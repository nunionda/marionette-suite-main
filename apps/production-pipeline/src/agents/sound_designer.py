"""
마리오네트 스튜디오 — SoundDesigner 에이전트
DirectionPlan JSON의 대사 + 오디오 컨셉을 기반으로
카테고리별 최적 TTS 모델로 음성을 생성한다.

카테고리별 모델 매핑:
  Film/Drama   → Gemini TTS (multi-speaker) + VoxCPM2 fallback
  Commercial   → VoxCPM2 (48 kHz studio) + MeloTTS fallback
  YouTube      → Qwen3-TTS (instruction control) + MeloTTS fallback
"""
import os
from typing import Optional
import io
import json
import wave
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan
from src.models.tts_config import CategoryTTSConfig, get_config, ProviderName
from src.providers import BaseTTSProvider, TTSResult
from src.providers.tts_qwen import QwenTTSProvider
from src.providers.tts_voxcpm import VoxCPMProvider
from src.providers.tts_melo import MeloTTSProvider
from src.utils.srt_generator import split_sentences, build_entries_from_durations, write_srt
from src.utils.narration_generator import generate_narration


class SoundDesignerAgent:
    def __init__(self, output_dir: str = "output/audio", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        # Gemini client (Film/Drama primary + narration generator)
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.tts_model = "gemini-2.5-flash-preview-tts"
            self.use_real_api = True
            print(f"🎵 SoundDesigner: Gemini TTS API 연동 완료")
        else:
            self.client = None
            self.use_real_api = False
            print(f"⚠️  SoundDesigner: API 키 미설정 — Mock 모드")

        # Provider registry (lazy init)
        self._providers: dict[str, BaseTTSProvider] = {}

    def _get_provider(self, name: ProviderName) -> Optional[BaseTTSProvider]:
        """Provider를 lazy하게 생성/캐싱. 사용 불가 시 None."""
        if name == "gemini":
            return None  # Gemini는 self.client로 직접 처리
        if name == "mock":
            return None

        if name not in self._providers:
            provider_map: dict[str, type[BaseTTSProvider]] = {
                "qwen": QwenTTSProvider,
                "voxcpm": VoxCPMProvider,
                "melo": MeloTTSProvider,
            }
            cls = provider_map.get(name)
            if cls:
                self._providers[name] = cls()

        provider = self._providers.get(name)
        if provider and provider.is_available():
            return provider
        return None

    # ── PCM/WAV helpers ──

    @staticmethod
    def _pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
        """raw PCM (audio/L16) 데이터를 WAV 포맷으로 변환."""
        buf = io.BytesIO()
        with wave.open(buf, 'wb') as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(sample_width)
            wf.setframerate(sample_rate)
            wf.writeframes(pcm_data)
        return buf.getvalue()

    def _parse_sample_rate(self, mime_type: str) -> int:
        """MIME 타입에서 샘플레이트 추출."""
        if mime_type and 'rate=' in mime_type:
            for part in mime_type.split(';'):
                if 'rate=' in part:
                    try:
                        return int(part.split('=')[1].strip())
                    except ValueError:
                        pass
        return 24000

    @staticmethod
    def _wav_duration_ms(wav_bytes: bytes) -> int:
        """WAV bytes의 duration을 ms로 계산."""
        with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
            return int(wf.getnframes() / wf.getframerate() * 1000)

    # ── Gemini TTS (Film/Drama primary) ──

    def _generate_tts_gemini(self, text: str, scene_number: int, voice: str = "Kore") -> Optional[TTSResult]:
        """Gemini TTS로 대사 음성 생성."""
        if not self.use_real_api:
            return None
        try:
            response = self.client.models.generate_content(
                model=self.tts_model,
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["audio"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice,
                            )
                        )
                    ),
                ),
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    raw_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type or ""
                    sample_rate = self._parse_sample_rate(mime_type)
                    wav_data = self._pcm_to_wav(raw_data, sample_rate=sample_rate)
                    duration_ms = self._wav_duration_ms(wav_data)

                    return TTSResult(
                        wav_bytes=wav_data,
                        sample_rate=sample_rate,
                        duration_ms=duration_ms,
                        provider_name="gemini",
                    )

            print(f"   ⚠️  씬 {scene_number}: TTS 오디오 파트 없음")
            return None
        except Exception as e:
            print(f"   ❌ 씬 {scene_number} Gemini TTS 오류: {e}")
            return None

    def _generate_tts_gemini_multi(
        self, text: str, scene_number: int, speakers: list[str]
    ) -> Optional[TTSResult]:
        """Gemini MultiSpeaker TTS — Film/Drama 다중화자."""
        if not self.use_real_api or len(speakers) < 2:
            return self._generate_tts_gemini(text, scene_number, speakers[0] if speakers else "Kore")
        try:
            response = self.client.models.generate_content(
                model=self.tts_model,
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["audio"],
                    speech_config=types.SpeechConfig(
                        multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                            speaker_voice_configs=[
                                types.SpeakerVoiceConfig(
                                    speaker=f"Speaker{i+1}",
                                    voice_config=types.VoiceConfig(
                                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                            voice_name=v,
                                        )
                                    ),
                                )
                                for i, v in enumerate(speakers)
                            ]
                        )
                    ),
                ),
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    raw_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type or ""
                    sample_rate = self._parse_sample_rate(mime_type)
                    wav_data = self._pcm_to_wav(raw_data, sample_rate=sample_rate)
                    duration_ms = self._wav_duration_ms(wav_data)
                    return TTSResult(
                        wav_bytes=wav_data,
                        sample_rate=sample_rate,
                        duration_ms=duration_ms,
                        provider_name="gemini_multi",
                    )
            return None
        except Exception as e:
            print(f"   ❌ 씬 {scene_number} MultiSpeaker TTS 오류: {e}")
            return self._generate_tts_gemini(text, scene_number, speakers[0] if speakers else "Kore")

    # ── Provider routing ──

    def _generate_with_provider(
        self,
        text: str,
        config: CategoryTTSConfig,
        voice: str = "",
        instruction: Optional[str] = None,
        voice_design: Optional[str] = None,
    ) -> Optional[TTSResult]:
        """카테고리 config에 따라 primary → fallback → mock 순으로 시도."""
        voice = voice or (config.default_voices[0] if config.default_voices else "default")

        # Primary
        provider = self._get_provider(config.primary_provider)
        if provider:
            result = provider.generate(text, voice, instruction=instruction, voice_design=voice_design)
            if result:
                return result
            print(f"   ⚠️  {config.primary_provider} 실패 → fallback")

        # Fallback
        fb = self._get_provider(config.fallback_provider)
        if fb:
            result = fb.generate(text, voice)
            if result:
                return result
            print(f"   ⚠️  {config.fallback_provider}도 실패 → Gemini fallback")

        # Last resort: Gemini
        return None  # caller가 Gemini 또는 Mock으로 처리

    # ── Mock ──

    def _generate_audio_mock(self, text: str, scene_number: int, suffix: str = "audio_mock") -> str:
        """Mock 오디오 파일 생성."""
        filename = f"scene_{scene_number:03d}_{suffix}.txt"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"[MOCK AUDIO] Scene {scene_number}\n")
            f.write(f"Text: {text}\n")
        return filepath

    # ── Narration ──

    def _resolve_narration(
        self, scene, config: CategoryTTSConfig, category: str
    ) -> Optional[str]:
        """카테고리별 나레이션 텍스트 결정 로직."""
        if not config.narration_enabled:
            return None

        manual_script = getattr(scene, "narration_script", None)

        if config.narration_source == "manual_first":
            # 광고: 수동 우선, 없으면 자동
            return manual_script or generate_narration(
                scene.action_description, category, scene.scene_number, self.api_key
            )
        elif config.narration_source == "auto_first":
            # 유튜브: 자동 우선, 수동 override
            if manual_script:
                return manual_script
            return generate_narration(
                scene.action_description, category, scene.scene_number, self.api_key
            )
        else:
            # Film/Drama: auto (선택적 — 대사 없는 씬만)
            dialogue = scene.dialogue
            if dialogue and dialogue.lower() != "null":
                return None  # 대사가 있으면 나레이션 불필요
            return generate_narration(
                scene.action_description, category, scene.scene_number, self.api_key
            )

    def _generate_narration_audio(
        self,
        narration_text: str,
        scene_number: int,
        config: CategoryTTSConfig,
    ) -> tuple[Optional[str], list[int]]:
        """나레이션 TTS + SRT용 문장별 duration 수집.

        Returns:
            (filepath, durations_ms) — filepath는 결합된 WAV, durations는 문장별 ms
        """
        sentences = split_sentences(narration_text)
        if not sentences:
            return None, []

        all_wav_bytes: list[bytes] = []
        durations_ms: list[int] = []
        sample_rate = config.sample_rate_hint

        for sentence in sentences:
            # 카테고리 primary/fallback으로 시도
            result = self._generate_with_provider(sentence, config)

            # Provider 실패 → Gemini fallback
            if result is None:
                result = self._generate_tts_gemini(sentence, scene_number, "Kore")

            if result:
                # WAV header 제거하고 raw PCM만 추출
                with wave.open(io.BytesIO(result.wav_bytes), "rb") as wf:
                    all_wav_bytes.append(wf.readframes(wf.getnframes()))
                    sample_rate = wf.getframerate()
                durations_ms.append(result.duration_ms)
            else:
                # 완전 실패 — 빈 WAV 추정치 (글자 수 기반)
                est_ms = max(500, len(sentence) * 80)  # ~80ms per char
                durations_ms.append(est_ms)

        if not all_wav_bytes:
            return None, durations_ms

        # 결합된 WAV 저장
        combined_pcm = b"".join(all_wav_bytes)
        wav_data = self._pcm_to_wav(combined_pcm, sample_rate=sample_rate)
        filename = f"scene_{scene_number:03d}_narration.wav"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(wav_data)

        return filepath, durations_ms

    # ── Main entry ──

    def generate_audio(self, json_path: str, category: str = "FILM") -> list[str]:
        """기획안 JSON에서 카테고리에 맞는 TTS 파이프라인 실행.

        Args:
            json_path: DirectionPlan JSON 파일 경로
            category: FILM | DRAMA_SERIES | COMMERCIAL | YOUTUBE_SHORT
        """
        config = get_config(category)

        print(f"🎵 AI 사운드 디자이너가 오디오 작업을 시작합니다...")
        print(f"   📂 입력: {json_path}")
        print(f"   🎬 카테고리: {config.label} ({category})")
        print(f"   🎤 Primary: {config.primary_provider} / Fallback: {config.fallback_provider}")
        print(f"   🔊 다중화자: {'Yes' if config.multi_speaker else 'No'} / SRT: {'Yes' if config.srt_enabled else 'No'}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return []

        generated_files: list[str] = []

        for scene in plan.scenes:
            dialogue = scene.dialogue
            has_dialogue = dialogue and dialogue.lower() != "null"

            # ── 1. 대사 TTS ──
            if has_dialogue:
                print(f"🎤 씬 {scene.scene_number} — 대사: {dialogue[:50]}...")

                result: Optional[TTSResult] = None
                speaker = getattr(scene, "speaker", None)

                if config.multi_speaker and speaker:
                    # 다중화자: 화자별 voice 매핑
                    voice = self._map_speaker_to_voice(speaker, config)
                    result = self._generate_tts_gemini(dialogue, scene.scene_number, voice)
                elif config.primary_provider == "gemini" and self.use_real_api:
                    voice = config.default_voices[0] if config.default_voices else "Kore"
                    result = self._generate_tts_gemini(dialogue, scene.scene_number, voice)
                else:
                    result = self._generate_with_provider(dialogue, config)
                    if result is None and self.use_real_api:
                        result = self._generate_tts_gemini(dialogue, scene.scene_number)

                if result:
                    filename = f"scene_{scene.scene_number:03d}_dialogue.wav"
                    filepath = os.path.join(self.output_dir, filename)
                    with open(filepath, "wb") as f:
                        f.write(result.wav_bytes)
                    generated_files.append(filepath)
                    size_kb = len(result.wav_bytes) / 1024
                    print(f"   ✅ 대사 TTS ({result.provider_name}): {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._generate_audio_mock(dialogue, scene.scene_number, "dialogue_mock")
                    generated_files.append(mock)
                    print(f"   ⚠️  Mock 폴백: {mock}")
            else:
                print(f"🔇 씬 {scene.scene_number} — 대사 없음")

            # ── 2. 나레이션 TTS ──
            narration_text = self._resolve_narration(scene, config, category)
            if narration_text:
                print(f"   📝 나레이션: {narration_text[:50]}...")
                nar_path, durations = self._generate_narration_audio(
                    narration_text, scene.scene_number, config
                )
                if nar_path:
                    generated_files.append(nar_path)
                    size_kb = os.path.getsize(nar_path) / 1024
                    print(f"   ✅ 나레이션 TTS: {nar_path} ({size_kb:.0f}KB)")

                    # ── 3. SRT 생성 ──
                    if config.srt_enabled and durations:
                        sentences = split_sentences(narration_text)
                        if len(sentences) == len(durations):
                            entries = build_entries_from_durations(sentences, durations)
                            srt_path = os.path.join(
                                self.output_dir,
                                f"scene_{scene.scene_number:03d}_narration.srt",
                            )
                            write_srt(srt_path, entries)
                            generated_files.append(srt_path)
                            print(f"   ✅ SRT 자막: {srt_path}")
                else:
                    mock = self._generate_audio_mock(narration_text, scene.scene_number, "narration_mock")
                    generated_files.append(mock)

        # 글로벌 오디오 컨셉 메타데이터 저장
        meta_path = os.path.join(self.output_dir, "audio_concept.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump({
                "category": category,
                "config_label": config.label,
                "primary_provider": config.primary_provider,
                "fallback_provider": config.fallback_provider,
                "multi_speaker": config.multi_speaker,
                "srt_enabled": config.srt_enabled,
                "global_audio_concept": plan.global_audio_concept,
                "files_generated": len(generated_files),
                "total_scenes": len(plan.scenes),
            }, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 사운드 디자인 완료! ({len(generated_files)} 파일, 카테고리: {config.label})")
        return generated_files

    @staticmethod
    def _map_speaker_to_voice(speaker: str, config: CategoryTTSConfig) -> str:
        """화자 이름을 Gemini PrebuiltVoice 이름에 매핑."""
        # 간단한 해시 기반 매핑 — 동일 이름은 항상 같은 목소리
        voices = config.default_voices
        if not voices:
            return "Kore"
        idx = hash(speaker) % len(voices)
        return voices[idx]

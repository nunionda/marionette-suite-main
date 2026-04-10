"""
마리오네트 스튜디오 — SoundDesigner 에이전트
DirectionPlan JSON의 대사 + 오디오 컨셉을 기반으로
Gemini TTS API로 내레이션/대사 음성 생성
"""
import os
from typing import Optional, Union, List
import io
import json
import wave
import struct
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.models.schemas import DirectionPlan


class SoundDesignerAgent:
    def __init__(self, output_dir: str = "output/audio", api_key: str = None):
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
        self.api_key = api_key or os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.tts_model = "gemini-2.5-flash-preview-tts"
            self.use_real_api = True
            print(f"🎵 SoundDesigner: Gemini TTS API 연동 완료")
        else:
            self.client = None
            self.use_real_api = False
            print(f"⚠️  SoundDesigner: API 키 미설정 — Mock 모드")

    @staticmethod
    def _pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
        """
        raw PCM (audio/L16) 데이터를 WAV 포맷으로 변환
        Gemini TTS는 audio/L16;rate=24000 (16bit mono PCM)을 반환
        """
        buf = io.BytesIO()
        with wave.open(buf, 'wb') as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(sample_width)
            wf.setframerate(sample_rate)
            wf.writeframes(pcm_data)
        return buf.getvalue()

    def _parse_sample_rate(self, mime_type: str) -> int:
        """MIME 타입에서 샘플레이트 추출 (예: audio/L16;codec=pcm;rate=24000)"""
        if mime_type and 'rate=' in mime_type:
            for part in mime_type.split(';'):
                if 'rate=' in part:
                    try:
                        return int(part.split('=')[1].strip())
                    except ValueError:
                        pass
        return 24000  # 기본값

    def _generate_tts_real(self, text: str, scene_number: int, voice: str = "Kore") -> Optional[str]:
        """Gemini TTS로 대사 음성 생성 (PCM → WAV 변환 포함)"""
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

                    # PCM → WAV 변환
                    wav_data = self._pcm_to_wav(raw_data, sample_rate=sample_rate)

                    filename = f"scene_{scene_number:03d}_dialogue.wav"
                    filepath = os.path.join(self.output_dir, filename)

                    with open(filepath, "wb") as f:
                        f.write(wav_data)

                    return filepath

            print(f"   ⚠️  씬 {scene_number}: TTS 오디오 파트 없음")
            return None

        except Exception as e:
            print(f"   ❌ 씬 {scene_number} TTS 오류: {e}")
            return None

    def _generate_audio_mock(self, text: str, scene_number: int) -> str:
        """Mock 오디오 파일 생성"""
        filename = f"scene_{scene_number:03d}_audio_mock.txt"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"[MOCK AUDIO] Scene {scene_number}\n")
            f.write(f"Dialogue: {text}\n")
        return filepath

    def generate_audio(self, json_path: str) -> list[str]:
        """기획안 JSON에서 씬별 대사 TTS + 오디오 메타데이터 생성"""
        print(f"🎵 AI 사운드 디자이너가 오디오 작업을 시작합니다...")
        print(f"   📂 입력: {json_path}")
        print(f"   🎤 모드: {'Gemini TTS' if self.use_real_api else 'Mock'}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        try:
            plan = DirectionPlan(**data)
        except Exception as e:
            print(f"❌ 기획안 파싱 실패: {e}")
            return []

        generated_audio = []
        for scene in plan.scenes:
            dialogue = scene.dialogue
            if not dialogue or dialogue.lower() == "null":
                print(f"🔇 씬 {scene.scene_number} — 대사 없음 (스킵)")
                continue

            print(f"🎤 씬 {scene.scene_number} — 대사: {dialogue[:50]}...")

            if self.use_real_api:
                filepath = self._generate_tts_real(dialogue, scene.scene_number)
                if filepath:
                    generated_audio.append(filepath)
                    size_kb = os.path.getsize(filepath) / 1024
                    print(f"   ✅ TTS 생성: {filepath} ({size_kb:.0f}KB)")
                else:
                    mock = self._generate_audio_mock(dialogue, scene.scene_number)
                    generated_audio.append(mock)
                    print(f"   ⚠️  Mock 폴백: {mock}")
            else:
                mock = self._generate_audio_mock(dialogue, scene.scene_number)
                generated_audio.append(mock)
                print(f"   ✅ Mock: {mock}")

        # 글로벌 오디오 컨셉 메타데이터 저장
        meta_path = os.path.join(self.output_dir, "audio_concept.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump({
                "global_audio_concept": plan.global_audio_concept,
                "scenes_with_audio": len(generated_audio),
                "total_scenes": len(plan.scenes),
            }, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 사운드 디자인 완료! ({len(generated_audio)}클립)")
        return generated_audio

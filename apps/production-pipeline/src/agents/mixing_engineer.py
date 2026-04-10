"""
마리오네트 스튜디오 — MixingEngineer (믹싱 엔지니어) 에이전트
POST-PRODUCTION

대사(WAV) + BGM + 비디오(MP4)를 최종 합본하여 완성된 영상 출력
FFMPEG 오디오 스트림 머지
"""
import os
from typing import Optional, Union, List
import glob
import subprocess


class MixingEngineerAgent:
    """믹싱 엔지니어 — 비디오 + 오디오 최종 합본"""

    def __init__(
        self,
        output_dir: str = "output/final",
        video_dir: str = "output/graded",
        audio_dir: str = "output/audio",
        master_dir: str = "output/master",
    ):
        self.output_dir = output_dir
        self.video_dir = video_dir
        self.audio_dir = audio_dir
        self.master_dir = master_dir
        os.makedirs(self.output_dir, exist_ok=True)
        print("🎛️ MixingEngineer: 믹싱 엔지니어 초기화 완료")

    def _find_best_video(self) -> Optional[str]:
        """최적의 비디오 소스 찾기 (graded > master > videos)"""
        # 1. 컬러 그레이딩된 버전
        graded = sorted(glob.glob(os.path.join(self.video_dir, "*.mp4")))
        graded = [v for v in graded if os.path.getsize(v) > 10240]
        if graded:
            return graded[0]

        # 2. 마스터 편집본
        master = sorted(glob.glob(os.path.join(self.master_dir, "*.mp4")))
        master = [v for v in master if os.path.getsize(v) > 10240]
        if master:
            return master[0]

        # 3. raw 비디오
        raw = sorted(glob.glob("output/videos/*.mp4"))
        raw = [v for v in raw if os.path.getsize(v) > 10240]
        if raw:
            return raw[0]

        return None

    def _find_dialogue_tracks(self) -> list[str]:
        """대사 WAV 파일 목록"""
        wavs = sorted(glob.glob(os.path.join(self.audio_dir, "scene_*_dialogue.wav")))
        return [w for w in wavs if os.path.getsize(w) > 100]

    def _find_bgm_track(self) -> Optional[str]:
        """BGM 트랙 찾기"""
        bgm_patterns = ["bgm*.wav", "bgm*.mp3", "score*.wav", "score*.mp3"]
        for pattern in bgm_patterns:
            matches = glob.glob(os.path.join(self.audio_dir, pattern))
            if matches:
                return matches[0]
        return None

    def mix_final(self, title: str = "bit_savior") -> Optional[str]:
        """
        최종 믹싱 — 비디오 + 대사 오디오 합본

        Returns: 최종 출력 MP4 경로
        """
        print("🎛️ 믹싱 엔지니어가 최종 합본을 시작합니다...")

        video = self._find_best_video()
        dialogues = self._find_dialogue_tracks()
        bgm = self._find_bgm_track()

        print(f"   📹 비디오: {video or '없음'}")
        print(f"   🎤 대사 트랙: {len(dialogues)}개")
        print(f"   🎵 BGM: {bgm or '없음'}")

        if not video:
            print("   ⚠️ 유효한 비디오 파일이 없습니다")
            # Mock 출력
            mock_path = os.path.join(self.output_dir, f"FINAL_{title}_mock.txt")
            with open(mock_path, "w") as f:
                f.write(f"[MOCK FINAL MIX] {title}\n")
                f.write(f"Dialogue tracks: {len(dialogues)}\nBGM: {bgm}\n")
            return mock_path

        output_path = os.path.join(self.output_dir, f"FINAL_{title}.mp4")

        # ─── FFMPEG 합본 전략 ───
        if dialogues and not bgm:
            # 비디오 + 대사만 (첫 번째 대사 트랙 사용)
            return self._merge_video_audio(video, dialogues[0], output_path)
        elif dialogues and bgm:
            # 비디오 + 대사 + BGM (amix로 믹싱)
            return self._merge_video_dialogue_bgm(video, dialogues[0], bgm, output_path)
        elif bgm:
            # 비디오 + BGM만
            return self._merge_video_audio(video, bgm, output_path)
        else:
            # 오디오 없음 → 비디오만 복사
            return self._copy_video(video, output_path)

    def _merge_video_audio(self, video: str, audio: str, output: str) -> Optional[str]:
        """비디오 + 단일 오디오 트랙 합본"""
        cmd = [
            "ffmpeg", "-y",
            "-i", video,
            "-i", audio,
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            output,
        ]
        return self._run_ffmpeg(cmd, output)

    def _merge_video_dialogue_bgm(self, video: str, dialogue: str, bgm: str, output: str) -> Optional[str]:
        """비디오 + 대사 + BGM 3트랙 믹싱"""
        cmd = [
            "ffmpeg", "-y",
            "-i", video,
            "-i", dialogue,
            "-i", bgm,
            "-filter_complex",
            "[1:a]volume=1.0[dial];[2:a]volume=0.3[bgm];[dial][bgm]amix=inputs=2:duration=shortest[aout]",
            "-map", "0:v:0",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            output,
        ]
        return self._run_ffmpeg(cmd, output)

    def _copy_video(self, video: str, output: str) -> Optional[str]:
        """오디오 없이 비디오만 복사"""
        cmd = ["ffmpeg", "-y", "-i", video, "-c", "copy", output]
        return self._run_ffmpeg(cmd, output)

    def _run_ffmpeg(self, cmd: list, output: str) -> Optional[str]:
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            size_kb = os.path.getsize(output) / 1024
            print(f"   ✅ 최종 합본 완료: {output} ({size_kb:.0f}KB)")
            return output
        except subprocess.CalledProcessError as e:
            print(f"   ❌ FFMPEG 믹싱 오류: {e}")
            return None
        except FileNotFoundError:
            print(f"   ❌ ffmpeg가 설치되지 않았습니다")
            return None

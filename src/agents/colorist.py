"""
마리오네트 스튜디오 — Colorist (컬러리스트) 에이전트
POST-PRODUCTION

FFMPEG 필터 기반 컬러 그레이딩 — LUT 적용, 톤 매핑, 비네팅
"""
import os
import subprocess


# ─── 컬러 그레이딩 프리셋 ───

COLOR_PRESETS = {
    "tech_noir": {
        "name": "Tech-Noir",
        "description": "시네마틱 틸&오렌지, 높은 대비, 어두운 그림자",
        "filter": (
            "curves=master='0/0 0.25/0.15 0.5/0.45 0.75/0.8 1/1':"
            "blue='0/0.05 0.5/0.55 1/0.9',"
            "colorbalance=rs=-0.1:gs=-0.05:bs=0.15:"
            "rm=0.05:gm=-0.05:bm=0.1:"
            "rh=0.1:gh=0.0:bh=-0.1,"
            "eq=contrast=1.3:brightness=-0.05:saturation=0.85,"
            "vignette=PI/4"
        ),
    },
    "cold_blue": {
        "name": "Cold Blue",
        "description": "차가운 블루 톤, 탈포화, 높은 대비",
        "filter": (
            "colorbalance=rs=-0.15:gs=-0.1:bs=0.2:"
            "rm=-0.1:gm=-0.05:bm=0.15,"
            "eq=contrast=1.25:brightness=-0.08:saturation=0.7,"
            "vignette=PI/4"
        ),
    },
    "warm_golden": {
        "name": "Warm Golden",
        "description": "따뜻한 골든아워 톤, 소프트 대비",
        "filter": (
            "colorbalance=rs=0.15:gs=0.1:bs=-0.1:"
            "rm=0.1:gm=0.05:bm=-0.05,"
            "eq=contrast=1.15:brightness=0.03:saturation=1.1,"
            "vignette=PI/5"
        ),
    },
    "desaturated": {
        "name": "Desaturated",
        "description": "거의 흑백에 가까운 탈채도, 영화적 질감",
        "filter": (
            "eq=contrast=1.4:brightness=-0.05:saturation=0.3,"
            "vignette=PI/3.5"
        ),
    },
    "none": {
        "name": "No Grading",
        "description": "컬러 그레이딩 없이 원본 유지",
        "filter": None,
    },
}

DEFAULT_COLOR = "tech_noir"


class ColoristAgent:
    """컬러리스트 — FFMPEG 필터 기반 컬러 그레이딩"""

    def __init__(self, output_dir: str = "output/graded", preset: str = DEFAULT_COLOR):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.preset_key = preset if preset in COLOR_PRESETS else DEFAULT_COLOR
        self.preset = COLOR_PRESETS[self.preset_key]
        print(f"🎨 Colorist: {self.preset['name']} 프리셋 로드")

    def set_preset(self, preset: str):
        if preset in COLOR_PRESETS:
            self.preset_key = preset
            self.preset = COLOR_PRESETS[preset]
            print(f"🎨 컬러 프리셋 변경: {self.preset['name']}")
        else:
            print(f"⚠️ 알 수 없는 프리셋: {preset}")
            print(f"   사용 가능: {', '.join(COLOR_PRESETS.keys())}")

    @staticmethod
    def list_presets() -> dict:
        return {k: v["name"] for k, v in COLOR_PRESETS.items()}

    def grade_video(self, input_path: str, scene_number: int = 0) -> str | None:
        """단일 비디오에 컬러 그레이딩 적용"""
        if not self.preset["filter"]:
            print(f"   ⏭️ 컬러 그레이딩 스킵 (none 프리셋)")
            return input_path

        filename = f"graded_{os.path.basename(input_path)}"
        output_path = os.path.join(self.output_dir, filename)

        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-vf", self.preset["filter"],
            "-c:a", "copy",
            output_path,
        ]

        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"   ✅ 컬러 그레이딩 완료: {output_path}")
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"   ❌ FFMPEG 컬러 그레이딩 오류: {e}")
            return input_path
        except FileNotFoundError:
            print(f"   ❌ ffmpeg가 설치되지 않았습니다")
            return input_path

    def grade_master(self, master_path: str) -> str | None:
        """마스터 편집본에 컬러 그레이딩 적용"""
        print(f"🎨 컬러리스트가 마스터 편집본에 그레이딩을 적용합니다...")
        print(f"   📂 입력: {master_path}")
        print(f"   🎨 프리셋: {self.preset['name']}")

        if not os.path.exists(master_path) or os.path.getsize(master_path) < 10240:
            print(f"   ⚠️ 유효한 비디오 파일이 아닙니다 (Mock 스킵)")
            return master_path

        result = self.grade_video(master_path)
        if result:
            size_kb = os.path.getsize(result) / 1024
            print(f"🎨 컬러 그레이딩 완료! ({size_kb:.0f}KB)")
        return result

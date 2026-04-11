"""
마리오네트 스튜디오 — Mastering Forge 서비스
개별 에셋(이미지, manifest)을 수집하여 ZIP 패키지로 번들링
"""
import zipfile
import json
from pathlib import Path
from datetime import datetime
from server.core.config import settings


class MasteringForge:
    def __init__(self, db_session=None):
        self.db = db_session
        self.output_base = Path(settings.OUTPUT_DIR) / "mastering"
        self.output_base.mkdir(parents=True, exist_ok=True)

    async def generate_master(self, project_id: str, resolution: str = "2k") -> str:
        """
        프로젝트 에셋을 ZIP으로 번들링하여 최종 패키지 생성.
        - 파이프라인이 생성한 이미지/manifest/script 파일을 수집
        - ZIP 파일로 묶어 다운로드 가능한 패키지 생성
        """
        print(f"📦 Mastering Forge: Bundling assets for project {project_id} ({resolution})...")

        project_dir = self.output_base / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_filename = f"master_{resolution}_{timestamp}.zip"
        zip_path = project_dir / zip_filename

        # 프로젝트에 속하는 에셋 디렉토리 목록
        asset_dirs = [
            settings.STORYBOARDS_DIR / project_id,
            settings.PLANS_DIR / project_id,
            settings.VIDEOS_DIR / project_id,
            settings.AUDIO_DIR / project_id,
        ]

        # manifest 파일 (프로젝트 루트 manifests/ 에 저장됨)
        manifest_path = settings.OUTPUT_DIR / "manifests" / f"{project_id}_manifest.json"

        collected: list[tuple[Path, str]] = []  # (실제경로, ZIP 내부 경로)

        for asset_dir in asset_dirs:
            if asset_dir.exists():
                for file in sorted(asset_dir.rglob("*")):
                    if file.is_file():
                        arcname = str(file.relative_to(settings.OUTPUT_DIR))
                        collected.append((file, arcname))

        if manifest_path.exists():
            collected.append((manifest_path, f"manifests/{project_id}_manifest.json"))

        # 수집된 파일이 없으면 메타데이터만 포함한 ZIP 생성
        if not collected:
            print(f"⚠️  No assets found for {project_id}, creating metadata-only package")

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path, arcname in collected:
                zf.write(file_path, arcname)

            # 패키지 메타데이터 추가
            meta = {
                "project_id": project_id,
                "resolution": resolution,
                "bundled_at": timestamp,
                "file_count": len(collected),
                "files": [arc for _, arc in collected],
            }
            zf.writestr("package_meta.json", json.dumps(meta, ensure_ascii=False, indent=2))

        print(f"✅ Package ready: {zip_path} ({len(collected)} files)")
        return str(zip_path)

    def _create_concat_file(self, video_paths: list, concat_file_path: Path):
        """FFmpeg concat용 텍스트 파일 생성 (향후 실제 영상 지원 시 사용)"""
        with open(concat_file_path, "w") as f:
            for v in video_paths:
                f.write(f"file '{v}'\n")

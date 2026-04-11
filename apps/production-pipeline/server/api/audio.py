"""
오디오 파일 서빙 API — 생성된 WAV + SRT 파일을 프론트엔드에 제공
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from server.core.config import settings

router = APIRouter()

@router.get("/", summary="사용 가능한 오디오 파일 목록")
def list_audio_files():
    audio_dir = settings.OUTPUT_DIR / "audio"
    if not audio_dir.exists():
        return {"files": []}

    files = []
    for f in sorted(audio_dir.iterdir()):
        if f.suffix in (".wav", ".srt"):
            files.append({
                "name": f.name,
                "size_bytes": f.stat().st_size,
                "type": "wav" if f.suffix == ".wav" else "srt",
                "url": f"/output/audio/{f.name}",
            })
    return {"files": files}

@router.get("/{filename}", summary="오디오 파일 다운로드/스트리밍")
def get_audio_file(filename: str):
    audio_dir = (settings.OUTPUT_DIR / "audio").resolve()
    resolved = (audio_dir / filename).resolve()

    # Security: resolved path must remain inside audio_dir
    if not str(resolved).startswith(str(audio_dir) + "/"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not resolved.exists():
        raise HTTPException(status_code=404, detail=f"파일을 찾을 수 없습니다: {filename}")

    media_type = "audio/wav" if resolved.suffix == ".wav" else "text/plain"
    return FileResponse(str(resolved), media_type=media_type, filename=filename)

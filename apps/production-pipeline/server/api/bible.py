from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from server.core.database import get_db
from server.services.bible_service import BibleService
from server.models.database import Project

router = APIRouter(prefix="/api/bible", tags=["bible"])

@router.post("/{project_id}/generate")
async def generate_bible(project_id: str, db: Session = Depends(get_db)):
    """프로덕션 바이블 수동 생성 트리거"""
    service = BibleService(db)
    path = await service.generate_bible(project_id)
    if not path:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Production Bible generated successfully", "path": path}

@router.get("/{project_id}/view")
async def view_bible(project_id: str, db: Session = Depends(get_db)):
    """생성된 바이블 Markdown 파일 반환"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.production_book_path:
        raise HTTPException(status_code=404, detail="Production Bible not found or not generated yet")
    
    if not os.path.exists(project.production_book_path):
        raise HTTPException(status_code=404, detail="Bible file missing on server")
        
    return FileResponse(
        path=project.production_book_path, 
        media_type="text/markdown", 
        filename=os.path.basename(project.production_book_path)
    )

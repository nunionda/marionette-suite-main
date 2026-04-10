"""
마리오네트 스튜디오 — 보안 보관소(Vault) API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from server.core.database import get_db
from server.models.database import Credential
from server.utils.encryption import encrypt_key, decrypt_key

router = APIRouter()

class CredentialCreate(BaseModel):
    provider: str
    key_name: str = "default"
    api_key: str

class CredentialResponse(BaseModel):
    id: str
    provider: str
    key_name: str
    is_active: bool
    
@router.post("/credentials", response_model=CredentialResponse)
def add_credential(data: CredentialCreate, db: Session = Depends(get_db)):
    """새로운 API 키 암호화 저장"""
    # 기존 키 비활성화 (동일 프로바이더/이름인 경우)
    existing = db.query(Credential).filter(
        Credential.provider == data.provider,
        Credential.key_name == data.key_name
    ).first()
    
    encrypted = encrypt_key(data.api_key)
    
    if existing:
        existing.encrypted_key = encrypted
        existing.is_active = 1
        db.commit()
        db.refresh(existing)
        return CredentialResponse(**existing.to_dict())
    
    new_cred = Credential(
        provider=data.provider,
        key_name=data.key_name,
        encrypted_key=encrypted
    )
    db.add(new_cred)
    db.commit()
    db.refresh(new_cred)
    return CredentialResponse(**new_cred.to_dict())

@router.get("/credentials", response_model=List[CredentialResponse])
def list_credentials(db: Session = Depends(get_db)):
    """저장된 크리덴셜 목록 조회 (키 값은 제외)"""
    creds = db.query(Credential).all()
    return [CredentialResponse(**c.to_dict()) for c in creds]

@router.get("/credentials/{provider}")
def get_decrypted_key(provider: str, key_name: str = "default", db: Session = Depends(get_db)):
    """
    내부 서비스용: 암호화된 키를 복호화하여 반환 
    (주의: 프론트엔드 직접 노출 금지, 서버 내부 호출 권장)
    """
    cred = db.query(Credential).filter(
        Credential.provider == provider,
        Credential.key_name == key_name,
        Credential.is_active == 1
    ).first()
    
    if not cred:
        return {"key": None}
    
    return {"key": decrypt_key(cred.encrypted_key)}

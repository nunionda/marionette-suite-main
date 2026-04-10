import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from server.core.config import settings

# 암호화 마스터 키 생성 (없으면 .env에서 가져오거나 기본값 사용)
# 실제 운영 환경에서는 반드시 고유한 MASTER_KEY를 설정해야 함
MASTER_KEY_SECRET = os.getenv("MARIONETTE_VAULT_SECRET", "marionette-studio-default-secret-2024")

def _get_fernet():
    """마스터 비밀번호로 Fernet 인스턴스 생성"""
    salt = b'marionette_salt_2024' # 고정 솔트
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(MASTER_KEY_SECRET.encode()))
    return Fernet(key)

def encrypt_key(plain_text: str) -> str:
    """텍스트 암호화"""
    if not plain_text:
        return ""
    f = _get_fernet()
    return f.encrypt(plain_text.encode()).decode()

def decrypt_key(encrypted_text: str) -> str:
    """텍스트 복호화"""
    if not encrypted_text:
        return ""
    try:
        f = _get_fernet()
        return f.decrypt(encrypted_text.encode()).decode()
    except Exception as e:
        print(f"Decryption failed: {e}")
        return ""

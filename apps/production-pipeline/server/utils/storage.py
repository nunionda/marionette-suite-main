import os
import uuid
import boto3
from typing import Optional
from pathlib import Path
from botocore.exceptions import ClientError
from server.core.config import settings

class CloudStorageService:
    """
    AWS S3 등 클라우드 스토리지를 관리하는 서비스 계층
    (Digital Backlot 영속성을 위한 글로벌 자산 뱅크 연동)
    """

    def __init__(self):
        self.use_s3 = str(os.getenv("USE_S3", "false")).lower() == "true"
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "marionette-global-assets")
        self.region = os.getenv("AWS_REGION", "auto") # R2 generally uses auto
        
        # Cloudflare R2 지원 설정
        self.cf_account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        self.r2_public_domain = os.getenv("R2_PUBLIC_DOMAIN") # e.g. pub-xxxx.r2.dev or custom domain
        
        self.s3_client = None
        if self.use_s3:
            try:
                client_kwargs = {
                    'service_name': 's3',
                    'aws_access_key_id': os.getenv("AWS_ACCESS_KEY_ID"),
                    'aws_secret_access_key': os.getenv("AWS_SECRET_ACCESS_KEY"),
                    'region_name': self.region
                }
                
                # Zero-Cost Cloudflare R2 Override
                if self.cf_account_id:
                    client_kwargs['endpoint_url'] = f"https://{self.cf_account_id}.r2.cloudflarestorage.com"
                    print(f"🌩️ CloudStorageService: Cloudflare R2 연동 준비 완료 (Zero-Cost CI/CD Mode)")
                else:
                    print(f"☁️ CloudStorageService: AWS S3 연동 준비 완료 (Bucket: {self.bucket_name})")

                self.s3_client = boto3.client(**client_kwargs)
            except Exception as e:
                print(f"⚠️ Cloud Storage 초기화 실패, 로컬 Fallback으로 동작합니다: {e}")
                self.use_s3 = False

        if not self.use_s3:
            print("💽 CloudStorageService: 로컬 Fallback 스토리지 모드로 동작 중입니다.")

    def upload_file(self, file_path: str, asset_type: str = "general") -> Optional[str]:
        """
        자산을 S3에 업로드하고, 퍼블릭 혹은 Signed URL(또는 S3 URL)을 반환.
        use_s3가 False인 경우 원본 로컬 경로를 그대로 반환.
        """
        if not os.path.exists(file_path):
            print(f"❌ 업로드 실패: 파일이 존재하지 않습니다 ({file_path})")
            return None

        if not self.use_s3:
            return file_path

        filename = os.path.basename(file_path)
        ext = filename.split(".")[-1]
        unique_filename = f"{asset_type}/{uuid.uuid4().hex[:8]}_{filename}"

        try:
            # S3 버킷에 파일 업로드
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                unique_filename,
                ExtraArgs={'ContentType': self._guess_content_type(ext)}
            )
            
            # URL 생성 로직 분기 (Cloudflare R2 vs AWS S3)
            if self.cf_account_id:
                if self.r2_public_domain:
                    s3_url = f"https://{self.r2_public_domain}/{unique_filename}"
                else:
                    s3_url = f"https://{self.bucket_name}.{self.cf_account_id}.r2.cloudflarestorage.com/{unique_filename}"
                print(f"🌩️ Cloudflare R2 업로드 성공: {s3_url}")
            else:
                s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{unique_filename}"
                print(f"☁️ S3 업로드 성공: {s3_url}")
                
            return s3_url
            
        except ClientError as e:
            print(f"❌ S3 업로드 실패: {e}")
            return file_path
        except Exception as e:
            print(f"❌ S3 업로드 중 알 수 없는 에러 발생: {e}")
            return file_path

    def _guess_content_type(self, ext: str) -> str:
        types = {
            "mp4": "video/mp4",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "json": "application/json",
            "txt": "text/plain"
        }
        return types.get(ext.lower(), "binary/octet-stream")

# 싱글톤 인스턴스 (서버 시작 시 메모리에 로드)
storage_service = CloudStorageService()

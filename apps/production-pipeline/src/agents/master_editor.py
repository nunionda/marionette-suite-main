import os
from typing import Optional, Union, List
import json
import glob
import subprocess

class MasterEditorAgent:
    def __init__(self, output_dir: str = "output/master", videos_dir: str = "output/videos"):
        """
        AI 마스터 에디터 초기화
        """
        self.output_dir = output_dir
        self.videos_dir = videos_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
    def edit_and_color_grade(self, json_path: str):
        """
        ouput/videos 폴더 내의 영상을 하나로 연결(Concatenate)합니다.
        """
        print(f"✂️ AI 마스터 에디터: FFMPEG 영상 병합(Concatenation) 프로세스를 시작합니다...")
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            title = data.get("title", "Untitled").replace(" ", "_")
            
        # 1. 대상 비디오 파일 탐색 (확장자 mp4, 최소 10KB 이상인 실제 비디오만)
        all_mp4 = sorted(glob.glob(os.path.join(self.videos_dir, "*.mp4")))
        video_files = [v for v in all_mp4 if os.path.getsize(v) > 10240]  # 10KB 이상

        if not video_files:
            print("⚠️ 병합할 영상 파일(mp4)이 없으므로 더미 모드로 처리합니다.")
            master_filename = f"master_edit_{title}.mp4"
            master_path = os.path.join(self.output_dir, master_filename)
            with open(master_path, "w", encoding="utf-8") as master_file:
                master_file.write(f"Mock Master Edit File for: '{title}'. Please add real MP4s to output/videos.\n")
            return master_path

        print(f"🔍 병합 대상 클립 {len(video_files)}개 발견. FFMPEG 콘캣(Concat)을 준비합니다.")
        
        # 2. FFMPEG 리스트 파일(concat.txt) 생성
        list_file_path = os.path.join(self.output_dir, "concat.txt")
        with open(list_file_path, "w", encoding="utf-8") as list_file:
            for vid in video_files:
                # ffmpeg는 concat 파일 안의 경로를 안전하게 읽기 위해 절대 경로 또는 형식 필요
                abs_path = os.path.abspath(vid)
                list_file.write(f"file '{abs_path}'\n")
                
        # 3. FFMPEG 실행 (무손실 코덱 복사 방식)
        master_path = os.path.join(self.output_dir, f"final_master_{title}.mp4")
        
        # 기존 파일 덮어쓰기 로직
        if os.path.exists(master_path):
            os.remove(master_path)
            
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", list_file_path,
            "-c", "copy",
            master_path
        ]
        
        try:
            print(f"🎥 영상을 연결하고 있습니다... (ffmpeg)")
            subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"   ✅ 영상 컷 편집/병합 렌더링 완료: {master_path}")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFMPEG 실행 중 오류가 발생했습니다. (ffmpeg가 설치되어 있는지 확인하세요: brew install ffmpeg)")
            print(f"에러 코드: {e}")
            return None
        finally:
            # 임시 파일 정리
            try:
                if os.path.exists(list_file_path):
                    os.remove(list_file_path)
            except PermissionError:
                pass  # 샌드박스 환경에서는 삭제 불가할 수 있음

        print(f"🎉 모든 영상 마스터 편집 병합 완료!")
        return master_path

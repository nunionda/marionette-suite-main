from typing import List, Optional
from pydantic import BaseModel, Field

class Scene(BaseModel):
    scene_number: int = Field(description="씬 번호 (예: 1, 2, 3...)")
    setting: str = Field(description="배경 설정 (예: 어두운 골목길, 화창한 도심)")
    time_of_day: str = Field(description="시간대 (예: Day, Night, Sunset)")
    camera_angle: str = Field(description="카메라 앵글 및 워킹 (예: Wide shot, Close-up, Tracking shot)")
    action_description: str = Field(description="장면 내 시각적 행동 및 연출 묘사")
    dialogue: Optional[str] = Field(description="해당 씬에서 발생하는 대사 또는 내레이션 (없으면 null)")
    narration_script: Optional[str] = Field(default=None, description="나레이션 스크립트 (수동 입력). 없으면 카테고리 설정에 따라 자동 생성")
    speaker: Optional[str] = Field(default=None, description="대사 화자 이름 (다중화자 모드에서 voice_id 매핑용)")
    image_prompt: str = Field(description="NanoBanana 2 (Gemini Flash Image) 엔진용 5단 구조 영어 영문 이미지 생성 프롬프트. 구체적인 스타일, 조명, 구도, 피사체 묘사 포함.")
    video_prompt: str = Field(description="Veo 3.1 등 영상 생성 AI용 6단 구조 영어 영문 비디오 프롬프트. 카메라 움직임, 피사체 동작, 그리고 [Audio] 중심 묘사 포함.")

class DirectionPlan(BaseModel):
    title: str = Field(description="작품 제목")
    logline: str = Field(description="작품의 핵심 내용을 요약한 한 줄 시놉시스 (로그라인)")
    genre: str = Field(description="작품 장르 (예: SF, 드라마, 애니메이션)")
    target_audience: str = Field(description="예상 타겟 관객층")
    planning_intent: str = Field(description="기획 의도 (작품의 메시지 및 제작 목적)")
    worldview_settings: str = Field(description="세계관 설정 (주요 배경, 시대상, 규칙 등)")
    character_settings: str = Field(description="주요 캐릭터 설정 (이름, 외양, 성격, 특징)")
    global_audio_concept: str = Field(description="전체 오디오 컨셉 (전반적인 BGM 장르, 사운드 무드 톤 등)")
    scenes: List[Scene] = Field(description="시간 순서대로 구성된 씬(Scene)의 목록")

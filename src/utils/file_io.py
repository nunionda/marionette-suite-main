import json
import os
from datetime import datetime
from src.models.schemas import DirectionPlan

def save_output(direction_plan: DirectionPlan, output_dir: str = "output/plans"):
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%md_%H%M%S")
    
    # JSON 원본 저장 (다음 파이프라인 에이전트를 위한 용도)
    json_path = os.path.join(output_dir, f"direction_plan_{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(direction_plan.model_dump(), f, ensure_ascii=False, indent=2)
        
    # 사람이 읽기 쉬운 Markdown 보고서 저장
    md_path = os.path.join(output_dir, f"direction_plan_{timestamp}.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# 🎬 연출기획안 (Direction Plan): {direction_plan.title}\n\n")
        f.write(f"**진르:** {direction_plan.genre}\n")
        f.write(f"**타겟 관객:** {direction_plan.target_audience}\n")
        f.write(f"**로그라인:** {direction_plan.logline}\n\n")
        
        f.write(f"## 1. 기획 의도\n{direction_plan.planning_intent}\n\n")
        f.write(f"## 2. 세계관 설정\n{direction_plan.worldview_settings}\n\n")
        f.write(f"## 3. 캐릭터 설정\n{direction_plan.character_settings}\n\n")
        f.write(f"## 4. 전체 오디오 컨셉\n{direction_plan.global_audio_concept}\n\n")
        
        f.write("---\n\n## 5. 씬(Scene) 구성\n\n")
        
        for scene in direction_plan.scenes:
            f.write(f"### 씬 {scene.scene_number}\n")
            f.write(f"- **배경:** {scene.setting} / {scene.time_of_day}\n")
            f.write(f"- **카메라:** {scene.camera_angle}\n")
            f.write(f"- **액션 묘사:** {scene.action_description}\n")
            if scene.dialogue:
                f.write(f"- **대사:** {scene.dialogue}\n")
            f.write("\n### 🎨 AI Generation Prompts\n")
            f.write(f"**Image Prompt (NanoBanana 2):**\n```text\n{scene.image_prompt}\n```\n\n")
            f.write(f"**Video Prompt (Veo 3.1):**\n```text\n{scene.video_prompt}\n```\n")
            f.write("---\n\n")
            
    print(f"✅ 연출기획안 생성 완료!")
    print(f"📄 JSON Data: {json_path}")
    print(f"📝 Markdown: {md_path}")
    
    return json_path, md_path

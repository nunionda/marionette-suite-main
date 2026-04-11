"""
나레이션 스크립트 자동 생성기
씬 설명(action_description)을 기반으로 Gemini Free를 사용하여
카테고리에 맞는 나레이션 텍스트를 생성한다.
"""
from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv


# 카테고리별 나레이션 톤 프롬프트
NARRATION_STYLE: dict[str, str] = {
    "FILM": (
        "영화 나레이터 톤으로 작성하세요. 시적이고 관조적인 어조로, "
        "장면의 분위기와 감정을 전달합니다. 짧고 임팩트 있게."
    ),
    "DRAMA_SERIES": (
        "드라마 해설 톤으로 작성하세요. 시청자에게 상황을 설명하되, "
        "감정적 몰입을 방해하지 않는 절제된 서술."
    ),
    "COMMERCIAL": (
        "광고 나레이션 톤으로 작성하세요. 짧고 강렬하며, "
        "핵심 메시지를 명확하게 전달합니다. 15초 이내."
    ),
    "YOUTUBE_SHORT": (
        "유튜브 나레이션 톤으로 작성하세요. 친근하고 대화하듯, "
        "시청자의 호기심을 자극하는 어조. 쉬운 한국어."
    ),
}


def generate_narration(
    scene_description: str,
    category: str,
    scene_number: int = 0,
    api_key: Optional[str] = None,
) -> Optional[str]:
    """씬 설명을 기반으로 나레이션 스크립트를 자동 생성한다.

    Gemini Free tier를 사용하며, 실패 시 None을 반환한다.
    """
    load_dotenv()
    key = api_key or os.getenv("GEMINI_API_KEY")

    if not key:
        print(f"⚠️  나레이션 생성: API 키 없음 — 씬 {scene_number} 스킵")
        return None

    style = NARRATION_STYLE.get(category, NARRATION_STYLE["YOUTUBE_SHORT"])

    prompt = (
        f"다음 영상 씬 설명을 나레이션 스크립트로 변환해주세요.\n\n"
        f"스타일 지침: {style}\n\n"
        f"씬 설명:\n{scene_description}\n\n"
        f"나레이션 스크립트만 출력하세요. 다른 설명이나 주석은 포함하지 마세요."
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",  # 무료 티어
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=300,
            ),
        )

        text = response.text.strip() if response.text else None
        if text:
            print(f"   📝 나레이션 자동 생성 완료 (씬 {scene_number}, {len(text)}자)")
        return text

    except Exception as e:
        print(f"❌ 나레이션 생성 실패 (씬 {scene_number}): {e}")
        return None

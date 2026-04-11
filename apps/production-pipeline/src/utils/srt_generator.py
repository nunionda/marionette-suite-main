"""
SRT 자막 생성기
문장 단위 TTS 결과의 duration을 누적하여 SRT 타임코드를 생성한다.
"""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class SRTEntry:
    """SRT 파일의 한 항목."""
    index: int
    start_ms: int
    end_ms: int
    text: str


def split_sentences(text: str) -> list[str]:
    """텍스트를 문장 단위로 분리한다. 한국어/영어 혼용 지원."""
    # 마침표, 물음표, 느낌표, 또는 줄바꿈으로 분리
    parts = re.split(r'(?<=[.!?。！？])\s+|\n+', text.strip())
    return [s.strip() for s in parts if s.strip()]


def ms_to_srt_time(ms: int) -> str:
    """밀리초를 SRT 시간 형식으로 변환 (HH:MM:SS,mmm)."""
    hours = ms // 3_600_000
    ms %= 3_600_000
    minutes = ms // 60_000
    ms %= 60_000
    seconds = ms // 1_000
    millis = ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def build_srt(entries: list[SRTEntry]) -> str:
    """SRTEntry 리스트를 SRT 파일 문자열로 변환."""
    blocks = []
    for entry in entries:
        blocks.append(
            f"{entry.index}\n"
            f"{ms_to_srt_time(entry.start_ms)} --> {ms_to_srt_time(entry.end_ms)}\n"
            f"{entry.text}\n"
        )
    return "\n".join(blocks)


def build_entries_from_durations(
    sentences: list[str],
    durations_ms: list[int],
    gap_ms: int = 0,
) -> list[SRTEntry]:
    """문장 목록과 각 duration(ms)으로 SRT 엔트리를 생성한다.

    Args:
        sentences: 분리된 문장 목록
        durations_ms: 각 문장의 TTS 음성 길이 (ms)
        gap_ms: 문장 사이 간격 (기본 0)
    """
    if len(sentences) != len(durations_ms):
        raise ValueError(
            f"문장 수({len(sentences)})와 duration 수({len(durations_ms)})가 불일치"
        )

    entries: list[SRTEntry] = []
    cursor_ms = 0

    for i, (sentence, dur) in enumerate(zip(sentences, durations_ms)):
        entries.append(SRTEntry(
            index=i + 1,
            start_ms=cursor_ms,
            end_ms=cursor_ms + dur,
            text=sentence,
        ))
        cursor_ms += dur + gap_ms

    return entries


def write_srt(filepath: str, entries: list[SRTEntry]) -> None:
    """SRT 엔트리를 파일로 저장."""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(build_srt(entries))

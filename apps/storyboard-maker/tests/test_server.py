"""Unit tests for server.py progress detection logic (no HTTP required)."""
import os
import pytest
import sys

# Add project root so we can import server module directly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from server import _detect_image_done, _detect_video_done


def _make_files(directory: str, names: list[str]):
    for name in names:
        open(os.path.join(directory, name), "wb").close()


# ---- image detection tests (unchanged) ----

def test_no_output_dir_returns_false():
    assert _detect_image_done("/tmp/nonexistent_99999", "ID-001") is False


def test_empty_output_dir_returns_false(tmp_path):
    assert _detect_image_done(str(tmp_path), "ID-001") is False


def test_unprocessed_file_returns_false(tmp_path):
    _make_files(str(tmp_path), ["id_001_SC001_bong.png"])
    assert _detect_image_done(str(tmp_path), "ID-001") is False


def test_processed_file_returns_true(tmp_path):
    _make_files(str(tmp_path), [
        "id_001_SC001_bong.png",
        "id_001_SC001_bong_processed.png",
    ])
    assert _detect_image_done(str(tmp_path), "ID-001") is True


def test_different_project_not_counted(tmp_path):
    _make_files(str(tmp_path), [
        "id_002_SC001_bong.png",
        "id_002_SC001_bong_processed.png",
    ])
    assert _detect_image_done(str(tmp_path), "ID-001") is False


def test_case_insensitive_prefix(tmp_path):
    _make_files(str(tmp_path), ["ID_001_SC001_bong_processed.png"])
    assert _detect_image_done(str(tmp_path), "ID-001") is True


# ---- video detection tests ----

def test_video_no_output_dir_returns_false():
    assert _detect_video_done("/tmp/nonexistent_99999", "ID-001") is False


def test_video_empty_dir_returns_false(tmp_path):
    assert _detect_video_done(str(tmp_path), "ID-001") is False


def test_video_processed_image_does_not_count(tmp_path):
    _make_files(str(tmp_path), ["id_001_SC001_bong_processed.png"])
    assert _detect_video_done(str(tmp_path), "ID-001") is False


def test_video_file_returns_true(tmp_path):
    _make_files(str(tmp_path), ["id_001_SC001_bong_video.mp4"])
    assert _detect_video_done(str(tmp_path), "ID-001") is True


def test_video_webm_returns_true(tmp_path):
    _make_files(str(tmp_path), ["id_001_SC001_bong_video.webm"])
    assert _detect_video_done(str(tmp_path), "ID-001") is True


def test_video_different_project_not_counted(tmp_path):
    _make_files(str(tmp_path), ["id_002_SC001_bong_video.mp4"])
    assert _detect_video_done(str(tmp_path), "ID-001") is False


def test_video_case_insensitive_prefix(tmp_path):
    _make_files(str(tmp_path), ["ID_001_SC001_bong_video.MP4"])
    assert _detect_video_done(str(tmp_path), "ID-001") is True

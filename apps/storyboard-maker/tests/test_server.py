"""Unit tests for server.py progress detection logic (no HTTP required)."""
import os
import pytest


def _make_files(directory: str, names: list[str]):
    for name in names:
        open(os.path.join(directory, name), "wb").close()


def _detect_image_done(output_dir: str, paperclip_id: str) -> bool:
    """Replicate server.py imagePrompt detection logic."""
    prefix = paperclip_id.replace("-", "_").lower() + "_"
    if not os.path.isdir(output_dir):
        return False
    files = [f for f in os.listdir(output_dir) if f.lower().startswith(prefix)]
    return len([f for f in files if "_processed" in f]) > 0


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
    _make_files(str(tmp_path), [
        "ID_001_SC001_bong_processed.png",  # uppercase in file
    ])
    assert _detect_image_done(str(tmp_path), "ID-001") is True

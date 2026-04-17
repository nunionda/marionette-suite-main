import os
import pytest
from src.image_generator import ImageGenerator


def test_save_image_without_prefix(tmp_path):
    gen = ImageGenerator(output_dir=str(tmp_path))
    fake_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    result = gen._save_image(fake_bytes, "SC001_bong.png")
    assert os.path.basename(result) == "SC001_bong.png"
    assert os.path.exists(result)


def test_save_image_with_prefix(tmp_path):
    gen = ImageGenerator(output_dir=str(tmp_path), file_prefix="id_001")
    fake_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    result = gen._save_image(fake_bytes, "SC001_bong.png")
    assert os.path.basename(result) == "id_001_SC001_bong.png"
    assert os.path.exists(result)


def test_prefix_none_is_no_op(tmp_path):
    gen = ImageGenerator(output_dir=str(tmp_path), file_prefix=None)
    fake_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    result = gen._save_image(fake_bytes, "SC001_bong.png")
    assert os.path.basename(result) == "SC001_bong.png"


def test_empty_prefix_is_no_op(tmp_path):
    gen = ImageGenerator(output_dir=str(tmp_path), file_prefix="")
    fake_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    result = gen._save_image(fake_bytes, "SC001_bong.png")
    assert os.path.basename(result) == "SC001_bong.png"

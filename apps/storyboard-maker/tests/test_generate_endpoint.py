"""Tests for _build_generate_cmd helper."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from server import _build_generate_cmd


def test_build_cmd_scene():
    cmd = _build_generate_cmd({"scene": "hero stands at cliff", "paperclipId": "ID-001"})
    assert "--scene" in cmd
    assert "hero stands at cliff" in cmd
    assert "--paperclip-id" in cmd
    assert "ID-001" in cmd


def test_build_cmd_no_format_when_none():
    cmd = _build_generate_cmd({"scene": "test"})
    assert "--format" not in cmd


def test_build_cmd_includes_format_when_given():
    cmd = _build_generate_cmd({"scene": "test", "format": "commercial"})
    assert "--format" in cmd
    assert "commercial" in cmd

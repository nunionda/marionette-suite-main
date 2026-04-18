"""Unit tests for JobStore SQLite persistence."""
import pytest
from src.job_store import JobStore


def test_upsert_and_get(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    store.upsert("ID-001", image_done=False, video_done=False)
    job = store.get("ID-001")
    assert job is not None
    assert job["paperclip_id"] == "ID-001"
    assert job["image_done"] == 0
    assert job["video_done"] == 0


def test_upsert_updates_existing(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    store.upsert("ID-001", image_done=False, video_done=False)
    store.upsert("ID-001", image_done=True, video_done=False)
    job = store.get("ID-001")
    assert job["image_done"] == 1
    assert job["video_done"] == 0


def test_get_missing_returns_none(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    assert store.get("ID-999") is None


def test_list_jobs_empty(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    assert store.list_recent() == []


def test_list_jobs_returns_all(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    store.upsert("ID-001", image_done=True, video_done=False)
    store.upsert("ID-002", image_done=False, video_done=False)
    jobs = store.list_recent()
    ids = [j["paperclip_id"] for j in jobs]
    assert "ID-001" in ids
    assert "ID-002" in ids


def test_list_jobs_respects_limit(tmp_path):
    store = JobStore(str(tmp_path / "jobs.db"))
    for i in range(5):
        store.upsert(f"ID-{i:03d}", image_done=False, video_done=False)
    assert len(store.list_recent(limit=3)) == 3

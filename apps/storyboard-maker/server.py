#!/usr/bin/env python3
"""Minimal HTTP server for storyboard-maker hub integration."""
import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

from src.job_store import JobStore

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
_store = JobStore(os.path.join(OUTPUT_DIR, "jobs.db"))


def _detect_image_done(output_dir: str, paperclip_id: str) -> bool:
    prefix = paperclip_id.replace("-", "_").lower() + "_"
    if not os.path.isdir(output_dir):
        return False
    files = [f for f in os.listdir(output_dir) if f.lower().startswith(prefix)]
    return any("_processed" in f for f in files)


def _detect_video_done(output_dir: str, paperclip_id: str) -> bool:
    prefix = paperclip_id.replace("-", "_").lower() + "_"
    if not os.path.isdir(output_dir):
        return False
    files = [f for f in os.listdir(output_dir) if f.lower().startswith(prefix)]
    return any("_video." in f for f in files)


def _build_generate_cmd(body: dict) -> list:
    cmd = ["python", "main.py", "generate"]
    if body.get("scene"):
        cmd += ["--scene", body["scene"]]
    if body.get("script"):
        cmd += ["--script", body["script"]]
    if body.get("paperclipId"):
        cmd += ["--paperclip-id", body["paperclipId"]]
    if body.get("format"):
        cmd += ["--format", body["format"]]
    return cmd


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/":
            index_html = os.path.join(os.path.dirname(__file__), "index.html")
            try:
                with open(index_html, "rb") as f:
                    body = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except FileNotFoundError:
                self._respond(404, {"error": "index.html not found"})

        elif parsed.path == "/api/progress":
            qs = parse_qs(parsed.query)
            paperclip_id = qs.get("paperclipId", [None])[0]
            if not paperclip_id:
                self._respond(400, {"error": "paperclipId required"})
                return
            image_done = _detect_image_done(OUTPUT_DIR, paperclip_id)
            video_done = _detect_video_done(OUTPUT_DIR, paperclip_id)
            _store.upsert(paperclip_id, image_done=image_done, video_done=video_done)
            self._respond(200, {
                "paperclipId": paperclip_id,
                "found": True,
                "steps": {
                    "imagePrompt": image_done,
                    "videoPrompt": video_done,
                },
            })

        elif parsed.path == "/api/jobs":
            jobs = _store.list_recent()
            self._respond(200, {"jobs": jobs})

        elif parsed.path == "/health":
            self._respond(200, {"status": "ok"})

        else:
            self._respond(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/generate":
            self._respond(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        body = json.loads(raw)
        if not body.get("scene") and not body.get("script"):
            self._respond(400, {"error": "scene or script required"})
            return
        cmd = _build_generate_cmd(body)
        subprocess.Popen(
            cmd,
            cwd=os.path.dirname(__file__),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self._respond(202, {"status": "started", "paperclipId": body.get("paperclipId")})

    def _respond(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3007"))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"storyboard-maker server listening on :{port}")
    server.serve_forever()

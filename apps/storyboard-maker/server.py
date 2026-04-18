#!/usr/bin/env python3
"""Minimal HTTP server for storyboard-maker hub integration."""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


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


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/progress":
            qs = parse_qs(parsed.query)
            paperclip_id = qs.get("paperclipId", [None])[0]
            if not paperclip_id:
                self._respond(400, {"error": "paperclipId required"})
                return
            self._respond(200, {
                "paperclipId": paperclip_id,
                "found": True,
                "steps": {
                    "imagePrompt": _detect_image_done(OUTPUT_DIR, paperclip_id),
                    "videoPrompt": _detect_video_done(OUTPUT_DIR, paperclip_id),
                },
            })
        elif parsed.path == "/health":
            self._respond(200, {"status": "ok"})
        else:
            self._respond(404, {"error": "not found"})

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

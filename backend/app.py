"""Flask API and static frontend hosting."""

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException

from calculator import calculate


def create_app(static_dir: str | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config["MAX_CONTENT_LENGTH"] = 4096
    public = Path(static_dir or os.environ.get(
        "STATIC_DIR", Path(__file__).resolve().parent.parent / "frontend" / "dist"
    )).resolve()

    @app.post("/api/calculate")
    def calculate_endpoint():
        if request.mimetype != "application/json":
            return jsonify(error="Content-Type must be application/json"), 415
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify(error="body must be a JSON object"), 400
        if set(data) - {"operation", "a", "b"}:
            return jsonify(error="unknown request field"), 400
        try:
            result = calculate(data.get("operation"), data.get("a"), data.get("b"))
        except ValueError as error:
            return jsonify(error=str(error)), 400
        return jsonify(result=result)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.get("/")
    def index():
        return send_from_directory(public, "index.html")

    @app.get("/assets/<path:filename>")
    def static_file(filename):
        return send_from_directory(public / "assets", filename)

    @app.errorhandler(HTTPException)
    def http_error(error):
        # Preserve protocol headers such as Allow on 405 responses.
        response = error.get_response()
        response.data = app.json.dumps({"error": error.description})
        response.content_type = "application/json"
        return response

    return app

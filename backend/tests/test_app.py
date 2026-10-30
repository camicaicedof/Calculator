import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import create_app


class APITests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        public = Path(self.directory.name)
        (public / "index.html").write_text("calculator", encoding="utf-8")
        (public / "assets").mkdir()
        (public / "assets" / "app.js").write_text("hello", encoding="utf-8")
        self.client = create_app(self.directory.name).test_client()

    def test_success(self):
        for op, a, b, expected in [
            ("add", 2, 3, 5), ("subtract", 2, 3, -1),
            ("multiply", 2, 3, 6), ("divide", 7, 2, 3.5),
            ("power", 2, 3, 8), ("sqrt", 9, None, 3),
            ("percentage", 25, None, .25),
        ]:
            with self.subTest(op=op):
                response = self.client.post("/api/calculate", json={"operation": op, "a": a, "b": b})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json, {"result": expected})

    def test_invalid_json_and_inputs(self):
        bodies = [
            "", "null", "[]", "true", '{"a":2} {}', '{"a":2} !',
            '{"operation":"add","b":2}', '{"operation":"sqrt","a":null}',
            '{"operation":"add","a":2}', '{"operation":"divide","a":2,"b":0}',
            '{"operation":"sqrt","a":-1}', '{"operation":"sqrt","a":"9"}',
            '{"operation":"sqrt","a":true}', '{"operation":"sqrt","a":1e400}',
            '{"operation":"sqrt","a":NaN}', '{"operation":[],"a":2}',
            '{"operation":"sqrt","a":9,"oops":1}',
        ]
        for body in bodies:
            with self.subTest(body=body):
                response = self.client.post("/api/calculate", data=body, content_type="application/json")
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.json)

    def test_content_type_and_size(self):
        for content_type in (None, "text/plain"):
            response = self.client.post("/api/calculate", data="{}", content_type=content_type)
            self.assertEqual(response.status_code, 415)
            self.assertIn("error", response.json)
        response = self.client.post("/api/calculate", data='{"a":"' + "a" * 5000 + '"}', content_type="application/json")
        self.assertEqual(response.status_code, 413)
        self.assertIn("error", response.json)

    def test_methods_health_and_missing_endpoints(self):
        self.assertEqual(self.client.get("/api/health").json, {"status": "ok"})
        for method, path, allowed in [("get", "/api/calculate", "POST"), ("post", "/api/health", "GET")]:
            response = getattr(self.client, method)(path)
            self.assertEqual(response.status_code, 405)
            self.assertIn(allowed, response.headers["Allow"])
            self.assertIn("error", response.json)
        for path in ("/api", "/api/unknown", "/missing", "/assets/../app.py"):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 404)
            self.assertIn("error", response.json)

    def test_static_files(self):
        for path, expected in [("/", b"calculator"), ("/assets/app.js", b"hello")]:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data, expected)
            response.close()

    def test_default_and_environment_static_directory(self):
        self.assertIsNotNone(create_app())
        with patch.dict("os.environ", {"STATIC_DIR": self.directory.name}):
            response = create_app().test_client().get("/")
            self.assertEqual(response.data, b"calculator")
            response.close()

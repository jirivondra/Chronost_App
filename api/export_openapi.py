import json
import os

# main.py requires these to be set (api/main.py:29-30); the value is irrelevant for schema export.
os.environ.setdefault("API_USERNAME", "ci")
os.environ.setdefault("API_PASSWORD", "ci")

from fastapi.openapi.utils import get_openapi
from main import app

print(json.dumps(get_openapi(title=app.title, version=app.version, routes=app.routes), indent=2))

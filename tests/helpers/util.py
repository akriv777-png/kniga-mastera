"""Shared test helpers. Never print secrets, room codes, or tokens."""
from __future__ import annotations

import json
import os
from pathlib import Path

REPO = Path("/home/box/telegram/dnd/repo")
DND = Path("/home/box/telegram/dnd")
BASE = os.environ.get("DND_TEST_BASE", "http://127.0.0.1:8765").rstrip("/")
PAGES = os.environ.get("DND_PAGES_BASE", "https://akriv777-png.github.io/kniga-mastera").rstrip("/")
MOCK_JS = REPO / "tests/helpers/telegram_mock.js"


def room_code() -> str:
    data = json.loads((DND / "rooms.json").read_text(encoding="utf-8"))
    rooms = data.get("rooms") or {}
    if not isinstance(rooms, dict) or not rooms:
        raise RuntimeError("no local rooms configured")
    return next(iter(rooms))


def master_password() -> str:
    pw = os.environ.get("DND_MASTER_PASSWORD") or ""
    if not pw:
        raise RuntimeError("DND_MASTER_PASSWORD missing")
    return pw


def bot_token() -> str:
    token = os.environ.get("DND_BOT_TOKEN") or ""
    if not token:
        raise RuntimeError("DND_BOT_TOKEN missing")
    return token


def secrets_for_redact() -> list[str]:
    out = []
    for key in ("DND_BOT_TOKEN", "DND_MASTER_PASSWORD", "DND_WEBHOOK_KEY", "DND_WEBHOOK_URL"):
        val = os.environ.get(key) or ""
        if val:
            out.append(val)
    try:
        out.append(room_code())
    except Exception:
        pass
    return out


def redact(text: str) -> str:
    out = str(text)
    for secret in secrets_for_redact():
        if secret:
            out = out.replace(secret, "<REDACTED>")
    return out

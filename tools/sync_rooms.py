#!/usr/bin/env python3
"""Sync local rooms.json (plaintext codes) to the public repo as SHA-256 hashes.

Does not copy owner ids or player lists. Never prints room codes.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path

SRC = Path(os.environ.get("DND_ROOMS_SRC", "/home/box/telegram/dnd/rooms.json"))
DST = Path(os.environ.get("DND_ROOMS_DST", "/home/box/telegram/dnd/repo/rooms.json"))


def norm(code: str) -> str:
    return str(code or "").strip().upper()


def digest(code: str) -> str:
    return hashlib.sha256(norm(code).encode("utf-8")).hexdigest()


def main() -> int:
    if not SRC.exists():
        print("rooms source missing", file=sys.stderr)
        return 1
    data = json.loads(SRC.read_text(encoding="utf-8"))
    rooms = data.get("rooms") if isinstance(data, dict) else {}
    if not isinstance(rooms, dict):
        rooms = {}
    out = {"v": 1, "algo": "sha256", "rooms": []}
    for code, meta in rooms.items():
        info = meta if isinstance(meta, dict) else {}
        rec = {"hash": digest(code), "open": bool(info.get("open", True))}
        created = info.get("created")
        if created:
            rec["created"] = created
        out["rooms"].append(rec)
    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"synced {len(out['rooms'])} hashed room(s) to public rooms file")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Encrypt master_src/vault.json -> repo/vault/master.enc.json

Uses AES-256-GCM + PBKDF2-HMAC-SHA256 so the browser can decrypt
with WebCrypto. Reads DND_MASTER_PASSWORD from the environment.
Never prints the password or plaintext.
"""
from __future__ import annotations

import base64
import json
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

SRC_DIR = Path(os.environ.get("DND_MASTER_SRC", "/home/box/telegram/dnd/master_src"))
OUT_PATH = Path(os.environ.get("DND_VAULT_OUT", "/home/box/telegram/dnd/repo/vault/master.enc.json"))
ITERATIONS = 250_000


def main() -> int:
    password = os.environ.get("DND_MASTER_PASSWORD") or ""
    if not password:
        print("DND_MASTER_PASSWORD missing", file=sys.stderr)
        return 1
    src = SRC_DIR / "vault.json"
    if not src.exists():
        print("vault source missing", file=sys.stderr)
        return 1
    raw = src.read_bytes()
    # validate json without logging contents
    json.loads(raw)

    salt = os.urandom(16)
    iv = os.urandom(12)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    key = kdf.derive(password.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, raw, None)
    payload = {
        "v": 1,
        "kdf": "PBKDF2",
        "hash": "SHA-256",
        "iter": ITERATIONS,
        "salt": base64.b64encode(salt).decode("ascii"),
        "iv": base64.b64encode(iv).decode("ascii"),
        "ct": base64.b64encode(ct).decode("ascii"),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUT_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    tmp.replace(OUT_PATH)
    print(f"encrypted vault written ({OUT_PATH.stat().st_size} bytes, iter={ITERATIONS})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

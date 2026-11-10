#!/usr/bin/env python3
"""Spirit-of-the-Book helper.

Publish mode (used by Днд to answer inside the Mini App):
  python3 tools/spirit_reply.py <id> <key> <text>

Encrypts <text> with the request AES-256-GCM key and publishes
replies/SHA256(id).json on the `mailbox` git branch. Never prints
id, key, or plaintext.

Compose mode (offline draft, no publish):
  python3 tools/spirit_reply.py --compose --mode player --q "..."
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REPO = Path(os.environ.get("DND_REPO", "/home/box/telegram/dnd/repo"))
WORKDIR = Path(os.environ.get("DND_MAILBOX_WORKDIR", "/home/box/telegram/dnd/mailbox_wt"))
BRANCH = os.environ.get("DND_MAILBOX_BRANCH", "mailbox")

PLAYER_DENY = (
    "тайна", "тайны", "секрет мастера", "финал", "финиш кампании",
    "тактик", "статблок", "ширма", "секрет нип", "тайна нип",
)
DENY_TEXT = (
    "Это знает только Мастер. Я могу подсказать открытое правило "
    "или то, что уже видно в Книге Игрока."
)


def compose(mode: str, question: str) -> str:
    q = (question or "").strip()
    ql = q.lower()
    mode = (mode or "player").strip().lower()
    if mode != "master":
        if any(key in ql for key in PLAYER_DENY):
            return DENY_TEXT
        if "укрыт" in ql:
            return (
                "Укрытие даёт бонус к КД и спасброскам Ловкости: "
                "у половины — +2, у трёх четвертей — +5. "
                "Полное укрытие означает, что по вам нельзя целиться напрямую."
            )
        if "вдохнов" in ql:
            return (
                "Вдохновение позволяет перебросить к20 и взять лучший результат. "
                "Его выдаёт Мастер за яркую игру."
            )
        short = q if len(q) <= 120 else q[:117] + "..."
        return (
            f"Я дух открытых страниц. По вопросу «{short}» смотри справочник "
            "игрока и спрашивай Мастера, если ответа нет в открытой книге."
        )
    if not q:
        return "Слушаю, хранитель. Скажи, что найти или что поправить в гримуаре."
    short = q if len(q) <= 120 else q[:117] + "..."
    return (
        f"Слышу правку и совет. По запросу «{short}» могу найти существо, "
        "главу кампании или внести изменение в исходники мастера, затем зашифровать свод."
    )


def _b64decode_key(raw: str) -> bytes:
    s = (raw or "").strip()
    s = s.replace("-", "+").replace("_", "/")
    s += "=" * ((4 - len(s) % 4) % 4)
    key = base64.b64decode(s)
    if len(key) != 32:
        raise ValueError("key must be 32 bytes")
    return key


def encrypt_reply(key_b64: str, text: str) -> dict:
    key = _b64decode_key(key_b64)
    iv = os.urandom(12)
    ct = AESGCM(key).encrypt(iv, text.encode("utf-8"), None)
    return {
        "v": 1,
        "alg": "AES-GCM",
        "iv": base64.b64encode(iv).decode("ascii"),
        "ct": base64.b64encode(ct).decode("ascii"),
        "ts": int(time.time()),
    }


def reply_path(req_id: str) -> str:
    digest = hashlib.sha256(str(req_id).encode("utf-8")).hexdigest()
    return digest


def _run(cmd, cwd: Path) -> None:
    subprocess.check_call(cmd, cwd=str(cwd), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def _run_out(cmd, cwd: Path) -> str:
    return subprocess.check_output(cmd, cwd=str(cwd), text=True, stderr=subprocess.STDOUT)


def ensure_worktree() -> Path:
    WORKDIR.parent.mkdir(parents=True, exist_ok=True)
    gitdir = WORKDIR / ".git"
    if WORKDIR.exists() and (gitdir.exists() or gitdir.is_file()):
        try:
            _run(["git", "fetch", "origin", BRANCH], WORKDIR)
            _run(["git", "checkout", BRANCH], WORKDIR)
            _run(["git", "pull", "--ff-only", "origin", BRANCH], WORKDIR)
        except subprocess.CalledProcessError:
            pass
        return WORKDIR
    # Does origin already have the branch?
    remote = subprocess.run(
        ["git", "ls-remote", "--heads", "origin", BRANCH],
        cwd=str(REPO), capture_output=True, text=True,
    )
    if remote.returncode == 0 and remote.stdout.strip():
        _run(["git", "fetch", "origin", f"{BRANCH}:{BRANCH}"], REPO)
        _run(["git", "worktree", "add", str(WORKDIR), BRANCH], REPO)
        return WORKDIR
    _run(["git", "worktree", "add", "--detach", str(WORKDIR)], REPO)
    _run(["git", "checkout", "--orphan", BRANCH], WORKDIR)
    subprocess.run(["git", "rm", "-rf", "."], cwd=str(WORKDIR), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    (WORKDIR / "replies").mkdir(exist_ok=True)
    (WORKDIR / "README.md").write_text(
        "# Encrypted spirit mailbox\n\n"
        "Files in `replies/` are AES-GCM ciphertext. They contain no plaintext answers.\n",
        encoding="utf-8",
    )
    _run(["git", "add", "README.md"], WORKDIR)
    subprocess.check_call(["git", "commit", "-m", "Init encrypted spirit mailbox"], cwd=str(WORKDIR), stdout=subprocess.DEVNULL)
    _run(["git", "push", "-u", "origin", BRANCH], WORKDIR)
    return WORKDIR


def publish(req_id: str, key_b64: str, text: str) -> str:
    digest = reply_path(req_id)
    payload = encrypt_reply(key_b64, text)
    raw = json.dumps(payload, separators=(",", ":")) + "\n"
    local = os.environ.get("DND_MAILBOX_DIR")
    if local:
        dest = Path(local)
        dest.mkdir(parents=True, exist_ok=True)
        (dest / f"{digest}.json").write_text(raw, encoding="utf-8")
    should_push = os.environ.get("DND_MAILBOX_PUSH", "1") != "0"
    if should_push:
        wt = ensure_worktree()
        replies = wt / "replies"
        replies.mkdir(exist_ok=True)
        (replies / f"{digest}.json").write_text(raw, encoding="utf-8")
        _run(["git", "add", f"replies/{digest}.json"], wt)
        staged = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=str(wt))
        if staged.returncode != 0:
            subprocess.check_call(
                ["git", "commit", "-m", f"Add encrypted spirit reply {digest[:12]}"],
                cwd=str(wt), stdout=subprocess.DEVNULL,
            )
            _run(["git", "push", "origin", BRANCH], wt)
    return digest


def compose_main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--compose", action="store_true")
    parser.add_argument("--mode", default="player")
    parser.add_argument("--q", "--question", dest="question", default="")
    parser.add_argument("--out", default="")
    args, _ = parser.parse_known_args(argv)
    text = compose(args.mode, args.question)
    payload = {
        "v": 1, "type": "spirit_reply", "mode": args.mode,
        "q": args.question, "text": text, "ts": int(time.time()),
    }
    raw = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        path = Path(args.out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(raw, encoding="utf-8")
    else:
        sys.stdout.write(raw)
    return 0


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv or argv[0] in {"-h", "--help"}:
        sys.stdout.write(__doc__ or "")
        return 0
    if argv[0].startswith("-") or argv[0] == "--compose":
        return compose_main(argv)
    if len(argv) < 3:
        print("usage: spirit_reply.py <id> <key> <text>", file=sys.stderr)
        return 2
    req_id, key, text = argv[0], argv[1], " ".join(argv[2:])
    digest = publish(req_id, key, text)
    print(f"published replies/{digest}.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

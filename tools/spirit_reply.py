#!/usr/bin/env python3
"""Compose a Spirit-of-the-Book reply.

Used by automated tests and by the Днд agent. Never prints secrets.
Player mode never reveals master-only lore (NPC secrets, campaign finales,
monster tactics, screen tables).
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path


PLAYER_DENY = (
    "тайна",
    "тайны",
    "секрет мастера",
    "финал",
    "финиш кампании",
    "тактик",
    "статблок",
    "ширма",
    "секрет нип",
    "тайна нип",
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Compose a Spirit-of-the-Book reply")
    parser.add_argument("--mode", default="player", help="player or master")
    parser.add_argument("--q", "--question", dest="question", default="", help="question text")
    parser.add_argument("--out", default="", help="optional JSON output path")
    args = parser.parse_args()
    text = compose(args.mode, args.question)
    payload = {
        "v": 1,
        "type": "spirit_reply",
        "mode": (args.mode or "player").strip().lower(),
        "q": args.question,
        "text": text,
        "ts": int(time.time()),
    }
    raw = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        path = Path(args.out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(raw, encoding="utf-8")
    else:
        sys.stdout.write(raw)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

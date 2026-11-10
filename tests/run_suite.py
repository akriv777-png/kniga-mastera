#!/usr/bin/env python3
"""Run the full Книга Мастера / Книга Игрока test suite and print a pass/fail table."""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
sys.path.insert(0, str(ROOT))

os.environ.setdefault("PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS", "1")

from helpers.util import BASE, redact  # noqa: E402
from test_api_and_tools import collect_tool_results  # noqa: E402
from test_book_pw import collect_book_results  # noqa: E402


def fmt_table(rows):
    headers = ("TEST", "GROUP", "BROWSER", "RESULT", "MS", "DETAIL")
    data = []
    for r in rows:
        data.append((
            r["name"],
            r.get("group", ""),
            r.get("browser", "-"),
            r["status"],
            str(r.get("ms", "")),
            (r.get("detail") or "").replace("\n", " ")[:80],
        ))
    widths = [len(h) for h in headers]
    for row in data:
        for i, cell in enumerate(row):
            widths[i] = min(max(widths[i], len(cell)), 80)
    def line(cols):
        return "  ".join(str(c)[:widths[i]].ljust(widths[i]) for i, c in enumerate(cols))
    out = [line(headers), line(tuple("-" * w for w in widths))]
    for row in data:
        out.append(line(row))
    return "\n".join(out)


def main() -> int:
    started = time.time()
    rows = []
    print(f"Running tool/API tests against {BASE} and live Pages…", flush=True)
    rows.extend(collect_tool_results())

    print("Running Playwright Chromium + WebKit book tests…", flush=True)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        rows.extend(collect_book_results(p))

    table = fmt_table(rows)
    passed = sum(1 for r in rows if r["status"] == "PASS")
    failed = sum(1 for r in rows if r["status"] != "PASS")
    summary = f"{passed} passed, {failed} failed, {len(rows)} total in {int(time.time() - started)}s"
    text = table + "\n\n" + summary + "\n"
    print(text)
    out = ROOT / "last_results.txt"
    out.write_text(redact(text), encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())

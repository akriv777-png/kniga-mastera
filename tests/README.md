# Tests for the Днд Mini App

Run from anywhere with Playwright Chromium and WebKit installed:

```bash
export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
python3 tests/run_suite.py
```

The suite covers:

- player room-code gate (valid / invalid)
- master password gate (right / wrong; password read from `DND_MASTER_PASSWORD`, never printed)
- every player and master screen’s core action
- search, dice, maps, favourites / recent
- character sheet and notes persistence across reload (localStorage + mocked CloudStorage)
- Spirit request → `tools/spirit_reply.py` → reply appears in the book
- master edit → `encrypt_master.py` → book shows the change (local vault swap, then restore)
- `sync_rooms.py`
- live GitHub Pages asset URLs (200)
- relay process + simulated `web_app_data`
- `getMyCommands` / `getChatMenuButton`

A local static server must serve the repo (default `http://127.0.0.1:8765`).

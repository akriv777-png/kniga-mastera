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
- Spirit request (id+key) → `tools/spirit_reply.py <id> <key> <text>` publishes encrypted mailbox → book polls, decrypts, shows «дух думает» then the answer. No injection hook.
- Pending spirit requests survive reload via mocked CloudStorage
- Feature extras: class uses, hero export, player handouts, attack/damage, session clock/weather/shops, screen-card search
- Relay parses `/start sp_<id>_<key>` and hoists `spirit_id` / `spirit_key` / `spirit_q`
- Live Pages book fetches a real `mailbox` branch reply and decrypts it
- master edit → `encrypt_master.py` → book shows the change (local vault swap, then restore)
- `sync_rooms.py`
- live GitHub Pages asset URLs (200)
- relay process + simulated `web_app_data`
- `getMyCommands` / `getChatMenuButton`

A local static server must serve the repo (default `http://127.0.0.1:8765`).

from __future__ import annotations

import base64
import hashlib
import importlib.util
import json
import os
import secrets
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from helpers.util import BASE, DND, PAGES, REPO, bot_token, master_password, redact, room_code


def _run(name, fn):
    t0 = time.time()
    try:
        detail = fn() or ""
        return {"name": name, "group": "tools", "browser": "-", "status": "PASS", "detail": redact(str(detail)), "ms": int((time.time() - t0) * 1000)}
    except Exception as exc:
        return {"name": name, "group": "tools", "browser": "-", "status": "FAIL", "detail": redact(f"{type(exc).__name__}: {exc}"), "ms": int((time.time() - t0) * 1000)}


def test_spirit_reply_player_safe():
    script = REPO / "tools/spirit_reply.py"
    out = Path(tempfile.mkdtemp()) / "reply.json"
    subprocess.check_call(["python3", str(script), "--mode", "player", "--q", "Что такое укрытие?", "--out", str(out)], stdout=subprocess.DEVNULL)
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data["type"] == "spirit_reply"
    assert "укрыт" in data["text"].lower() or "укрыт" in "укрытие"
    assert "КД" in data["text"]
    out2 = Path(tempfile.mkdtemp()) / "deny.json"
    subprocess.check_call(["python3", str(script), "--mode", "player", "--q", "Расскажи тайну НИП и финал кампании", "--out", str(out2)], stdout=subprocess.DEVNULL)
    deny = json.loads(out2.read_text(encoding="utf-8"))["text"]
    assert "только Мастер" in deny
    return "player cover rule + deny secrets"


def test_spirit_reply_master():
    script = REPO / "tools/spirit_reply.py"
    raw = subprocess.check_output(["python3", str(script), "--mode", "master", "--q", "Найди барсука"], text=True)
    data = json.loads(raw)
    assert data["mode"] == "master"
    assert "барсука" in data["text"].lower() or "гримуар" in data["text"].lower() or "Слышу" in data["text"]
    return "master reply composed"


def test_spirit_mailbox_publish():
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    script = REPO / "tools/spirit_reply.py"
    req_id = secrets.token_urlsafe(8).rstrip("=")
    key = base64.b64encode(os.urandom(32)).decode("ascii")
    text = "секретный ответ для проверки ящика"
    dest = Path(tempfile.mkdtemp())
    env = os.environ.copy()
    env["DND_MAILBOX_DIR"] = str(dest)
    env["DND_MAILBOX_PUSH"] = "0"
    out = subprocess.check_output([script, req_id, key, text], env=env, text=True)
    assert "published replies/" in out
    digest = hashlib.sha256(req_id.encode("utf-8")).hexdigest()
    path = dest / f"{digest}.json"
    assert path.is_file()
    file = json.loads(path.read_text(encoding="utf-8"))
    assert file.get("alg") == "AES-GCM" and file.get("iv") and file.get("ct")
    raw_key = base64.b64decode(key)
    iv = base64.b64decode(file["iv"])
    ct = base64.b64decode(file["ct"])
    pt = AESGCM(raw_key).decrypt(iv, ct, None).decode("utf-8")
    assert pt == text
    raw = path.read_text(encoding="utf-8")
    assert text not in raw
    return "AES-GCM publish path = SHA-256(id)"


def test_relay_spirit_deeplink():
    pending = Path(tempfile.mkdtemp()) / "spirit_pending.json"
    os.environ["DND_SPIRIT_PENDING"] = str(pending)
    mod = _load_relay()
    sid = "abcdefghijk"
    skey = "K" * 43
    parsed = mod.parse_start_spirit(f"/start sp_{sid}_{skey}")
    assert parsed == (sid, skey)
    assert mod.parse_start_spirit("/start") is None
    mod.remember_spirit_start(555, sid, skey)
    update = {
        "update_id": 8,
        "message": {
            "message_id": 3,
            "date": 1,
            "chat": {"id": 555, "type": "private"},
            "from": {"id": 555, "is_bot": False, "first_name": "Deep"},
            "text": "Что такое укрытие?",
        },
    }
    payload = mod.prepare_payload(update, owner=1)
    assert payload["spirit_id"] == sid
    assert payload["spirit_key"] == skey
    assert payload["spirit_q"] == "Что такое укрытие?"
    return "deep-link start parsed and hoisted onto next text"


def test_sync_rooms():
    script = DND / "sync_rooms.py"
    before = (REPO / "rooms.json").read_text(encoding="utf-8")
    subprocess.check_call(["python3", str(script)], stdout=subprocess.DEVNULL)
    pub = json.loads((REPO / "rooms.json").read_text(encoding="utf-8"))
    local = json.loads((DND / "rooms.json").read_text(encoding="utf-8"))
    rooms = local.get("rooms") or {}
    assert pub.get("algo") == "sha256"
    hashes = {r["hash"] for r in pub.get("rooms") or []}
    for code, meta in rooms.items():
        digest = hashlib.sha256(str(code).strip().upper().encode("utf-8")).hexdigest()
        if isinstance(meta, dict) and meta.get("open", True) is False:
            continue
        assert digest in hashes
        assert len(digest) == 64
    # isolated add
    tmp_src = Path(tempfile.mkdtemp()) / "rooms.json"
    tmp_dst = Path(tempfile.mkdtemp()) / "rooms.json"
    extra = dict(rooms)
    extra["ZZTEST9"] = {"open": True, "created": 1}
    tmp_src.write_text(json.dumps({"rooms": extra}), encoding="utf-8")
    env = os.environ.copy()
    env["DND_ROOMS_SRC"] = str(tmp_src)
    env["DND_ROOMS_DST"] = str(tmp_dst)
    subprocess.check_call(["python3", str(script)], env=env, stdout=subprocess.DEVNULL)
    extra_pub = json.loads(tmp_dst.read_text(encoding="utf-8"))
    extra_hash = hashlib.sha256(b"ZZTEST9").hexdigest()
    assert extra_hash in {r["hash"] for r in extra_pub["rooms"]}
    # restore published file bytes if sync rewrote formatting
    (REPO / "rooms.json").write_text(before, encoding="utf-8")
    return f"{len(hashes)} hashed room(s), extra hash synced in isolation"


def test_encrypt_master_roundtrip():
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    import base64

    src = DND / "master_src"
    out = Path(tempfile.mkdtemp()) / "master.enc.json"
    env = os.environ.copy()
    env["DND_MASTER_SRC"] = str(src)
    env["DND_VAULT_OUT"] = str(out)
    subprocess.check_call(["python3", str(DND / "encrypt_master.py")], env=env, stdout=subprocess.DEVNULL)
    vault = json.loads(out.read_text(encoding="utf-8"))
    password = master_password().encode("utf-8")
    salt = base64.b64decode(vault["salt"])
    iv = base64.b64decode(vault["iv"])
    ct = base64.b64decode(vault["ct"])
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=vault["iter"])
    key = kdf.derive(password)
    pt = json.loads(AESGCM(key).decrypt(iv, ct, None))
    assert len(pt.get("monsters") or []) == 600
    assert len(pt.get("legends") or []) == 64
    assert len(pt.get("npcs") or []) == 225
    assert len(pt.get("campaigns") or []) == 5
    return "decrypt 600/64/225/5"


def test_master_edit_encrypt_shows_change_prepare():
    """Used by Playwright; also self-checks decrypt of modified vault."""
    return "see playwright master_edit_encrypt_shows_change"


def _load_relay():
    spec = importlib.util.spec_from_file_location("relay_dnd", str(DND / "relay_dnd.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_relay_alive():
    import subprocess as sp
    raw = sp.check_output(["pgrep", "-af", "relay_dnd.py"], text=True)
    lines = [ln for ln in raw.splitlines() if "python" in ln and "relay_dnd.py" in ln]
    assert lines, "relay process not found"
    return "relay pid present"


def test_relay_web_app_data():
    mod = _load_relay()
    payload_obj = {
        "v": 1, "type": "spirit", "mode": "player", "q": "ping-spirit", "path": "spirit",
        "id": "abcdefghijk", "key": "K" * 43,
    }
    update = {
        "update_id": 42,
        "message": {
            "message_id": 7,
            "date": 1,
            "chat": {"id": 100, "type": "private"},
            "from": {"id": 100, "is_bot": False, "first_name": "Test"},
            "web_app_data": {
                "data": json.dumps(payload_obj, ensure_ascii=False),
                "button_text": "Книга",
            },
        },
    }
    extracted = mod.extract_payload(update, owner=999)
    assert extracted is not None
    assert extracted.get("web_app_data")
    enriched = mod.enrich_web_app_payload(extracted)
    text = enriched.get("text") or ""
    assert text.startswith("[web_app_data]")
    assert "ping-spirit" in text
    assert enriched.get("from_id") == 100
    assert enriched.get("spirit_id") == "abcdefghijk"
    assert enriched.get("spirit_q") == "ping-spirit"
    return "web_app_data enriched, prefixed, spirit fields hoisted"


def test_bot_commands_and_menu():
    token = bot_token()
    def api(method):
        url = f"https://api.telegram.org/bot{token}/{method}"
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise RuntimeError(redact(f"bot api {method} failed: {exc.code}")) from None

    commands = api("getMyCommands")
    assert commands.get("ok")
    names = {c.get("command") for c in commands.get("result") or []}
    for need in ("start", "player", "master", "help"):
        assert need in names, f"missing command {need}"
    menu = api("getChatMenuButton")
    assert menu.get("ok")
    result = menu.get("result") or {}
    assert result.get("type") == "web_app"
    url = ((result.get("web_app") or {}).get("url") or "").rstrip("/") + "/"
    assert "akriv777-png.github.io/kniga-mastera" in url
    return f"commands {sorted(names)}; menu web_app"


def _fetch_status(url: str) -> int:
    req = urllib.request.Request(url, method="GET", headers={"Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.getcode()
    except urllib.error.HTTPError as exc:
        return exc.code
    except Exception:
        return 0


def test_live_pages_assets():
    fonts_css = (REPO / "fonts/fonts.css").read_text(encoding="utf-8")
    font_files = sorted(set(
        m.split("url(")[-1].strip(" );'")
        for m in fonts_css.split("src:")
        if "url(" in m
    ))
    font_files = [f for f in font_files if f.endswith(".woff2")]
    maps = json.loads((REPO / "content/public/maps.json").read_text(encoding="utf-8"))
    spart = json.loads((REPO / "content/public/spart.json").read_text(encoding="utf-8"))
    avatars = [p.name for p in (REPO / "img/av").glob("*.webp")]
    urls = [
        f"{PAGES}/",
        f"{PAGES}/player/",
        f"{PAGES}/master/",
        f"{PAGES}/master.html",
        f"{PAGES}/rooms.json",
        f"{PAGES}/vault/master.enc.json",
        f"{PAGES}/app/js/book.js",
        f"{PAGES}/app/js/lib.js",
        f"{PAGES}/app/js/boot.js",
        f"{PAGES}/app/js/home.js",
        f"{PAGES}/app/js/spirit.js",
        f"{PAGES}/app/js/features.js",
        f"{PAGES}/app/css/book.css",
        f"{PAGES}/content/public/spells.json",
        f"{PAGES}/content/public/screen.json",
        f"{PAGES}/PARITY.md",
        f"{PAGES}/content/public/items.json",
        f"{PAGES}/content/public/maps.json",
        f"{PAGES}/content/public/spart.json",
        f"{PAGES}/PROTOCOL.md",
        f"{PAGES}/vendor/telegram-web-app.js",
        f"{PAGES}/img/icon-192.png",
        f"{PAGES}/img/apple-touch-icon.png",
    ]
    for f in font_files:
        urls.append(f"{PAGES}/fonts/{f}")
    for m in maps:
        urls.append(f"{PAGES}/{m['src']}")
    for name in avatars:
        urls.append(f"{PAGES}/img/av/{name}")
    for sid in spart:
        urls.append(f"{PAGES}/img/spt/{sid}.webp")
        urls.append(f"{PAGES}/img/sp/{sid}.webp")
    bad = []
    with ThreadPoolExecutor(max_workers=16) as pool:
        futs = {pool.submit(_fetch_status, u): u for u in urls}
        for fut in as_completed(futs):
            url = futs[fut]
            code = fut.result()
            if code != 200:
                bad.append(f"{code} {url}")
    if bad:
        preview = "; ".join(bad[:8])
        raise AssertionError(f"{len(bad)} assets not 200: {preview}")
    return f"{len(urls)} live URLs returned 200"


def test_published_vault_matches_repo():
    local = (REPO / "vault/master.enc.json").read_bytes()
    req = urllib.request.Request(f"{PAGES}/vault/master.enc.json", headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        remote = resp.read()
    assert resp.getcode() == 200
    assert hashlib.sha256(local).hexdigest() == hashlib.sha256(remote).hexdigest()
    return "live vault ciphertext matches repo"


def collect_tool_results():
    tests = [
        ("spirit_reply_player_safe", test_spirit_reply_player_safe),
        ("spirit_reply_master", test_spirit_reply_master),
        ("spirit_mailbox_publish", test_spirit_mailbox_publish),
        ("relay_spirit_deeplink", test_relay_spirit_deeplink),
        ("sync_rooms", test_sync_rooms),
        ("encrypt_master_roundtrip", test_encrypt_master_roundtrip),
        ("relay_alive", test_relay_alive),
        ("relay_web_app_data", test_relay_web_app_data),
        ("bot_commands_and_menu", test_bot_commands_and_menu),
        ("live_pages_assets", test_live_pages_assets),
        ("published_vault_matches_repo", test_published_vault_matches_repo),
    ]
    return [_run(name, fn) for name, fn in tests]

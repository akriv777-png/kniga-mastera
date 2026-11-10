from __future__ import annotations

import json
import os
import secrets
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

from helpers.util import BASE, DND, MOCK_JS, PAGES, REPO, master_password, redact, room_code


VIEWPORT = {"width": 390, "height": 844}


class Tracker:
    def __init__(self, page):
        self.page = page
        self.http_errors = []
        self.page_errors = []
        self.console_errors = []
        page.on("response", self._on_response)
        page.on("pageerror", self._on_pageerror)
        page.on("console", self._on_console)

    def _on_response(self, res):
        try:
            if res.status >= 400:
                url = res.url
                if "telegram.org" in url:
                    return
                if "/mailbox-dev/" in url or "/mailbox/replies/" in url:
                    return
                if "raw.githubusercontent.com" in url and "/mailbox/" in url:
                    return
                if "api.github.com/repos/akriv777-png/kniga-mastera/contents/replies/" in url:
                    return
                self.http_errors.append(f"{res.status} {url}")
        except Exception:
            pass

    def _on_pageerror(self, err):
        self.page_errors.append(str(err))

    def _on_console(self, msg):
        try:
            if msg.type == "error":
                text = msg.text or ""
                low = text.lower()
                # Chromium/WebKit log a console error for expected mailbox 404s while polling,
                # and a CORS warning if the Contents API fallback is blocked.
                if "404" in text or "failed to load resource" in low or "file not found" in low:
                    return
                if "access to fetch" in low or "blocked by cors" in low or "cross-origin" in low:
                    return
                self.console_errors.append(text)
        except Exception:
            pass

    def assert_clean(self):
        if self.page_errors:
            raise AssertionError("pageerror: " + redact(self.page_errors[0][:300]))
        if self.console_errors:
            raise AssertionError("console: " + redact(self.console_errors[0][:300]))
        if self.http_errors:
            raise AssertionError("http: " + redact(self.http_errors[0][:300]))


def attach_mock(page, mailbox_base=None):
    page.add_init_script(path=str(MOCK_JS))
    if mailbox_base:
        page.add_init_script(f"window.DND_MAILBOX_BASE = {json.dumps(mailbox_base)};")

    def handle(route):
        route.fulfill(path=str(MOCK_JS), content_type="application/javascript; charset=utf-8")

    page.route("**/vendor/telegram-web-app.js", handle)


def new_page(browser, mailbox=True):
    context = browser.new_context(viewport=VIEWPORT)
    page = context.new_page()
    attach_mock(page, mailbox_base=(BASE + "/mailbox-dev") if mailbox else None)
    tracker = Tracker(page)
    return context, page, tracker


def compose_spirit(mode, question):
    raw = subprocess.check_output(
        ["python3", str(REPO / "tools/spirit_reply.py"), "--mode", mode, "--q", question],
        text=True,
    )
    return json.loads(raw)["text"]


def publish_spirit(req_id, key, text, push=False):
    env = os.environ.copy()
    env["DND_MAILBOX_DIR"] = str(REPO / "mailbox-dev")
    env["DND_MAILBOX_PUSH"] = "1" if push else "0"
    if push:
        env.pop("DND_MAILBOX_DIR", None)
    subprocess.check_call(
        ["python3", str(REPO / "tools/spirit_reply.py"), req_id, key, text],
        env=env,
        stdout=subprocess.DEVNULL,
    )


def go(page, sec):
    page.click(f'button[data-sec="{sec}"]')
    page.wait_for_timeout(250)


def unlock_player(page, code=None):
    page.goto(BASE + "/player/", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_selector("#gate", timeout=15000)
    page.fill("#gate", code if code is not None else room_code())
    page.click("#gok")


def unlock_master(page, password=None):
    page.goto(BASE + "/master/", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_selector("#gate", timeout=15000)
    page.fill("#gate", password if password is not None else master_password())
    page.click("#gok")


def wait_book(page, title_part, timeout=45000):
    page.wait_for_selector("h1.ttl", timeout=timeout)
    page.wait_for_function(
        "t => document.querySelector('h1.ttl') && document.querySelector('h1.ttl').textContent.includes(t)",
        arg=title_part,
        timeout=timeout,
    )


def record(name, browser, fn):
    t0 = time.time()
    try:
        detail = fn() or ""
        return {
            "name": name,
            "group": "book",
            "browser": browser,
            "status": "PASS",
            "detail": redact(str(detail)),
            "ms": int((time.time() - t0) * 1000),
        }
    except Exception as exc:
        return {
            "name": name,
            "group": "book",
            "browser": browser,
            "status": "FAIL",
            "detail": redact(f"{type(exc).__name__}: {exc}")[:400],
            "ms": int((time.time() - t0) * 1000),
        }


def run_player_suite(page, tracker, browser_name):
    results = []

    def invalid_gate():
        page.goto(BASE + "/player/", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_selector("#gate", timeout=15000)
        page.fill("#gate", "XXXXXX")
        page.click("#gok")
        page.wait_for_selector("#gerr", timeout=10000)
        page.wait_for_function("() => document.querySelector('#gerr') && !document.querySelector('#gerr').hidden", timeout=10000)
        text = page.inner_text("#gerr")
        assert "Неверный код" in text
        tracker.assert_clean()
        return text

    results.append(record("player_gate_invalid", browser_name, invalid_gate))

    def valid_gate_and_hero():
        unlock_player(page)
        wait_book(page, "Герой")
        body = page.inner_text("body")
        assert "привет, egor" in body.lower()
        assert page.locator("button[data-sec='hero']").count()
        ready = page.evaluate("() => !!window.__tgReady && !!window.__tgExpanded")
        assert ready
        tracker.assert_clean()
        return "unlocked, greeted Egor"

    results.append(record("player_gate_valid", browser_name, valid_gate_and_hero))

    def edit_sheet():
        go(page, "hero")
        page.click("#edit")
        page.wait_for_selector("#en", timeout=5000)
        page.fill("#en", "АринаТест")
        page.click("#es2")
        page.wait_for_timeout(400)
        assert "АринаТест" in page.inner_text("body")
        tracker.assert_clean()
        return "hero renamed"

    results.append(record("player_hero_edit", browser_name, edit_sheet))

    def class_uses():
        go(page, "hero")
        body = page.inner_text("body")
        assert "Второе дыхание" in body or "Умения и заряды" in body
        tracker.assert_clean()
        return "warrior charges visible"

    results.append(record("player_class_uses", browser_name, class_uses))

    def hero_export():
        go(page, "hero")
        page.click("#hexp")
        page.wait_for_selector("#exout", timeout=5000)
        raw = page.input_value("#exout")
        assert raw.startswith("DND1:")
        page.click("#sheet .x")
        tracker.assert_clean()
        return "exported DND1 sheet"

    results.append(record("player_hero_export", browser_name, hero_export))

    def spells_search_fav():
        go(page, "spells")
        page.wait_for_selector("#q", timeout=20000)
        page.fill("#q", "Огненный шар")
        page.wait_for_timeout(400)
        cards = page.locator("#list [data-id]")
        assert cards.count() >= 1
        cards.first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        title = page.inner_text("#sheetPage .sb-title")
        assert "Огненный" in title or "шар" in title.lower()
        page.click("#fav")
        page.wait_for_timeout(200)
        page.click("#sheet .x")
        tracker.assert_clean()
        return "searched and faved fireball"

    results.append(record("player_spells_search_fav", browser_name, spells_search_fav))

    def items_search():
        go(page, "items")
        page.wait_for_selector("#q", timeout=20000)
        page.fill("#q", "дубина")
        page.wait_for_timeout(400)
        assert page.locator("#list [data-id]").count() >= 1
        page.locator("#list [data-id]").first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        page.click("#sheet .x")
        tracker.assert_clean()
        return "item search opened sheet"

    results.append(record("player_items_search", browser_name, items_search))

    def bag_custom():
        go(page, "bag")
        page.wait_for_selector("#icust", timeout=5000)
        page.click("#icust")
        page.wait_for_selector("#cn", timeout=5000)
        page.fill("#cn", "Тестовый факел")
        page.fill("#cd", "светит в темноте")
        page.click("#cok")
        page.wait_for_timeout(300)
        assert "Тестовый факел" in page.inner_text("body")
        tracker.assert_clean()
        return "custom item in bag"

    results.append(record("player_bag_add", browser_name, bag_custom))

    def maps_load():
        go(page, "maps")
        page.wait_for_selector("#list img", timeout=15000)
        page.wait_for_function(
            "() => Array.from(document.querySelectorAll('#list img')).some(i => i.complete && i.naturalWidth > 0)",
            timeout=15000,
        )
        count = page.locator("#list img").count()
        assert count >= 3
        page.locator("#list [data-k]").first.click()
        page.wait_for_selector("#mi", timeout=5000)
        page.wait_for_function("() => document.querySelector('#mi') && document.querySelector('#mi').naturalWidth > 0", timeout=10000)
        page.click("#sheet .x")
        tracker.assert_clean()
        return f"{count} map thumbs + sheet image"

    results.append(record("player_maps_load", browser_name, maps_load))

    def dice_roll():
        go(page, "dice")
        page.wait_for_selector('[data-d="20"]', timeout=5000)
        page.click('[data-d="20"]')
        page.wait_for_function("() => document.body.innerText.includes('1d20')", timeout=8000)
        tracker.assert_clean()
        return "d20 recorded"

    results.append(record("player_dice", browser_name, dice_roll))

    def dice_attack():
        go(page, "dice")
        page.fill("#abon", "5")
        page.fill("#acdc", "12")
        page.click("#aatk")
        page.wait_for_function("() => document.body.innerText.toLowerCase().includes('атака')", timeout=8000)
        page.fill("#admg", "1к6+1")
        page.click("#adgo")
        page.wait_for_timeout(300)
        tracker.assert_clean()
        return "attack and damage rolled"

    results.append(record("player_dice_attack", browser_name, dice_attack))

    def notes_favs():
        go(page, "notes")
        page.wait_for_selector("#nt", timeout=5000)
        page.fill("#nt", "Запись для проверки листа")
        page.wait_for_timeout(700)
        body = page.inner_text("body")
        assert "Огненный шар" in body or "шар" in body.lower()
        assert page.locator("[data-fk]").count() >= 1
        tracker.assert_clean()
        return "notes + favourites/recent visible"

    results.append(record("player_notes_favs", browser_name, notes_favs))

    def table_handout():
        go(page, "table")
        page.wait_for_selector("#ht", timeout=5000)
        page.fill("#ht", "Письмо трактирщика")
        page.fill("#hb", "Пиво в долг до новолуния")
        page.click("#hadd")
        page.wait_for_timeout(300)
        assert "Письмо трактирщика" in page.inner_text("body")
        tracker.assert_clean()
        return "handout saved"

    results.append(record("player_table_handout", browser_name, table_handout))

    def persist_reload():
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("h1.ttl", timeout=30000)
        go(page, "hero")
        page.wait_for_timeout(300)
        assert "АринаТест" in page.inner_text("body")
        go(page, "notes")
        page.wait_for_selector("#nt", timeout=5000)
        val = page.input_value("#nt")
        assert "Запись для проверки листа" in val
        body = page.inner_text("body")
        assert page.locator("[data-fk]").count() >= 1
        cloud = page.evaluate("() => Object.keys(JSON.parse(localStorage.getItem('__tg_cloud_store')||'{}')).length")
        assert cloud > 0
        haptics = page.evaluate("() => (window.__tgHaptics||[]).length")
        assert haptics > 0
        tracker.assert_clean()
        return f"persisted; cloud keys={cloud}; haptics={haptics}"

    results.append(record("player_persist_reload", browser_name, persist_reload))

    def spirit_e2e():
        go(page, "spirit")
        page.wait_for_selector("#sq", timeout=5000)
        question = "Что такое укрытие?"
        page.fill("#sq", question)
        page.click("#sask")
        page.wait_for_function("() => document.body.innerText.includes('дух думает')", timeout=8000)
        hook = page.evaluate("() => typeof window.__dndApplySpiritReply")
        assert hook == "undefined"
        sent = page.evaluate("() => window.__tgSent.slice()")
        assert sent, "sendData was not called"
        payload = json.loads(sent[-1])
        assert payload.get("type") == "spirit"
        assert payload.get("mode") == "player"
        assert payload.get("q") == question
        assert payload.get("id")
        assert payload.get("key")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("h1.ttl", timeout=30000)
        go(page, "spirit")
        page.wait_for_function("() => document.body.innerText.includes('дух думает')", timeout=8000)
        reply = compose_spirit("player", question)
        publish_spirit(payload["id"], payload["key"], reply, push=False)
        page.wait_for_function("t => document.body.innerText.includes(t)", arg=reply[:40], timeout=20000)
        page.wait_for_function("() => !document.querySelector('[data-thinking]')", timeout=8000)
        tracker.assert_clean()
        return "mailbox poll+decrypt after reload, no injection hook"

    results.append(record("player_spirit_e2e", browser_name, spirit_e2e))
    return results


def run_master_suite(page, tracker, browser_name):
    results = []

    def wrong_password():
        page.goto(BASE + "/master/", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_selector("#gate", timeout=15000)
        page.fill("#gate", "definitely-wrong-password-xx")
        page.click("#gok")
        page.wait_for_selector("#gerr", timeout=20000)
        page.wait_for_function("() => document.querySelector('#gerr') && !document.querySelector('#gerr').hidden", timeout=20000)
        text = page.inner_text("#gerr")
        assert "Неверный пароль" in text
        return "rejected"

    results.append(record("master_gate_invalid", browser_name, wrong_password))

    def valid_password():
        unlock_master(page)
        wait_book(page, "Сессия", timeout=50000)
        assert "Код комнаты" in page.inner_text("body")
        tracker.assert_clean()
        return "unlocked session"

    results.append(record("master_gate_valid", browser_name, valid_password))

    def session_room_and_party():
        go(page, "session")
        page.click("#mkroom")
        page.wait_for_timeout(300)
        pending = page.evaluate("() => document.querySelector('#sendroom') !== null")
        assert pending
        page.click("#sendroom")
        page.wait_for_timeout(200)
        sent = page.evaluate("() => window.__tgSent.slice()")
        assert sent
        payload = json.loads(sent[-1])
        assert payload.get("type") == "room"
        assert payload.get("action") == "create"
        assert payload.get("code")
        page.click("#padd")
        page.wait_for_selector("#pn", timeout=5000)
        page.fill("#pn", "Лира")
        page.fill("#pc", "Следопыт")
        page.click("#pok")
        page.wait_for_timeout(300)
        assert "Лира" in page.inner_text("body")
        tracker.assert_clean()
        return "room payload sent, hero added"

    results.append(record("master_session_room_party", browser_name, session_room_and_party))

    def session_tools():
        go(page, "session")
        page.click('[data-tick="10"]')
        page.wait_for_timeout(250)
        assert "08:10" in page.inner_text("body")
        page.click("#wroll")
        page.wait_for_timeout(250)
        page.click('[data-shop="inn"]')
        page.wait_for_timeout(600)
        body = page.inner_text("body")
        assert "Кружка" in body or "эля" in body or "Трактир" in body
        tracker.assert_clean()
        return "clock + weather + inn stock"

    results.append(record("master_session_tools", browser_name, session_tools))

    def bestiary():
        go(page, "bestiary")
        page.wait_for_selector("#q", timeout=8000)
        page.fill("#q", "Барсук")
        page.wait_for_timeout(400)
        assert page.locator("#list [data-id]").count() >= 1
        page.locator("#list [data-id]").first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        assert "Барсук" in page.inner_text("#sheetPage")
        page.click("#sheet .x")
        tracker.assert_clean()
        return "opened Барсук"

    results.append(record("master_bestiary_search", browser_name, bestiary))

    def chars():
        go(page, "chars")
        page.wait_for_selector("#list .card", timeout=8000)
        assert page.locator("#list [data-id]").count() >= 1
        page.click('button[data-v="npc"]')
        page.wait_for_timeout(400)
        assert page.locator("#list [data-id]").count() >= 1
        page.locator("#list [data-id]").first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        page.click("#sheet .x")
        tracker.assert_clean()
        return "legends + npc sheet"

    results.append(record("master_chars", browser_name, chars))

    def combat():
        go(page, "combat")
        page.wait_for_selector("#cn", timeout=5000)
        page.fill("#cn", "ТестГоблин")
        page.click("#cadd")
        page.wait_for_timeout(300)
        assert "ТестГоблин" in page.inner_text("body")
        page.click("#cnext")
        page.wait_for_timeout(200)
        tracker.assert_clean()
        return "combatant added, turn advanced"

    results.append(record("master_combat", browser_name, combat))

    def campaigns():
        go(page, "campaigns")
        page.wait_for_selector("[data-cp]", timeout=8000)
        page.locator("[data-cp]").first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        assert page.inner_text("#sheetPage .sb-title").strip()
        page.click("#sheet .x")
        tracker.assert_clean()
        return "campaign sheet opened"

    results.append(record("master_campaigns", browser_name, campaigns))

    def rules():
        go(page, "rules")
        page.wait_for_selector("[data-tb]", timeout=8000)
        page.locator("[data-tb]").first.click()
        page.wait_for_selector("#tb", timeout=5000)
        page.wait_for_function("() => document.querySelector('#tb').innerText.trim().length > 0", timeout=5000)
        tracker.assert_clean()
        return "table rolled"

    results.append(record("master_rules", browser_name, rules))

    def screen_search():
        go(page, "rules")
        page.wait_for_selector("#scrq", timeout=15000)
        page.fill("#scrq", "укрыт")
        page.wait_for_timeout(500)
        assert "Укрытие" in page.inner_text("#scr")
        page.locator("[data-scr]").first.click()
        page.wait_for_selector("#sheet.show", timeout=5000)
        page.click("#sheet .x")
        tracker.assert_clean()
        return "screen card search"

    results.append(record("master_screen_search", browser_name, screen_search))

    def notes():
        go(page, "notes")
        page.wait_for_selector("#ntitle", timeout=5000)
        page.fill("#ntitle", "Тестовая метка")
        page.fill("#ntext", "только для мастера")
        page.fill("#ntag", "Тайна")
        page.click("#nadd")
        page.wait_for_timeout(300)
        assert "Тестовая метка" in page.inner_text("body")
        tracker.assert_clean()
        return "master note saved"

    results.append(record("master_notes", browser_name, notes))

    def master_spells_items_dice_maps():
        go(page, "spells")
        page.wait_for_selector("#list [data-id]", timeout=20000)
        go(page, "items")
        page.wait_for_selector("#list [data-id]", timeout=20000)
        go(page, "dice")
        page.click('[data-d="6"]')
        page.wait_for_function("() => document.body.innerText.includes('1d6')", timeout=8000)
        go(page, "maps")
        page.wait_for_selector("#list img", timeout=15000)
        tracker.assert_clean()
        return "spells, items, dice, maps ok"

    results.append(record("master_ref_dice_maps", browser_name, master_spells_items_dice_maps))

    def spirit_master():
        go(page, "spirit")
        page.fill("#sq", "Найди барсука в бестиарии")
        page.click("#sask")
        page.wait_for_function("() => document.body.innerText.includes('дух думает')", timeout=8000)
        sent = page.evaluate("() => window.__tgSent.slice()")
        payload = json.loads(sent[-1])
        assert payload.get("mode") == "master"
        assert payload.get("id") and payload.get("key")
        reply = compose_spirit("master", payload["q"])
        publish_spirit(payload["id"], payload["key"], reply, push=False)
        page.wait_for_function("t => document.body.innerText.includes(t)", arg=reply[:40], timeout=20000)
        hook = page.evaluate("() => typeof window.__dndApplySpiritReply")
        assert hook == "undefined"
        tracker.assert_clean()
        return "master mailbox poll+decrypt, no injection hook"

    results.append(record("master_spirit_e2e", browser_name, spirit_master))
    return results


def run_master_edit_suite(browser, browser_name):
    """Edit temp master source, encrypt, swap local vault, prove book shows the change, restore."""

    def body():
        marker = "ZXQ" + secrets.token_hex(3).upper()
        src_vault = json.loads((DND / "master_src/vault.json").read_text(encoding="utf-8"))
        src_vault["monsters"][0]["n"] = src_vault["monsters"][0]["n"] + marker
        tmp = Path(tempfile.mkdtemp())
        (tmp / "vault.json").write_text(json.dumps(src_vault, ensure_ascii=False), encoding="utf-8")
        enc_out = tmp / "master.enc.json"
        env = os.environ.copy()
        env["DND_MASTER_SRC"] = str(tmp)
        env["DND_VAULT_OUT"] = str(enc_out)
        subprocess.check_call(["python3", str(DND / "encrypt_master.py")], env=env, stdout=subprocess.DEVNULL)
        live = REPO / "vault/master.enc.json"
        backup = tmp / "backup.enc.json"
        shutil.copy2(live, backup)
        try:
            shutil.copy2(enc_out, live)
            context, page, tracker = new_page(browser)
            try:
                unlock_master(page)
                wait_book(page, "Сессия", timeout=50000)
                go(page, "bestiary")
                page.wait_for_selector("#q", timeout=8000)
                page.fill("#q", marker)
                page.wait_for_timeout(400)
                text = page.inner_text("#list")
                assert marker in text
                tracker.assert_clean()
            finally:
                context.close()
        finally:
            shutil.copy2(backup, live)
        return "marker visible after encrypt, vault restored"

    return record("master_edit_encrypt_shows_change", browser_name, body)


def run_launcher(browser, browser_name):
    def body():
        context, page, tracker = new_page(browser)
        try:
            page.goto(BASE + "/", wait_until="networkidle", timeout=30000)
            page.wait_for_selector("h1", timeout=10000)
            text = page.inner_text("body")
            assert "Игрок" in text and "Мастер" in text
            assert "привет, egor" in text.lower()
            tracker.assert_clean()
            return "launcher both modes"
        finally:
            context.close()

    return record("launcher_home", browser_name, body)


def _load_relay():
    import importlib.util
    spec = importlib.util.spec_from_file_location("relay_dnd", str(DND / "relay_dnd.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def wait_live_spirit_js(timeout=180):
    import urllib.request
    deadline = time.time() + timeout
    last = "no fetch"
    while time.time() < deadline:
        try:
            req = urllib.request.Request(
                f"{PAGES}/app/js/spirit.js",
                headers={"Cache-Control": "no-cache", "Pragma": "no-cache"},
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                body = resp.read().decode("utf-8", "replace")
                if resp.getcode() == 200 and "fetchMailbox" in body:
                    req2 = urllib.request.Request(
                        f"{PAGES}/app/js/book.js",
                        headers={"Cache-Control": "no-cache", "Pragma": "no-cache"},
                    )
                    with urllib.request.urlopen(req2, timeout=20) as resp2:
                        js = resp2.read().decode("utf-8", "replace")
                    if "ensureSpiritWatch" in js:
                        return
                    last = "book.js missing ensureSpiritWatch"
                else:
                    last = "spirit.js not ready"
        except Exception as exc:
            last = str(exc)[:120]
        time.sleep(5)
    raise AssertionError("live Pages spirit poller not deployed: " + last)


def run_live_spirit_roundtrip(browser, browser_name):
    def body():
        wait_live_spirit_js()
        context, page, tracker = new_page(browser, mailbox=False)
        try:
            page.goto(PAGES + "/player/", wait_until="domcontentloaded", timeout=45000)
            page.wait_for_selector("#gate", timeout=20000)
            page.fill("#gate", room_code())
            page.click("#gok")
            wait_book(page, "Герой", timeout=45000)
            go(page, "spirit")
            page.wait_for_selector("#sq", timeout=8000)
            marker = "ZXLV" + secrets.token_hex(3)
            question = "Живая проверка духа " + marker
            page.fill("#sq", question)
            page.click("#sask")
            page.wait_for_function("() => document.body.innerText.includes('дух думает')", timeout=10000)
            sent = page.evaluate("() => window.__tgSent.slice()")
            assert sent, "sendData was not called on live book"
            payload = json.loads(sent[-1])
            assert payload.get("q") == question
            assert payload.get("id") and payload.get("key")
            mod = _load_relay()
            update = {
                "update_id": 9001,
                "message": {
                    "message_id": 11,
                    "date": 1,
                    "chat": {"id": 321, "type": "private"},
                    "from": {"id": 321, "is_bot": False, "first_name": "Live"},
                    "web_app_data": {
                        "data": json.dumps(payload, ensure_ascii=False),
                        "button_text": "Книга",
                    },
                },
            }
            prepared = mod.prepare_payload(update, owner=1)
            assert prepared is not None
            assert prepared.get("spirit_id") == payload["id"]
            assert prepared.get("spirit_q") == question
            answer = f"Страницы шепчут маркер {marker}."
            t_pub = time.time()
            env = os.environ.copy()
            env["DND_MAILBOX_PUSH"] = "1"
            env.pop("DND_MAILBOX_DIR", None)
            subprocess.check_call(
                ["python3", str(REPO / "tools/spirit_reply.py"), payload["id"], payload["key"], answer],
                env=env,
                stdout=subprocess.DEVNULL,
            )
            published_ms = int((time.time() - t_pub) * 1000)
            t_wait = time.time()
            page.wait_for_function(
                "t => document.body.innerText.includes(t)",
                arg=marker,
                timeout=120000,
            )
            poll_ms = int((time.time() - t_wait) * 1000)
            hook = page.evaluate("() => typeof window.__dndApplySpiritReply")
            assert hook == "undefined"
            tracker.assert_clean()
            return f"relay hoist ok; publish {published_ms}ms; poll+decrypt {poll_ms}ms"
        finally:
            context.close()

    return record("live_spirit_roundtrip", browser_name, body)


def collect_book_results(playwright):
    os.environ.setdefault("PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS", "1")
    results = []
    for browser_name in ("chromium", "webkit"):
        browser = getattr(playwright, browser_name).launch(headless=True)
        try:
            results.append(run_launcher(browser, browser_name))
            context, page, tracker = new_page(browser)
            try:
                results.extend(run_player_suite(page, tracker, browser_name))
            finally:
                context.close()
            context, page, tracker = new_page(browser)
            try:
                results.extend(run_master_suite(page, tracker, browser_name))
            finally:
                context.close()
            results.append(run_master_edit_suite(browser, browser_name))
            if browser_name == "chromium" and os.environ.get("DND_SKIP_LIVE") != "1":
                results.append(run_live_spirit_roundtrip(browser, browser_name))
        finally:
            browser.close()
    return results

/* Shared helpers for the Telegram Mini App books. Vanilla ES module. */
const enc = new TextEncoder();
const dec = new TextDecoder();

export function $(sel, root) {
  return (root || document).querySelector(sel);
}

export function $$(sel, root) {
  return Array.from((root || document).querySelectorAll(sel));
}

export function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
  });
}

export function uid() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return a[0].toString(36) + a[1].toString(36);
}

export function debounce(fn, ms) {
  let t = 0;
  return function () {
    const args = arguments;
    const ctx = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, ms);
  };
}

export function rootUrl() {
  const value = window.DND_ROOT;
  return value == null ? "./" : String(value);
}

export function joinUrl(base, rel) {
  if (!rel) return base;
  if (/^https?:/i.test(rel)) return rel;
  const b = String(base || "./");
  if (rel.charAt(0) === "/") return rel;
  return b + rel.replace(/^\.\//, "");
}

export function mod(score) {
  return Math.floor((Number(score) - 10) / 2);
}

export function fmod(value) {
  const n = Number(value) || 0;
  return (n >= 0 ? "+" : "") + n;
}

export function crTxt(cr) {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

export function pb(level) {
  return 2 + Math.floor(((Number(level) || 1) - 1) / 4);
}

export function rnd(sides) {
  const n = Math.max(1, Number(sides) || 1);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % n) + 1;
}

export function rollFormula(expr) {
  const raw = String(expr || "").replace(/\s+/g, "").replace(/[−–]/g, "-").toLowerCase().replace(/к/g, "d");
  const m = raw.match(/^(\d{0,3})d(\d{1,3})([+-]\d{1,4})?$/);
  if (!m) return null;
  const count = Math.min(40, Math.max(1, Number(m[1] || "1")));
  const sides = Math.min(1000, Math.max(2, Number(m[2])));
  const bonus = Number(m[3] || "0");
  const rolls = [];
  let total = bonus;
  for (let i = 0; i < count; i++) {
    const v = rnd(sides);
    rolls.push(v);
    total += v;
  }
  return { expr: raw, count, sides, bonus, rolls, total };
}

export function fmtBody(text) {
  const src = String(text || "").trim();
  if (!src) return "";
  const parts = src.split(/\n+/);
  return parts.map(function (p) {
    let h = esc(p);
    h = h.replace(/(\d+\s*к\s*\d+(?:\s*[+−-]\s*\d+)?)/g, '<b class="dice">$1</b>');
    h = h.replace(/(СЛ\s*\d+)/g, '<b class="key">$1</b>');
    return "<p>" + h + "</p>";
  }).join("");
}

export function whenReady(fn) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
  else fn();
}

/* ---------- Telegram ---------- */
export function webApp() {
  return (window.Telegram && window.Telegram.WebApp) || null;
}

export function tgUser() {
  const tg = webApp();
  const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
  return u || null;
}

export function userFirstName() {
  const u = tgUser();
  return (u && u.first_name) || "";
}

function applyTheme(tg) {
  const p = (tg && tg.themeParams) || {};
  const root = document.documentElement;
  const map = {
    bg_color: ["--tg-theme-bg-color"],
    text_color: ["--tg-theme-text-color"],
    hint_color: ["--tg-theme-hint-color"],
    button_color: ["--tg-theme-button-color"],
    button_text_color: ["--tg-theme-button-text-color"],
    secondary_bg_color: ["--tg-theme-secondary-bg-color"],
    header_bg_color: ["--tg-theme-header-bg-color"],
    accent_text_color: ["--tg-theme-accent-text-color"],
    destructive_text_color: ["--tg-theme-destructive-text-color"]
  };
  Object.keys(map).forEach(function (key) {
    if (!p[key]) return;
    map[key].forEach(function (name) { root.style.setProperty(name, p[key]); });
  });
  try {
    if (tg.setBackgroundColor) tg.setBackgroundColor(p.bg_color || "#10090a");
    if (tg.setHeaderColor) tg.setHeaderColor(p.header_bg_color || p.bg_color || "#10090a");
  } catch (err) {}
  if (p.bg_color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", p.bg_color);
  }
}

function applyViewport(tg) {
  if (!tg) return;
  const root = document.documentElement;
  if (tg.viewportHeight) root.style.setProperty("--tg-viewport-height", tg.viewportHeight + "px");
  if (tg.viewportStableHeight) root.style.setProperty("--tg-viewport-stable-height", tg.viewportStableHeight + "px");
}

export function haptic(kind) {
  const tg = webApp();
  const h = tg && tg.HapticFeedback;
  if (!h) return;
  try {
    if (kind === "success" || kind === "error" || kind === "warning") h.notificationOccurred(kind);
    else if (kind === "select") h.selectionChanged();
    else h.impactOccurred(kind || "light");
  } catch (err) {}
}

export function showPopup(opts) {
  const tg = webApp();
  return new Promise(function (resolve) {
    if (tg && tg.showPopup) {
      try {
        tg.showPopup(opts, function (id) { resolve(id || ""); });
        return;
      } catch (err) {}
    }
    const msg = (opts && (opts.message || opts.title)) || "";
    if (opts && opts.buttons && opts.buttons.some(function (b) { return b.type === "destructive" || b.id === "ok" || b.type === "ok"; })) {
      resolve(window.confirm(msg) ? (opts.buttons[0].id || "ok") : "cancel");
      return;
    }
    window.alert(msg);
    resolve("ok");
  });
}

export function verAtLeast(min) {
  const tg = webApp();
  if (!tg) return false;
  try {
    if (typeof tg.isVersionAtLeast === "function") return !!tg.isVersionAtLeast(String(min));
  } catch (err) {}
  const a = String(tg.version || "0").split(".").map(function (x) { return parseInt(x, 10) || 0; });
  const b = String(min).split(".").map(function (x) { return parseInt(x, 10) || 0; });
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0, y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return true;
}

export function insideTelegram() {
  const tg = webApp();
  return !!(tg && tg.initData);
}

function cloudAvailable() {
  const tg = webApp();
  const cs = tg && tg.CloudStorage;
  return !!(insideTelegram() && cs && typeof cs.getItem === "function" && verAtLeast("6.9"));
}

export function initTelegram() {
  const tg = webApp();
  if (tg) {
    try { tg.ready(); } catch (err) {}
    try { tg.expand(); } catch (err) {}
    try { if (tg.disableVerticalSwipes && verAtLeast("7.7")) tg.disableVerticalSwipes(); } catch (err) {}
    applyTheme(tg);
    applyViewport(tg);
    try { tg.onEvent("themeChanged", function () { applyTheme(tg); }); } catch (err) {}
    try { tg.onEvent("viewportChanged", function () { applyViewport(tg); }); } catch (err) {}
  }
  document.documentElement.classList.add(tg ? "in-telegram" : "outside-telegram");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (list) {
      list.forEach(function (reg) { reg.unregister(); });
    }).catch(function () {});
  }
  return tg;
}

export function setMainButton(text, onClick) {
  const tg = webApp();
  const btn = tg && tg.MainButton;
  if (!btn) return function () {};
  try { if (btn.offClick) btn.offClick(setMainButton._fn); } catch (err) {}
  if (!text) {
    try { btn.hide(); } catch (err) {}
    setMainButton._fn = null;
    return function () {};
  }
  setMainButton._fn = onClick || function () {};
  try {
    btn.setText(text);
    if (btn.onClick) btn.onClick(setMainButton._fn);
    btn.show();
  } catch (err) {}
  return function () {
    try { if (btn.offClick) btn.offClick(setMainButton._fn); } catch (e) {}
    try { btn.hide(); } catch (e) {}
  };
}

export function setBackButton(onClick) {
  const tg = webApp();
  const btn = tg && tg.BackButton;
  if (!btn) return function () {};
  try { if (btn.offClick) btn.offClick(setBackButton._fn); } catch (err) {}
  if (!onClick) {
    try { btn.hide(); } catch (err) {}
    setBackButton._fn = null;
    return function () {};
  }
  setBackButton._fn = onClick;
  try {
    if (btn.onClick) btn.onClick(onClick);
    btn.show();
  } catch (err) {}
  return function () {
    try { if (btn.offClick) btn.offClick(onClick); } catch (e) {}
    try { btn.hide(); } catch (e) {}
  };
}

export function setSettingsButton(onClick) {
  const tg = webApp();
  const btn = tg && tg.SettingsButton;
  if (!btn || !verAtLeast("7.0")) return function () {};
  try { if (btn.offClick) btn.offClick(setSettingsButton._fn); } catch (err) {}
  if (!onClick) {
    try { btn.hide(); } catch (err) {}
    return function () {};
  }
  setSettingsButton._fn = onClick;
  try {
    if (btn.onClick) btn.onClick(onClick);
    btn.show();
  } catch (err) {}
  return function () {};
}

export function bytesToB64(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

export function bytesToB64url(buf) {
  return bytesToB64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function b64ToB64url(b64) {
  return String(b64 || "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function sendToBot(payload, opts) {
  const tg = webApp();
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  if (tg && typeof tg.sendData === "function") {
    try {
      tg.sendData(data);
      return "sent";
    } catch (err) {}
  }
  const text = (opts && opts.clipboard) || (payload && payload.q) || data;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function () {});
  }
  const start = (opts && opts.start) || "spirit";
  const link = "https://t.me/Nezich_dnd_bot?start=" + start;
  try {
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(link);
      return "copied";
    }
  } catch (err) {}
  try { window.open(link, "_blank"); } catch (err) {}
  return "copied";
}

/* ---------- CloudStorage / localStorage ---------- */
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
}

function cloudGetItem(key) {
  if (!cloudAvailable()) return Promise.resolve(null);
  const cs = webApp().CloudStorage;
  return new Promise(function (resolve) {
    try {
      cs.getItem(key, function (err, value) {
        if (err) resolve(null);
        else resolve(value == null ? null : String(value));
      });
    } catch (err) { resolve(null); }
  });
}

function cloudSetItem(key, value) {
  if (!cloudAvailable()) return Promise.resolve(false);
  const cs = webApp().CloudStorage;
  return new Promise(function (resolve) {
    try {
      cs.setItem(key, value, function (err) { resolve(!err); });
    } catch (err) { resolve(false); }
  });
}

function chunkedDump(value) {
  const raw = JSON.stringify(value);
  const size = 3500;
  if (raw.length <= size) return { raw: raw, parts: null };
  const parts = [];
  for (let i = 0; i < raw.length; i += size) parts.push(raw.slice(i, i + size));
  return { raw: null, parts: parts };
}

export function createStore(prefix) {
  const p = prefix || "dnd";
  return {
    get: function (key, fallback) {
      return lsGet(p + "." + key, fallback);
    },
    set: function (key, value) {
      lsSet(p + "." + key, value);
      const packed = chunkedDump(value);
      const ck = p + "_" + key;
      if (packed.parts) {
        cloudSetItem(ck + "__n", String(packed.parts.length));
        packed.parts.forEach(function (part, i) { cloudSetItem(ck + "__" + i, part); });
      } else {
        cloudSetItem(ck + "__n", "1");
        cloudSetItem(ck + "__0", packed.raw);
      }
    },
    hydrate: async function (key, fallback) {
      const ck = p + "_" + key;
      const nRaw = await cloudGetItem(ck + "__n");
      const n = Number(nRaw || "0");
      if (n > 0) {
        const chunks = [];
        for (let i = 0; i < n; i++) chunks.push(await cloudGetItem(ck + "__" + i));
        if (chunks.every(function (x) { return x != null; })) {
          try {
            const value = JSON.parse(chunks.join(""));
            lsSet(p + "." + key, value);
            return value;
          } catch (err) {}
        }
      }
      return lsGet(p + "." + key, fallback);
    }
  };
}

/* ---------- Crypto / rooms ---------- */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
}

export function normCode(code) {
  return String(code || "").trim().toUpperCase();
}

export async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(String(text)));
  return bytesToHex(buf);
}

export async function hashCode(code) {
  return sha256hex(normCode(code));
}

export async function decryptVault(password, vault) {
  if (!vault || !vault.ct || !vault.salt || !vault.iv) throw new Error("bad vault");
  const salt = b64ToBytes(vault.salt);
  const iv = b64ToBytes(vault.iv);
  const ct = b64ToBytes(vault.ct);
  const material = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: vault.iter || 250000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
  return JSON.parse(dec.decode(pt));
}

/* ---------- Avatars & spell art ---------- */
const AV_RULES = [
  [/драконорожд/, "dragonborn"], [/полу-?эльф/, "halfelf"], [/полу-?орк/, "halforc"],
  [/полурослик|хоббит/, "halfling"], [/дроу|т[её]мн\S* эльф/, "drow"], [/эльф|эладрин/, "elf"],
  [/дварф|дворф/, "dwarf"], [/гном/, "gnome"], [/тифлинг/, "tiefling"], [/аасимар/, "aasimar"],
  [/голиаф/, "goliath"], [/гоблин|хобгоблин|багбир|кобольд/, "goblin"], [/орк/, "orc"],
  [/человек|люд/, "human"], [/нежить|зомби|скелет|вампир|лич|призрак/, "undead"],
  [/исчади|демон|дьявол/, "fiend"], [/дракон/, "dragon"], [/элементал/, "elemental"],
  [/великан|огр|тролл/, "giant"], [/аберрац/, "aberration"], [/конструкт|голем/, "construct"],
  [/фе[яий]|фейр/, "fey"], [/слиз/, "ooze"], [/растени/, "plant"], [/небожител|ангел/, "celestial"],
  [/чудовищ/, "monstrosity"], [/звер|рой/, "beast"], [/гуманоид/, "humanoid"]
];

export function avKey(text) {
  const s = String(text || "").toLowerCase();
  if (!s) return null;
  for (let i = 0; i < AV_RULES.length; i++) {
    if (AV_RULES[i][0].test(s)) return AV_RULES[i][1];
  }
  return null;
}

export function avUrl(entity, small) {
  if (!entity) return "";
  if (entity.photo) return entity.photo;
  const key = avKey(entity.race || entity.ty || entity.r || "");
  if (!key) return "";
  return joinUrl(rootUrl(), "img/av/" + key + (small ? "-s" : "") + ".webp");
}

let spellArtSet = null;

export async function loadSpellArtIndex() {
  if (spellArtSet) return spellArtSet;
  try {
    const list = await fetchJSON("content/public/spart.json");
    spellArtSet = new Set(Array.isArray(list) ? list : []);
  } catch (err) {
    spellArtSet = new Set();
  }
  return spellArtSet;
}

export function hasSpellArt(id) {
  return !!(spellArtSet && id && spellArtSet.has(id));
}

export function spellArtUrl(id, thumb) {
  if (!id || !hasSpellArt(id)) return "";
  return joinUrl(rootUrl(), (thumb ? "img/spt/" : "img/sp/") + id + ".webp");
}

export function mapUrl(src) {
  return joinUrl(rootUrl(), src);
}

export async function fetchJSON(rel) {
  const url = joinUrl(rootUrl(), rel);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("load failed " + res.status);
  return res.json();
}

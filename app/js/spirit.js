/* In-book Spirit mailbox: poll an encrypted public reply and decrypt with a per-request key. */
import * as L from "./lib.js";

const RAW = "https://raw.githubusercontent.com/akriv777-png/kniga-mastera/mailbox/replies/";
const API = "https://api.github.com/repos/akriv777-png/kniga-mastera/contents/replies/";
const TIMEOUT_MS = 5 * 60 * 1000;

export function generateRequest() {
  const idBytes = new Uint8Array(8);
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(idBytes);
  crypto.getRandomValues(keyBytes);
  return { id: L.bytesToB64url(idBytes), key: L.bytesToB64(keyBytes) };
}

export function startParam(id, key) {
  return "sp_" + id + "_" + L.b64ToB64url(key);
}

function mailboxUrls(hash, tryApi) {
  const custom = String(window.DND_MAILBOX_BASE || "").replace(/\/$/, "");
  const ts = Date.now();
  if (custom) return [custom + "/" + hash + ".json?ts=" + ts];
  const urls = [RAW + hash + ".json?ts=" + ts];
  if (tryApi) urls.push(API + hash + ".json?ref=mailbox&ts=" + ts);
  return urls;
}

async function parseMailboxBody(res) {
  const data = await res.json();
  if (data && data.ct && data.iv) return data;
  if (data && data.content && data.encoding === "base64") {
    const raw = atob(String(data.content).replace(/\s+/g, ""));
    return JSON.parse(raw);
  }
  return null;
}

export async function fetchMailbox(id, opts) {
  const hash = await L.sha256hex(id);
  const urls = mailboxUrls(hash, !!(opts && opts.tryApi));
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], { cache: "no-store" });
      if (!res.ok) continue;
      const file = await parseMailboxBody(res);
      if (file && file.ct && file.iv) return file;
    } catch (err) {}
  }
  return null;
}

function b64ToBytes(b64) {
  let s = String(b64 || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function decryptReply(keyB64, file) {
  if (!file || !file.ct || !file.iv) throw new Error("bad mailbox file");
  const keyBytes = b64ToBytes(keyB64);
  const iv = b64ToBytes(file.iv);
  const ct = b64ToBytes(file.ct);
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
  return new TextDecoder().decode(pt);
}

let watchTimer = 0;

export function stopWatch() {
  if (watchTimer) clearInterval(watchTimer);
  watchTimer = 0;
}

export function startWatch(opts) {
  stopWatch();
  let n = 0;
  async function tick() {
    n += 1;
    const list = (opts.getPending && opts.getPending()) || [];
    if (!list.length) return;
    const now = Date.now();
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!p || !p.id || !p.key) continue;
      if (now - (p.ts || 0) > TIMEOUT_MS) {
        if (opts.onTimeout) opts.onTimeout(p);
        continue;
      }
      try {
        const file = await fetchMailbox(p.id, { tryApi: n >= 3 && n % 3 === 0 });
        if (!file) continue;
        const text = await decryptReply(p.key, file);
        if (text && opts.onAnswer) opts.onAnswer(p, text);
      } catch (err) {}
    }
    if (opts.onTick) opts.onTick();
  }
  watchTimer = setInterval(tick, 2000);
  tick();
  return stopWatch;
}

/* Telegram Mini App book: player + master. Vanilla ES module. */
import * as L from "./lib.js";
import * as Spirit from "./spirit.js";
import * as F from "./features.js";

const MODE = window.DND_MODE === "master" ? "master" : "player";
const store = L.createStore(MODE === "master" ? "dndm" : "dndp");

const PLAYER_SECS = [
  ["hero", "⚔", "Герой"],
  ["bag", "⛁", "Сумка"],
  ["spells", "✧", "Чары"],
  ["items", "⚖", "Предметы"],
  ["maps", "🗺", "Карты"],
  ["dice", "⚄", "Кубики"],
  ["notes", "✎", "Записи"],
  ["table", "🗒", "Стол"],
  ["spirit", "👁", "Дух"]
];
const MASTER_SECS = [
  ["session", "◉", "Сессия"],
  ["bestiary", "☠", "Бестиарий"],
  ["chars", "👤", "Персонажи"],
  ["spells", "✧", "Чары"],
  ["items", "⚖", "Лут"],
  ["combat", "⚔", "Бой"],
  ["dice", "⚄", "Кубики"],
  ["maps", "🗺", "Карты"],
  ["campaigns", "📜", "Кампании"],
  ["notes", "✎", "Заметки"],
  ["rules", "📖", "Ширма"],
  ["spirit", "👁", "Дух"]
];
const SECS = MODE === "master" ? MASTER_SECS : PLAYER_SECS;
const AB = ["СИЛ", "ЛОВ", "ТЕЛ", "ИНТ", "МДР", "ХАР"];
const SK = [
  ["Акробатика", 1], ["Анализ", 3], ["Атлетика", 0], ["Внимательность", 4],
  ["Выживание", 4], ["Выступление", 5], ["Запугивание", 5], ["История", 3],
  ["Ловкость рук", 1], ["Магия", 3], ["Медицина", 4], ["Обман", 5],
  ["Природа", 3], ["Проницательность", 4], ["Религия", 3], ["Скрытность", 1],
  ["Убеждение", 5], ["Уход за животными", 4]
];
const COND = ["Ослеплён", "Очарован", "Оглохший", "Испуган", "Схвачен", "Недееспособен", "Невидим", "Парализован", "Окаменел", "Отравлен", "Сбит с ног", "Опутан", "Ошеломлён", "Без сознания", "Концентрация"];
const RACES = ["Человек", "Эльф", "Дроу", "Дварф", "Полурослик", "Гном", "Полуорк", "Тифлинг", "Драконорождённый", "Аасимар", "Голиаф", "Полуэльф"];
const CLASSES = ["Варвар", "Бард", "Жрец", "Друид", "Воин", "Монах", "Паладин", "Следопыт", "Плут", "Чародей", "Колдун", "Волшебник"];
const SLOTS = [[], [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]];

const S = {
  mode: MODE,
  sec: MODE === "master" ? "session" : "hero",
  q: "",
  chip: "",
  more: 80,
  vault: null,
  spells: null,
  items: null,
  maps: null,
  rooms: null,
  hero: null,
  notes: [],
  favs: [],
  recent: [],
  combat: { list: [], turn: 0, round: 1 },
  party: [],
  rolls: [],
  spirit: [],
  pending: [],
  pendingRoom: "",
  screen: null,
  sess: null,
  handouts: [],
  shop: null
};

function freshHero() {
  return {
    id: L.uid(),
    name: L.userFirstName() || "Новый герой",
    cls: "Воин",
    race: "Человек",
    lvl: 1,
    st: [15, 14, 13, 12, 10, 8],
    hp: 12,
    maxhp: 12,
    thp: 0,
    ac: 16,
    spd: 9,
    conds: [],
    inv: [],
    coins: { "мм": 0, "см": 0, "эм": 0, "зм": 15, "пм": 0 },
    spells: [],
    slots: {},
    prof: [],
    svp: [0, 2],
    notes: "",
    journal: [],
    ds: { s: 0, f: 0 },
    insp: false,
    xp: 0
  };
}

function saveHero() { store.set("hero", S.hero); }
function saveNotes() { store.set("notes", S.notes); }
function saveFavs() { store.set("favs", S.favs); store.set("recent", S.recent); }
function saveCombat() { store.set("combat", S.combat); }
function saveParty() { store.set("party", S.party); }
function saveRolls() { store.set("rolls", S.rolls.slice(0, 40)); }
function saveSpirit() { store.set("spirit", S.spirit.slice(0, 40)); }
function savePending() { store.set("pending", S.pending || []); }
function saveSess() { store.set("sess", S.sess); }
function saveHandouts() { store.set("handouts", S.handouts || []); }

function toast(text) {
  let el = L.$("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { el.classList.remove("on"); }, Math.max(1600, String(text).length * 40));
}

function remember(kind, rec) {
  if (!rec || !rec.id) return;
  S.recent = [{ k: kind, id: rec.id, n: rec.n }].concat(S.recent.filter(function (x) {
    return !(x.k === kind && x.id === rec.id);
  })).slice(0, 25);
  saveFavs();
}

function isFav(kind, id) {
  return S.favs.some(function (x) { return x.k === kind && x.id === id; });
}

function toggleFav(kind, rec) {
  if (!rec || !rec.id) return;
  if (isFav(kind, rec.id)) S.favs = S.favs.filter(function (x) { return !(x.k === kind && x.id === rec.id); });
  else S.favs.unshift({ k: kind, id: rec.id, n: rec.n });
  saveFavs();
  L.haptic("select");
}

function header(title, sub) {
  const name = L.userFirstName();
  const greet = name ? "Привет, " + L.esc(name) : "Гримуар стола";
  return '<p class="kicker">' + greet + "</p><h1 class=\"ttl\">" + L.esc(title) + '</h1><p class="sub">' + L.esc(sub) + "</p>";
}

function avHtml(ent, px) {
  const url = L.avUrl(ent, px && px <= 96);
  const letter = L.esc(String((ent && (ent.n || ent.name) || "?").charAt(0)));
  if (url) return '<img class="av" src="' + L.esc(url) + '" width="' + (px || 52) + '" height="' + (px || 52) + '" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">';
  return '<div class="av" style="display:flex;align-items:center;justify-content:center;font-family:var(--title)">' + letter + "</div>";
}

function moreBtn(len) {
  if (len <= S.more) return "";
  return '<button class="btn ghost" id="more" type="button">Показать ещё (' + (len - S.more) + ")</button>";
}

function bindMore(len) {
  const b = L.$("#more");
  if (!b) return;
  b.addEventListener("click", function () { S.more += 80; render(); });
}

function openSheet(html, bind) {
  let sheet = L.$("#sheet");
  if (!sheet) {
    sheet = document.createElement("div");
    sheet.id = "sheet";
    sheet.className = "sheet";
    sheet.innerHTML = '<div class="bg"></div><div class="sh"><div class="grab"></div><button class="x" type="button" aria-label="Закрыть">✕</button><div id="sheetPage"></div></div>';
    document.body.appendChild(sheet);
    sheet.querySelector(".bg").addEventListener("click", closeSheet);
    sheet.querySelector(".x").addEventListener("click", closeSheet);
  }
  const page = L.$("#sheetPage", sheet);
  page.innerHTML = html;
  page.scrollTop = 0;
  sheet.classList.add("show");
  updateBack();
  if (bind) bind(page);
}

function closeSheet() {
  const sheet = L.$("#sheet");
  if (sheet) sheet.classList.remove("show");
  updateBack();
}

function sheetOpen() {
  const sheet = L.$("#sheet");
  return !!(sheet && sheet.classList.contains("show"));
}

async function loadSpells() {
  if (!S.spells) S.spells = await L.fetchJSON("content/public/spells.json");
  return S.spells;
}
async function loadItems() {
  if (!S.items) S.items = await L.fetchJSON("content/public/items.json");
  return S.items;
}
async function loadMaps() {
  if (!S.maps) S.maps = await L.fetchJSON("content/public/maps.json");
  return S.maps;
}

function findSpell(id) { return (S.spells || []).find(function (x) { return x.id === id; }); }
function findItem(id) { return (S.items || []).find(function (x) { return x.id === id; }); }
function monsters() { return (S.vault && S.vault.monsters) || []; }
function legends() { return (S.vault && S.vault.legends) || []; }
function npcs() { return (S.vault && S.vault.npcs) || []; }
function campaigns() { return (S.vault && S.vault.campaigns) || []; }
function tables() { return (S.vault && S.vault.tables) || {}; }

function tacticsFor(m) {
  if (!m) return "";
  const map = (S.vault && S.vault.tactics) || {};
  if (map[m.id]) return map[m.id];
  const ty = String(m.ty || "").toLowerCase();
  if (/нежить|конструкт|слизь/.test(ty)) return "Без страха: атакует ближайшего и не отступает.";
  if (/зверь|чудовищ/.test(ty)) return "Хищник: выбирает слабейшую или отбившуюся цель.";
  if (/дракон|великан|исчад/.test(ty)) return "Уверен в силе: бьёт самого опасного противника.";
  return "Действует по характеру: фокусирует одну цель, пользуется местностью.";
}

function go(sec) {
  if (!SECS.some(function (s) { return s[0] === sec; })) return;
  S.sec = sec;
  S.q = "";
  S.chip = "";
  S.more = 80;
  store.set("sec", sec);
  L.haptic("select");
  closeSheet();
  render();
}

function updateBack() {
  if (sheetOpen()) {
    L.setBackButton(function () { closeSheet(); });
    return;
  }
  L.setBackButton(function () {
    location.href = L.joinUrl(L.rootUrl(), "index.html");
  });
}

function setNav() {
  const nav = L.$("#nav");
  if (!nav) return;
  nav.innerHTML = SECS.map(function (s) {
    return '<button type="button" class="nav-btn' + (s[0] === S.sec ? " on" : "") + '" data-sec="' + s[0] + '"><i>' + s[1] + "</i>" + s[2] + "</button>";
  }).join("");
  nav.querySelectorAll("[data-sec]").forEach(function (b) {
    b.addEventListener("click", function () { go(b.getAttribute("data-sec")); });
  });
}

function pageEl() { return L.$("#page"); }

function bindSearch(cb) {
  const i = L.$("#q");
  if (!i) return;
  i.value = S.q;
  i.addEventListener("input", L.debounce(function () {
    S.q = i.value.trim();
    S.more = 80;
    cb();
  }, 120));
}

function meta(label, value) {
  if (value == null || value === "") return "";
  return '<div class="pc-st"><small>' + L.esc(label) + "</small><b>" + L.esc(value) + "</b></div>";
}
function block(label, value) {
  if (!value) return "";
  return "<h3>" + L.esc(label) + "</h3><p>" + L.esc(value) + "</p>";
}
function feats(title, list) {
  if (!list || !list.length) return "";
  return "<h3>" + L.esc(title) + "</h3>" + list.map(function (f) {
    return '<div class="feat"><span class="fn">' + L.esc(f.n || "") + ".</span> " + L.esc(f.d || "").replace(/\n/g, "<br>") + "</div>";
  }).join("");
}

function spellSheet(s) {
  if (!s) return;
  remember("spell", s);
  const art = L.spellArtUrl(s.id, false);
  openSheet(
    '<div class="sb-title">' + L.esc(s.n) + "</div>" +
    '<div class="sb-sub">' + L.esc((s.l ? s.l + " уровень" : "Заговор") + (s.sc ? " · " + s.sc : "")) + "</div>" +
    (art ? '<img class="sb-art" src="' + L.esc(art) + '" alt="" onerror="this.remove()">' : "") +
    '<div class="pc-grid">' + meta("Время", s.t) + meta("Дистанция", s.r) + meta("Компоненты", s.c) + meta("Длительность", s.d) + meta("Урон", s.dmg) + "</div>" +
    (s.m ? '<p class="muted">Материалы: ' + L.esc(s.m) + "</p>" : "") +
    '<div class="pc-body">' + L.fmtBody(s.ds) + "</div>" +
    (s.cl && s.cl.length ? '<p class="muted">Классы: ' + s.cl.map(L.esc).join(", ") + "</p>" : "") +
    (s.conc ? '<p class="muted">Нужна концентрация.</p>' : "") +
    (s.rit ? '<p class="muted">Можно как ритуал.</p>' : "") +
    '<button class="btn ghost" id="fav" type="button">' + (isFav("spell", s.id) ? "В избранном" : "В избранное") + "</button>" +
    (MODE === "player" ? '<button class="btn" id="learn" type="button">Добавить в гримуар</button>' : ""),
    function (r) {
      L.$("#fav", r).addEventListener("click", function () { toggleFav("spell", s); spellSheet(s); });
      const learn = L.$("#learn", r);
      if (learn) learn.addEventListener("click", function () {
        if (S.hero.spells.indexOf(s.id) < 0) S.hero.spells.push(s.id);
        saveHero(); toast("В гримуаре: " + s.n); closeSheet();
      });
    }
  );
}

function itemSheet(it) {
  if (!it) return;
  remember("item", it);
  openSheet(
    '<div class="sb-title">' + L.esc(it.n) + "</div>" +
    '<div class="sb-sub">' + L.esc([it.cat, it.sub].filter(Boolean).join(" · ")) + (it.rar ? " · " + L.esc(it.rar) : "") + "</div>" +
    '<div class="pc-grid">' + meta("Урон", it.dmg) + meta("КД", it.ac) + meta("Свойства", it.prop) + meta("Вес", it.w ? it.w + " кг" : "") + meta("Цена", it.cost) + "</div>" +
    '<div class="pc-body">' + L.fmtBody(it.ds) + "</div>" +
    (it.att ? '<p class="muted">Требует настройки.</p>' : "") +
    '<button class="btn ghost" id="fav" type="button">' + (isFav("item", it.id) ? "В избранном" : "В избранное") + "</button>" +
    (MODE === "player" ? '<button class="btn" id="take" type="button">Положить в сумку</button>' : ""),
    function (r) {
      L.$("#fav", r).addEventListener("click", function () { toggleFav("item", it); itemSheet(it); });
      const take = L.$("#take", r);
      if (take) take.addEventListener("click", function () { addItem(it); closeSheet(); });
    }
  );
}

function monSheet(m, kind) {
  if (!m) return;
  const k = kind || "monster";
  remember(k, m);
  const ab = ["Сил", "Лов", "Тел", "Инт", "Мдр", "Хар"];
  const st = m.st || [];
  openSheet(
    '<div class="sb-title">' + L.esc(m.n) + "</div>" +
    '<div class="sb-sub">' + L.esc([m.sz, m.ty, m.al].filter(Boolean).join(" · ")) + "</div>" +
    avHtml(m, 88) +
    '<div class="kv">' + meta("КД", m.ac + (m.acn ? " (" + m.acn + ")" : "")) + meta("Хиты", m.hp + (m.hd ? " (" + m.hd + ")" : "")) +
      meta("Скорость", m.sp) + meta("ОП", m.cr != null ? L.crTxt(m.cr) : "") + meta("Опыт", m.xp) + meta("Языки", m.la) + "</div>" +
    '<div class="grid6">' + st.map(function (v, i) {
      return '<div class="ab"><small>' + ab[i] + "</small><b>" + L.fmod(L.mod(v)) + "</b><small>" + L.esc(v) + "</small></div>";
    }).join("") + "</div>" +
    (m.sv ? "<p><b>Спасброски.</b> " + L.esc(m.sv) + "</p>" : "") +
    (m.sk ? "<p><b>Навыки.</b> " + L.esc(m.sk) + "</p>" : "") +
    (m.se ? "<p><b>Чувства.</b> " + L.esc(m.se) + "</p>" : "") +
    (m.imm ? "<p><b>Иммунитет.</b> " + L.esc(m.imm) + "</p>" : "") +
    (m.res ? "<p><b>Сопротивление.</b> " + L.esc(m.res) + "</p>" : "") +
    (m.vul ? "<p><b>Уязвимость.</b> " + L.esc(m.vul) + "</p>" : "") +
    '<p class="muted"><b>Тактика:</b> ' + L.esc(tacticsFor(m)) + "</p>" +
    feats("Особенности", m.f) + feats("Действия", m.a) + feats("Реакции", m.r) + feats("Легендарные действия", m.lg) +
    '<button class="btn ghost" id="fav" type="button">' + (isFav(k, m.id) ? "В избранном" : "В избранное") + "</button>" +
    (MODE === "master" ? '<button class="btn" id="toC" type="button">В трекер боя</button>' : ""),
    function (root) {
      L.$("#fav", root).addEventListener("click", function () { toggleFav(k, m); monSheet(m, k); });
      const toC = L.$("#toC", root);
      if (toC) toC.addEventListener("click", function () { addCombatant(m); closeSheet(); toast("В бою: " + m.n); });
    }
  );
}

function npcSheet(n) {
  if (!n) return;
  remember("npc", n);
  openSheet(
    '<div class="sb-title">' + L.esc(n.n) + "</div>" +
    '<div class="sb-sub">' + L.esc([n.race, n.role].filter(Boolean).join(" · ")) + "</div>" +
    avHtml({ n: n.n, race: n.race }, 88) +
    block("Внешность", n.look) + block("Характер", n.personality) + block("Речь", n.speech) +
    block("Мотив", n.motive) + block("Тайна", n.secret) + block("Завязка", n.hook) +
    (n.phrases && n.phrases.length ? "<h3>Фразы</h3><ul>" + n.phrases.map(function (p) { return "<li>" + L.esc(p) + "</li>"; }).join("") + "</ul>" : "") +
    (n.stat ? '<p class="muted">Статблок: ' + L.esc(n.stat) + "</p>" : "") +
    '<button class="btn ghost" id="fav" type="button">' + (isFav("npc", n.id) ? "В избранном" : "В избранное") + "</button>",
    function (r) { L.$("#fav", r).addEventListener("click", function () { toggleFav("npc", n); npcSheet(n); }); }
  );
}

function rHero() {
  const H = S.hero;
  const p = L.pb(H.lvl);
  return header("Герой", H.name + " · " + H.cls + " " + H.lvl + " ур.") +
    '<div class="card"><div class="row">' + avHtml({ n: H.name, race: H.race }, 64) +
    '<div class="grow"><div class="t">' + L.esc(H.name) + '</div><div class="m">' + L.esc(H.race + " · " + H.cls + " · ур. " + H.lvl) + "</div></div>" +
    '<button class="btn sm" id="edit" type="button">Изм.</button></div></div>' +
    '<div class="card" id="hpc"><div class="hp"><span class="big">' + H.hp + "</span><small>/ " + H.maxhp + (H.thp ? " · +" + H.thp + " врем." : "") + "<br>хиты</small></div>" +
    '<div class="bar"><i style="width:' + Math.max(0, H.hp / Math.max(1, H.maxhp) * 100) + '%"></i></div></div>' +
    '<div class="kv"><div><small>КД</small><b>' + H.ac + "</b></div><div><small>Иниц.</small><b>" + L.fmod(L.mod(H.st[1])) + "</b></div>" +
    "<div><small>Скорость</small><b>" + H.spd + " м</b></div><div><small>Мастерство</small><b>" + L.fmod(p) + "</b></div></div>" +
    "<h3>Характеристики</h3><div class=\"grid6\">" + H.st.map(function (v, i) {
      return '<div class="ab" data-ab="' + i + '"><small>' + AB[i] + "</small><b>" + L.fmod(L.mod(v)) + "</b><small>" + v + (H.svp.indexOf(i) >= 0 ? " · спас" : "") + "</small></div>";
    }).join("") + "</div>" +
    "<h3>Навыки</h3><div class=\"card\">" + SK.map(function (pair, i) {
      const pr = H.prof.indexOf(i) >= 0;
      return '<div class="row" data-sk="' + i + '" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="grow">' + (pr ? "◆ " : "◇ ") + pair[0] + ' <span class="muted">' + AB[pair[1]] + '</span></span><b>' + L.fmod(L.mod(H.st[pair[1]]) + (pr ? p : 0)) + "</b></div>";
    }).join("") + "</div>" +
    "<h3>Состояния</h3><div class=\"wrap\">" + COND.map(function (c) {
      return '<button type="button" class="chip' + (H.conds.indexOf(c) >= 0 ? " on" : "") + '" data-c="' + L.esc(c) + '">' + L.esc(c) + "</button>";
    }).join("") + "</div>" +
    '<div class="row" style="margin-top:12px"><button class="btn" id="sr" type="button">Короткий отдых</button><button class="btn ghost" id="lr" type="button">Долгий отдых</button></div>' +
    '<button class="btn ghost" id="insp" type="button" style="margin-top:8px">' + (H.insp ? "Потратить вдохновение" : "Вдохновения нет") + "</button>" +
    F.usesHtml(H) +
    '<div class="row" style="margin-top:12px"><button class="btn ghost" id="hexp" type="button">Экспорт листа</button><button class="btn ghost" id="himp" type="button">Импорт листа</button></div>';
}

function bHero() {
  const H = S.hero;
  L.$("#edit").addEventListener("click", editHero);
  L.$("#hpc").addEventListener("click", function () {
    openSheet('<div class="sb-title">Хиты</div><input class="inp" id="nv" type="number" inputmode="numeric" placeholder="сколько">' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="nm" type="button">Урон</button><button class="btn gold" id="np" type="button">Лечение</button></div>', function (r) {
        L.$("#nm", r).addEventListener("click", function () { hpChange(-Math.abs(+L.$("#nv", r).value || 0)); closeSheet(); render(); });
        L.$("#np", r).addEventListener("click", function () { hpChange(Math.abs(+L.$("#nv", r).value || 0)); closeSheet(); render(); });
      });
  });
  L.$$("[data-ab]").forEach(function (el) {
    el.addEventListener("click", function () {
      const i = +el.getAttribute("data-ab");
      askRoll("Спасбросок " + AB[i], L.mod(H.st[i]) + (H.svp.indexOf(i) >= 0 ? L.pb(H.lvl) : 0));
    });
  });
  L.$$("[data-sk]").forEach(function (el) {
    el.addEventListener("click", function () {
      const i = +el.getAttribute("data-sk");
      const pr = H.prof.indexOf(i) >= 0;
      askRoll(SK[i][0], L.mod(H.st[SK[i][1]]) + (pr ? L.pb(H.lvl) : 0));
    });
  });
  L.$$("[data-c]").forEach(function (el) {
    el.addEventListener("click", function () {
      const c = el.getAttribute("data-c");
      H.conds = H.conds.indexOf(c) >= 0 ? H.conds.filter(function (x) { return x !== c; }) : H.conds.concat([c]);
      saveHero(); render();
    });
  });
  L.$("#sr").addEventListener("click", function () {
    const hd = /чародей|волшебник/i.test(H.cls) ? 6 : /варвар/i.test(H.cls) ? 12 : /воин|паладин|следопыт/i.test(H.cls) ? 10 : 8;
    const v = Math.max(1, L.rnd(hd) + L.mod(H.st[2]));
    H.hp = Math.min(H.maxhp, H.hp + v);
    F.restoreUses(H, "short");
    saveHero(); render(); toast("Короткий отдых: +" + v + " хитов");
  });
  L.$("#lr").addEventListener("click", function () {
    H.hp = H.maxhp; H.thp = 0;
    Object.keys(H.slots).forEach(function (k) { H.slots[k].used = 0; });
    H.conds = H.conds.filter(function (c) { return c !== "Без сознания"; });
    F.restoreUses(H, "long");
    saveHero(); render(); toast("Долгий отдых: всё восстановлено");
  });
  L.$("#insp").addEventListener("click", function () {
    if (!H.insp) { toast("Вдохновение выдаёт Мастер"); return; }
    H.insp = false; saveHero(); render(); toast("Вдохновение: бросьте 2к20 и возьмите больший");
  });
  L.$$("[data-use]").forEach(function (el) {
    el.addEventListener("click", function () {
      F.syncUses(H);
      const k = el.getAttribute("data-use");
      const u = H.uses[k];
      if (!u) return;
      u.used = u.used >= u.max ? 0 : u.used + 1;
      saveHero(); render();
    });
  });
  const hexp = L.$("#hexp");
  if (hexp) hexp.addEventListener("click", function () {
    const raw = F.exportHero(H);
    openSheet('<div class="sb-title">Экспорт листа</div><p class="muted">Скопируй код и храни его у себя. В нём лист героя, не тайны Мастера.</p><textarea class="inp" id="exout" readonly>' + L.esc(raw) + "</textarea>", function () {});
  });
  const himp = L.$("#himp");
  if (himp) himp.addEventListener("click", function () {
    openSheet('<div class="sb-title">Импорт листа</div><textarea class="inp" id="imin" placeholder="DND1:…"></textarea><button class="btn" id="imok" type="button" style="margin-top:10px">Загрузить</button>', function (r) {
      L.$("#imok", r).addEventListener("click", function () {
        try {
          const next = F.importHero(L.$("#imin", r).value);
          S.hero = Object.assign(freshHero(), next);
          saveHero(); closeSheet(); render(); toast("Лист загружен");
        } catch (err) { toast("Не удалось прочитать лист"); }
      });
    });
  });
}

function hpChange(v) {
  const H = S.hero;
  if (v < 0) {
    let d = -v;
    const a = Math.min(H.thp || 0, d);
    H.thp = (H.thp || 0) - a; d -= a;
    H.hp = Math.max(0, H.hp - d);
    if (H.hp === 0 && H.conds.indexOf("Без сознания") < 0) H.conds.push("Без сознания");
  } else {
    if (H.hp === 0) { H.ds = { s: 0, f: 0 }; H.conds = H.conds.filter(function (c) { return c !== "Без сознания"; }); }
    H.hp = Math.min(H.maxhp, H.hp + v);
  }
  saveHero();
}

function field(id, label, value) {
  return '<label class="grow"><small class="muted">' + L.esc(label) + '</small><input class="inp" id="' + id + '" type="number" value="' + L.esc(value) + '"></label>';
}

function editHero() {
  const H = S.hero;
  openSheet(
    '<div class="sb-title">Лист героя</div>' +
    '<input class="inp" id="en" value="' + L.esc(H.name) + '" placeholder="Имя">' +
    '<div class="row" style="margin-top:8px"><input class="inp grow" id="er" value="' + L.esc(H.race) + '" placeholder="Народ"><input class="inp grow" id="ec" value="' + L.esc(H.cls) + '" placeholder="Класс"></div>' +
    '<div class="row" style="margin-top:8px">' + field("el", "Уровень", H.lvl) + field("ea", "КД", H.ac) + field("em", "Макс. хиты", H.maxhp) + field("es", "Скорость", H.spd) + "</div>" +
    '<div class="row" style="margin-top:8px;flex-wrap:wrap">' + H.st.map(function (v, i) {
      return '<label class="grow"><small class="muted">' + AB[i] + '</small><input class="inp" data-st="' + i + '" type="number" value="' + v + '"></label>';
    }).join("") + "</div>" +
    "<p class=\"muted\">Владения</p><div class=\"wrap\">" +
      AB.map(function (a, i) { return '<button type="button" class="chip' + (H.svp.indexOf(i) >= 0 ? " on" : "") + '" data-sv="' + i + '">спас ' + a + "</button>"; }).join("") +
      SK.map(function (pair, i) { return '<button type="button" class="chip' + (H.prof.indexOf(i) >= 0 ? " on" : "") + '" data-pf="' + i + '">' + pair[0] + "</button>"; }).join("") +
    "</div>" +
    '<p class="muted">Быстрый выбор:</p><div class="wrap">' +
      RACES.map(function (r) { return '<button type="button" class="chip" data-race="' + L.esc(r) + '">' + L.esc(r) + "</button>"; }).join("") +
    "</div><div class=\"wrap\">" +
      CLASSES.map(function (r) { return '<button type="button" class="chip" data-cls="' + L.esc(r) + '">' + L.esc(r) + "</button>"; }).join("") +
    "</div>" +
    '<button class="btn" id="es2" type="button" style="margin-top:12px">Сохранить</button>',
    function (r) {
      function tg(arr, v) { return arr.indexOf(v) >= 0 ? arr.filter(function (x) { return x !== v; }) : arr.concat([v]); }
      L.$$("[data-sv]", r).forEach(function (b) { b.addEventListener("click", function () { H.svp = tg(H.svp, +b.getAttribute("data-sv")); b.classList.toggle("on"); }); });
      L.$$("[data-pf]", r).forEach(function (b) { b.addEventListener("click", function () { H.prof = tg(H.prof, +b.getAttribute("data-pf")); b.classList.toggle("on"); }); });
      L.$$("[data-race]", r).forEach(function (b) { b.addEventListener("click", function () { L.$("#er", r).value = b.getAttribute("data-race"); }); });
      L.$$("[data-cls]", r).forEach(function (b) { b.addEventListener("click", function () { L.$("#ec", r).value = b.getAttribute("data-cls"); }); });
      L.$("#es2", r).addEventListener("click", function () {
        H.name = L.$("#en", r).value || H.name;
        H.race = L.$("#er", r).value; H.cls = L.$("#ec", r).value;
        H.lvl = Math.max(1, Math.min(20, +L.$("#el", r).value || 1));
        H.ac = +L.$("#ea", r).value || 10;
        H.maxhp = +L.$("#em", r).value || 1; H.hp = Math.min(H.hp, H.maxhp);
        H.spd = +L.$("#es", r).value || 9;
        L.$$("[data-st]", r).forEach(function (i) { H.st[+i.getAttribute("data-st")] = +i.value || 10; });
        saveHero(); closeSheet(); render(); toast("Лист сохранён");
      });
    }
  );
}

function askRoll(label, bonus) {
  openSheet('<div class="sb-title">' + L.esc(label) + '</div><p class="muted">Бросьте к20. Модификатор ' + L.fmod(bonus) + " прибавится сам.</p>" +
    '<div class="row"><input class="inp grow" id="rin" type="number" inputmode="numeric" min="1" max="20" placeholder="к20"><button class="btn sm" id="rgo" type="button">=</button></div>' +
    '<div id="rres" class="center" style="min-height:24px;margin:10px 0"></div>' +
    '<button class="btn ghost" id="rv" type="button">Случайный бросок</button>', function (r) {
      function show(d) {
        L.$("#rres", r).innerHTML = '<div style="font:400 56px var(--title)">' + (d + bonus) + '</div><div class="muted">к20: ' + d + " " + L.fmod(bonus) + (d === 20 ? " · КРИТ" : d === 1 ? " · провал" : "") + "</div>";
      }
      L.$("#rgo", r).addEventListener("click", function () { const d = +L.$("#rin", r).value; if (d >= 1 && d <= 20) show(d); else toast("Введите 1–20"); });
      L.$("#rv", r).addEventListener("click", function () { const d = L.rnd(20); L.$("#rin", r).value = d; show(d); L.haptic("success"); });
    });
}

function addItem(it) {
  const H = S.hero;
  const ex = it.id && H.inv.find(function (x) { return x.item === it.id; });
  if (ex) ex.q = (ex.q || 1) + 1;
  else H.inv.push({ id: L.uid(), item: it.id, n: it.n, w: it.w || 0, d: [it.dmg, it.prop].filter(Boolean).join(" · "), q: 1 });
  saveHero(); toast("В сумке: " + it.n);
}

function rBag() {
  const H = S.hero;
  const w = H.inv.reduce(function (s, x) { return s + (x.w || 0) * (x.q || 1); }, 0);
  return header("Сумка", "снаряжение и монеты") +
    '<div class="card"><div class="row">' + Object.keys(H.coins).map(function (k) {
      return '<div class="grow center" data-coin="' + k + '"><b style="font-size:22px">' + H.coins[k] + "</b><div class=\"muted\">" + k + "</div></div>";
    }).join("") + '</div><div class="muted center" style="margin-top:8px">10 мм = 1 см · 10 см = 1 зм · 1 пм = 10 зм</div></div>' +
    '<div class="search"><input id="q" placeholder="Найти предмет…"></div><div id="ir"></div>' +
    "<h3>Снаряжение <span class=\"muted\">· " + w.toFixed(1) + " / " + (H.st[0] * 7.5).toFixed(0) + " кг</span></h3>" +
    (w > H.st[0] * 7.5 ? '<div class="err">Перегруз: скорость 1,5 м, пока не сбросите лишнее.</div>' : "") +
    '<div class="card">' + (H.inv.length ? H.inv.map(function (x) {
      return '<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="grow" data-iv="' + x.id + '"><div class="t">' + L.esc(x.n) + (x.q > 1 ? " ×" + x.q : "") + '</div><div class="m">' + L.esc(x.d || "") + "</div></div>" +
        '<button class="btn sm" data-iq="' + x.id + '" data-d="-1" type="button">−</button><button class="btn sm" data-iq="' + x.id + '" data-d="1" type="button">＋</button></div>';
    }).join("") : '<div class="empty">Сумка пуста</div>') + "</div>" +
    '<button class="btn ghost" id="icust" type="button">Свой предмет</button>';
}

function bBag() {
  bindSearch(function () { fillItemSuggest(); });
  fillItemSuggest();
  L.$$("[data-coin]").forEach(function (el) {
    el.addEventListener("click", function () {
      const k = el.getAttribute("data-coin");
      openSheet('<div class="sb-title">' + k + '</div><input class="inp" id="cv" type="number" value="' + S.hero.coins[k] + '"><button class="btn" id="cok" type="button" style="margin-top:10px">Сохранить</button>', function (r) {
        L.$("#cok", r).addEventListener("click", function () { S.hero.coins[k] = Math.max(0, +L.$("#cv", r).value || 0); saveHero(); closeSheet(); render(); });
      });
    });
  });
  L.$$("[data-iq]").forEach(function (b) {
    b.addEventListener("click", function () {
      const x = S.hero.inv.find(function (y) { return y.id === b.getAttribute("data-iq"); });
      if (!x) return;
      x.q = (x.q || 1) + (+b.getAttribute("data-d"));
      if (x.q <= 0) S.hero.inv = S.hero.inv.filter(function (y) { return y !== x; });
      saveHero(); render();
    });
  });
  L.$$("[data-iv]").forEach(function (el) {
    el.addEventListener("click", function () {
      const x = S.hero.inv.find(function (y) { return y.id === el.getAttribute("data-iv"); });
      const it = x && x.item ? findItem(x.item) : x;
      if (it) itemSheet(it.id ? it : { id: x.id, n: x.n, ds: x.d });
    });
  });
  L.$("#icust").addEventListener("click", function () {
    openSheet('<div class="sb-title">Свой предмет</div><input class="inp" id="cn" placeholder="Название"><input class="inp" id="cd" placeholder="Описание" style="margin-top:8px"><button class="btn" id="cok" type="button" style="margin-top:10px">Добавить</button>', function (r) {
      L.$("#cok", r).addEventListener("click", function () {
        addItem({ n: L.$("#cn", r).value || "Предмет", ds: L.$("#cd", r).value, w: 0 });
        closeSheet(); render();
      });
    });
  });
}

async function fillItemSuggest() {
  const box = L.$("#ir");
  if (!box) return;
  const q = S.q.toLowerCase();
  if (q.length < 2) { box.innerHTML = ""; return; }
  const items = await loadItems();
  const hits = items.filter(function (i) { return String(i.n || "").toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
  box.innerHTML = '<div class="card">' + (hits.length ? hits.map(function (i) {
    return '<div class="row" data-add="' + L.esc(i.id) + '" style="padding:8px 0"><div class="grow"><div class="t">' + L.esc(i.n) + '</div><div class="m">' + L.esc([i.dmg, i.cost, i.rar].filter(Boolean).join(" · ")) + "</div></div><b>＋</b></div>";
  }).join("") : '<p class="muted">Ничего не найдено</p>') + "</div>";
  L.$$("[data-add]", box).forEach(function (b) {
    b.addEventListener("click", function () { const it = findItem(b.getAttribute("data-add")); if (it) { addItem(it); render(); } });
  });
}

function playerSpellbook() {
  const H = S.hero;
  const ks = Object.keys(H.slots).sort();
  return '<div class="card"><div class="row"><b class="grow">Ячейки</b><button class="btn sm" id="sfill" type="button">По уровню</button></div>' +
    (ks.length ? ks.map(function (l) {
      return '<div class="row" style="margin-top:8px"><span class="muted" style="width:52px">' + l + " ур.</span><div class=\"slots\">" +
        Array.from({ length: H.slots[l].max }, function (_, i) {
          return '<button type="button" class="pip' + (i < H.slots[l].used ? " used" : "") + '" data-sl="' + l + '" data-i="' + i + '"></button>';
        }).join("") + "</div></div>";
    }).join("") : '<p class="muted">Нет ячеек. Нажми «По уровню».</p>') + "</div>" +
    (H.spells.length ? "<h3>Мои заклинания</h3><div class=\"list\">" + H.spells.map(function (id) {
      const s = findSpell(id); if (!s) return "";
      return '<div class="card" data-mine="' + s.id + '"><div class="grow"><div class="t">' + L.esc(s.n) + '</div><div class="m">' + L.esc(s.l ? s.l + " ур." : "заговор") + "</div></div></div>";
    }).join("") + "</div>" : "");
}

function rSpells() {
  return header("Чары", MODE === "player" ? "гримуар и справочник" : "полный справочник заклинаний") +
    (MODE === "player" ? playerSpellbook() : "") +
    '<div class="search"><input id="q" placeholder="Найти заклинание…"></div>' +
    '<div class="chips" id="chips"></div><div class="list" id="list"></div>';
}

function fillSpells() {
  const q = S.q.toLowerCase();
  let list = S.spells || [];
  if (S.chip === "0") list = list.filter(function (s) { return !s.l; });
  else if (S.chip) list = list.filter(function (s) { return String(s.l) === S.chip; });
  if (q) list = list.filter(function (s) { return String(s.n || "").toLowerCase().indexOf(q) >= 0 || String(s.sc || "").toLowerCase().indexOf(q) >= 0; });
  const shown = list.slice(0, S.more);
  const box = L.$("#list");
  if (!box) return;
  box.innerHTML = shown.map(function (s) {
    const thumb = L.spellArtUrl(s.id, true);
    return '<div class="card" data-id="' + L.esc(s.id) + '">' +
      (thumb ? '<img class="av" src="' + L.esc(thumb) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : "") +
      '<div class="grow"><div class="t">' + L.esc(s.n) + '</div><div class="m">' + L.esc((s.l ? s.l + " ур." : "заговор") + (s.sc ? " · " + s.sc : "") + (s.conc ? " · конц." : "") + (s.rit ? " · ритуал" : "")) + "</div></div></div>";
  }).join("") + moreBtn(list.length);
  box.querySelectorAll("[data-id]").forEach(function (c) { c.addEventListener("click", function () { spellSheet(findSpell(c.getAttribute("data-id"))); }); });
  bindMore(list.length);
}

async function bSpells(seq) {
  await loadSpells();
  await L.loadSpellArtIndex();
  if (seq && seq !== renderSeq) return;
  const chips = L.$("#chips");
  if (!chips) return;
  const levels = [["", "Все"], ["0", "Заговоры"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"]];
  chips.innerHTML = levels.map(function (x) {
    return '<button type="button" class="chip' + (S.chip === x[0] ? " on" : "") + '" data-v="' + x[0] + '">' + x[1] + "</button>";
  }).join("");
  chips.querySelectorAll("[data-v]").forEach(function (b) {
    b.addEventListener("click", function () { S.chip = b.getAttribute("data-v"); S.more = 80; fillSpells(); chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c === b); }); });
  });
  bindSearch(fillSpells);
  fillSpells();
  if (MODE === "player") {
    const fill = L.$("#sfill");
    if (fill) fill.addEventListener("click", function () {
      const a = SLOTS[S.hero.lvl] || [];
      S.hero.slots = {};
      a.forEach(function (m, i) { S.hero.slots[i + 1] = { max: m, used: 0 }; });
      saveHero(); render();
    });
    L.$$("[data-sl]").forEach(function (b) {
      b.addEventListener("click", function () {
        const s = S.hero.slots[b.getAttribute("data-sl")];
        const i = +b.getAttribute("data-i");
        s.used = i < s.used ? i : i + 1;
        saveHero(); render();
      });
    });
    L.$$("[data-mine]").forEach(function (c) { c.addEventListener("click", function () { spellSheet(findSpell(c.getAttribute("data-mine"))); }); });
  }
}

function rItems() {
  return header(MODE === "master" ? "Лут" : "Предметы", "оружие, доспехи, снаряжение и чудеса") +
    '<div class="search"><input id="q" placeholder="Найти предмет…"></div><div class="chips" id="chips"></div><div class="list" id="list"></div>';
}

function fillItems() {
  let list = S.items || [];
  if (S.chip) list = list.filter(function (i) { return i.cat === S.chip || i.rar === S.chip; });
  if (S.q) {
    const q = S.q.toLowerCase();
    list = list.filter(function (i) { return String(i.n || "").toLowerCase().indexOf(q) >= 0; });
  }
  const shown = list.slice(0, S.more);
  const box = L.$("#list");
  if (!box) return;
  box.innerHTML = shown.map(function (i) {
    return '<div class="card" data-id="' + L.esc(i.id) + '"><div class="grow"><div class="t">' + L.esc(i.n) + '</div><div class="m">' + L.esc([i.cat, i.rar, i.dmg || i.cost].filter(Boolean).join(" · ")) + '</div></div><span class="badge">' + L.esc(i.rar || "") + "</span></div>";
  }).join("") + moreBtn(list.length);
  box.querySelectorAll("[data-id]").forEach(function (c) { c.addEventListener("click", function () { itemSheet(findItem(c.getAttribute("data-id"))); }); });
  bindMore(list.length);
}

async function bItems(seq) {
  await loadItems();
  if (seq && seq !== renderSeq) return;
  const cats = ["", "Оружие", "Доспехи", "Снаряжение", "Магические", "Инструменты"];
  const chips = L.$("#chips");
  if (!chips) return;
  chips.innerHTML = cats.map(function (c) {
    return '<button type="button" class="chip' + (S.chip === c ? " on" : "") + '" data-v="' + L.esc(c) + '">' + (c || "Все") + "</button>";
  }).join("");
  L.$$("#chips [data-v]").forEach(function (b) {
    b.addEventListener("click", function () { S.chip = b.getAttribute("data-v"); S.more = 80; fillItems(); });
  });
  bindSearch(fillItems);
  fillItems();
}

function rList(title, sub, ph) {
  return header(title, sub) + '<div class="search"><input id="q" placeholder="' + ph + '"></div><div class="chips" id="chips"></div><div class="list" id="list"></div>';
}

function fillMonsters() {
  let list = monsters();
  if (S.chip) list = list.filter(function (m) { return String(m.ty || "").indexOf(S.chip) === 0; });
  if (S.q) { const q = S.q.toLowerCase(); list = list.filter(function (m) { return String(m.n || "").toLowerCase().indexOf(q) >= 0; }); }
  list = list.slice().sort(function (a, b) { return (a.cr || 0) - (b.cr || 0) || String(a.n).localeCompare(String(b.n), "ru"); });
  const shown = list.slice(0, S.more);
  const box = L.$("#list");
  if (!box) return;
  box.innerHTML = shown.map(function (m) {
    return '<div class="card" data-id="' + L.esc(m.id) + '">' + avHtml(m, 52) + '<div class="grow"><div class="t">' + L.esc(m.n) + '</div><div class="m">' + L.esc((m.sz || "") + " " + (m.ty || "")) + '</div></div><span class="badge">ОП ' + L.crTxt(m.cr) + "</span></div>";
  }).join("") + moreBtn(list.length);
  L.$$("#list [data-id]").forEach(function (c) {
    c.addEventListener("click", function () { monSheet(monsters().find(function (m) { return m.id === c.getAttribute("data-id"); }), "monster"); });
  });
  bindMore(list.length);
}

function rBestiary() { return rList("Бестиарий", "монстры и оригинальные существа книги", "Найти существо…"); }
function bBestiary() {
  const types = ["", "гуманоид", "зверь", "нежить", "чудовище", "исчадие", "дракон", "великан", "конструкт", "элементаль", "фея", "аберрация"];
  L.$("#chips").innerHTML = types.map(function (t) { return '<button type="button" class="chip' + (S.chip === t ? " on" : "") + '" data-v="' + L.esc(t) + '">' + (t || "Все") + "</button>"; }).join("");
  L.$$("#chips [data-v]").forEach(function (b) { b.addEventListener("click", function () { S.chip = b.getAttribute("data-v"); S.more = 80; fillMonsters(); }); });
  bindSearch(fillMonsters);
  fillMonsters();
}

function rChars() {
  return header("Персонажи", "легенды мира и НИП с тайнами") +
    '<div class="chips"><button type="button" class="chip' + (S.chip !== "npc" ? " on" : "") + '" data-v="leg">Легенды</button><button type="button" class="chip' + (S.chip === "npc" ? " on" : "") + '" data-v="npc">НИП</button></div>' +
    '<div class="search"><input id="q" placeholder="Найти персонажа…"></div><div class="list" id="list"></div>';
}

function fillChars() {
  const q = S.q.toLowerCase();
  if (S.chip === "npc") {
    let list = npcs();
    if (q) list = list.filter(function (n) { return (n.n + " " + n.role + " " + n.race).toLowerCase().indexOf(q) >= 0; });
    const shown = list.slice(0, S.more);
    const boxN = L.$("#list");
    if (!boxN) return;
    boxN.innerHTML = shown.map(function (n) {
      return '<div class="card" data-id="' + L.esc(n.id) + '">' + avHtml({ n: n.n, race: n.race }, 52) + '<div class="grow"><div class="t">' + L.esc(n.n) + '</div><div class="m">' + L.esc([n.race, n.role].filter(Boolean).join(" · ")) + "</div></div></div>";
    }).join("") + moreBtn(list.length);
    L.$$("#list [data-id]").forEach(function (c) { c.addEventListener("click", function () { npcSheet(npcs().find(function (n) { return n.id === c.getAttribute("data-id"); })); }); });
    bindMore(list.length);
  } else {
    let list = legends();
    if (q) list = list.filter(function (n) { return String(n.n || "").toLowerCase().indexOf(q) >= 0; });
    const shown = list.slice(0, S.more);
    const boxL = L.$("#list");
    if (!boxL) return;
    boxL.innerHTML = shown.map(function (m) {
      return '<div class="card" data-id="' + L.esc(m.id) + '">' + avHtml(m, 52) + '<div class="grow"><div class="t">' + L.esc(m.n) + '</div><div class="m">' + L.esc(m.ty || "") + '</div></div><span class="badge">ОП ' + L.crTxt(m.cr) + "</span></div>";
    }).join("") + moreBtn(list.length);
    L.$$("#list [data-id]").forEach(function (c) { c.addEventListener("click", function () { monSheet(legends().find(function (n) { return n.id === c.getAttribute("data-id"); }), "legend"); }); });
    bindMore(list.length);
  }
}

function bChars() {
  L.$$(".chips [data-v]").forEach(function (b) { b.addEventListener("click", function () { S.chip = b.getAttribute("data-v") === "npc" ? "npc" : ""; S.more = 80; render(); }); });
  bindSearch(fillChars);
  fillChars();
}

function rMaps() {
  return header("Карты", "земли Великого континента") + '<div class="list" id="list"><div class="muted">Открываю атлас…</div></div>';
}

async function bMaps(seq) {
  const maps = await loadMaps();
  if (seq && seq !== renderSeq) return;
  const box = L.$("#list");
  if (!box) return;
  box.innerHTML = maps.map(function (m) {
    return '<div class="card" data-k="' + L.esc(m.k) + '" style="display:block"><img src="' + L.esc(L.mapUrl(m.src)) + '" alt="" style="height:140px;width:100%;object-fit:cover;border-radius:12px;margin-bottom:8px" loading="lazy"><div class="t">' + L.esc(m.n) + "</div></div>";
  }).join("");
  L.$$("#list [data-k]").forEach(function (c) {
    c.addEventListener("click", function () { openMap(maps.find(function (m) { return m.k === c.getAttribute("data-k"); })); });
  });
}

function openMap(m) {
  if (!m) return;
  remember("map", { id: m.k, n: m.n });
  openSheet('<div class="sb-title">' + L.esc(m.n) + '</div><div class="map-view" id="mv"><img id="mi" src="' + L.esc(L.mapUrl(m.src)) + '" alt="' + L.esc(m.n) + '"></div><p class="muted">Двумя пальцами увеличивай, одним — двигай карту.</p>', function () {
    const view = L.$("#mv"); const img = L.$("#mi");
    let scale = 1, x = 0, y = 0, pts = null, lastDist = 0;
    function apply() { img.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")"; }
    view.addEventListener("pointerdown", function (e) {
      view.setPointerCapture(e.pointerId);
      if (!pts) pts = {};
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    });
    view.addEventListener("pointerup", function (e) { if (pts) delete pts[e.pointerId]; lastDist = 0; });
    view.addEventListener("pointercancel", function (e) { if (pts) delete pts[e.pointerId]; lastDist = 0; });
    view.addEventListener("pointermove", function (e) {
      if (!pts || !pts[e.pointerId]) return;
      const ids = Object.keys(pts);
      if (ids.length === 1) {
        x += e.clientX - pts[e.pointerId].x; y += e.clientY - pts[e.pointerId].y;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY }; apply();
      } else if (ids.length >= 2) {
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        const a = pts[ids[0]], b = pts[ids[1]];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastDist) scale = Math.min(5, Math.max(1, scale * (dist / lastDist)));
        lastDist = dist; apply();
      }
    });
    view.addEventListener("wheel", function (e) {
      e.preventDefault();
      scale = Math.min(5, Math.max(1, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
      apply();
    }, { passive: false });
  });
}

function favBlock() {
  if (!S.favs.length && !S.recent.length) return "";
  return (S.favs.length ? "<h3>Избранное</h3><div class=\"list\">" + S.favs.map(function (f) {
    return '<div class="card" data-fk="' + L.esc(f.k) + '" data-fid="' + L.esc(f.id) + '"><div class="grow"><div class="t">' + L.esc(f.n) + '</div><div class="m">' + L.esc(f.k) + "</div></div></div>";
  }).join("") + "</div>" : "") +
    (S.recent.length ? "<h3>Недавнее</h3><div class=\"list\">" + S.recent.slice(0, 10).map(function (f) {
      return '<div class="card" data-fk="' + L.esc(f.k) + '" data-fid="' + L.esc(f.id) + '"><div class="grow"><div class="t">' + L.esc(f.n) + '</div><div class="m">' + L.esc(f.k) + "</div></div></div>";
    }).join("") + "</div>" : "");
}

function openFav(k, id) {
  if (k === "spell") { loadSpells().then(function () { spellSheet(findSpell(id)); }); return; }
  if (k === "item") { loadItems().then(function () { itemSheet(findItem(id)); }); return; }
  if (k === "monster") { monSheet(monsters().find(function (m) { return m.id === id; }), "monster"); return; }
  if (k === "legend") { monSheet(legends().find(function (m) { return m.id === id; }), "legend"); return; }
  if (k === "npc") { npcSheet(npcs().find(function (m) { return m.id === id; })); return; }
  if (k === "map") { loadMaps().then(function (maps) { openMap(maps.find(function (m) { return m.k === id; })); }); }
}

function rNotes() {
  if (MODE === "player") {
    const H = S.hero;
    return header("Записи", "дневник и заметки на полях") +
      '<textarea class="inp" id="nt" placeholder="Имена, долги, подозрения…">' + L.esc(H.notes || "") + "</textarea>" +
      '<h3>Дневник</h3><div class="row"><input class="inp grow" id="jq" placeholder="Что случилось сегодня?"><button class="btn sm" id="ja" type="button">＋</button></div>' +
      '<div class="card">' + ((H.journal || []).length ? H.journal.map(function (j, i) {
        return '<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="grow"><div class="muted">' + L.esc(j.d) + '</div><div>' + L.esc(j.t) + '</div></div><button class="btn sm" data-jd="' + i + '" type="button">✕</button></div>';
      }).join("") : '<div class="empty">Дневник пуст</div>') + "</div>" + favBlock();
  }
  return header("Заметки", "только для Мастера — игроки этого не видят") +
    '<div class="row"><input class="inp grow" id="ntitle" placeholder="Заголовок"></div>' +
    '<textarea class="inp" id="ntext" placeholder="Тайна, сцена, напоминание…" style="margin-top:8px"></textarea>' +
    '<div class="row" style="margin-top:8px"><input class="inp grow" id="ntag" placeholder="Метка: Тайна, Сцена, Квест"><button class="btn sm" id="nadd" type="button">＋</button></div>' +
    (S.notes.length ? S.notes.map(function (n) {
      return '<div class="card" data-nid="' + n.id + '"><div class="badge">' + L.esc(n.tag || "") + '</div><div class="t">' + L.esc(n.title) + '</div><div class="m">' + L.esc((n.text || "").slice(0, 180)) + "</div></div>";
    }).join("") : '<div class="empty">Заметок пока нет</div>') + favBlock();
}

function bNotes() {
  if (MODE === "player") {
    L.$("#nt").addEventListener("input", L.debounce(function (e) { S.hero.notes = e.target.value; saveHero(); }, 400));
    L.$("#ja").addEventListener("click", function () {
      const t = L.$("#jq").value.trim(); if (!t) return;
      S.hero.journal.unshift({ d: new Date().toLocaleDateString("ru-RU"), t: t });
      saveHero(); render();
    });
    L.$$("[data-jd]").forEach(function (b) {
      b.addEventListener("click", function () { S.hero.journal.splice(+b.getAttribute("data-jd"), 1); saveHero(); render(); });
    });
  } else {
    L.$("#nadd").addEventListener("click", function () {
      const title = L.$("#ntitle").value.trim(); const text = L.$("#ntext").value.trim();
      if (!title && !text) return;
      S.notes.unshift({ id: L.uid(), title: title || "Заметка", text: text, tag: L.$("#ntag").value.trim() || "Заметка", t: Date.now() });
      saveNotes(); render();
    });
    L.$$("[data-nid]").forEach(function (c) {
      c.addEventListener("click", function () {
        const n = S.notes.find(function (x) { return x.id === c.getAttribute("data-nid"); });
        if (!n) return;
        openSheet('<div class="sb-title">' + L.esc(n.title) + '</div><p class="muted">' + L.esc(n.tag || "") + "</p><div class=\"pc-body\">" + L.fmtBody(n.text) + "</div>" +
          '<button class="btn ghost" id="ndel" type="button">Удалить</button>', function (r) {
            L.$("#ndel", r).addEventListener("click", function () { S.notes = S.notes.filter(function (x) { return x.id !== n.id; }); saveNotes(); closeSheet(); render(); });
          });
      });
    });
  }
  L.$$("[data-fk]").forEach(function (c) { c.addEventListener("click", function () { openFav(c.getAttribute("data-fk"), c.getAttribute("data-fid")); }); });
}

function rCombat() {
  const C = S.combat;
  return header("Бой", "раунд " + C.round + (C.list.length ? " · ход " + ((C.turn % C.list.length) + 1) : "")) +
    '<div class="search"><input id="q" placeholder="Добавить из бестиария…"></div><div id="ir"></div>' +
    '<div class="row"><input class="inp grow" id="cn" placeholder="Своё имя"><input class="inp" id="ci" type="number" placeholder="Иниц." style="max-width:90px"><button class="btn sm" id="cadd" type="button">＋</button></div>' +
    (C.list.length ? C.list.map(function (c, i) {
      return '<div class="card combatant' + (i === C.turn && C.list.length ? " on" : "") + '"><div class="grow"><div class="t">' + L.esc(c.n) + ' <span class="muted">иниц. ' + c.init + '</span></div><div class="m">КД ' + c.ac + " · хиты " + c.hp + "/" + c.maxhp + '</div></div>' +
        '<button class="btn sm" data-cd="' + c.id + '" type="button">−</button><button class="btn sm" data-ch="' + c.id + '" type="button">＋</button><button class="btn sm ghost" data-cx="' + c.id + '" type="button">✕</button></div>';
    }).join("") : '<div class="empty">Трекер пуст — добавь существ</div>') +
    '<div class="row" style="margin-top:12px"><button class="btn" id="cnext" type="button">Следующий ход</button><button class="btn ghost" id="creset" type="button">Новый бой</button></div>';
}

function addCombatant(m) {
  const init = L.rnd(20) + L.mod((m.st && m.st[1]) || 10);
  S.combat.list.push({ id: L.uid(), n: m.n, init: init, hp: m.hp || 10, maxhp: m.hp || 10, ac: m.ac || 10, mid: m.id });
  S.combat.list.sort(function (a, b) { return b.init - a.init; });
  saveCombat();
}

function bumpHp(id, dir) {
  openSheet('<div class="sb-title">' + (dir < 0 ? "Урон" : "Лечение") + '</div><input class="inp" id="hv" type="number" inputmode="numeric" placeholder="сколько"><button class="btn" id="hok" type="button" style="margin-top:10px">Применить</button>', function (r) {
    L.$("#hok", r).addEventListener("click", function () {
      const n = Math.abs(+L.$("#hv", r).value || 1);
      const c = S.combat.list.find(function (x) { return x.id === id; });
      if (c) c.hp = Math.max(0, Math.min(c.maxhp, c.hp + dir * n));
      saveCombat(); closeSheet(); render();
    });
  });
}

function fillMonSuggest() {
  const box = L.$("#ir"); if (!box) return;
  const q = S.q.toLowerCase();
  if (q.length < 2) { box.innerHTML = ""; return; }
  const hits = monsters().filter(function (m) { return String(m.n || "").toLowerCase().indexOf(q) >= 0; }).slice(0, 7);
  box.innerHTML = '<div class="card">' + hits.map(function (m) {
    return '<div class="row" data-addm="' + L.esc(m.id) + '" style="padding:8px 0"><div class="grow"><div class="t">' + L.esc(m.n) + '</div><div class="m">ОП ' + L.crTxt(m.cr) + "</div></div><b>＋</b></div>";
  }).join("") + "</div>";
  L.$$("[data-addm]", box).forEach(function (b) {
    b.addEventListener("click", function () { const m = monsters().find(function (x) { return x.id === b.getAttribute("data-addm"); }); if (m) { addCombatant(m); render(); } });
  });
}

function bCombat() {
  bindSearch(function () { fillMonSuggest(); });
  fillMonSuggest();
  L.$("#cadd").addEventListener("click", function () {
    const n = L.$("#cn").value.trim(); if (!n) return;
    addCombatant({ n: n, hp: 10, ac: 10, st: [10, 10, 10, 10, 10, 10] });
    const ci = L.$("#ci").value; if (ci) S.combat.list[S.combat.list.length - 1].init = +ci;
    S.combat.list.sort(function (a, b) { return b.init - a.init; });
    saveCombat(); render();
  });
  L.$$("[data-cd]").forEach(function (b) { b.addEventListener("click", function () { bumpHp(b.getAttribute("data-cd"), -1); }); });
  L.$$("[data-ch]").forEach(function (b) { b.addEventListener("click", function () { bumpHp(b.getAttribute("data-ch"), 1); }); });
  L.$$("[data-cx]").forEach(function (b) { b.addEventListener("click", function () { S.combat.list = S.combat.list.filter(function (x) { return x.id !== b.getAttribute("data-cx"); }); if (S.combat.turn >= S.combat.list.length) S.combat.turn = 0; saveCombat(); render(); }); });
  L.$("#cnext").addEventListener("click", function () {
    if (!S.combat.list.length) return;
    S.combat.turn = (S.combat.turn + 1) % S.combat.list.length;
    if (S.combat.turn === 0) S.combat.round += 1;
    saveCombat(); render(); L.haptic("medium");
  });
  L.$("#creset").addEventListener("click", function () { S.combat = { list: [], turn: 0, round: 1 }; saveCombat(); render(); });
}

function rDice() {
  const dice = [4, 6, 8, 10, 12, 20, 100];
  return header("Кубики", "судьба любит шум кости") +
    '<div class="wrap">' + dice.map(function (d) { return '<button class="btn sm" data-d="' + d + '" type="button">к' + d + "</button>"; }).join("") + "</div>" +
    '<div class="row" style="margin-top:12px"><input class="inp grow" id="df" placeholder="например 2к6+3"><button class="btn sm" id="dgo" type="button">Бросить</button></div>' +
    '<div id="dres" class="center" style="font:400 64px var(--title);margin:16px 0">—</div>' +
    "<h3>Атака и урон</h3><div class=\"row\"><input class=\"inp grow\" id=\"abon\" type=\"number\" placeholder=\"бонус атаки\"><input class=\"inp\" id=\"acdc\" type=\"number\" placeholder=\"КД\" style=\"max-width:90px\"><button class=\"btn sm\" id=\"aatk\" type=\"button\">Атака</button></div>" +
    '<div class="row" style="margin-top:8px"><input class="inp grow" id="admg" placeholder="урон, например 2к6+3"><button class="btn sm" id="adgo" type="button">Урон</button></div>' +
    "<h3>История</h3><div class=\"card\">" + (S.rolls.length ? S.rolls.map(function (r) {
      return '<div class="row" style="padding:6px 0"><span class="grow">' + L.esc(r.expr) + '</span><b>' + r.total + "</b></div>";
    }).join("") : '<div class="empty">Пока пусто</div>') + "</div>";
}

function bDice() {
  function show(res) {
    if (!res) { toast("Не понял формулу"); return; }
    L.$("#dres").textContent = res.total;
    S.rolls.unshift({ expr: res.expr + " → " + res.rolls.join("+") + (res.bonus ? (res.bonus > 0 ? "+" : "") + res.bonus : ""), total: res.total });
    saveRolls(); L.haptic("success");
    render();
  }
  L.$$("[data-d]").forEach(function (b) { b.addEventListener("click", function () { show(L.rollFormula("1d" + b.getAttribute("data-d"))); }); });
  L.$("#dgo").addEventListener("click", function () { show(L.rollFormula(L.$("#df").value || "1d20")); });
  const atk = L.$("#aatk");
  if (atk) atk.addEventListener("click", function () {
    const bonus = +L.$("#abon").value || 0;
    const ac = +L.$("#acdc").value || 0;
    const d = L.rnd(20);
    const total = d + bonus;
    const hit = !ac || total >= ac || d === 20;
    const label = "атака " + (d === 20 ? "крит" : d === 1 ? "провал" : hit ? "попадание" : "мимо") + (ac ? " против КД " + ac : "");
    show({ expr: label, rolls: [d], bonus: bonus, total: total });
  });
  const dmg = L.$("#adgo");
  if (dmg) dmg.addEventListener("click", function () {
    show(L.rollFormula(L.$("#admg").value || "1d8"));
  });
}

function rCampaigns() {
  const list = campaigns();
  return header("Кампании", "готовые истории на несколько вечеров") +
    (list.length ? list.map(function (c, i) {
      return '<div class="card" data-cp="' + i + '"><div class="grow"><div class="t">' + L.esc(c.n) + '</div><div class="m">Уровни ' + L.esc(c.lvl || "") + " · " + L.esc(c.sess || "") + " · глав: " + ((c.chapters || []).length) + "</div></div></div>";
    }).join("") : '<div class="empty">Кампаний нет</div>');
}

function bCampaigns() {
  L.$$("[data-cp]").forEach(function (c) { c.addEventListener("click", function () { campSheet(+c.getAttribute("data-cp")); }); });
}

function campSheet(i, chapter) {
  const c = campaigns()[i]; if (!c) return;
  if (chapter == null) {
    openSheet('<div class="sb-title">' + L.esc(c.n) + '</div><p class="muted">Уровни ' + L.esc(c.lvl || "") + " · " + L.esc(c.sess || "") + "</p>" +
      block("Завязка", c.premise) +
      (c.hooks && c.hooks.length ? "<h3>Как вовлечь</h3><ul>" + c.hooks.map(function (h) { return "<li>" + L.esc(h) + "</li>"; }).join("") + "</ul>" : "") +
      (c.npcs && c.npcs.length ? "<h3>Персонажи</h3>" + c.npcs.map(function (n) { return "<p><b>" + L.esc(n.n) + "</b> — " + L.esc(n.role || "") + "<br>" + L.esc(n.d || "") + "</p>"; }).join("") : "") +
      (c.tips && c.tips.length ? "<h3>Советы</h3><ul>" + c.tips.map(function (h) { return "<li>" + L.esc(h) + "</li>"; }).join("") + "</ul>" : "") +
      block("Финал (только Мастеру)", c.finale) +
      "<h3>Главы</h3>" + (c.chapters || []).map(function (h, k) {
        return '<div class="card" data-ch="' + k + '"><div class="t">' + (k + 1) + ". " + L.esc(h.n) + '</div><div class="m">' + L.esc(h.goal || "") + "</div></div>";
      }).join(""), function (r) {
        L.$$("[data-ch]", r).forEach(function (b) { b.addEventListener("click", function () { campSheet(i, +b.getAttribute("data-ch")); }); });
      });
    return;
  }
  const h = (c.chapters || [])[chapter]; if (!h) return;
  openSheet('<div class="sb-title">' + (chapter + 1) + ". " + L.esc(h.n) + '</div><p class="muted">' + L.esc(c.n) + "</p>" +
    block("Цель", h.goal) + '<div class="pc-body">' + L.fmtBody(h.sum) + "</div>" +
    (h.scenes && h.scenes.length ? "<h3>Сцены</h3><ol>" + h.scenes.map(function (s) { return "<li><b>" + L.esc(s.n) + ".</b> " + L.esc(s.t) + "</li>"; }).join("") + "</ol>" : "") +
    (h.locs && h.locs.length ? "<h3>Места</h3>" + h.locs.map(function (l) { return '<div class="card"><div class="t">' + L.esc(l.n) + '</div><div class="m">' + L.esc(l.d || "") + "</div></div>"; }).join("") : "") +
    (h.enc && h.enc.length ? "<h3>Встречи</h3>" + h.enc.map(function (en) { return '<div class="card"><div class="t">' + L.esc(en.n) + '</div><div class="m">' + L.esc(en.tac || "") + "</div></div>"; }).join("") : "") +
    block("Награда", h.loot) + (h.tip ? '<p class="muted">' + L.esc(h.tip) + "</p>" : "") +
    '<button class="btn ghost" id="backc" type="button">К кампании</button>', function (r) {
      L.$("#backc", r).addEventListener("click", function () { campSheet(i); });
    });
}

function rRules() {
  const T = tables();
  const keys = Object.keys(T);
  const labels = { enc: "Столкновения", quest: "Квесты", tavern: "Таверны", rumor: "Слухи", oneshot: "Ваншоты", weather: "Погода", city: "Город", wild: "Глушь", trap2: "Ловушки", puzzle: "Головоломки", riddle2: "Загадки", loot1: "Добыча 1", loot2: "Добыча 2", loot3: "Добыча 3", loot4: "Добыча 4", villain: "Злодеи", reaction: "Реакции", complication: "Осложнения", travel: "Путешествия", chase: "Погони" };
  return header("Ширма", "правила стола, таблицы и завязки") +
    '<div class="search"><input id="scrq" placeholder="Найти правило: укрытие, ход, зелье…"></div>' +
    '<div id="scr"></div>' +
    "<h3>Генераторы</h3><div class=\"wrap\">" + keys.map(function (k) {
      return '<button class="btn sm" data-tb="' + L.esc(k) + '" type="button">' + L.esc(labels[k] || k) + "</button>";
    }).join("") + '</div><div id="tb"></div>';
}

async function loadScreen() {
  if (S.screen) return S.screen;
  try { S.screen = await L.fetchJSON("content/public/screen.json"); }
  catch (err) { S.screen = []; }
  return S.screen;
}

function fillScreen() {
  const box = L.$("#scr");
  if (!box) return;
  const q = L.$("#scrq") ? L.$("#scrq").value : "";
  const cards = F.filterScreen(S.screen || [], q);
  box.innerHTML = cards.map(function (c) {
    return '<div class="card scr-card" data-scr="' + L.esc(c.id) + '"><div class="t">' + L.esc(c.n) + "</div></div>";
  }).join("") || '<div class="empty">Ничего не нашлось</div>';
  L.$$("[data-scr]", box).forEach(function (el) {
    el.addEventListener("click", function () {
      const c = (S.screen || []).find(function (x) { return x.id === el.getAttribute("data-scr"); });
      if (c) openScreen(c);
    });
  });
}

function openScreen(c) {
  openSheet('<div class="sb-title">' + L.esc(c.n) + '</div><div class="body">' + (c.html || "") + "</div>", function (r) {
    const btn = r.querySelector("[data-scr-names]");
    if (!btn) return;
    function showNames() {
      const dest = r.querySelector("#scrNames") || btn.previousElementSibling;
      if (dest) dest.innerHTML = F.randomNames(tables()).map(function (n) { return "<div>" + L.esc(n) + "</div>"; }).join("");
    }
    btn.addEventListener("click", showNames);
    showNames();
  });
}

async function bRules(seq) {
  await loadScreen();
  if (seq && seq !== renderSeq) return;
  fillScreen();
  const inp = L.$("#scrq");
  if (inp) inp.addEventListener("input", L.debounce(fillScreen, 180));
  L.$$("[data-tb]").forEach(function (b) { b.addEventListener("click", function () { showTable(b.getAttribute("data-tb")); }); });
}

function pick(arr) { return arr[L.rnd(arr.length) - 1]; }

function showTable(key) {
  const T = tables();
  const val = T[key];
  const box = L.$("#tb");
  if (!val || !box) return;
  if (key === "enc" && val && typeof val === "object" && !Array.isArray(val)) {
    const biomes = Object.keys(val);
    box.innerHTML = '<h3>Столкновения</h3><div class="wrap">' + biomes.map(function (b) { return '<button class="btn sm" data-bio="' + L.esc(b) + '" type="button">' + L.esc(b) + "</button>"; }).join("") + '</div><div id="encout"></div>';
    L.$$("[data-bio]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        const rows = val[b.getAttribute("data-bio")] || [];
        const row = pick(rows);
        L.$("#encout").innerHTML = '<div class="card"><div class="t">' + L.esc(b.getAttribute("data-bio")) + '</div><div class="pc-body"><p>' + L.esc(Array.isArray(row) ? row[1] : row) + "</p></div></div>";
      });
    });
    return;
  }
  if (key === "quest") {
    const text = pick(val.giver) + " просит " + pick(val.task) + " " + pick(val.where) + ". Поворот: " + pick(val.twist) + ". Награда: " + pick(val.reward) + ".";
    box.innerHTML = '<div class="card"><div class="t">Завязка</div><p>' + L.esc(text) + '</p><button class="btn sm" id="reroll" type="button">Ещё</button></div>';
    L.$("#reroll", box).addEventListener("click", function () { showTable(key); });
    return;
  }
  if (key === "tavern") {
    const name = "«" + pick(val.a) + " " + pick(val.b) + "»";
    box.innerHTML = '<div class="card"><div class="t">' + L.esc(name) + "</div><p>Хозяин: " + L.esc(pick(val.owner)) + "</p><p>" + L.esc(pick(val.feature)) + '</p><button class="btn sm" id="reroll" type="button">Ещё</button></div>';
    L.$("#reroll", box).addEventListener("click", function () { showTable(key); });
    return;
  }
  if (Array.isArray(val)) {
    const item = pick(val);
    if (item && item.n) {
      box.innerHTML = '<div class="card"><div class="t">' + L.esc(item.n) + '</div><div class="m">' + L.esc(item.lvl || item.d || "") + '</div><div class="pc-body">' + L.fmtBody(item.hook || item.t || item.d || "") + '</div><button class="btn sm" id="reroll" type="button">Ещё</button></div>';
    } else {
      const text = Array.isArray(item) ? item[0] : item;
      box.innerHTML = '<div class="card"><p>' + L.esc(typeof text === "string" ? text : JSON.stringify(item)) + '</p><button class="btn sm" id="reroll" type="button">Ещё</button></div>';
    }
    const again = L.$("#reroll", box); if (again) again.addEventListener("click", function () { showTable(key); });
    return;
  }
  box.innerHTML = '<div class="card"><p class="muted">Таблица открыта. Выбери другой раздел или спроси Духа книги.</p></div>';
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars.charAt(L.rnd(chars.length) - 1);
  return s;
}

function rSession() {
  const name = L.userFirstName();
  return header("Сессия", name ? name + ", стол ждёт твоей руки" : "комната, герои и дух книги") +
    '<div class="card"><div class="t">Код комнаты</div><p class="muted">Игроки входят в книгу по коду. Новый код нужно передать боту — тогда он появится в общем списке.</p>' +
    (S.pendingRoom ? '<div class="center" style="font:400 36px var(--title);letter-spacing:.2em;margin:10px 0">' + L.esc(S.pendingRoom) + "</div>" : "") +
    '<button class="btn" id="mkroom" type="button">Создать код</button>' +
    (S.pendingRoom ? '<button class="btn ghost" id="sendroom" type="button">Передать код боту</button>' : "") +
    "</div>" +
    '<div class="card"><div class="t">Герои за столом</div>' +
    (S.party.length ? S.party.map(function (p) {
      return '<div class="row" style="padding:8px 0"><div class="grow"><div class="t">' + L.esc(p.name) + '</div><div class="m">' + L.esc(p.cls || "") + " · хиты " + p.hp + "/" + p.maxhp + " · КД " + p.ac + "</div></div>" +
        '<button class="btn sm ghost" data-px="' + p.id + '" type="button">✕</button></div>';
    }).join("") : '<p class="muted">Пока никого. Добавь героев, чтобы видеть их на сессии.</p>') +
    '<button class="btn ghost" id="padd" type="button">Добавить героя</button></div>' +
    '<div class="card"><div class="t">Дух книги</div><p class="muted">Спроси совет, попроси найти правило или править гримуар. Ответ придёт и в книгу, и сообщением от бота.</p><button class="btn ghost" id="ospirit" type="button">Открыть Духа</button></div>' +
    sessExtrasHtml();
}

function sessExtrasHtml() {
  const X = S.sess || F.freshSess();
  const left = X.timerEnd ? Math.max(0, Math.ceil((X.timerEnd - Date.now()) / 1000)) : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const kinds = F.shopTypes();
  return '<div class="card" id="clock"><div class="t">Календарь стола</div>' +
    '<div class="center" style="font:400 32px var(--title);margin:8px 0">День ' + X.day + " · " + F.hhmm(X.min) + "</div>" +
    '<div class="row"><button class="btn sm" data-tick="10" type="button">+10 мин</button><button class="btn sm" data-tick="60" type="button">+1 час</button><button class="btn sm" data-tick="day" type="button">+день</button></div></div>' +
    '<div class="card"><div class="t">Погода</div><p>' + L.esc(X.weather || "Ясно") + " — " + L.esc(X.weatherNote || "") + '</p><button class="btn ghost" id="wroll" type="button">Новая погода</button></div>' +
    '<div class="card"><div class="t">Таймер</div><div class="center" style="font:400 28px var(--title)">' + (left ? mm + ":" + ss : "—") + "</div>" +
    '<div class="row"><button class="btn sm" data-tm="60" type="button">1 мин</button><button class="btn sm" data-tm="300" type="button">5 мин</button><button class="btn sm" data-tm="600" type="button">10 мин</button><button class="btn sm ghost" id="tmstop" type="button">Стоп</button></div></div>' +
    '<div class="card"><div class="t">Квесты</div>' +
    ((X.quests || []).length ? X.quests.map(function (q, i) {
      return '<div class="row" style="padding:6px 0"><span class="grow' + (q.done ? " muted" : "") + '">' + (q.done ? "✓ " : "○ ") + L.esc(q.t) + '</span><button class="btn sm" data-qd="' + i + '" type="button">✓</button></div>';
    }).join("") : '<p class="muted">Пока нет активных квестов.</p>') +
    '<div class="row"><input class="inp grow" id="qt" placeholder="Новый квест"><button class="btn sm" id="qadd" type="button">＋</button></div></div>' +
    '<div class="card"><div class="t">Журнал сессии</div>' +
    ((X.log || []).length ? X.log.slice(0, 12).map(function (line) {
      return '<div class="m">' + L.esc(line) + "</div>";
    }).join("") : '<p class="muted">Записывай ходы, чтобы не забыть.</p>') +
    '<div class="row"><input class="inp grow" id="lg" placeholder="Что произошло?"><button class="btn sm" id="ladd" type="button">＋</button></div></div>' +
    '<div class="card"><div class="t">Лавки</div><p class="muted">Собери витрину по типу лавки — ассортимент из справочника предметов.</p>' +
    '<div class="wrap">' + kinds.map(function (s) {
      return '<button class="btn sm" data-shop="' + s[0] + '" type="button">' + L.esc(s[1]) + "</button>";
    }).join("") + "</div>" +
    (S.shop && S.shop.items ? "<h3>" + L.esc((kinds.find(function (s) { return s[0] === S.shop.kind; }) || [,"Лавка"])[1]) + "</h3>" + S.shop.items.map(function (it) {
      return '<div class="row" style="padding:6px 0"><span class="grow">' + L.esc(it.n) + '</span><b>' + L.esc(it.cost || it.p || "") + "</b></div>";
    }).join("") : "") + "</div>" +
    '<div class="card"><div class="t">Резервная копия стола</div><p class="muted">Сохраняет героев, квесты, журнал и бой на этом устройстве. Тайны гримуара в файл не попадают.</p>' +
    '<div class="row"><button class="btn ghost" id="bkout" type="button">Скачать</button><button class="btn ghost" id="bkin" type="button">Восстановить</button></div></div>';
}

function bSession() {
  L.$("#mkroom").addEventListener("click", function () {
    S.pendingRoom = genCode();
    store.set("pendingRoom", S.pendingRoom);
    render();
    toast("Код создан. Передай его боту, чтобы игроки смогли войти.");
  });
  const send = L.$("#sendroom");
  if (send) send.addEventListener("click", function () {
    const how = L.sendToBot({ v: 1, type: "room", action: "create", code: S.pendingRoom, mode: "master" });
    toast(how === "sent" ? "Код ушёл боту" : "Код скопирован — вставь его боту в чат");
  });
  L.$("#padd").addEventListener("click", function () {
    openSheet('<div class="sb-title">Герой стола</div><input class="inp" id="pn" placeholder="Имя"><input class="inp" id="pc" placeholder="Класс" style="margin-top:8px">' +
      '<div class="row" style="margin-top:8px">' + field("php", "Хиты", 10) + field("pac", "КД", 14) + "</div>" +
      '<button class="btn" id="pok" type="button" style="margin-top:10px">Добавить</button>', function (r) {
        L.$("#pok", r).addEventListener("click", function () {
          S.party.push({ id: L.uid(), name: L.$("#pn", r).value || "Герой", cls: L.$("#pc", r).value || "", hp: +L.$("#php", r).value || 10, maxhp: +L.$("#php", r).value || 10, ac: +L.$("#pac", r).value || 14 });
          saveParty(); closeSheet(); render();
        });
      });
  });
  L.$$("[data-px]").forEach(function (b) { b.addEventListener("click", function () { S.party = S.party.filter(function (p) { return p.id !== b.getAttribute("data-px"); }); saveParty(); render(); }); });
  L.$("#ospirit").addEventListener("click", function () { go("spirit"); });
  if (!S.sess) S.sess = F.freshSess();
  L.$$("[data-tick]").forEach(function (b) {
    b.addEventListener("click", function () {
      const v = b.getAttribute("data-tick");
      if (v === "day") { S.sess.day += 1; S.sess.min = 8 * 60; }
      else S.sess.min += +v;
      while (S.sess.min >= 1440) { S.sess.min -= 1440; S.sess.day += 1; }
      sessionLog("Время: день " + S.sess.day + " " + F.hhmm(S.sess.min));
      saveSess(); render();
    });
  });
  const wroll = L.$("#wroll");
  if (wroll) wroll.addEventListener("click", function () {
    const w = F.pickWeather();
    S.sess.weather = w[1];
    S.sess.weatherNote = w[2];
    sessionLog("Погода: " + w[1]);
    saveSess(); render();
  });
  L.$$("[data-tm]").forEach(function (b) {
    b.addEventListener("click", function () {
      S.sess.timerEnd = Date.now() + (+b.getAttribute("data-tm") * 1000);
      saveSess(); render();
    });
  });
  const tmstop = L.$("#tmstop");
  if (tmstop) tmstop.addEventListener("click", function () { S.sess.timerEnd = 0; saveSess(); render(); });
  const qadd = L.$("#qadd");
  if (qadd) qadd.addEventListener("click", function () {
    const text = (L.$("#qt").value || "").trim();
    if (!text) return;
    S.sess.quests = S.sess.quests || [];
    S.sess.quests.push({ t: text, done: false });
    saveSess(); render();
  });
  L.$$("[data-qd]").forEach(function (b) {
    b.addEventListener("click", function () {
      const q = S.sess.quests[+b.getAttribute("data-qd")];
      if (q) q.done = !q.done;
      saveSess(); render();
    });
  });
  const ladd = L.$("#ladd");
  if (ladd) ladd.addEventListener("click", function () {
    const text = (L.$("#lg").value || "").trim();
    if (!text) return;
    sessionLog(text);
    saveSess(); render();
  });
  L.$$("[data-shop]").forEach(function (b) {
    b.addEventListener("click", async function () {
      await loadItems();
      S.shop = { kind: b.getAttribute("data-shop"), items: F.stockShop(b.getAttribute("data-shop"), S.items || []) };
      render();
    });
  });
  const bkout = L.$("#bkout");
  if (bkout) bkout.addEventListener("click", function () {
    const data = {
      v: 1, party: S.party, notes: S.notes, combat: S.combat, sess: S.sess, handouts: S.handouts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dnd-session.json";
    a.click();
    toast("Копия стола скачана");
  });
  const bkin = L.$("#bkin");
  if (bkin) bkin.addEventListener("click", function () {
    openSheet('<div class="sb-title">Восстановить стол</div><textarea class="inp" id="bktxt" placeholder="Вставь JSON копии"></textarea><button class="btn" id="bkok" type="button" style="margin-top:10px">Загрузить</button>', function (r) {
      L.$("#bkok", r).addEventListener("click", function () {
        try {
          const data = JSON.parse(L.$("#bktxt", r).value);
          if (data.party) S.party = data.party;
          if (data.notes) S.notes = data.notes;
          if (data.combat) S.combat = data.combat;
          if (data.sess) S.sess = data.sess;
          if (data.handouts) S.handouts = data.handouts;
          saveParty(); saveNotes(); saveCombat(); saveSess(); saveHandouts();
          closeSheet(); render(); toast("Стол восстановлен");
        } catch (err) { toast("Не удалось прочитать копию"); }
      });
    });
  });
}

function sessionLog(line) {
  if (!S.sess) S.sess = F.freshSess();
  S.sess.log = S.sess.log || [];
  S.sess.log.unshift(F.hhmm(S.sess.min) + " · " + line);
  S.sess.log = S.sess.log.slice(0, 40);
}

function thinkingHtml() {
  return '<div class="bubble bot thinking" data-thinking="1">дух думает<span class="dots"><i></i><i></i><i></i></span></div>';
}

function rSpirit() {
  const pending = S.pending || [];
  let bubbles = (S.spirit || []).map(function (m) {
    if (m.thinking) return thinkingHtml();
    return '<div class="bubble ' + (m.me ? "me" : "bot") + '">' + L.esc(m.t) + "</div>";
  }).join("");
  pending.forEach(function (p) {
    const shown = (S.spirit || []).some(function (m) { return m.thinking && m.id === p.id; });
    if (!shown) bubbles += thinkingHtml();
  });
  if (!bubbles) {
    bubbles = '<div class="bubble bot">Я дух этих страниц. Спроси о правиле, существе, сцене или правке книги. Ответ появится здесь и продублируется в чат с ботом.</div>';
  }
  return header("Дух книги", "шёпот с полей гримуара") +
    '<div class="spirit-log">' + bubbles + "</div>" +
    '<textarea class="inp" id="sq" placeholder="' + (MODE === "master" ? "Спросить или попросить правку…" : "Спросить духа как игрока…") + '"></textarea>' +
    '<button class="btn" id="sask" type="button">Спросить духа</button>' +
    '<p class="muted">Вопрос уходит боту @Nezich_dnd_bot. Если книга открыта из меню, а не с кнопки клавиатуры, вопрос копируется и открывается чат с глубокой ссылкой — вставь его следующим сообщением.</p>';
}

function onSpiritAnswer(p, text) {
  const t = String(text || "").trim();
  if (!t || !p) return;
  S.spirit = (S.spirit || []).filter(function (m) { return !(m.thinking && m.id === p.id); });
  S.spirit.push({ me: false, t: t, id: p.id });
  S.pending = (S.pending || []).filter(function (x) { return x.id !== p.id; });
  saveSpirit();
  savePending();
  if (S.sec === "spirit") render();
  else toast("Дух ответил на страницах");
  L.haptic("success");
}

function onSpiritTimeout(p) {
  S.spirit = (S.spirit || []).filter(function (m) { return !(m.thinking && m.id === p.id); });
  S.spirit.push({ me: false, t: "Дух молчит слишком долго. Спроси ещё раз.", id: p && p.id, timeout: true });
  S.pending = (S.pending || []).filter(function (x) { return x.id !== p.id; });
  saveSpirit();
  savePending();
  if (S.sec === "spirit") render();
}

function ensureSpiritWatch() {
  Spirit.startWatch({
    getPending: function () { return S.pending || []; },
    onAnswer: onSpiritAnswer,
    onTimeout: onSpiritTimeout
  });
}

function bSpirit() {
  function send() {
    const q = L.$("#sq").value.trim();
    if (!q) return;
    const req = Spirit.generateRequest();
    const rec = { id: req.id, key: req.key, q: q, ts: Date.now(), mode: MODE };
    S.pending = (S.pending || []).concat([rec]);
    savePending();
    S.spirit.push({ me: true, t: q, id: req.id });
    S.spirit.push({ me: false, t: "дух думает", thinking: true, id: req.id });
    saveSpirit();
    const payload = {
      v: 1, type: "spirit", mode: MODE, name: L.userFirstName() || "",
      q: q, path: S.sec, id: req.id, key: req.key
    };
    const start = Spirit.startParam(req.id, req.key);
    L.sendToBot(payload, { start: start, clipboard: q });
    L.$("#sq").value = "";
    render();
    ensureSpiritWatch();
    L.haptic("success");
  }
  L.$("#sask").addEventListener("click", send);
  L.setMainButton("Спросить духа", send);
}

function rTable() {
  return header("Стол", "раздатки и записки — живой стол теперь в Telegram") +
    '<div class="card"><p class="muted">Живая карта с туманом войны, жетонами и WebRTC больше не в книге: она ломала iPhone внутри Telegram. Стол теперь — этот чат и эти страницы.</p></div>' +
    '<div class="row"><input class="inp grow" id="ht" placeholder="Заголовок раздатки"></div>' +
    '<textarea class="inp" id="hb" placeholder="Текст на пергаменте…"></textarea>' +
    '<button class="btn" id="hadd" type="button">Сохранить раздатку</button>' +
    ((S.handouts || []).length ? S.handouts.map(function (h) {
      return '<div class="card" data-hid="' + h.id + '"><div class="t">' + L.esc(h.n) + '</div><div class="m">' + L.esc((h.t || "").slice(0, 160)) + "</div></div>";
    }).join("") : '<div class="empty">Раздаток пока нет</div>');
}

function bTable() {
  const add = L.$("#hadd");
  if (add) add.addEventListener("click", function () {
    const n = (L.$("#ht").value || "").trim();
    const body = (L.$("#hb").value || "").trim();
    if (!n && !body) return;
    S.handouts.unshift({ id: L.uid(), n: n || "Раздатка", t: body, ts: Date.now() });
    saveHandouts(); render();
  });
  L.$$("[data-hid]").forEach(function (c) {
    c.addEventListener("click", function () {
      const h = S.handouts.find(function (x) { return x.id === c.getAttribute("data-hid"); });
      if (!h) return;
      openSheet('<div class="sb-title">' + L.esc(h.n) + '</div><div class="pc-body">' + L.fmtBody(h.t) + "</div>" +
        '<button class="btn ghost" id="hdel" type="button">Удалить</button>', function (r) {
          L.$("#hdel", r).addEventListener("click", function () {
            S.handouts = S.handouts.filter(function (x) { return x.id !== h.id; });
            saveHandouts(); closeSheet(); render();
          });
        });
    });
  });
}

function rSettingsSheet() {
  openSheet('<div class="sb-title">Настройки</div>' +
    '<p class="muted">Книга хранит лист, заметки и избранное в памяти Telegram и на этом устройстве.</p>' +
    '<button class="btn ghost" id="sclr" type="button">Очистить локальные данные</button>' +
    (MODE === "player" ? '<button class="btn ghost" id="sroom" type="button">Сменить код комнаты</button>' : '<button class="btn ghost" id="slock" type="button">Закрыть книгу Мастера</button>') +
    '<button class="btn ghost" id="shome" type="button">На главную</button>' +
    '<p class="muted" style="margin-top:16px">@Nezich_dnd_bot · Книга Мастера и Книга Игрока</p>', function (r) {
      L.$("#sclr", r).addEventListener("click", function () {
        ["hero", "notes", "favs", "recent", "combat", "party", "rolls", "spirit", "pending", "sess", "handouts"].forEach(function (k) {
          try { localStorage.removeItem((MODE === "master" ? "dndm." : "dndp.") + k); } catch (err) {}
        });
        toast("Локальные данные очищены");
        location.reload();
      });
      const room = L.$("#sroom", r);
      if (room) room.addEventListener("click", function () { try { sessionStorage.removeItem("dnd_room_ok"); } catch (err) {} location.reload(); });
      const lock = L.$("#slock", r);
      if (lock) lock.addEventListener("click", function () { location.reload(); });
      L.$("#shome", r).addEventListener("click", function () { location.href = L.joinUrl(L.rootUrl(), "index.html"); });
    });
}

let renderSeq = 0;

async function render() {
  const seq = ++renderSeq;
  const page = pageEl();
  if (!page) return;
  L.setMainButton("", null);
  setNav();
  updateBack();
  const map = {
    hero: [rHero, bHero],
    bag: [rBag, bBag],
    spells: [rSpells, bSpells],
    items: [rItems, bItems],
    maps: [rMaps, bMaps],
    notes: [rNotes, bNotes],
    table: [rTable, bTable],
    spirit: [rSpirit, bSpirit],
    session: [rSession, bSession],
    bestiary: [rBestiary, bBestiary],
    chars: [rChars, bChars],
    combat: [rCombat, bCombat],
    dice: [rDice, bDice],
    campaigns: [rCampaigns, bCampaigns],
    rules: [rRules, bRules]
  };
  const pair = map[S.sec] || map.hero;
  const html = pair[0]();
  if (seq !== renderSeq) return;
  page.innerHTML = html;
  await pair[1](seq);
}

function shellHtml() {
  return '<div id="page" class="page"></div><nav id="nav" class="nav"></nav>' +
    '<button type="button" class="fab" id="fab" aria-label="Дух книги">👁</button><div id="toast" class="toast"></div>';
}

function showGate(kind) {
  const app = L.$("#app");
  const isMaster = kind === "master";
  app.innerHTML = '<div class="gate"><div class="sigil">' + (isMaster ? "M" : "И") + "</div>" +
    '<p class="kicker">' + (isMaster ? "Книга Мастера" : "Книга Игрока") + "</p>" +
    "<h1 class=\"ttl\">" + (isMaster ? "Печать" : "Код комнаты") + "</h1>" +
    '<p class="sub">' + (isMaster ? "Введи пароль гримуара, чтобы снять печать." : "Введи код, который дал Мастер.") + "</p>" +
    '<input class="inp code" id="gate" autocomplete="off" spellcheck="false" placeholder="' + (isMaster ? "пароль" : "КОД КОМНАТЫ") + '"' + (isMaster ? ' type="password"' : "") + ">" +
    '<button class="btn" id="gok" type="button">' + (isMaster ? "Снять печать" : "Войти") + "</button>" +
    '<p class="err" id="gerr" hidden></p>' +
    '<button class="btn ghost" id="gback" type="button">На главную</button></div>';
  const err = L.$("#gerr");
  function fail(msg) { err.hidden = false; err.textContent = msg; L.haptic("error"); }
  async function submit() {
    const val = L.$("#gate").value;
    if (isMaster) {
      if (!val) { fail("Введи пароль"); return; }
      L.$("#gok").textContent = "Печать спадает…";
      try {
        const vaultFile = await L.fetchJSON("vault/master.enc.json");
        S.vault = await L.decryptVault(val, vaultFile);
        L.haptic("success");
        await enterBook();
      } catch (e) {
        L.$("#gok").textContent = "Снять печать";
        fail("Неверный пароль или книга не открылась.");
      }
      return;
    }
    if (!val) { fail("Введи код комнаты"); return; }
    try {
      const rooms = S.rooms || await L.fetchJSON("rooms.json");
      S.rooms = rooms;
      const hex = await L.hashCode(val);
      const ok = (rooms.rooms || []).some(function (r) { return r.hash === hex && r.open !== false; });
      if (!ok) { fail("Неверный код комнаты"); return; }
      try { sessionStorage.setItem("dnd_room_ok", hex); } catch (e) {}
      L.haptic("success");
      await enterBook();
    } catch (e) {
      fail("Не удалось проверить код. Попробуй ещё раз.");
    }
  }
  L.$("#gok").addEventListener("click", submit);
  L.$("#gate").addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  L.$("#gback").addEventListener("click", function () { location.href = L.joinUrl(L.rootUrl(), "index.html"); });
  L.setMainButton(isMaster ? "Снять печать" : "Войти", submit);
  L.setBackButton(function () { location.href = L.joinUrl(L.rootUrl(), "index.html"); });
}

async function enterBook() {
  L.$("#app").innerHTML = shellHtml();
  L.$("#fab").addEventListener("click", function () { go("spirit"); });
  L.setSettingsButton(rSettingsSheet);
  S.hero = await store.hydrate("hero", freshHero());
  if (!S.hero || !S.hero.st) S.hero = freshHero();
  S.notes = await store.hydrate("notes", []);
  S.favs = await store.hydrate("favs", []);
  S.recent = await store.hydrate("recent", []);
  S.combat = await store.hydrate("combat", { list: [], turn: 0, round: 1 });
  S.party = await store.hydrate("party", []);
  S.rolls = await store.hydrate("rolls", []);
  S.spirit = await store.hydrate("spirit", []);
  S.pending = await store.hydrate("pending", []);
  if (!Array.isArray(S.pending)) S.pending = [];
  S.sess = await store.hydrate("sess", F.freshSess());
  if (!S.sess || typeof S.sess.day !== "number") S.sess = F.freshSess();
  S.handouts = await store.hydrate("handouts", []);
  if (!Array.isArray(S.handouts)) S.handouts = [];
  S.pendingRoom = store.get("pendingRoom", "");
  const saved = store.get("sec", S.sec);
  if (SECS.some(function (s) { return s[0] === saved; })) S.sec = saved;
  await L.loadSpellArtIndex();
  ensureSpiritWatch();
  await render();
}

export async function startBook() {
  L.initTelegram();
  document.documentElement.classList.add("dnd-mode-" + MODE);
  if (MODE === "master") {
    showGate("master");
    return;
  }
  let roomOk = false;
  try { roomOk = !!sessionStorage.getItem("dnd_room_ok"); } catch (e) {}
  if (!roomOk) { showGate("player"); return; }
  await enterBook();
}

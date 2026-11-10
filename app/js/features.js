/* Extra tools ported from the old Ширма Мастера / Книга Игрока. */
import * as L from "./lib.js";

const md = (v) => Math.floor(((Number(v) || 10) - 10) / 2);

export function classUses(hero) {
  const cls = hero.cls || "";
  const lvl = hero.lvl || 1;
  const cha = md((hero.st || [])[5] || 10);
  const rows = [];
  if (cls === "Воин") {
    rows.push(["Второе дыхание", 1, "short"]);
    if (lvl >= 2) rows.push(["Всплеск действий", lvl >= 17 ? 2 : 1, "short"]);
    if (lvl >= 9) rows.push(["Упорный", lvl >= 17 ? 3 : lvl >= 13 ? 2 : 1, "long"]);
  } else if (cls === "Варвар") {
    rows.push(["Ярость", lvl >= 17 ? 6 : lvl >= 12 ? 5 : lvl >= 6 ? 4 : lvl >= 3 ? 3 : 2, "long"]);
  } else if (cls === "Бард") {
    rows.push(["Вдохновение барда", Math.max(1, cha), lvl >= 5 ? "short" : "long"]);
  } else if (cls === "Жрец") {
    if (lvl >= 2) rows.push(["Божественный канал", lvl >= 18 ? 3 : lvl >= 6 ? 2 : 1, "short"]);
  } else if (cls === "Паладин") {
    rows.push(["Божественное чувство", 1 + Math.max(0, cha), "long"]);
    rows.push(["Наложение рук (хиты)", 5 * lvl, "long"]);
    if (lvl >= 3) rows.push(["Божественный канал", 1, "short"]);
  } else if (cls === "Монах") {
    if (lvl >= 2) rows.push(["Ки", lvl, "short"]);
  } else if (cls === "Чародей") {
    if (lvl >= 2) rows.push(["Очки чародейства", lvl, "long"]);
  } else if (cls === "Друид") {
    if (lvl >= 2) rows.push(["Дикий облик", 2, "short"]);
  } else if (cls === "Волшебник") {
    rows.push(["Магическое восстановление", 1, "long"]);
  } else if (cls === "Плут" && lvl >= 20) {
    rows.push(["Удача", 1, "short"]);
  }
  return rows;
}

export function syncUses(hero) {
  hero.uses = hero.uses || {};
  const seen = {};
  classUses(hero).forEach(function (row) {
    const k = "c:" + row[0];
    seen[k] = 1;
    if (!hero.uses[k]) hero.uses[k] = { n: row[0], max: row[1], used: 0, per: row[2] };
    else {
      hero.uses[k].max = row[1];
      hero.uses[k].per = row[2];
      hero.uses[k].used = Math.min(hero.uses[k].used, row[1]);
    }
  });
  Object.keys(hero.uses).forEach(function (k) {
    if (k.indexOf("c:") === 0 && !seen[k]) delete hero.uses[k];
  });
  return hero.uses;
}

export function restoreUses(hero, kind) {
  syncUses(hero);
  Object.keys(hero.uses).forEach(function (k) {
    const u = hero.uses[k];
    if (u.per === "short" || (kind === "long" && u.per === "long")) u.used = 0;
  });
}

const PER_LABEL = { short: "короткий отдых", long: "долгий отдых", day: "1/день" };

export function usesHtml(hero) {
  const U = syncUses(hero);
  const keys = Object.keys(U);
  if (!keys.length) return "";
  return "<h3>Умения и заряды</h3><div class=\"use-row\">" + keys.map(function (k) {
    const u = U[k];
    const left = Math.max(0, u.max - u.used);
    const pips = u.max <= 8
      ? Array.from({ length: u.max }, function (_, i) { return "<i class=\"" + (i < left ? "on" : "") + "\"></i>"; }).join("")
      : "<b>" + left + "/" + u.max + "</b>";
    return "<button type=\"button\" class=\"use-c" + (u.used >= u.max ? " out" : "") + "\" data-use=\"" + L.esc(k) + "\"><span>" + L.esc(u.n) + "</span><em>" + pips + "</em><small>" + L.esc(PER_LABEL[u.per] || "") + "</small></button>";
  }).join("") + "</div>";
}

export function exportHero(hero) {
  return "DND1:" + btoa(unescape(encodeURIComponent(JSON.stringify(hero))));
}

export function importHero(raw) {
  const v = String(raw || "").trim().replace(/^DND1:/, "").replace(/^KP1:/, "");
  const h = JSON.parse(decodeURIComponent(escape(atob(v))));
  if (!h || typeof h !== "object") throw new Error("bad hero");
  return h;
}

export const WEATHERS = [
  ["☀", "Ясно", "Без помех. Видимость отличная."],
  ["⛅", "Облачно", "Без помех. Ночью темнее обычного."],
  ["🌧", "Дождь", "Помеха на Внимательность. Костры гаснут, следы смываются."],
  ["⛈", "Гроза", "Помеха на Внимательность и дальнобойные атаки. Путь −50 %."],
  ["🌫", "Туман", "Видимость 20 м. Легко заблудиться: Выживание СЛ 15."],
  ["❄", "Снег", "Труднопроходимая местность. Путь −50 %. Следы видны лучше."],
  ["🌨", "Метель", "Видимость 10 м, сильный холод."],
  ["🌬", "Сильный ветер", "Помеха на дальнобойные атаки. Летящим труднее."],
  ["🔥", "Зной", "Каждый час без воды — спасбросок Телосложения СЛ 12."]
];

export function pickWeather() {
  return WEATHERS[L.rnd(WEATHERS.length) - 1];
}

export function freshSess() {
  return { day: 1, min: 8 * 60, weather: "Ясно", weatherNote: "Без помех. Видимость отличная.", timerEnd: 0, quests: [], log: [] };
}

export function hhmm(min) {
  const m = ((Number(min) || 0) % 1440 + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

export function shopTypes() {
  return [
    ["smith", "Кузница", /доспех|оружи|щит| кольчуг|кираса|латы/i],
    ["arms", "Оружейная", /меч|лук|топор|копь|арбалет|кинжал|булав|молот/i],
    ["alch", "Алхимик", /зелье|яд|кислот|масло|противоядие|алхим/i],
    ["magic", "Магическая лавка", /волшеб|жезл|посох|свиток|кольцо|амулет|плащ/i],
    ["inn", "Трактир", null],
    ["gen", "Товарная лавка", /верёвк|факел|рюкзак|паёк|набор|инструмент|мешок/i],
    ["temple", "Храм", /свят|лечение|символ|молитв|целител/i]
  ];
}

export const INN_MENU = [
  ["Кружка эля", "4 мм"], ["Бутылка вина", "2 зм"], ["Сытный ужин", "3 см"],
  ["Ночлег в общем зале", "5 мм"], ["Комната на ночь", "5 см"], ["Паёк в дорогу", "5 см"]
];

export function stockShop(kind, items) {
  if (kind === "inn") {
    return INN_MENU.map(function (row) { return { n: row[0], cost: row[1], cat: "Трактир" }; });
  }
  const spec = shopTypes().find(function (s) { return s[0] === kind; });
  const re = spec && spec[2];
  const pool = (items || []).filter(function (it) {
    if (!re) return it.cat === "Снаряжение" || it.cat === "Инструменты";
    return re.test((it.n || "") + " " + (it.cat || "") + " " + (it.sub || ""));
  });
  const out = [];
  const seen = {};
  let guard = 0;
  while (out.length < 10 && guard < 80 && pool.length) {
    guard += 1;
    const it = pool[L.rnd(pool.length) - 1];
    if (seen[it.id]) continue;
    seen[it.id] = 1;
    out.push(it);
  }
  return out;
}

export function filterScreen(cards, q) {
  const needle = String(q || "").toLowerCase().trim();
  if (!needle) return cards;
  return cards.filter(function (c) {
    return (c.n + " " + c.kw + " " + c.id).toLowerCase().indexOf(needle) >= 0;
  });
}

function pickName(item) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return String(item[0] || "");
  return String(item.n || item.name || item[0] || "");
}

export function randomNames(tbls) {
  const T = tbls || {};
  const sources = [
    ["Человек", T.nhum], ["Эльф", T.nelf], ["Дварф", T.ndwarf],
    ["Полурослик", T.nhalf], ["Орк", T.norc], ["Тифлинг", T.ntief]
  ];
  const out = [];
  sources.forEach(function (pair) {
    const arr = pair[1];
    if (!Array.isArray(arr) || !arr.length) return;
    const name = pickName(arr[L.rnd(arr.length) - 1]);
    if (name) out.push(pair[0] + ": " + name);
  });
  if (!out.length) out.push("Арин Вестов", "Мира Тенелист", "Торин Камнерук", "Лесса Искристая");
  return out;
}

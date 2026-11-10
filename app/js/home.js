import * as L from "./lib.js";

L.whenReady(function () { startHome(); });

async function startHome() {
  L.initTelegram();
  L.setSettingsButton(function () {
    L.showPopup({ title: "Днд", message: "Книга Мастера и Книга Игрока для стола в Telegram. Бот @Nezich_dnd_bot.", buttons: [{ type: "close" }] });
  });
  L.setBackButton(null);

  const name = L.userFirstName();
  const greet = L.$("[data-greet]");
  if (greet) greet.textContent = name ? ("Привет, " + name) : "Гримуар стола";

  const params = new URLSearchParams(location.search);
  if (params.get("mode") === "master") {
    location.href = "master/";
    return;
  }
  if (params.get("mode") === "player") {
    const input = L.$("#room-code");
    if (input) input.focus();
  }

  L.$("#btn-player").addEventListener("click", function () { enterPlayer(); });
  L.$("#room-code").addEventListener("keydown", function (e) { if (e.key === "Enter") enterPlayer(); });
  L.$("#btn-master").addEventListener("click", function () {
    L.haptic("select");
    location.href = "master/";
  });
}

async function enterPlayer() {
  const input = L.$("#room-code");
  const msg = L.$("#home-msg");
  const code = input ? input.value : "";
  function fail(text) {
    msg.hidden = false;
    msg.textContent = text;
    L.haptic("error");
  }
  if (!String(code || "").trim()) {
    fail("Введи код комнаты");
    return;
  }
  try {
    const rooms = await L.fetchJSON("rooms.json");
    const hex = await L.hashCode(code);
    const ok = (rooms.rooms || []).some(function (r) { return r.hash === hex && r.open !== false; });
    if (!ok) {
      fail("Неверный код комнаты");
      return;
    }
    try { sessionStorage.setItem("dnd_room_ok", hex); } catch (err) {}
    L.haptic("success");
    location.href = "player/";
  } catch (err) {
    fail("Не удалось проверить код. Попробуй ещё раз.");
  }
}

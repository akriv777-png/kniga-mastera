(function () {
  "use strict";

  var ui = null;
  var msgEl = document.getElementById("home-msg");

  function lookup(obj, path) {
    var keys = path.split(".");
    var value = obj;
    for (var i = 0; i < keys.length; i++) {
      if (value && typeof value === "object") value = value[keys[i]];
      else return null;
    }
    return typeof value === "string" ? value : null;
  }

  function applyUi(data) {
    ui = data || {};
    document.querySelectorAll("[data-k]").forEach(function (el) {
      var value = lookup(ui, el.getAttribute("data-k"));
      if (!value) return;
      if (el.tagName === "INPUT") el.placeholder = value;
      else el.textContent = value;
    });
  }

  function showMsg(text) {
    if (!msgEl) return;
    if (!text) {
      msgEl.hidden = true;
      msgEl.textContent = "";
      return;
    }
    msgEl.hidden = false;
    msgEl.textContent = text;
  }

  function playerHref() {
    return "player/";
  }

  function readApiFromFile() {
    return fetch("content/api.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : {}; })
      .then(function (data) {
        var url = data && data.auth_api;
        if (url && !DNDTg.apiUrl()) {
          try { sessionStorage.setItem("dnd_api", url); } catch (err) {}
        }
      })
      .catch(function () {});
  }

  function canCheckRoom() {
    return !!(window.DNDTg && DNDTg.isTelegram && DNDTg.apiUrl());
  }

  function enterPlayer(requireCode) {
    var input = document.getElementById("room-code");
    var code = input ? String(input.value || "").trim() : "";
    var api = DNDTg.apiUrl();
    showMsg("");

    if (canCheckRoom()) {
      if (!code) {
        showMsg(lookup(ui, "player.error_need_code") || "Введи код комнаты");
        return;
      }
      fetch(api + "/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: DNDTg.webApp.initData, code: code })
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.body && result.body.ok) {
            try { sessionStorage.setItem("dnd_room", code); } catch (err) {}
            location.href = playerHref();
            return;
          }
          showMsg(lookup(ui, "player.error_code") || "Неверный код комнаты");
        })
        .catch(function () {
          showMsg(lookup(ui, "player.error_network") || "Не удалось проверить код.");
        });
      return;
    }

    if (requireCode && !code && DNDTg.isTelegram) {
      showMsg(lookup(ui, "player.error_need_code") || "Введи код комнаты");
      return;
    }
    if (code) {
      try { sessionStorage.setItem("dnd_room", code); } catch (err) {}
    }
    location.href = playerHref();
  }

  function enterMaster() {
    showMsg("");
    var api = DNDTg.apiUrl();
    if (api) {
      location.href = api + "/master.html";
      return;
    }
    var host = location.hostname || "";
    if (host.endsWith("trycloudflare.com") || host === "127.0.0.1" || host === "localhost") {
      location.href = "master.html";
      return;
    }
    showMsg(lookup(ui, "master.need_telegram") || "Книга Мастера открывается через бота.");
  }

  function ready() {
    var ghost = document.getElementById("btn-player-open");
    if (ghost && canCheckRoom()) ghost.hidden = true;

    var params = new URLSearchParams(location.search);
    var mode = params.get("mode");
    if (mode === "master") enterMaster();
    if (mode === "player") {
      var playerCard = document.getElementById("card-player");
      if (playerCard) playerCard.scrollIntoView({ block: "start" });
      document.getElementById("room-code") && document.getElementById("room-code").focus();
    }
  }

  document.getElementById("btn-player").addEventListener("click", function () {
    enterPlayer(true);
  });
  document.getElementById("btn-player-open").addEventListener("click", function () {
    enterPlayer(false);
  });
  document.getElementById("btn-master").addEventListener("click", function () {
    enterMaster();
  });
  document.getElementById("room-code").addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") enterPlayer(true);
  });

  Promise.all([
    fetch("content/ui.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : {}; })
      .then(applyUi)
      .catch(function () { applyUi({}); }),
    readApiFromFile()
  ]).then(ready);
})();

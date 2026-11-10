(function (global) {
  "use strict";

  function webApp() {
    return (global.Telegram && Telegram.WebApp) || null;
  }

  function applyTheme(tg) {
    var p = (tg && tg.themeParams) || {};
    var root = document.documentElement;
    var map = {
      bg_color: ["--tg-theme-bg-color", "--bg", "--home-bg"],
      text_color: ["--tg-theme-text-color", "--tx", "--home-tx"],
      hint_color: ["--tg-theme-hint-color", "--tx2", "--tx3", "--home-muted"],
      link_color: ["--tg-theme-link-color"],
      button_color: ["--tg-theme-button-color", "--home-btn"],
      button_text_color: ["--tg-theme-button-text-color", "--home-btn-tx"],
      secondary_bg_color: ["--tg-theme-secondary-bg-color", "--bg2", "--card", "--home-card"],
      header_bg_color: ["--tg-theme-header-bg-color"],
      accent_text_color: ["--tg-theme-accent-text-color"],
      section_bg_color: ["--tg-theme-section-bg-color", "--card2"],
      subtitle_text_color: ["--tg-theme-subtitle-text-color"],
      destructive_text_color: ["--tg-theme-destructive-text-color"]
    };
    Object.keys(map).forEach(function (key) {
      if (!p[key]) return;
      map[key].forEach(function (cssVar) {
        root.style.setProperty(cssVar, p[key]);
      });
    });
    try {
      if (p.bg_color && tg.setBackgroundColor) tg.setBackgroundColor(p.bg_color);
      if (tg.setHeaderColor) {
        tg.setHeaderColor(p.header_bg_color || p.bg_color || "#120907");
      }
    } catch (err) {}
    if (p.bg_color) {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", p.bg_color);
    }
  }

  function applyViewport(tg) {
    if (!tg) return;
    var root = document.documentElement;
    if (tg.viewportHeight) {
      root.style.setProperty("--tg-viewport-height", tg.viewportHeight + "px");
    }
    if (tg.viewportStableHeight) {
      root.style.setProperty("--tg-viewport-stable-height", tg.viewportStableHeight + "px");
    }
    var h = tg.viewportStableHeight || tg.viewportHeight;
    if (h && document.body) document.body.style.minHeight = h + "px";
  }

  function apiUrl() {
    try {
      var params = new URLSearchParams(location.search);
      var q = params.get("api");
      if (q) {
        sessionStorage.setItem("dnd_api", q);
        return q.replace(/\/+$/, "");
      }
      var stored = sessionStorage.getItem("dnd_api");
      if (stored) return stored.replace(/\/+$/, "");
    } catch (err) {}
    if (global.DND_API_URL) return String(global.DND_API_URL).replace(/\/+$/, "");
    return "";
  }

  function bookMode() {
    if (global.DND_BOOK_MODE) return global.DND_BOOK_MODE;
    var path = location.pathname || "";
    if (/master\.html$/.test(path)) return "master";
    if (/\/player(\/|$)/.test(path)) return "player";
    return "home";
  }

  function launcherUrl() {
    return bookMode() === "player" ? "../" : "index.html";
  }

  function setupBack(tg) {
    if (!tg || !tg.BackButton) return;
    var mode = bookMode();
    try { tg.BackButton.offClick(); } catch (err) {}
    if (mode === "home") {
      tg.BackButton.hide();
      return;
    }
    tg.BackButton.show();
    tg.BackButton.onClick(function () {
      location.href = launcherUrl();
    });
  }

  function init() {
    var tg = webApp();
    if (tg) {
      try { tg.ready(); } catch (err) {}
      try { tg.expand(); } catch (err) {}
      applyTheme(tg);
      applyViewport(tg);
      setupBack(tg);
      tg.onEvent("themeChanged", function () { applyTheme(tg); });
      tg.onEvent("viewportChanged", function () { applyViewport(tg); });
    }
    document.documentElement.classList.add(tg ? "in-telegram" : "outside-telegram");
    document.documentElement.classList.add("dnd-mode-" + bookMode());
    global.DNDTg = {
      webApp: tg,
      apiUrl: apiUrl,
      bookMode: bookMode,
      isTelegram: !!(tg && tg.initData)
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

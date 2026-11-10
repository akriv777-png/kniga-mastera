/* Mock Telegram.WebApp for automated tests. Persist CloudStorage in localStorage. */
(function () {
  var cloudKey = "__tg_cloud_store";
  function cloudRead() {
    try { return JSON.parse(localStorage.getItem(cloudKey) || "{}"); } catch (e) { return {}; }
  }
  function cloudWrite(obj) {
    try { localStorage.setItem(cloudKey, JSON.stringify(obj)); } catch (e) {}
  }
  window.__tgSent = window.__tgSent || [];
  window.__tgHaptics = window.__tgHaptics || [];
  window.__tgPopups = window.__tgPopups || [];
  window.__tgLinks = window.__tgLinks || [];
  var WebApp = {
    version: "8.0",
    platform: "tdesktop",
    initData: "query_id=test&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Egor%22%7D",
    initDataUnsafe: { user: { id: 1, first_name: "Egor", username: "testuser" } },
    themeParams: {
      bg_color: "#10090a",
      text_color: "#f4e4c1",
      hint_color: "#9a8b78",
      button_color: "#c0392b",
      button_text_color: "#ffffff",
      secondary_bg_color: "#1a1012",
      header_bg_color: "#10090a"
    },
    viewportHeight: 844,
    viewportStableHeight: 844,
    ready: function () { window.__tgReady = true; },
    expand: function () { window.__tgExpanded = true; },
    disableVerticalSwipes: function () {},
    setBackgroundColor: function () {},
    setHeaderColor: function () {},
    onEvent: function () {},
    offEvent: function () {},
    isVersionAtLeast: function () { return true; },
    sendData: function (data) { window.__tgSent.push(String(data)); },
    openTelegramLink: function (url) { window.__tgLinks.push(String(url)); },
    showPopup: function (opts, cb) {
      window.__tgPopups.push(opts || {});
      if (cb) cb("ok");
    },
    HapticFeedback: {
      notificationOccurred: function (k) { window.__tgHaptics.push(String(k)); },
      selectionChanged: function () { window.__tgHaptics.push("select"); },
      impactOccurred: function (k) { window.__tgHaptics.push(String(k || "light")); }
    },
    CloudStorage: {
      getItem: function (key, cb) {
        var s = cloudRead();
        var v = Object.prototype.hasOwnProperty.call(s, key) ? s[key] : null;
        if (cb) cb(null, v);
      },
      setItem: function (key, value, cb) {
        var s = cloudRead();
        s[key] = String(value);
        cloudWrite(s);
        if (cb) cb(null);
      },
      getItems: function (keys, cb) {
        var s = cloudRead();
        var out = {};
        (keys || []).forEach(function (k) { out[k] = s[k] == null ? null : s[k]; });
        if (cb) cb(null, out);
      }
    },
    MainButton: {
      isVisible: false, text: "", _fn: null,
      setText: function (t) { this.text = t; },
      show: function () { this.isVisible = true; },
      hide: function () { this.isVisible = false; },
      onClick: function (fn) { this._fn = fn; },
      offClick: function () { this._fn = null; }
    },
    BackButton: {
      isVisible: false, _fn: null,
      show: function () { this.isVisible = true; },
      hide: function () { this.isVisible = false; },
      onClick: function (fn) { this._fn = fn; },
      offClick: function () { this._fn = null; }
    },
    SettingsButton: {
      isVisible: false, _fn: null,
      show: function () { this.isVisible = true; },
      hide: function () { this.isVisible = false; },
      onClick: function (fn) { this._fn = fn; },
      offClick: function () { this._fn = null; }
    }
  };
  window.Telegram = { WebApp: WebApp };
})();

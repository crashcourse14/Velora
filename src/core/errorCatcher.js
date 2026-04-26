/**
 * errorCatcher.js
 *
 * Automatically opens a floating Chrome log window on page load.
 * Intercepts ALL console output and uncaught errors/promise rejections,
 * then displays them in real-time. Logs are buffered from the very first
 * line of JS execution, so nothing is ever missed.
 *
 * Usage:
 *   import "./errorCatcher.js";   // first import in main.js
 */

(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────

  const logs = [];
  let logWindow = null;
  let listEl = null;

  // ─── Intercept console methods ────────────────────────────────────────────

  const LEVELS = ["log", "info", "warn", "error", "debug"];

  LEVELS.forEach(function (level) {
    const original = console[level].bind(console);
    console[level] = function (...args) {
      original(...args);
      addEntry(level, args.map(stringify).join(" "));
    };
  });

  // ─── Intercept uncaught errors ────────────────────────────────────────────

  window.addEventListener("error", function (e) {
    addEntry(
      "error",
      `Uncaught ${e.error ? e.error.name : "Error"}: ${e.message}\n  at ${e.filename}:${e.lineno}:${e.colno}`
    );
  });

  window.addEventListener("unhandledrejection", function (e) {
    const reason = e.reason instanceof Error
      ? `${e.reason.name}: ${e.reason.message}`
      : String(e.reason);
    addEntry("error", `Unhandled Promise Rejection — ${reason}`);
  });

  // ─── Core helpers ─────────────────────────────────────────────────────────

  function stringify(val) {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    if (typeof val === "object") {
      try { return JSON.stringify(val, null, 2); }
      catch (_) { return String(val); }
    }
    return String(val);
  }

  function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, "0")}`;
  }

  function addEntry(level, message) {
    const entry = { level, message, timestamp: timestamp() };
    logs.push(entry);
    renderEntry(entry);
  }

  // ─── Window management ────────────────────────────────────────────────────

  function openLogWindow() {
    if (logWindow && !logWindow.closed) {
      logWindow.focus();
      return;
    }

    const features = [
      "width=720", "height=520",
      "top=60", "left=60",
      "resizable=yes", "scrollbars=yes",
    ].join(",");

    logWindow = window.open("", "ErrorCatcherLog", features);

    if (!logWindow) {
      injectOverlay();
      return;
    }

    logWindow.document.write(buildWindowHTML());
    logWindow.document.close();

    logWindow.addEventListener("load", function () {
      listEl = logWindow.document.getElementById("log-list");
      logs.forEach(renderEntry);
    });

    logWindow.addEventListener("beforeunload", function () {
      logWindow = null;
      listEl = null;
    });
  }

  // ─── HTML for the popup window ────────────────────────────────────────────

  function buildWindowHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>🛡 Velora — Dev Console</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace; background: #0d1117; color: #c9d1d9; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #161b22; border-bottom: 1px solid #30363d; flex-shrink: 0; }
  header h1 { font-size: 13px; font-weight: 600; letter-spacing: .04em; color: #e6edf3; }
  .controls { display: flex; gap: 8px; align-items: center; }
  .filter-btns { display: flex; gap: 4px; }
  button { font-family: inherit; font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid #30363d; background: #21262d; color: #c9d1d9; cursor: pointer; transition: background .15s; }
  button:hover { background: #30363d; }
  button.active-filter { outline: 1px solid #58a6ff; }
  #search { font-family: inherit; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #30363d; background: #0d1117; color: #c9d1d9; width: 160px; }
  #search:focus { outline: 1px solid #58a6ff; }
  #log-list { list-style: none; flex: 1; overflow-y: auto; padding: 8px 0; }
  .log-item { display: grid; grid-template-columns: 90px 60px 1fr; gap: 8px; align-items: baseline; padding: 5px 14px; border-bottom: 1px solid rgba(48,54,61,.5); font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; transition: background .1s; }
  .log-item:hover { background: #161b22; }
  .log-item.hidden { display: none; }
  .ts { color: #6e7681; font-size: 11px; }
  .badge { font-size: 10px; font-weight: 700; letter-spacing: .06em; padding: 1px 5px; border-radius: 3px; text-align: center; }
  .msg { color: #e6edf3; }
  .log-log .badge { background:#1f3a1f; color:#3fb950; }
  .log-info .badge { background:#0d2d50; color:#58a6ff; }
  .log-warn .badge { background:#3d2f00; color:#d29922; }
  .log-error .badge { background:#3d1010; color:#f85149; }
  .log-debug .badge { background:#2a1e3f; color:#bc8cff; }
  .log-warn { background: rgba(210,153,34,.04); }
  .log-error { background: rgba(248,81,73,.06); }
  footer { padding: 6px 14px; font-size: 11px; color: #6e7681; background: #161b22; border-top: 1px solid #30363d; flex-shrink: 0; display: flex; justify-content: space-between; }
</style>
</head>
<body>
<header>
  <h1>🛡 Velora — Dev Console</h1>
  <div class="controls">
    <input id="search" type="text" placeholder="Filter logs..." oninput="applyFilters()">
    <div class="filter-btns">
      <button onclick="toggleLevel('log')"   id="f-log"   class="active-filter">LOG</button>
      <button onclick="toggleLevel('info')"  id="f-info"  class="active-filter">INFO</button>
      <button onclick="toggleLevel('warn')"  id="f-warn"  class="active-filter">WARN</button>
      <button onclick="toggleLevel('error')" id="f-error" class="active-filter">ERROR</button>
      <button onclick="toggleLevel('debug')" id="f-debug" class="active-filter">DEBUG</button>
    </div>
    <button onclick="clearLogs()">Clear</button>
    <button onclick="window.close()">Close</button>
  </div>
</header>
<ul id="log-list"></ul>
<footer>
  <span id="footer-count">Listening for logs…</span>
  <span id="footer-status" style="color:#3fb950">● LIVE</span>
</footer>
<script>
  const list = document.getElementById('log-list');
  const footer = document.getElementById('footer-count');
  const searchEl = document.getElementById('search');
  const activeFilters = new Set(['log','info','warn','error','debug']);

  function toggleLevel(level) {
    const btn = document.getElementById('f-' + level);
    if (activeFilters.has(level)) { activeFilters.delete(level); btn.classList.remove('active-filter'); }
    else { activeFilters.add(level); btn.classList.add('active-filter'); }
    applyFilters();
  }

  function applyFilters() {
    const query = searchEl.value.toLowerCase();
    list.querySelectorAll('.log-item').forEach(item => {
      const show = activeFilters.has(item.dataset.level) && (!query || item.querySelector('.msg').textContent.toLowerCase().includes(query));
      item.classList.toggle('hidden', !show);
    });
    updateFooter();
  }

  function clearLogs() { list.innerHTML = ''; updateFooter(); }

  function updateFooter() {
    const total = list.children.length;
    const visible = list.querySelectorAll('.log-item:not(.hidden)').length;
    footer.textContent = visible === total ? total + ' entr' + (total === 1 ? 'y' : 'ies') : visible + ' of ' + total + ' entries';
  }

  const observer = new MutationObserver(updateFooter);
  observer.observe(list, { childList: true });
<\/script>
</body>
</html>`;
  }

  // ─── Render entry ─────────────────────────────────────────────────────────

  function renderEntry(entry) {
    if (!listEl) return;
    const item = (logWindow || document).createElement("li");
    item.className = "log-item log-" + entry.level;
    item.dataset.level = entry.level;
    item.innerHTML =
      `<span class="ts">${entry.timestamp}</span>` +
      `<span class="badge">${entry.level.toUpperCase()}</span>` +
      `<span class="msg">${escapeHTML(entry.message)}</span>`;
    listEl.appendChild(item);
    item.scrollIntoView({ block: "end" });
  }

  // ─── Fallback overlay (popups blocked) ───────────────────────────────────

  function injectOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "error-catcher-overlay";
    overlay.style.cssText = "position:fixed;bottom:0;right:0;width:420px;height:300px;background:#0d1117;color:#c9d1d9;font:12px/1.5 monospace;border-top:2px solid #f85149;border-left:2px solid #f85149;z-index:2147483647;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -4px 24px rgba(0,0,0,.6);";
    overlay.innerHTML =
      `<div style="padding:6px 10px;background:#161b22;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
         <b style="font-size:11px">🛡 Velora — Dev Console (popup blocked)</b>
         <button onclick="this.closest('#error-catcher-overlay').remove()" style="background:none;border:none;color:#c9d1d9;cursor:pointer;font-size:14px">✕</button>
       </div>
       <ul id="log-list" style="flex:1;overflow-y:auto;list-style:none;padding:4px 0;margin:0"></ul>`;
    document.body.appendChild(overlay);
    listEl = overlay.querySelector("#log-list");
    logs.forEach(renderEntry);
  }

  // ─── Escape utility ───────────────────────────────────────────────────────

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  window.openLogWindow = openLogWindow;

  // ─── Auto-open: works whether DOM is ready or not ────────────────────────
  // ES modules are deferred — DOMContentLoaded may have already fired by the
  // time this runs, so we check readyState instead of adding a listener.

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function boot() {
    openLogWindow();
    const btn = document.getElementById("errorBtn");
    if (btn) btn.addEventListener("click", openLogWindow);
  }

})();

export {};
/**
 * errorCatcher.js
 *
 * Drop this script at the very top of your HTML, before any other scripts.
 * It intercepts ALL console output and uncaught errors/promise rejections,
 * then displays them in a floating, real-time log window.
 *
 * Usage:
 *   <script src="errorCatcher.js"></script>   <!-- first! -->
 *   <script src="loader.js"></script>
 */

(function () {
  "use strict";

  // ─── State ────────────────────────────────────────────────────────────────

  const logs = [];          // { level, message, timestamp }
  let logWindow = null;     // reference to the popup window
  let listEl = null;        // <ul> inside the popup that holds log rows

  // ─── Intercept console methods ────────────────────────────────────────────

  const LEVELS = ["log", "info", "warn", "error", "debug"];

  LEVELS.forEach(function (level) {
    const original = console[level].bind(console);

    console[level] = function (...args) {
      original(...args);                          // keep native behaviour
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
    renderEntry(entry);         // update the live window if open
  }

  // ─── Window management ────────────────────────────────────────────────────

  /**
   * Opens (or focuses) the floating log window and renders all buffered logs.
   * Called automatically; you can also call window.openLogWindow() manually.
   */
  function openLogWindow() {
    if (logWindow && !logWindow.closed) {
      logWindow.focus();
      return;
    }

    const features = [
      "width=700", "height=480",
      "top=60", "left=60",
      "resizable=yes", "scrollbars=yes",
    ].join(",");

    logWindow = window.open("", "ErrorCatcherLog", features);

    if (!logWindow) {
      // Popup was blocked — fall back to a DOM overlay on the host page
      injectOverlay();
      return;
    }

    logWindow.document.write(buildWindowHTML());
    logWindow.document.close();

    // Wait for the popup DOM to be fully ready before replaying the buffer.
    // document.write is synchronous, but the popup's load event guarantees
    // getElementById will find #log-list reliably across all browsers.
    logWindow.addEventListener("load", function () {
      listEl = logWindow.document.getElementById("log-list");

      // Replay every entry captured before (and during) the window opening
      logs.forEach(renderEntry);
    });

    logWindow.addEventListener("beforeunload", function () {
      logWindow = null;
      listEl = null;
    });
  }

  /** Appends a single entry to the live log list. */
  function renderEntry(entry) {
    if (!listEl) return;

    const item = (logWindow || document).createElement("li");
    item.className = "log-item log-" + entry.level;
    item.innerHTML =
      `<span class="ts">${entry.timestamp}</span>` +
      `<span class="badge">${entry.level.toUpperCase()}</span>` +
      `<span class="msg">${escapeHTML(entry.message)}</span>`;

    listEl.appendChild(item);

    // Auto-scroll to bottom
    item.scrollIntoView({ block: "end" });
  }

  // ─── HTML for the popup window ────────────────────────────────────────────

  function buildWindowHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>🛡 Error Catcher — Live Log</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    background: #0d1117;
    color: #c9d1d9;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    flex-shrink: 0;
  }

  header h1 {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .04em;
    color: #e6edf3;
  }

  .controls { display: flex; gap: 8px; }

  button {
    font-family: inherit;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #30363d;
    background: #21262d;
    color: #c9d1d9;
    cursor: pointer;
    transition: background .15s;
  }
  button:hover { background: #30363d; }

  #log-list {
    list-style: none;
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .log-item {
    display: grid;
    grid-template-columns: 90px 60px 1fr;
    gap: 8px;
    align-items: baseline;
    padding: 5px 14px;
    border-bottom: 1px solid rgba(48,54,61,.5);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    transition: background .1s;
  }
  .log-item:hover { background: #161b22; }

  .ts   { color: #6e7681; font-size: 11px; }
  .badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .06em;
    padding: 1px 5px;
    border-radius: 3px;
    text-align: center;
  }
  .msg  { color: #e6edf3; }

  /* Level colours */
  .log-log    .badge { background:#1f3a1f; color:#3fb950; }
  .log-info   .badge { background:#0d2d50; color:#58a6ff; }
  .log-warn   .badge { background:#3d2f00; color:#d29922; }
  .log-error  .badge { background:#3d1010; color:#f85149; }
  .log-debug  .badge { background:#2a1e3f; color:#bc8cff; }

  .log-warn  { background: rgba(210,153,34,.04); }
  .log-error { background: rgba(248,81,73,.06); }

  footer {
    padding: 6px 14px;
    font-size: 11px;
    color: #6e7681;
    background: #161b22;
    border-top: 1px solid #30363d;
    flex-shrink: 0;
  }
</style>
</head>
<body>
<header>
  <h1>🛡 Error Catcher &mdash; Live Log</h1>
  <div class="controls">
    <button onclick="document.getElementById('log-list').innerHTML=''">Clear view</button>
    <button onclick="window.close()">Close</button>
  </div>
</header>
<ul id="log-list"></ul>
<footer id="footer">Listening for logs&hellip;</footer>
<script>
  // Keep footer entry count up to date
  const list = document.getElementById('log-list');
  const footer = document.getElementById('footer');
  const observer = new MutationObserver(() => {
    footer.textContent = list.children.length + ' entr' + (list.children.length === 1 ? 'y' : 'ies') + ' — live';
  });
  observer.observe(list, { childList: true });
<\/script>
</body>
</html>`;
  }

  // ─── Fallback: DOM overlay (when popups are blocked) ─────────────────────

  function injectOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "error-catcher-overlay";
    overlay.style.cssText = [
      "position:fixed", "bottom:0", "right:0", "width:420px", "height:300px",
      "background:#0d1117", "color:#c9d1d9", "font:12px/1.5 monospace",
      "border-top:2px solid #f85149", "border-left:2px solid #f85149",
      "z-index:2147483647", "display:flex", "flex-direction:column",
      "overflow:hidden", "box-shadow:0 -4px 24px rgba(0,0,0,.6)",
    ].join(";");

    overlay.innerHTML =
      `<div style="padding:6px 10px;background:#161b22;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
         <b style="font-size:11px">🛡 Error Catcher</b>
         <button onclick="this.closest('#error-catcher-overlay').remove()"
                 style="background:none;border:none;color:#c9d1d9;cursor:pointer;font-size:14px">✕</button>
       </div>
       <ul id="log-list" style="flex:1;overflow-y:auto;list-style:none;padding:4px 0;margin:0"></ul>`;

    document.body.appendChild(overlay);
    listEl = overlay.querySelector("#log-list");
    logs.forEach(renderEntry);
  }

  // ─── Escape utility ───────────────────────────────────────────────────────

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  window.openLogWindow = openLogWindow;

  // Open the log window when #errorBtn is clicked.
  // Works whether the button already exists or is added later (event delegation).
  window.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("errorBtn");
    if (btn) {
      btn.addEventListener("click", openLogWindow);
    } else {
      // Fallback: watch for the button being added dynamically
      const observer = new MutationObserver(function () {
        const btn = document.getElementById("errorBtn");
        if (btn) {
          btn.addEventListener("click", openLogWindow);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
})();
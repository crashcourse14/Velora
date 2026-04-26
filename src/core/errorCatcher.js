/**
 * errorCatcher.js
 *
 * Provides a floating in-page log window when debug mode is enabled.
 * It intercepts console output and uncaught errors/promise rejections.
 *
 * Usage:
 *   import { initErrorCatcher } from "./core/errorCatcher.js";
 *   if (debugMode) initErrorCatcher();
 */

export function initErrorCatcher() {
  "use strict";

  console.log("[Debug] initErrorCatcher enabled");

  const logs = [];
  let listEl = null;
  let logWindow = null;

  const LEVELS = ["log", "info", "warn", "error", "debug"];

  LEVELS.forEach(function (level) {
    if (typeof console[level] !== "function") {
      return;
    }

    const original = console[level].bind(console);
    console[level] = function (...args) {
      try {
        original(...args);
      } catch (_) {
        // ignore logging failures
      }
      addEntry(level, args.map(stringify).join(" "));
    };
  });

  window.addEventListener("error", function (e) {
    addEntry(
      "error",
      `Uncaught ${e.error ? e.error.name : "Error"}: ${e.message}
  at ${e.filename}:${e.lineno}:${e.colno}`
    );
  });

  window.addEventListener("unhandledrejection", function (e) {
    const reason = e.reason instanceof Error
      ? `${e.reason.name}: ${e.reason.message}`
      : String(e.reason);
    addEntry("error", `Unhandled Promise Rejection — ${reason}`);
  });

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
    if (listEl) {
      renderEntry(entry);
    }
  }

  function renderEntry(entry) {
    if (!listEl) return;
    const item = document.createElement("li");
    item.className = "log-item log-" + entry.level;
    item.dataset.level = entry.level;
    item.innerHTML =
      `<span class=\"ts\">${entry.timestamp}</span>` +
      `<span class=\"badge\">${entry.level.toUpperCase()}</span>` +
      `<span class=\"msg\">${escapeHTML(entry.message)}</span>`;
    listEl.appendChild(item);
    item.scrollIntoView({ block: "end" });
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function injectOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "error-catcher-overlay";
    overlay.style.cssText = "position:fixed;top:80px;left:80px;width:420px;height:300px;background:#0d1117;color:#c9d1d9;font:12px/1.5 monospace;border:2px solid #f85149;z-index:2147483647;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.6);";
    overlay.innerHTML =
      `<div id="error-catcher-header" style="padding:8px 10px;background:#161b22;display:flex;justify-content:space-between;align-items:center;cursor:move;flex-shrink:0;border-bottom:1px solid #30363d;">
         <b style="font-size:11px">🛡 Velora — Dev Console</b>
         <button id="error-catcher-close" style="background:none;border:none;color:#c9d1d9;cursor:pointer;font-size:14px">✕</button>
       </div>
       <ul id="log-list" style="flex:1;overflow-y:auto;list-style:none;padding:4px 0;margin:0;"></ul>`;
    document.body.appendChild(overlay);
    listEl = overlay.querySelector("#log-list");
    const header = overlay.querySelector("#error-catcher-header");
    const closeBtn = overlay.querySelector("#error-catcher-close");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        overlay.remove();
        listEl = null;
      });
    }

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startLeft = 0;
    let startTop = 0;

    function onPointerMove(event) {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      overlay.style.left = `${startLeft + dx}px`;
      overlay.style.top = `${startTop + dy}px`;
    }

    function onPointerUp() {
      dragging = false;
    }

    if (header) {
      header.addEventListener("pointerdown", (event) => {
        dragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        const rect = overlay.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        overlay.setPointerCapture(event.pointerId);
      });
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    // Render all buffered logs so far
    logs.forEach(renderEntry);
    console.log("[Debug] error catcher overlay created and visible");
  }

  // Open overlay immediately once body is available
  function openOverlay() {
    if (logWindow) {
      return;
    }

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", openOverlay);
      return;
    }

    logWindow = true;
    injectOverlay();
  }

  openOverlay();
}


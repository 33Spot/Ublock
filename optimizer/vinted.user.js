// ==UserScript==
// @name         Vinted.pl - reduce script bloat (block trackers + throttle timers)
// @namespace    local
// @version      0.4
// @description  Blocks common third-party tracking scripts and throttles aggressive timers when the tab is hidden. Optional idle reload.
// @match        https://www.vinted.pl/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  "use strict";

  /********************************************************************
   * Config
   ********************************************************************/
  const DEFAULTS = {
    enabled: true,
    debug: true,

    // Script blocking
    blockThirdPartyScripts: true,

    // Allowlist always wins (prevents accidental breakage).
    // Keep this generous for anything that might be required for core site/security.
    allowPatterns: [
      /(^|\.)vinted\.pl$/i,
      /(^|\.)vinted\.(com|net|fr|de|it|es|nl|be|se|cz|ro|hu|lt|co\.uk)$/i,
      /(^|\.)cloudflare\.com$/i,
      /(^|\.)challenges\.cloudflare\.com$/i,
      /recaptcha/i,
      /(^|\.)hcaptcha\.com$/i,
      /(^|\.)gstatic\.com$/i,
    ],

    // Blocklist: common analytics/ads/session-replay/tag managers.
    // This is intentionally "generic"; you can add/remove based on what you see in DevTools > Network.
    blockPatterns: [
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
      /doubleclick\.net/i,
      /googleadservices\.com/i,
      /connect\.facebook\.net/i,
      /facebook\.com\/tr/i,
      /hotjar\.com/i,
      /intercomcdn\.com/i,
      /segment\.com/i,
      /cdn\.amplitude\.com/i,
      /mixpanel\.com/i,
      /fullstory\.com/i,
      /clarity\.ms/i,
      /optimizely\.com/i,
      /newrelic\.com/i,
      /datadoghq\.com/i,
      /sentry\.io/i,
      /bugsnag\.com/i,
      /app\.link/i,
      /snapchat\.com/i,
      /tiktok\.com/i,
    ],

    // Background throttling (helps when you leave the computer)
    throttleTimersWhenHidden: true,
    minHiddenIntervalMs: 15000, // bump fast intervals to at least 15s when tab hidden
    minHiddenTimeoutMs: 5000,   // bump fast timeouts to at least 5s when tab hidden

    // Optional "memory leak band-aid"
    idleReloadEnabled: false,
    reloadEveryMin: 180,   // try 120–240
    onlyIfIdleMin: 45,     // only reload if you haven't used mouse/keyboard recently
  };

  function loadCfg() {
    const cfg = {};
    for (const k of Object.keys(DEFAULTS)) cfg[k] = GM_getValue(k, DEFAULTS[k]);
    return cfg;
  }

  const cfg = loadCfg();

  const log = (...a) => cfg.debug && console.log("[vinted-bloat]", ...a);
  const warn = (...a) => cfg.debug && console.warn("[vinted-bloat]", ...a);

  GM_registerMenuCommand(`Enabled: ${cfg.enabled ? "ON" : "OFF"} (click to toggle)`, () => {
    GM_setValue("enabled", !cfg.enabled);
    location.reload();
  });

  GM_registerMenuCommand(`Debug: ${cfg.debug ? "ON" : "OFF"} (click to toggle)`, () => {
    GM_setValue("debug", !cfg.debug);
    location.reload();
  });

  GM_registerMenuCommand(`Idle reload: ${cfg.idleReloadEnabled ? "ON" : "OFF"} (click to toggle)`, () => {
    GM_setValue("idleReloadEnabled", !cfg.idleReloadEnabled);
    location.reload();
  });

  if (!cfg.enabled) return;

  /********************************************************************
   * Helpers
   ********************************************************************/
  function hostnameFromUrl(u) {
    try { return new URL(u, location.href).hostname; } catch { return ""; }
  }

  function isThirdParty(u) {
    try {
      const url = new URL(u, location.href);
      return url.hostname !== location.hostname;
    } catch {
      return false;
    }
  }

  function matchesAny(patterns, text) {
    return patterns.some((re) => {
      try { return re.test(text); } catch { return false; }
    });
  }

  function shouldAllow(url) {
    const host = hostnameFromUrl(url);
    return matchesAny(cfg.allowPatterns, host) || matchesAny(cfg.allowPatterns, url);
  }

  function shouldBlockScript(url) {
    if (!url) return false;
    if (!cfg.blockThirdPartyScripts) return false;
    if (!isThirdParty(url)) return false;
    if (shouldAllow(url)) return false;

    const host = hostnameFromUrl(url);
    const hit = matchesAny(cfg.blockPatterns, host) || matchesAny(cfg.blockPatterns, url);
    return hit;
  }

  /********************************************************************
   * Block third-party scripts early (best-effort in userscript land)
   ********************************************************************/
  function neuterScript(el, reason) {
    try {
      // Stop execution if it somehow gets inserted
      el.type = "javascript/blocked";
      el.dataset.vintedBloatBlocked = reason || "blocked";
    } catch {}
  }

  // Catch: script.src = "..."
  try {
    const desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (desc && desc.set) {
      Object.defineProperty(HTMLScriptElement.prototype, "src", {
        get: desc.get,
        set: function (value) {
          if (shouldBlockScript(value)) {
            warn("Blocked script via src setter:", value);
            neuterScript(this, "src-setter");
            // Do NOT set src at all.
            return;
          }
          return desc.set.call(this, value);
        },
        configurable: true,
        enumerable: true,
      });
      log("Hooked HTMLScriptElement.prototype.src");
    }
  } catch (e) {
    warn("Failed hooking script src setter:", e);
  }

  // Catch: script.setAttribute("src", "...")
  try {
    const _setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      if (this && this.tagName === "SCRIPT" && String(name).toLowerCase() === "src") {
        if (shouldBlockScript(String(value))) {
          warn("Blocked script via setAttribute:", value);
          neuterScript(this, "setAttribute");
          return; // skip setting
        }
      }
      return _setAttribute.call(this, name, value);
    };
    log("Hooked Element.prototype.setAttribute");
  } catch (e) {
    warn("Failed hooking setAttribute:", e);
  }

  // Catch: appendChild/insertBefore of <script>
  function wrapInserter(proto, fnName) {
    const orig = proto[fnName];
    proto[fnName] = function (...args) {
      const node = args[0];
      try {
        if (node && node.tagName === "SCRIPT") {
          const src = node.src || node.getAttribute?.("src");
          if (src && shouldBlockScript(src)) {
            warn(`Blocked script via ${fnName}:`, src);
            neuterScript(node, fnName);
            // Prevent insertion
            return node;
          }
        }
      } catch {}
      return orig.apply(this, args);
    };
  }

  try {
    wrapInserter(Node.prototype, "appendChild");
    wrapInserter(Node.prototype, "insertBefore");
    log("Hooked appendChild/insertBefore");
  } catch (e) {
    warn("Failed hooking DOM insertion:", e);
  }

  /********************************************************************
   * Throttle timers when tab is hidden (reduces CPU while you're away)
   ********************************************************************/
  if (cfg.throttleTimersWhenHidden) {
    const _setInterval = window.setInterval.bind(window);
    const _setTimeout = window.setTimeout.bind(window);

    window.setInterval = function (fn, ms, ...rest) {
      let delay = Number(ms);
      if (document.hidden && Number.isFinite(delay) && delay < cfg.minHiddenIntervalMs) {
        delay = cfg.minHiddenIntervalMs;
      }
      return _setInterval(fn, delay, ...rest);
    };

    window.setTimeout = function (fn, ms, ...rest) {
      let delay = Number(ms);
      if (document.hidden && Number.isFinite(delay) && delay < cfg.minHiddenTimeoutMs) {
        delay = cfg.minHiddenTimeoutMs;
      }
      return _setTimeout(fn, delay, ...rest);
    };

    log("Timer throttling enabled for hidden tab");
  }

  /********************************************************************
   * Optional: idle reload "band-aid" for long-session memory growth
   ********************************************************************/
  if (cfg.idleReloadEnabled) {
    let lastActivity = Date.now();
    const mark = () => (lastActivity = Date.now());
    ["mousemove","keydown","click","scroll","touchstart"].forEach((e) =>
      window.addEventListener(e, mark, { passive: true })
    );

    function isTypingOrEditing() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    }

    const baseMs = cfg.reloadEveryMin * 60 * 1000;

    window.setTimeout(function tick() {
      const idleMin = (Date.now() - lastActivity) / 60000;
      if (idleMin >= cfg.onlyIfIdleMin && !isTypingOrEditing()) {
        warn(`Idle reload triggered (idle ${idleMin.toFixed(1)} min)`);
        location.reload();
        return;
      }
      window.setTimeout(tick, baseMs);
    }, baseMs);

    log("Idle reload enabled");
  }
})();

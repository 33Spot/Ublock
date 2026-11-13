// ==UserScript==
// @name          Universal Website Optimizer
// @namespace     http://tampermonkey.net/
// @version       4.1.0
// @description   Optimizes page behavior without exposing the target-domain list in plaintext.
// @match         *://*/*
// @grant         none
// @run-at        document-start
// @noframes
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// @downloadURL   https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Top-level only. Remove this plus @noframes if you want iframe execution.
    if (window.top !== window.self) return;

    const CONFIG = {
        debug: false,
        blockAllPopups: false,
        unmuteVideos: true,
        forceNativeControls: true,
        fixHiddenVideoIframes: true,
        removeObtrusiveOverlays: true,
        blockAdblockDetectors: true,
        waitForCloudflareMs: 120000,
        scanDebounceMs: 400
    };

    const LOG_PREFIX = '[Universal Website Optimizer]';
    const log = (...args) => { if (CONFIG.debug) console.log(LOG_PREFIX, ...args); };
    const warn = (...args) => { if (CONFIG.debug) console.warn(LOG_PREFIX, ...args); };

    const HOST = (location.hostname || '').toLowerCase();

    // Encoded domain vault. No plaintext target domains here.
    const VAULT = [
        '6d6567612e6e7a',
        '696d64622e636f6d',
        '796f75747562652e636f6d',
        '7370616e6b62616e672e636f6d',
        '7669647372632e6e6574',
        '666d6f766965732d68642e746f',
        '7669646c696e6b2e70726f',
        '7672706f726e67616c6178792e636f6d',
        '65706f726e65722e636f6d',
        '64726976652e676f6f676c652e636f6d',
        '706f726e7a6f672e636f6d',
        '706f726e747265782e636f6d',
        '73666c69782e746f',
        '66726565646973632e706c',
        '6172656e612e6169',
        '74766e32342e706c',
        '726574726f67616d65732e6363',
        '77636f2e7476'
    ];

    function dec(h) {
        let out = '';
        for (let i = 0; i < h.length; i += 2) {
            out += String.fromCharCode(parseInt(h.slice(i, i + 2), 16));
        }
        return out;
    }

    const DOMAINS = VAULT.map(dec);

    function hostIs(domain) {
        return HOST === domain || HOST.endsWith('.' + domain);
    }

    let CODE = -1;
    for (let i = 0; i < DOMAINS.length; i++) {
        if (hostIs(DOMAINS[i])) {
            CODE = i;
            break;
        }
    }

    // Hard exclusions: numeric codes 9, 16 and 17.
    if (CODE === 9 || CODE === 16 || CODE === 17) return;

    function parseURL(value) {
        try {
            return new URL(String(value == null ? '' : value), location.href);
        } catch (e) {
            return null;
        }
    }

    function queryAll(root, selector) {
        if (!root) return [];
        const out = [];

        try {
            if (root.nodeType === 1 && root.matches && root.matches(selector)) {
                out.push(root);
            }

            if (root.querySelectorAll) {
                const nodes = root.querySelectorAll(selector);
                for (let i = 0; i < nodes.length; i++) {
                    out.push(nodes[i]);
                }
            }
        } catch (e) {}

        return out;
    }

    function getClassName(el) {
        if (!el) return '';
        if (typeof el.className === 'string') return el.className;
        return el.getAttribute ? (el.getAttribute('class') || '') : '';
    }

    /* Cloudflare wait */

    const CF_SELECTOR = [
        '#cf-challenge-form',
        '#challenge-form',
        '.cf-browser-verification',
        '.cf-turnstile',
        'form[action*="cloudflare" i]',
        'script[src*="/cdn-cgi/challenge-platform/"]'
    ].join(',');

    function isCloudflareChallenge() {
        try {
            if (document.querySelector(CF_SELECTOR)) return true;

            const title = (document.title || '').trim();

            if (
                /^(Just a moment|Attention Required|Checking your browser|Verify you are human)/i.test(title) &&
                document.querySelector('script[src*="/cdn-cgi/"]')
            ) {
                return true;
            }
        } catch (e) {}

        return false;
    }

    function whenCloudflarePasses(callback) {
        let waited = 0;

        const tick = () => {
            if (isCloudflareChallenge()) {
                if (waited >= CONFIG.waitForCloudflareMs) {
                    warn('Cloudflare wait timed out; continuing anyway.');
                    callback();
                    return;
                }

                waited += 1500;
                setTimeout(tick, 1500);
                return;
            }

            callback();
        };

        tick();
    }

    /* Pop-up / redirect guarding */

    let lastUserGesture = 0;

    ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'].forEach(type => {
        document.addEventListener(type, () => {
            lastUserGesture = Date.now();
        }, true);
    });

    function hasRecentUserGesture() {
        if (Date.now() - lastUserGesture < 1500) return true;

        try {
            if (navigator.userActivation) {
                return !!navigator.userActivation.isActive;
            }
        } catch (e) {}

        return false;
    }

    const SUSPICIOUS_PATH_RE = /(?:^|[/?#&._-])(?:popup|popunder|redirect|click|track(?:er|ing)?|sponsor|promo|affiliate|aff|adservice|advert|adsystem)(?:[/?#&._-]|$)/i;

    function isSuspiciousURL(url) {
        const u = parseURL(url);
        if (!u) return false;
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;

        return SUSPICIOUS_PATH_RE.test(u.hostname + u.pathname + u.search);
    }

    function shouldBlockPopup(url, target) {
        const t = String(target || '').toLowerCase();

        if (t === '_self' || t === '_top' || t === '_parent') return false;

        const raw = String(url == null ? '' : url);
        const u = parseURL(raw);
        const activated = hasRecentUserGesture();

        if (u && isSuspiciousURL(u.href)) return true;

        if (CONFIG.blockAllPopups) return true;

        if (!u) {
            return !activated;
        }

        if (u.protocol === 'about:' || u.protocol === 'blob:' || u.protocol === 'data:') {
            return false;
        }

        if (activated) {
            return false;
        }

        return u.origin !== location.origin;
    }

    let popupBlockerInstalled = false;
    let originalWindowOpen = null;

    function installPopupBlocker() {
        if (popupBlockerInstalled) return;
        popupBlockerInstalled = true;

        originalWindowOpen = window.open;

        try {
            window.open = function (url, name, specs, replace) {
                if (shouldBlockPopup(url, name)) {
                    log('Blocked popup:', url);
                    return null;
                }

                try {
                    return originalWindowOpen.apply(window, arguments);
                } catch (e) {
                    warn('window.open call failed:', e);
                    return null;
                }
            };
        } catch (e) {
            warn('Could not override window.open:', e);
        }

        document.addEventListener('click', event => {
            const anchor = event.target && event.target.closest
                ? event.target.closest('a[href]')
                : null;

            if (!anchor) return;
            if (anchor.hasAttribute('download')) return;

            const href = anchor.href;

            if (href && isSuspiciousURL(href)) {
                log('Blocked suspicious link:', href);
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    }

    /* Anti-adblock helpers */

    const ADBLOCK_SCRIPT_PATTERN = /(fuckadblock|blockadblock|detectadblock|detect-adblock|anti-adblock|antiadblock|canrunads|canshowads|isadblockactive|adblockdetected|adblock-detect|adblockdetection)/i;
    const ADBLOCK_TEXT_PATTERN = /(adblock|ad blocker|ad-block|disable.{0,30}ad|whitelist.{0,30}(site|domain)|turn off.{0,30}ad|support us by disabling)/i;

    const checkedScripts = new WeakSet();

    function isAdblockDetectorScript(script) {
        if (!script || script.tagName !== 'SCRIPT') return false;

        const src = script.src || '';
        const code = script.textContent || '';

        return (src && ADBLOCK_SCRIPT_PATTERN.test(src)) ||
               (code && ADBLOCK_SCRIPT_PATTERN.test(code));
    }

    function removeAdblockPrompts(root) {
        const selector = [
            '[id*="adblock" i]',
            '[class*="adblock" i]',
            '[id*="ad-block" i]',
            '[class*="ad-block" i]',
            '[id*="anti-ad" i]',
            '[class*="anti-ad" i]',
            '[id*="blockad" i]',
            '[class*="blockad" i]'
        ].join(',');

        queryAll(root, selector).forEach(el => {
            if (!el.isConnected) return;
            if (el === document.body || el === document.documentElement) return;

            if (el.querySelector('input[type="password"], form[action*="login" i], form[action*="signin" i]')) {
                return;
            }

            const text = (
                (el.innerText || el.textContent || '') +
                ' ' +
                (el.id || '') +
                ' ' +
                getClassName(el)
            ).replace(/\s+/g, ' ');

            if (ADBLOCK_TEXT_PATTERN.test(text)) {
                log('Removing anti-adblock prompt:', el);
                el.remove();
            }
        });
    }

    function blockAdblockDetectors(root) {
        if (!CONFIG.blockAdblockDetectors) return;

        queryAll(root, 'script').forEach(script => {
            if (!script.isConnected || checkedScripts.has(script)) return;
            checkedScripts.add(script);

            if (isAdblockDetectorScript(script)) {
                log('Blocking anti-adblock script:', script.src || '(inline)');
                script.remove();
            }
        });

        removeAdblockPrompts(root);
    }

    /* Overlay/cookie removal */

    const OVERLAY_SELECTOR = [
        '[id*="popup" i]', '[class*="popup" i]',
        '[id*="pop-up" i]', '[class*="pop-up" i]',
        '[id*="interstitial" i]', '[class*="interstitial" i]',
        '[id*="ad-banner" i]', '[class*="ad-banner" i]',
        '[id*="ad-container" i]', '[class*="ad-container" i]',
        '[id*="ad-placeholder" i]', '[class*="ad-placeholder" i]',
        '[id*="ad-slot" i]', '[class*="ad-slot" i]',
        '[id*="ad-wrapper" i]', '[class*="ad-wrapper" i]',
        '[id*="cookie" i]', '[class*="cookie" i]',
        '[id*="consent" i]', '[class*="consent" i]',
        '[id*="overlay" i]', '[class*="overlay" i]',
        '.adsbygoogle'
    ].join(',');

    function isInsidePlayer(el) {
        return !!(el && el.closest && el.closest(
            'video, [class*="player" i], [id*="player" i]'
        ));
    }

    function hasLoginForm(el) {
        return !!(el && el.querySelector && el.querySelector(
            'input[type="password"], form[action*="login" i], form[action*="signin" i]'
        ));
    }

    function shouldRemoveOverlay(el) {
        if (!el || !el.isConnected) return false;
        if (el === document.body || el === document.documentElement) return false;

        const id = el.id || '';
        const className = getClassName(el);
        const name = (id + ' ' + className).toLowerCase();

        const text = (
            (el.innerText || el.textContent || '') +
            ' ' +
            name
        ).replace(/\s+/g, ' ').trim();

        if (ADBLOCK_TEXT_PATTERN.test(text)) return true;

        if (/(adsbygoogle|ad-banner|ad-container|ad-placeholder|ad-slot|ad-wrapper)/.test(name)) {
            return true;
        }

        if (
            /(cookie|consent|gdpr|cmp)/.test(name) &&
            /(cookie|consent|privacy|gdpr|accept all|reject all|manage choices|manage preferences)/i.test(text)
        ) {
            return true;
        }

        if (isInsidePlayer(el)) return false;
        if (hasLoginForm(el)) return false;

        if (/(popup|pop-up|interstitial)/.test(name)) {
            return true;
        }

        if (/overlay/.test(name)) {
            try {
                const style = getComputedStyle(el);
                const rect = el.getBoundingClientRect();

                const fixed = style.position === 'fixed' || style.position === 'sticky';
                const z = parseInt(style.zIndex, 10) || 0;
                const large = rect.width >= innerWidth * 0.55 && rect.height >= innerHeight * 0.35;

                if ((fixed && z >= 50) || large) return true;
            } catch (e) {}
        }

        return false;
    }

    function removeObtrusiveOverlays(root) {
        if (!CONFIG.removeObtrusiveOverlays) return;

        // Conservative on two sensitive sites. Numeric codes only.
        if (CODE === 0 || CODE === 1) return;

        queryAll(root, OVERLAY_SELECTOR).forEach(el => {
            try {
                if (shouldRemoveOverlay(el)) {
                    log('Removing overlay:', el);
                    el.remove();
                }
            } catch (e) {}
        });
    }

    /* Video playback */

    const seenVideos = new WeakSet();

    function fixVideoPlayback(root) {
        if (!CONFIG.unmuteVideos) return;

        // Leave two native-player sites alone. Numeric codes only.
        if (CODE === 2 || CODE === 9) return;

        queryAll(root, 'video').forEach(video => {
            if (seenVideos.has(video)) return;
            seenVideos.add(video);

            try {
                if (CONFIG.forceNativeControls && !video.controls) {
                    video.controls = true;
                }
            } catch (e) {}

            const unmute = () => {
                try {
                    if (!video.muted && video.volume !== 0) return;

                    video.muted = false;

                    if (video.volume === 0) {
                        video.volume = 1;
                    }

                    log('Unmuted video:', video);
                } catch (e) {}
            };

            try {
                if (video.readyState >= 2 && !video.paused) {
                    unmute();
                }

                video.addEventListener('playing', unmute, { once: true });
            } catch (e) {}
        });
    }

    /* Hidden video iframes */

    const seenIframes = new WeakSet();

    function fixVideoIframes(root) {
        if (!CONFIG.fixHiddenVideoIframes) return;

        queryAll(root, 'iframe').forEach(iframe => {
            if (seenIframes.has(iframe)) return;

            const src = iframe.src || iframe.getAttribute('src') || '';

            if (!/(embed|player|stream|video)/i.test(src)) return;

            seenIframes.add(iframe);

            try {
                const style = getComputedStyle(iframe);
                const rect = iframe.getBoundingClientRect();

                const hidden =
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    parseFloat(style.opacity) === 0 ||
                    rect.width < 2 ||
                    rect.height < 2;

                if (hidden) {
                    log('Revealing video iframe:', src);

                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';

                    if (rect.width < 2) iframe.style.width = '100%';
                    if (rect.height < 2) iframe.style.height = '100%';
                }
            } catch (e) {}
        });
    }

    /* Encoded site-specific fixes */

    function fixSpecialVideos(root) {
        if (CODE !== 13) return;

        const domain = DOMAINS[13];

        queryAll(root, 'a[href*="' + domain + '"]').forEach(link => {
            if (link.target !== '_blank') link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });

        queryAll(root, "embed[src*='player.swf'], object[data*='player.swf']").forEach(el => {
            log('Removing obsolete Flash element:', el);
            el.remove();
        });
    }

    function optimizeSpecialA(root) {
        if (CODE !== 15) return;

        queryAll(root, '.overlay, .popup, .ad-banner, .cookie-consent, .ad-placeholder').forEach(el => {
            try {
                if (
                    shouldRemoveOverlay(el) ||
                    /cookie-consent|ad-placeholder|ad-banner/i.test(getClassName(el))
                ) {
                    el.remove();
                }
            } catch (e) {}
        });
    }

    /* Main scan */

    let isOptimizing = false;

    function optimizePage(root) {
        if (isOptimizing) return;
        if (isCloudflareChallenge()) return;

        isOptimizing = true;

        try {
            const target = root || document;

            blockAdblockDetectors(target);
            removeObtrusiveOverlays(target);

            fixSpecialVideos(target);
            optimizeSpecialA(target);

            fixVideoPlayback(target);
            fixVideoIframes(target);
        } catch (e) {
            warn('Optimization scan failed:', e);
        } finally {
            isOptimizing = false;
        }
    }

    let optimizeTimer = null;

    function scheduleOptimize(delay) {
        if (optimizeTimer) return;

        optimizeTimer = setTimeout(() => {
            optimizeTimer = null;

            if (isCloudflareChallenge()) {
                scheduleOptimize(2000);
                return;
            }

            optimizePage(document);
        }, typeof delay === 'number' ? delay : CONFIG.scanDebounceMs);
    }

    /* Early anti-adblock script blocker */

    function removeAdblockScriptsFromNode(node) {
        if (!CONFIG.blockAdblockDetectors || !node) return;
        if (node.nodeType !== 1 && node.nodeType !== 11) return;

        if (node.nodeType === 1 && node.tagName === 'SCRIPT' && isAdblockDetectorScript(node)) {
            log('Blocking early anti-adblock script:', node.src || '(inline)');
            node.remove();
            return;
        }

        if (node.querySelectorAll) {
            node.querySelectorAll('script').forEach(script => {
                if (isAdblockDetectorScript(script)) {
                    log('Blocking early anti-adblock script:', script.src || '(inline)');
                    script.remove();
                }
            });
        }
    }

    function installEarlyMutationGuard() {
        if (!CONFIG.blockAdblockDetectors) return;

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    removeAdblockScriptsFromNode(node);
                }
            }
        });

        try {
            observer.observe(document, { childList: true, subtree: true });
        } catch (e) {
            warn('Could not start early MutationObserver:', e);
        }
    }

    /* SPA navigation / observers */

    let domObserver = null;
    let lastUrl = location.href;

    function checkForUrlChange() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            log('URL changed:', lastUrl);
            scheduleOptimize(200);
        }
    }

    function hookHistory() {
        ['pushState', 'replaceState'].forEach(method => {
            const original = history[method];
            if (!original || original.__uwoWrapped) return;

            const wrapper = function () {
                const result = original.apply(this, arguments);
                checkForUrlChange();
                scheduleOptimize(200);
                return result;
            };

            wrapper.__uwoWrapped = true;

            try {
                history[method] = wrapper;
            } catch (e) {}
        });
    }

    function startObservers() {
        if (domObserver) return;

        const root = document.documentElement || document;

        domObserver = new MutationObserver(() => {
            checkForUrlChange();
            scheduleOptimize();
        });

        try {
            domObserver.observe(root, { childList: true, subtree: true });
        } catch (e) {
            warn('Could not start main MutationObserver:', e);
            return;
        }

        window.addEventListener('popstate', checkForUrlChange, true);
        window.addEventListener('hashchange', checkForUrlChange, true);

        setInterval(checkForUrlChange, 1000);

        setInterval(() => {
            if (!document.hidden) {
                scheduleOptimize(0);
            }
        }, 10000);

        hookHistory();
    }

    /* Bootstrap */

    let bootstrapped = false;

    function bootstrap() {
        if (bootstrapped) {
            scheduleOptimize(0);
            return;
        }

        bootstrapped = true;
        log('Starting on', HOST);

        startObservers();
        optimizePage(document);

        setTimeout(() => scheduleOptimize(0), 1000);
        setTimeout(() => scheduleOptimize(0), 3000);
    }

    installPopupBlocker();
    installEarlyMutationGuard();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            whenCloudflarePasses(bootstrap);
        }, { once: true });
    } else {
        whenCloudflarePasses(bootstrap);
    }

    window.addEventListener('load', () => {
        whenCloudflarePasses(() => scheduleOptimize(0));
    }, { once: true });

})();

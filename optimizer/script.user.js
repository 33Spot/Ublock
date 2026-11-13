// ==UserScript==
// @name          Universal Website Optimizer (Safe)
// @namespace     http://tampermonkey.net/
// @version       4.2.0
// @description   Conservative optimizer: popup guard + video fixes without breaking normal site buttons/UI.
// @match         *://*/*
// @grant         none
// @run-at        document-start
// @noframes
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// @downloadURL   https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    const CONFIG = {
        debug: false,

        // Popup guard. This does not modify page UI.
        blockAutomaticPopups: true,
        blockSuspiciousPopups: true,

        // Video fixes.
        unmuteVideos: true,
        forceVideoControls: true,
        revealHiddenVideoIframes: true,

        // SPA navigation.
        rescanOnSpaNavigation: true

        // Intentionally NOT included:
        // removeOverlays
        // removeAdblockPrompts
        // removeAdblockScripts
        //
        // Those caused normal buttons/dropdowns/modals to be deleted or reset.
    };

    const LOG_PREFIX = '[Universal Website Optimizer]';
    const log = (...args) => { if (CONFIG.debug) console.log(LOG_PREFIX, ...args); };
    const warn = (...args) => { if (CONFIG.debug) console.warn(LOG_PREFIX, ...args); };

    const HOST = (location.hostname || '').toLowerCase();

    // Encoded host list. No plaintext target domains here.
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

    // Hard exclusions. Numeric only.
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

    /* ------------------------------------------------------------
       Cloudflare wait
       ------------------------------------------------------------ */

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
                if (waited >= 120000) {
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

    /* ------------------------------------------------------------
       Popup guard
       ------------------------------------------------------------ */

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

    const SUSPICIOUS_PATH_RE = /(?:^|[/?#&._-])(?:popup|popunder|redirect|track(?:er|ing)?|sponsor|promo|affiliate|aff|adservice|advert|adsystem)(?:[/?#&._-]|$)/i;

    function isSuspiciousURL(url) {
        const u = parseURL(url);
        if (!u) return false;
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;

        return SUSPICIOUS_PATH_RE.test(u.hostname + u.pathname + u.search);
    }

    function shouldBlockPopup(url, target) {
        if (!CONFIG.blockAutomaticPopups) return false;

        const t = String(target || '').toLowerCase();
        if (t === '_self' || t === '_top' || t === '_parent') return false;

        const u = parseURL(url);
        const activated = hasRecentUserGesture();

        if (u && CONFIG.blockSuspiciousPopups && isSuspiciousURL(u.href)) {
            return true;
        }

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

    let popupGuardInstalled = false;
    let originalWindowOpen = null;

    function installPopupGuard() {
        if (popupGuardInstalled) return;
        popupGuardInstalled = true;

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
                    warn('window.open failed:', e);
                    return null;
                }
            };
        } catch (e) {
            warn('Could not override window.open:', e);
        }
    }

    /* ------------------------------------------------------------
       Video playback
       ------------------------------------------------------------ */

    const seenVideos = new WeakSet();

    function fixVideoPlayback(root) {
        if (!CONFIG.unmuteVideos && !CONFIG.forceVideoControls) return;

        // Leave these native-player hosts alone. Numeric codes only.
        if (CODE === 2 || CODE === 9) return;

        queryAll(root, 'video').forEach(video => {
            if (seenVideos.has(video)) return;
            seenVideos.add(video);

            try {
                if (CONFIG.forceVideoControls && !video.controls) {
                    video.controls = true;
                }
            } catch (e) {}

            if (!CONFIG.unmuteVideos) return;

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

    /* ------------------------------------------------------------
       Hidden video iframe reveal
       ------------------------------------------------------------ */

    const seenIframes = new WeakSet();

    function isVideoLikeIframe(iframe) {
        if (!iframe) return false;

        const src = iframe.getAttribute('src') || iframe.src || '';
        if (!src) return false;

        const hasFullscreen =
            iframe.hasAttribute('allowfullscreen') ||
            /allowfullscreen/i.test(iframe.getAttribute('allow') || '');

        // Generic detection only. No target host names are exposed.
        return hasFullscreen || /(?:embed|player|stream|video)/i.test(src);
    }

    function fixVideoIframes(root) {
        if (!CONFIG.revealHiddenVideoIframes) return;

        queryAll(root, 'iframe').forEach(iframe => {
            if (seenIframes.has(iframe)) return;
            if (!isVideoLikeIframe(iframe)) return;

            // Do not touch UI containers.
            if (iframe.closest(
                'nav, header, footer, form, button, ' +
                '[role="dialog"], [role="menu"], [aria-modal="true"]'
            )) {
                return;
            }

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
                    log('Revealing video iframe:', iframe.src || iframe.getAttribute('src'));

                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';

                    if (rect.width < 2) iframe.style.width = '100%';
                    if (rect.height < 2) iframe.style.height = '100%';
                }
            } catch (e) {}
        });
    }

    /* ------------------------------------------------------------
       Main scan
       ------------------------------------------------------------ */

    let isOptimizing = false;

    function optimizePage(root) {
        if (isOptimizing) return;
        if (isCloudflareChallenge()) return;

        isOptimizing = true;

        try {
            const target = root || document;

            fixVideoPlayback(target);
            fixVideoIframes(target);
        } catch (e) {
            warn('Optimization scan failed:', e);
        } finally {
            isOptimizing = false;
        }
    }

    function processAddedNode(node) {
        if (!node) return;

        if (node.nodeType === 1) {
            if (node.tagName === 'VIDEO') {
                fixVideoPlayback(node);
            } else if (node.tagName === 'IFRAME') {
                fixVideoIframes(node);
            } else if (node.querySelector && node.querySelector('video, iframe')) {
                fixVideoPlayback(node);
                fixVideoIframes(node);
            }
        } else if (node.nodeType === 11) {
            fixVideoPlayback(node);
            fixVideoIframes(node);
        }
    }

    let scanTimer = null;

    function scheduleLightScan(delay) {
        if (scanTimer) return;

        scanTimer = setTimeout(() => {
            scanTimer = null;

            if (isCloudflareChallenge()) {
                scheduleLightScan(2000);
                return;
            }

            optimizePage(document);
        }, typeof delay === 'number' ? delay : 400);
    }

    /* ------------------------------------------------------------
       Observers / SPA navigation
       ------------------------------------------------------------ */

    function installObservers() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    processAddedNode(node);
                }
            }
        });

        try {
            observer.observe(document.documentElement || document, {
                childList: true,
                subtree: true
            });
        } catch (e) {
            warn('MutationObserver failed:', e);
        }

        let lastUrl = location.href;

        const checkUrl = () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;

                if (CONFIG.rescanOnSpaNavigation) {
                    scheduleLightScan(200);
                }
            }
        };

        window.addEventListener('popstate', checkUrl, true);
        window.addEventListener('hashchange', checkUrl, true);

        setInterval(checkUrl, 1000);

        ['pushState', 'replaceState'].forEach(method => {
            const original = history[method];
            if (!original || original.__uwoWrapped) return;

            const wrapper = function () {
                const result = original.apply(this, arguments);
                checkUrl();

                if (CONFIG.rescanOnSpaNavigation) {
                    scheduleLightScan(200);
                }

                return result;
            };

            wrapper.__uwoWrapped = true;

            try {
                history[method] = wrapper;
            } catch (e) {}
        });
    }

    /* ------------------------------------------------------------
       Bootstrap
       ------------------------------------------------------------ */

    let bootstrapped = false;

    function bootstrap() {
        if (bootstrapped) {
            scheduleLightScan(0);
            return;
        }

        bootstrapped = true;

        installPopupGuard();
        installObservers();

        scheduleLightScan(0);
        setTimeout(() => scheduleLightScan(0), 1000);
        setTimeout(() => scheduleLightScan(0), 3000);

        window.addEventListener('load', () => {
            scheduleLightScan(0);
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            whenCloudflarePasses(bootstrap);
        }, { once: true });
    } else {
        whenCloudflarePasses(bootstrap);
    }

    window.addEventListener('load', () => {
        whenCloudflarePasses(() => scheduleLightScan(0));
    }, { once: true });

})();

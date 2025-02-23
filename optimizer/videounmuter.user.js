// ==UserScript==
// @name         Auto Unmute Videos (with Iframe Injection)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automatically unmutes all videos on a page, including those in iframes, by injecting scripts where possible.
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function unmuteVideo(video) {
        if (video && video.muted) {
            video.muted = false;
            video.volume = 1.0;
        }
    }

    function processVideos() {
        document.querySelectorAll('video').forEach(unmuteVideo);
    }

    function injectScriptIntoIframe(iframe) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc) return;

            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    document.querySelectorAll('video').forEach(video => {
                        video.muted = false;
                        video.volume = 1.0;
                    });

                    const observer = new MutationObserver(() => {
                        document.querySelectorAll('video').forEach(video => {
                            video.muted = false;
                            video.volume = 1.0;
                        });
                    });

                    observer.observe(document.body, { childList: true, subtree: true });
                })();
            `;

            doc.head.appendChild(script);
        } catch (e) {
            console.warn("Cannot inject script into iframe due to CORS:", e);
        }
    }

    function processIframes() {
        document.querySelectorAll('iframe').forEach(injectScriptIntoIframe);
    }

    function observeMutations() {
        const observer = new MutationObserver(() => {
            processVideos();
            processIframes();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Run on initial page load
    processVideos();
    processIframes();
    observeMutations();
})();

// ==UserScript==
// @name         Auto Unmute Videos (User-Control Friendly)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Automatically unmutes all videos on a page, including iframes, but allows manual muting by the user.
// @author       You
// @match        *://*/*
// @grant        none
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/videounmuter.user.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function unmuteVideo(video) {
        if (video && video.muted) {
            if (!video.dataset.userMuted) {
                video.muted = false;
                video.volume = 1.0;
            }
        }
    }

    function trackUserMute(video) {
        video.addEventListener('volumechange', function () {
            if (video.muted) {
                video.dataset.userMuted = "true"; // Mark that the user muted it
            } else {
                delete video.dataset.userMuted; // Remove the flag if unmuted
            }
        });
    }

    function processVideos() {
        document.querySelectorAll('video').forEach(video => {
            unmuteVideo(video);
            trackUserMute(video);
        });
    }

    function injectScriptIntoIframe(iframe) {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc) return;

            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    function unmuteVideo(video) {
                        if (video && video.muted) {
                            if (!video.dataset.userMuted) {
                                video.muted = false;
                                video.volume = 1.0;
                            }
                        }
                    }

                    function trackUserMute(video) {
                        video.addEventListener('volumechange', function () {
                            if (video.muted) {
                                video.dataset.userMuted = "true"; // Mark that the user muted it
                            } else {
                                delete video.dataset.userMuted; // Remove the flag if unmuted
                            }
                        });
                    }

                    function processVideos() {
                        document.querySelectorAll('video').forEach(video => {
                            unmuteVideo(video);
                            trackUserMute(video);
                        });
                    }

                    processVideos();

                    const observer = new MutationObserver(() => {
                        processVideos();
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

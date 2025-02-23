// ==UserScript==
// @name         Auto Unmute Videos (User-Control Friendly)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically unmutes all videos, but lets you mute manually.
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function unmuteVideo(video) {
        if (video && video.muted && !video.dataset.userMuted) {
            video.muted = false;
            video.volume = 1.0;
        }
    }

    function trackUserMute(video) {
        video.addEventListener('volumechange', function () {
            if (video.muted) {
                video.dataset.userMuted = "true"; // User muted manually
            } else {
                delete video.dataset.userMuted; // Remove flag if unmuted
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
            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    function unmuteVideo(video) {
                        if (video && video.muted && !video.dataset.userMuted) {
                            video.muted = false;
                            video.volume = 1.0;
                        }
                    }

                    function trackUserMute(video) {
                        video.addEventListener('volumechange', function () {
                            if (video.muted) {
                                video.dataset.userMuted = "true";
                            } else {
                                delete video.dataset.userMuted;
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

            iframe.onload = function () {
                if (iframe.contentDocument) {
                    iframe.contentDocument.head.appendChild(script);
                }
            };
        } catch (e) {
            console.warn("Cannot inject into iframe:", e);
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

    processVideos();
    processIframes();
    observeMutations();
})();

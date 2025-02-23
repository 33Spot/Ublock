// ==UserScript==
// @name         Auto Unmute Videos (Final Fix)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Automatically unmutes videos but allows user muting.
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
            console.log("Unmuted video:", video);
        }
    }

    function trackUserMute(video) {
        setTimeout(() => {
            video.addEventListener('volumechange', function () {
                if (video.muted) {
                    video.dataset.userMuted = "true"; // Only set after initial load
                    console.log("User manually muted video:", video);
                } else {
                    delete video.dataset.userMuted;
                    console.log("User unmuted video:", video);
                }
            });
        }, 2000); // Wait 2s to avoid misdetecting initial muting
    }

    function processVideos() {
        document.querySelectorAll('video').forEach(video => {
            unmuteVideo(video);
            trackUserMute(video);
        });
    }

    function observeMutations() {
        const observer = new MutationObserver(() => {
            processVideos();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    processVideos();
    observeMutations();
})();

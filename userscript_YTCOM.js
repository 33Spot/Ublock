// ==UserScript==
// @name         YouTube Optimizer (Final Optimized Version)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Blocks ads & tracking while ensuring smooth video playback on YouTube.
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[YouTube Optimizer] Script started...");

    // 🔹 **Allow only necessary YouTube scripts (fix UI elements)**
    function whitelistYouTubeScripts() {
        document.querySelectorAll("script").forEach(script => {
            const src = script.src || "";

            // ✅ **Allow all essential YouTube scripts**
            if (
                src.includes("player") ||
                src.includes("ytcfg") ||
                src.includes("webcomponents") ||
                src.includes("custom-elements") ||
                src.includes("ytstatic.com") ||
                src.includes("googlevideo.com") ||
                src.includes("youtube.com") ||
                src.includes("ytimg.com") ||
                src.includes("/youtubei/v1/next") ||
                src.includes("/youtubei/v1/player") ||
                src.includes("/youtubei/v1/browse")
            ) {
                console.log("[YouTube Optimizer] Keeping script:", src);
                return;
            }

            // ❌ **Block tracking & ads**
            if (
                src.includes("doubleclick.net") ||
                src.includes("googletagmanager.com") ||
                src.includes("ad_status.js") ||
                src.includes("cookielaw.org") ||
                src.includes("gemius.pl")
            ) {
                console.log("[YouTube Optimizer] Blocking tracking script:", src);
                script.remove();
            }
        });
    }

    // 🔹 **Ensure all YouTube AJAX requests work properly**
    function allowYouTubeRequests() {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (
                url.includes("youtube.com") ||
                url.includes("ytimg.com") ||
                url.includes("googlevideo.com") ||
                url.includes("googleapis.com") ||
                url.includes("/youtubei/v1/next") ||
                url.includes("/youtubei/v1/player") ||
                url.includes("/youtubei/v1/browse")
            ) {
                console.log("[YouTube Optimizer] Allowing video request:", url);
            } else {
                console.log("[YouTube Optimizer] Blocking tracking request:", url);
                return;
            }
            return originalOpen.apply(this, arguments);
        };
    }

    // 🔹 **Fix Up Next Video Clicking**
    function fixUpNextVideoClick() {
        let lastUrl = location.href;

        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[YouTube Optimizer] Detected video change, ensuring new video loads...");
                lastUrl = location.href;
                forceVideoLoad();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Force video to properly load when clicked**
    function forceVideoLoad() {
        setTimeout(() => {
            let player = document.querySelector("video");
            if (player) {
                console.log("[YouTube Optimizer] Reloading video...");
                player.load();
                player.play();
            } else {
                console.log("[YouTube Optimizer] Video player not found, retrying...");
                setTimeout(forceVideoLoad, 1000);
            }
        }, 1000);
    }

    // 🔹 **Fix First Video in List Not Loading Properly**
    function fixFirstVideoLoading() {
        setTimeout(() => {
            let firstVideo = document.querySelector("ytd-rich-item-renderer, ytd-video-renderer");
            if (firstVideo) {
                console.log("[YouTube Optimizer] Ensuring first video in the list is loaded:", firstVideo);
                firstVideo.scrollIntoView({ behavior: "smooth" });
            }
        }, 1000);
    }

    // 🔹 **Remove ads but keep all videos functional**
    function removeAds() {
        document.querySelectorAll(".ytp-ad-module, .ad-showing, .ytp-ad-text, .ytd-ad-slot-renderer").forEach(ad => {
            console.log("[YouTube Optimizer] Removing ad:", ad);
            ad.remove();
        });
    }

    // 🔹 **Fix UI Elements Not Working (MutationObserver Fix)**
    function fixUIElements() {
        let observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName.includes("sqrx")) {
                            console.log("[YouTube Optimizer] Fixing UI element:", node);
                            node.removeAttribute("class");
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("[YouTube Optimizer] Monitoring UI elements.");
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        allowYouTubeRequests();
        whitelistYouTubeScripts();
        fixUpNextVideoClick();
        fixFirstVideoLoading();
        fixUIElements();
        removeAds();
    });

})();


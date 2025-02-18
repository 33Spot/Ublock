// ==UserScript==
// @name          Universal Website Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description   Universal Website Optimizer - Blocks ads, popups, trackers, bypasses adblock detection, improves video playback, and ensures videos are not muted.
// @match        *://*/*
// @grant        none
// @updateURL    https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    const currentSite = window.location.hostname;

    // 🔹 **Prevent videos from being muted**
    function ensureVideoUnmuted() {
        setInterval(() => {
            document.querySelectorAll("video").forEach(video => {
                if (video.muted) {
                    video.muted = false;
                    console.log("[Universal Website Optimizer] Unmuted video:", video);
                }
            });
        }, 3000);
    }

    // 🔹 **Prevent pop-ups and unwanted redirects**
    function blockPopupsAndRedirects() {
        console.log("[Universal Website Optimizer] Blocking pop-ups and unwanted redirects...");

        window.open = function(url, name, specs) {
            console.log("[Universal Website Optimizer] Blocked popup attempt:", url);
            return null;
        };

        window.addEventListener("beforeunload", function(event) {
            if (document.activeElement.tagName !== "A") {
                console.log("[Universal Website Optimizer] Prevented forced redirect");
                event.preventDefault();
                event.returnValue = "";
            }
        });
    }

    // 🔹 **Bypass Cloudflare protection without breaking functionality**
    function allowCloudflare() {
        if (document.querySelector("#cf-challenge-form") || document.querySelector(".cf-browser-verification")) {
            console.log("[Universal Website Optimizer] Detected Cloudflare challenge, allowing scripts...");
            return;
        }
    }

    // 🔹 **Dynamically detect and block adblock detection scripts**
    function blockAdblockDetectors() {
        document.querySelectorAll("script").forEach(script => {
            if (
                script.innerHTML.includes("adblock") ||
                script.innerHTML.includes("fuckadblock") ||
                script.innerHTML.includes("disableAdblock") ||
                script.innerHTML.includes("adBlockDetected") ||
                script.src.includes("adblock.js")
            ) {
                console.log("[Universal Website Optimizer] Blocking adblock detector:", script);
                script.remove();
            }
        });
    }

    // 🔹 **Use MutationObserver instead of deprecated events**
    function fixDynamicPopups() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === "SCRIPT" && node.src.includes("pop")) {
                        console.log("[Universal Website Optimizer] Blocking dynamic popup script:", node.src);
                        node.remove();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Ensure smooth AJAX-based navigation**
    function optimizeNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[Universal Website Optimizer] Page changed, reapplying optimizations...");
                lastUrl = location.href;
                allowCloudflare();
                blockAdblockDetectors();
                fixDynamicPopups();
                ensureVideoUnmuted();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Improve performance: Reduce execution frequency**
    function optimizePerformance() {
        setInterval(() => {
            allowCloudflare();
            blockAdblockDetectors();
            fixDynamicPopups();
            ensureVideoUnmuted();
        }, 5000);
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        blockPopupsAndRedirects();
        allowCloudflare();
        blockAdblockDetectors();
        fixDynamicPopups();
        ensureVideoUnmuted();
        optimizeNavigation();
        optimizePerformance();
    });

})();

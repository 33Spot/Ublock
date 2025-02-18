// ==UserScript==
// @name          Universal Website Optimizer
// @namespace     http://tampermonkey.net/
// @version       2.7
// @description   Optimizes websites by blocking pop-ups, unmuting videos, and bypassing anti-adblock scripts.
// @match         *://*/*
// @grant         none
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    const currentSite = window.location.hostname;

    // 🔹 **Fix Mega.nz issue by skipping pop-up removal on Mega**
    function isMegaSite() {
        return currentSite.includes("mega.nz");
    }

    // 🔹 **Prevent pop-ups and redirections, but not on Mega**
    function blockPopupsAndRedirects() {
        if (isMegaSite()) return; // Don't run on Mega

        console.log("[Universal Website Optimizer] Blocking pop-ups and unwanted redirects...");

        // Block pop-up tricks
        window.open = function (url, name, specs) {
            console.log("[Universal Website Optimizer] Blocked popup attempt:", url);
            return null;
        };

        // Prevent forced redirects but allow normal navigation
        window.addEventListener('beforeunload', (event) => {
            if (document.activeElement.tagName !== 'A') {
                event.stopImmediatePropagation();
            }
        }, true);
    }

    // 🔹 **Dynamically detect and block aggressive anti-adblock scripts**
    function blockAdblockDetectors() {
        const adblockKeys = ["adblock", "fuckadblock", "disableAdblock", "adBlockDetected", "BlockAdBlock", "isAdBlockActive", "canRunAds", "canShowAds"];
        document.querySelectorAll("script").forEach(script => {
            adblockKeys.forEach(key => {
                if (script.innerHTML.includes(key) || script.src.includes(key)) {
                    console.log("[Universal Website Optimizer] Blocking adblock detector:", script);
                    script.remove();
                }
            });
        });
    }

    // 🔹 **Ensure videos start unmuted but keep user controls**
    function fixVideoPlayback() {
        setInterval(() => {
            document.querySelectorAll("video").forEach(video => {
                if (video.muted) {
                    video.muted = false;
                    console.log("[Universal Website Optimizer] Unmuted video:", video);
                }
                video.controls = true; // Keep user controls intact
            });
        }, 3000);
    }

    // 🔹 **Ensure all iframes containing video embeds are visible**
    function fixVideoIframes() {
        document.querySelectorAll("iframe").forEach(iframe => {
            if (iframe.src.includes("embed") || iframe.src.includes("video")) {
                console.log("[Universal Website Optimizer] Fixing iframe visibility...");
                iframe.style.display = "block";
                iframe.style.opacity = "1";
                iframe.style.position = "relative";
                iframe.style.zIndex = "1000";
            }
        });
    }

    // 🔹 **Remove pop-ups, overlays, and cookie banners (except on Mega)**
    function removePopups() {
        if (isMegaSite()) return; // Skip pop-up removal on Mega

        const elementsToRemove = [
            ".popup", ".overlay", ".cookie-consent", ".ad-banner", "#ad-container",
            "[id*='modal']", "[class*='modal']", "[class*='popup']", "[id*='popup']"
        ];
        elementsToRemove.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                console.log("[Universal Website Optimizer] Removing:", selector);
                element.remove();
            });
        });
    }

    // 🔹 **Ensure smooth AJAX-based navigation**
    function optimizeNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[Universal Website Optimizer] Page changed, reapplying optimizations...");
                lastUrl = location.href;
                blockAdblockDetectors();
                removePopups();
                fixVideoPlayback();
                fixVideoIframes();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        blockPopupsAndRedirects();
        blockAdblockDetectors();
        removePopups();
        fixVideoPlayback();
        fixVideoIframes();
        optimizeNavigation();
    });

})();

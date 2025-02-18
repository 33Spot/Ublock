// ==UserScript==
// @name          Universal Website Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description   Optimizes websites by blocking pop-ups, unmuting videos, and bypassing anti-adblock scripts.
// @match        *://*/*
// @grant        none
// @updateURL    https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    // 🔹 **Bypass Cloudflare protection without breaking functionality**
    function allowCloudflare() {
        if (document.querySelector("#cf-challenge-form") || document.querySelector(".cf-browser-verification")) {
            console.log("[Universal Website Optimizer] Detected Cloudflare challenge, allowing scripts...");
            return;
        }
    }

    // 🔹 **Block aggressive anti-adblock scripts**
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

    // 🔹 **Prevent forced redirects while allowing manual navigation**
    function refineRedirectBlocking() {
        window.addEventListener('beforeunload', (event) => {
            if (event.target.activeElement.tagName !== 'A') {
                event.stopImmediatePropagation();
            }
        }, true);
    }

    // 🔹 **Ensure videos are visible, unmuted, and playable**
    function fixVideoPlayback() {
        setInterval(() => {
            document.querySelectorAll("video, .xp-Player-video, iframe[src*='stream.freedisc.pl']").forEach(video => {
                console.log("[Universal Website Optimizer] Ensuring video stays visible and playing...");
                
                video.style.display = "block";
                video.style.opacity = "1";
                video.style.position = "relative";
                video.style.zIndex = "1000";
                video.muted = false; // Ensure videos start unmuted
                
                let overlays = document.querySelectorAll(".xp-Player-layer, .ad-overlay, .popup, .video-blocker");
                overlays.forEach(el => {
                    console.log("[Universal Website Optimizer] Removing overlay:", el);
                    el.remove();
                });
            });
        }, 3000);
    }

    // 🔹 **Fix cross-origin iframe issues (e.g., vidlink.pro videos)**
    function fixCrossOriginFrames() {
        document.querySelectorAll("iframe").forEach(iframe => {
            if (iframe.src.includes("vidlink.pro")) {
                console.log("[Universal Website Optimizer] Fixing cross-origin frame visibility:", iframe);
                iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
            }
        });
    }

    // 🔹 **Remove pop-ups, overlays, and cookie banners**
    function removePopups() {
        const elementsToRemove = [".popup", ".overlay", ".cookie-consent", ".ad-banner", "#ad-container", "[id*='modal']", "[class*='modal']", "[class*='popup']", "[id*='popup']"];
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
                fixCrossOriginFrames();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        allowCloudflare();
        blockAdblockDetectors();
        removePopups();
        refineRedirectBlocking();
        fixVideoPlayback();
        fixCrossOriginFrames();
        optimizeNavigation();
    });

})();

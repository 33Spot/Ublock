// ==UserScript==
// @name         Universal Website Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Universal Website Optimizer
// @match        *://*/*
// @exclude      *://example.com/*
// @exclude      *://*.example.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Universal Video Fixer] Script started...");

    const currentSite = window.location.hostname;

    // 🔹 **Allow necessary video scripts & bypass ad-block detection**
    function whitelistVideoScripts() {
        document.querySelectorAll("script").forEach(script => {
            const src = script.src || "";

            // ✅ Keep essential video player scripts
            if (
                src.includes("hls.js") ||
                src.includes("video.js") ||
                src.includes("player") ||
                src.includes("stream") ||
                src.includes("xp-Player") ||
                src.includes("nosofiles.com")
            ) {
                console.log("[Universal Video Fixer] Keeping video script:", src);
                return;
            }

            // ❌ Block tracking & ads (BUT DON'T BLOCK VIDEO PLAYER SCRIPTS)
            if (
                src.includes("doubleclick.net") ||
                src.includes("googletagmanager.com") ||
                src.includes("ads.js") ||
                src.includes("facebook.net") ||
                src.includes("cookie-consent") ||
                src.includes("track") ||
                src.includes("recaptcha") ||
                src.includes("adservice") ||
                src.includes("popunder1000.js")  // Ad script causing issues
            ) {
                console.log("[Universal Video Fixer] Blocking tracking script:", src);
                script.remove();
            }
        });

        // 🔹 **Fix missing variables that cause errors**
        if (typeof kot_ajax_var === "undefined") {
            window.kot_ajax_var = {}; // Fake object to bypass errors
            console.log("[Universal Video Fixer] Bypassing missing kot_ajax_var.");
        }
        if (typeof adverts_block === "undefined") {
            window.adverts_block = {}; // Fake object to prevent video stop
            console.log("[Universal Video Fixer] Bypassing missing adverts_block.");
        }
    }

    // 🔹 **Ensure all videos are visible and playable**
    function fixVideoPlayback() {
        setInterval(() => {
            document.querySelectorAll("video, .xp-Player-video").forEach(video => {
                console.log("[Universal Video Fixer] Ensuring video stays visible and playing...");

                // ✅ Ensure the video is displayed properly
                video.style.display = "block";
                video.style.opacity = "1";
                video.style.position = "relative";
                video.style.zIndex = "1000";

                // ✅ Remove overlays blocking video playback
                let overlays = document.querySelectorAll(".xp-Player-layer, .ad-overlay, .popup, .video-blocker");
                overlays.forEach(el => {
                    console.log("[Universal Video Fixer] Removing overlay:", el);
                    el.remove();
                });

                // ✅ Reload video if it stops after 3 seconds
                if (video.readyState < 3) {
                    console.log("[Universal Video Fixer] Reloading video...");
                    video.load();
                    video.play();
                }

                // ✅ Restore missing video controls
                video.controls = true;
                video.setAttribute("controls", "controls");
            });
        }, 3000);
    }

    // 🔹 **Prevent scripts from stopping video after 3 seconds**
    function preventStopAfter3Seconds() {
        if (currentSite.includes("punishworld.com")) {
            setInterval(() => {
                let video = document.querySelector(".xp-Player-video");
                if (video) {
                    console.log("[Universal Video Fixer] Preventing video from stopping...");
                    video.play();
                }
            }, 2000); // Keep checking every 2 seconds to keep it running
        }
    }

    // 🔹 **Ensure all iframes containing video embeds are visible**
    function fixVideoIframes() {
        document.querySelectorAll("iframe").forEach(iframe => {
            if (iframe.src.includes("embed") || iframe.src.includes("video")) {
                console.log("[Universal Video Fixer] Fixing iframe visibility...");
                iframe.style.display = "block";
                iframe.style.opacity = "1";
                iframe.style.position = "relative";
                iframe.style.zIndex = "1000";
            }
        });
    }

    // 🔹 **Remove pop-ups, overlays, and cookie banners**
    function removePopups() {
        const elementsToRemove = [
            ".popup", ".overlay", ".cookie-consent", ".ad-banner", "#ad-container",
            "[id*='modal']", "[class*='modal']", "[class*='popup']", "[id*='popup']"
        ];
        elementsToRemove.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                console.log("[Universal Video Fixer] Removing:", selector);
                element.remove();
            });
        });
    }

    // 🔹 **Ensure smooth AJAX-based navigation**
    function optimizeNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[Universal Video Fixer] Page changed, reapplying optimizations...");
                lastUrl = location.href;
                whitelistVideoScripts();
                removePopups();
                fixVideoPlayback();
                fixVideoIframes();
                preventStopAfter3Seconds();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        whitelistVideoScripts();
        removePopups();
        fixVideoPlayback();
        fixVideoIframes();
        preventStopAfter3Seconds();
        optimizeNavigation();
    });

})();


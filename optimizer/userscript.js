// ==UserScript==
// @name         Universal Video Fixer (Freedisc.pl Added)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Fixes video playback issues on multiple sites, now including Freedisc.pl.
// @match        *://*/*
// @exclude      *://example.com/*
// @exclude      *://*.example.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Universal Video Fixer] Script started...");

    const currentSite = window.location.hostname;

    // 🔹 **Whitelist necessary video scripts**
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
                src.includes("nosofiles.com") ||  
                src.includes("stream.freedisc.pl") // Freedisc video host
            ) {
                console.log("[Universal Video Fixer] Keeping video script:", src);
                return;
            }

            // ❌ Block tracking & ad scripts
            if (
                src.includes("doubleclick.net") ||
                src.includes("googletagmanager.com") ||
                src.includes("ads.js") ||
                src.includes("facebook.net") ||
                src.includes("cookie-consent") ||
                src.includes("track") ||
                src.includes("recaptcha") ||
                src.includes("adservice")
            ) {
                console.log("[Universal Video Fixer] Blocking tracking script:", src);
                script.remove();
            }
        });
    }

    // 🔹 **Ensure all videos are visible and playable**
    function fixVideoPlayback() {
        setInterval(() => {
            document.querySelectorAll("video, .xp-Player-video, iframe[src*='stream.freedisc.pl']").forEach(video => {
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

                // ✅ Reload video if it stops playing
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

    // 🔹 **Ensure Freedisc.pl videos play correctly**
    function fixFreediscVideos() {
        if (currentSite.includes("freedisc.pl")) {
            console.log("[Universal Video Fixer] Applying Freedisc.pl fixes...");

            // ✅ Ensure MP4 video links load
            document.querySelectorAll("a[href*='stream.freedisc.pl']").forEach(link => {
                link.setAttribute("target", "_blank"); // Open in a new tab
                console.log("[Universal Video Fixer] Allowing Freedisc MP4 link:", link.href);
            });

            // ✅ Remove outdated Flash player elements
            document.querySelectorAll("embed[src*='player.swf'], object[data*='player.swf']").forEach(flashPlayer => {
                console.log("[Universal Video Fixer] Removing outdated Flash player:", flashPlayer);
                flashPlayer.remove();
            });
        }
    }

    // 🔹 **Ensure all iframes containing video embeds are visible**
    function fixVideoIframes() {
        document.querySelectorAll("iframe").forEach(iframe => {
            if (iframe.src.includes("embed") || iframe.src.includes("video") || iframe.src.includes("stream.freedisc.pl")) {
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
                fixFreediscVideos();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        whitelistVideoScripts();
        removePopups();
        fixVideoPlayback();
        fixVideoIframes();
        fixFreediscVideos();
        optimizeNavigation();
    });

})();

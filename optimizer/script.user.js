// ==UserScript==
// @name          Universal Website Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description   Universal Website Optimizer
// @match        *://*/*
// @exclude      *://example.com/*
// @exclude      *://*.example.com/*
// @grant        none
// @updateURL    https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    const currentSite = window.location.hostname;

    // 🔹 **Prevent pop-ups and redirections**
    function blockPopupsAndRedirects() {
        console.log("[Universal Website Optimizer] Blocking pop-ups and unwanted redirects...");

        // Block `window.open` to prevent pop-ups
        window.open = function(url, name, specs) {
            console.log("[Universal Website Optimizer] Blocked popup attempt:", url);
            return null;
        };

        // Prevent unwanted location changes
        Object.defineProperty(window, 'location', {
            configurable: false,
            enumerable: true,
            get: function() {
                return window._location;
            },
            set: function(url) {
                console.log("[Universal Website Optimizer] Blocked forced redirect to:", url);
            }
        });

        // Remove event listeners that trigger pop-ups
        document.addEventListener("mousedown", function(event) {
            let target = event.target;
            if (target.tagName === "A" && target.href.includes("ad") || target.href.includes("pop")) {
                event.preventDefault();
                console.log("[Universal Website Optimizer] Prevented ad popup click:", target.href);
            }
        }, true);
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

        document.querySelectorAll("div, span, iframe").forEach(el => {
            if (
                el.id.includes("adblock") ||
                el.className.includes("adblock") ||
                el.innerText.includes("disable adblock")
            ) {
                console.log("[Universal Website Optimizer] Removing adblock detection element:", el);
                el.remove();
            }
        });
    }

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
                src.includes("stream.freedisc.pl") || // Freedisc video host
                src.includes("fmovies-hd.to") // FMovies video player
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

                video.style.display = "block";
                video.style.opacity = "1";
                video.style.position = "relative";
                video.style.zIndex = "1000";

                let overlays = document.querySelectorAll(".xp-Player-layer, .ad-overlay, .popup, .video-blocker");
                overlays.forEach(el => {
                    console.log("[Universal Video Fixer] Removing overlay:", el);
                    el.remove();
                });

                if (video.readyState < 3) {
                    console.log("[Universal Video Fixer] Reloading video...");
                    video.load();
                    video.play();
                }

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
        blockPopupsAndRedirects();
        whitelistVideoScripts();
        blockAdblockDetectors();
        removePopups();
        fixVideoPlayback();
        fixVideoIframes();
        fixFreediscVideos();
        optimizeNavigation();
    });

})();

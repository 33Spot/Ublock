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

    // 🔹 **Prevent script from breaking GitHub and similar sites**
    const safeSites = ["github.com", "gitlab.com", "bitbucket.org"];
    if (safeSites.includes(currentSite)) {
        console.log("[Universal Website Optimizer] Detected safe site, disabling modifications...");
        return;
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
                src.includes("stream.freedisc.pl") ||
                src.includes("fmovies-hd.to")
            ) {
                console.log("[Universal Website Optimizer] Keeping video script:", src);
                return;
            }

            // ❌ Block tracking & ad scripts
            if (
                !script.src.includes("cloudflare.com") && // Allow Cloudflare
                (src.includes("doubleclick.net") ||
                src.includes("googletagmanager.com") ||
                src.includes("ads.js") ||
                src.includes("facebook.net") ||
                src.includes("cookie-consent") ||
                src.includes("track") ||
                src.includes("recaptcha") ||
                src.includes("adservice"))
            ) {
                console.log("[Universal Website Optimizer] Blocking tracking script:", src);
                script.remove();
            }
        });
    }

    // 🔹 **Ensure smooth navigation without breaking Cloudflare challenges**
    function optimizeNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[Universal Website Optimizer] Page changed, reapplying optimizations...");
                lastUrl = location.href;
                allowCloudflare();
                whitelistVideoScripts();
                blockAdblockDetectors();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Improve performance: Reduce execution frequency**
    function optimizePerformance() {
        setInterval(() => {
            allowCloudflare();
            whitelistVideoScripts();
            blockAdblockDetectors();
        }, 5000); // Run every 5 seconds to minimize CPU usage
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        allowCloudflare();
        whitelistVideoScripts();
        blockAdblockDetectors();
        optimizeNavigation();
        optimizePerformance();
    });

})();

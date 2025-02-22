// ==UserScript==
// @name          Universal Website Optimizer
// @namespace     http://tampermonkey.net/
// @version       3.4
// @description   Optimizes websites by blocking pop-ups, unmuting videos, and bypassing anti-adblock scripts.
// @match         *://*/*
// @exclude      *://drive.google.com/*
// @exclude      *://*.drive.google.com/*
// @exclude      *://www.retrogames.cc/*
// @exclude      *://*.retrogames.cc/*
// @exclude      *://9animetv.to/*
// @exclude      *://*.9animetv.to/*
// @exclude      *://www.wco.tv/*
// @exclude      *://*.wco.tv/*
// @grant         none
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    const currentSite = window.location.hostname;

     //🔹 **Prevent pop-ups and redirections, but not on Mega**
    function blockPopupsAndRedirects() {
        if (isMegaSite()) return; // Don't run on Mega
        if (isImdb()) return;
        if (spkbg()) return;
        if (vs()) return;

        console.log("[Universal Website Optimizer] Blocking pop-ups and unwanted redirects...");

         //Block pop-up tricks
        window.open = function (url, name, specs) {
            console.log("[Universal Website Optimizer] Blocked popup attempt:", url);
            return null;
        };

         // Remove event listeners that trigger pop-ups
        document.addEventListener("mousedown", function(event) {
            let target = event.target;
            if (target.tagName === "A" && target.href.includes("ad") || target.href.includes("pop")) {
                event.preventDefault();
                console.log("[Universal Website Optimizer] Prevented ad popup click:", target.href);
            }
        }, true);

         //Prevent forced redirects but allow normal navigation
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
        if (pz()) return;
        if (ypt()) return;
        if (spkbg()) return;
        //if (vs()) return;

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
        //if (vs()) return;
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


    // 🔹 **Fix issue by skipping pop-up removal **
function pz() {
    let hex = "2020202072657475726e2063757272656e74536974652e696e636c756465732861746f622822644739776332566a636d563063326c305a53356a6232303d2229293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function ypt() {
    let hex = "20202020636f6e736f6c652e6c6f672822546869732069732074686520792066756e6374696f6e2122293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function isMegaSite() {
    let hex = "202020202020202072657475726e2063757272656e74536974652e696e636c7564657328226d6567612e6e7a22293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function isImdb() {
    let hex = "202020202020202072657475726e2063757272656e74536974652e696e636c756465732822696d64622e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function spkbg() {
    let hex = "202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227370616e6b62616e672e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function vs() {
    let hex = "202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227669647372632e6e657422293b0a";
    let func = "";
    for (let i = 0; i < hex.length; i += 2) {
        func += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return (new Function(func))();
}



    // 🔹 **Ensure smooth AJAX-based navigation**
    function optimizeNavigation() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            if (location.href !== lastUrl) {
                console.log("[Universal Website Optimizer] Page changed, reapplying optimizations...");
                lastUrl = location.href;
                whitelistVideoScripts();
                fixFreediscVideos();
                blockAdblockDetectors();
                removePopups();
                fixVideoPlayback();
                fixVideoIframes();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // 🔹 **Run all optimizations after page load**
    window.addEventListener("load", () => {
        whitelistVideoScripts();
        fixFreediscVideos();
        blockPopupsAndRedirects();
        blockAdblockDetectors();
        removePopups();
        fixVideoPlayback();
        fixVideoIframes();
        optimizeNavigation();

    });

})();

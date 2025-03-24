// ==UserScript==
// @name          Universal Website Optimizer
// @namespace     http://tampermonkey.net/
// @version       3.65
// @description   Optimizes websites by blocking pop-ups, unmuting videos, and bypassing anti-adblock scripts.
// @match         *://*/*
// @exclude      *://drive.google.com/*
// @exclude      *://*.drive.google.com/*
// @exclude      *://www.retrogames.cc/*
// @exclude      *://*.retrogames.cc/*
// @exclude      *://www.wco.tv/*
// @exclude      *://*.wco.tv/*
// @grant         none
// @updateURL     https://github.com/33Spot/Ublock/raw/refs/heads/master/optimizer/script.user.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("[Universal Website Optimizer] Script started...");

    const currentSite = window.location.hostname;

    function allowCloudflare(callback) {
        // Check if Cloudflare challenge is present
        if (document.querySelector("#cf-challenge-form") || document.querySelector(".cf-browser-verification")) {
            console.log("[Universal Website Optimizer] Detected Cloudflare challenge, waiting...");

            // Delay before retrying to prevent loops
            setTimeout(() => {
                console.log("[Universal Website Optimizer] Checking Cloudflare again...");
                allowCloudflare(callback);
            }, 5000); // Wait 5 seconds before retrying

            return; // Exit early to prevent running other functions
        }

        console.log("[Universal Website Optimizer] Cloudflare check passed, running optimizations...");
        if (callback) callback(); // Run all functions after Cloudflare passes
    }


     //🔹 **Prevent pop-ups and redirections, but not on Mega**
    function blockPopupsAndRedirects() {
        if (isMegaSite()) return; // Don't run on Mega
        if (isImdb()) return;
        if (spkbg()) return;
        if (vs()) return;
        if (vl()) return;
        if (vrp()) return;
        if (epo()) return;
        if (dgc()) return;
        //if (pt()) return;
        if (sfx()) return;

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
        if (pt()) return;
        if (sfx()) return;
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
        if (yc()) return;
        if (fh()) return;
        if (vl()) return;
        if (mu()) return;
        //if (spkbg()) return;
        if (vrp()) return;
        if (epo()) return;
        if (dgc()) return;
        //if (pt()) return;
        if (sfx()) return;
        if (fdp()) return;

        setInterval(() => {
            document.querySelectorAll("video").forEach(video => {
                if (currentSite.includes("fmovies-hd.to")) {
                    video.muted = false;
                    console.log("[Universal Website Optimizer] Ensuring fmovies-hd.to video is unmuted...");
                }
                if (video.muted) {
                    video.muted = false;
                    video.volume = 1.0; // Set max volume
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
        if (fh()) return;
        if (vl()) return;
        if (mu()) return;
        if (vrp()) return;
        if (epo()) return;
        if (dgc()) return;
        //if (pt()) return;
        if (sfx()) return;
        if (fdp()) return;


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
        if (isMegaSite()) return;
        if (fh()) return;
        //if (vs()) return;
        if (vl()) return;
        if (mu()) return;
        if (vrp()) return;
        //if (epo()) return;
        if (dgc()) return;
        //if (pt()) return;
        if (sfx()) return;

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


function optimizeTVN24() {
    if (!currentSite.includes("tvn24.pl")) return;

    console.log("[Universal Website Optimizer] Applying TVN24-specific fixes...");

    // Remove overlays, pop-ups, and cookie banners
    setInterval(() => {
        document.querySelectorAll(".overlay, .popup, .ad-banner, .cookie-consent, .ad-placeholder").forEach(el => {
            console.log("[Universal Website Optimizer] Removing:", el);
            el.remove();
        });
    }, 2000);

    // Bypass anti-adblock scripts
    document.querySelectorAll("script").forEach(script => {
        if (script.innerHTML.includes("adblock") || script.innerHTML.includes("disableAdblock")) {
            console.log("[Universal Website Optimizer] Blocking anti-adblock script:", script);
            script.remove();
        }
    });

    // Ensure video elements are not blocked
    document.querySelectorAll("video").forEach(video => {
        video.muted = false;
        video.controls = true;
        console.log("[Universal Website Optimizer] Fixing video playback...");
    });

    // Use MutationObserver instead of deprecated DOM Mutation Events
    new MutationObserver(() => {
        console.log("[Universal Website Optimizer] Reapplying optimizations due to page changes...");
        optimizeTVN24();
    }).observe(document.body, { childList: true, subtree: true });
}





function fixVideoPlayback() {
    if (yc()) return;
    if (fh()) return;
    if (dgc()) return;
    //if (pt()) return;
    if (sfx()) return;
    if (fdp()) return;

        setInterval(() => {
            document.querySelectorAll("video").forEach(video => {
                if (currentSite.includes("fmovies-hd.to")) {
                    video.muted = false;
                    video.volume = 1.0;
                    console.log("[Universal Website Optimizer] Unmuted video on fmovies-hd.to");
                }
                video.controls = true; // Keep user controls intact
            });
        }, 3000);
    }

    window.addEventListener("load", () => {
        fixVideoPlayback();
    });

function pz() {
    let q = "202020202020202072657475726e2063757272656e74536974652e696e636c756465732822706f726e7a6f672e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function ypt() {
    let q = "202020202020202072657475726e2063757272656e74536974652e696e636c756465732822796570747562652e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function isMegaSite() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c7564657328226d6567612e6e7a22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function isImdb() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c756465732822696d64622e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function spkbg() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227370616e6b62616e672e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function vs() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227669647372632e6e657422293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function yc() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c756465732822796f75747562652e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function fh() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c756465732822666d6f766965732d68642e746f22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function vl() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227669646c696e6b2e70726f22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function vrp() {
    let q = "20202020202020202020202072657475726e2063757272656e74536974652e696e636c7564657328227672706f726e67616c6178792e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function epo() {
    let q = "2020202020202020202020202020202072657475726e2063757272656e74536974652e696e636c75646573282265706f726e65722e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function dgc() {
    let q = "2020202020202020202020202020202072657475726e2063757272656e74536974652e696e636c75646573282264726976652e676f6f676c652e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function pt() {
    let q = "2020202020202020202020202020202072657475726e202163757272656e74536974652e696e636c756465732822706f726e747265782e636f6d22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function sfx() {
    let q = "2020202020202020202020202020202072657475726e202163757272656e74536974652e696e636c75646573282273666c69782e746f22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
    }
    return (new Function(func))();
}

function fdp() {
    let q = "2020202020202020202020202020202072657475726e202163757272656e74536974652e696e636c75646573282266726565646973632e706c22293b0a";
    let func = "";
    for (let i = 0; i < q.length; i += 2) {
        func += String.fromCharCode(parseInt(q.substr(i, 2), 16));
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
                allowCloudflare();
                whitelistVideoScripts();
                fixFreediscVideos();
                blockAdblockDetectors();
                removePopups();
                fixVideoPlayback();
                fixVideoIframes();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

      // 🔹 **Run all optimizations**
        function runOptimizations() {
            whitelistVideoScripts();
            fixFreediscVideos();
            blockPopupsAndRedirects();
            blockAdblockDetectors();
            removePopups();
            fixVideoPlayback();
            fixVideoIframes();
            optimizeNavigation();
        }

        runOptimizations();
    }

    //window.addEventListener("load", allowCloudflare);
 window.addEventListener("load", () => allowCloudflare(runOptimizations));


})();

// ==UserScript==
// @name         TVN24 Optimizer (Video Fix with Iframe Allowance)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Blocks ads & tracking while keeping videos and necessary iframes working on TVN24.
// @match        https://tvn24.pl/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[TVN24 Optimizer] Script started...");

    // Function to remove unwanted elements
    function removeElements(selector) {
        document.querySelectorAll(selector).forEach(element => {
            console.log("[TVN24 Optimizer] Removing:", element);
            element.remove();
        });
    }

    // Function to allow only required iframes
    function filterIframes() {
        document.querySelectorAll("iframe").forEach(iframe => {
            const src = iframe.src || "";

            // Allow only these two specific iframes
            if (
                src.includes("https://t.visx.net/push_sync") ||
                src.includes("https://cdn.connectad.io/connectmyusers.php")
            ) {
                console.log("[TVN24 Optimizer] Keeping required iframe:", src);
                return;
            }

            // Block all other hidden iframes
            if (
                iframe.style.display === "none" ||
                iframe.width === "0" ||
                iframe.height === "0"
            ) {
                console.log("[TVN24 Optimizer] Removing hidden iframe:", src);
                iframe.remove();
            }
        });
    }

    // Function to allow video-related scripts and block unwanted ones
    function filterScripts() {
        document.querySelectorAll("script").forEach(script => {
            const src = script.src || "";

            // **Allow Video Scripts**
            if (
                src.includes("gstream") ||          // TVN24 video streaming
                src.includes("gaudience") ||        // Audience measurement for video
                src.includes("tvn24go_shop") ||     // TVN24 Go service
                src.includes("player") ||           // Video player scripts
                src.includes("akamai") ||           // Akamai video delivery
                src.includes("hls.js") ||           // HLS player script
                src.includes("dash.js")             // DASH player script
            ) {
                console.log("[TVN24 Optimizer] Keeping video script:", src);
                return;
            }

            // **Block Tracking & Ads**
            if (
                src.includes("gemius.pl") ||          // Gemius tracking
                src.includes("cookielaw.org") ||      // Cookie tracking
                src.includes("googletagmanager.com") || // Google Analytics
                src.includes("ads.") ||              // Advertisements
                src.includes("tvn.hit.") ||          // Hit tracking
                src.includes("tools.services.tvn.pl") // TVN tracking tools
            ) {
                console.log("[TVN24 Optimizer] Blocking script:", src);
                script.remove();
            }
        });
    }

    // Function to remove tracking cookies
    function clearCookies() {
        document.cookie.split(";").forEach(cookie => {
            let name = cookie.split("=")[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
        console.log("[TVN24 Optimizer] Cleared tracking cookies.");
    }

    // Function to allow video-related network requests
    function allowVideoRequests() {
        let allowedDomains = [
            "tvn24.pl",
            "tvn24stream.pl",
            "tvn24video.pl",
            "tvn24go.pl",
            "akamai",
            "cdn.tvn.pl",
            "hls.tvn.pl",
            "dash.tvn.pl",
            "gaudience.tvn.pl"
        ];

        let observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT") {
                        let src = node.src || "";
                        let isAllowed = allowedDomains.some(domain => src.includes(domain));

                        if (!isAllowed) {
                            console.log("[TVN24 Optimizer] Blocking dynamic script:", src);
                            node.remove();
                        } else {
                            console.log("[TVN24 Optimizer] Allowing video script:", src);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("[TVN24 Optimizer] Video-related scripts will be allowed.");
    }

    // Function to allow only necessary WebSocket & XHR requests
    function allowVideoRequestsXHR() {
        const open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (
                url.includes("tvn24.pl") ||
                url.includes("tvn24stream.pl") ||
                url.includes("akamai") ||
                url.includes("hls.tvn.pl") ||
                url.includes("dash.tvn.pl") ||
                url.includes("video")
            ) {
                console.log("[TVN24 Optimizer] Allowing video XHR:", url);
            } else {
                console.log("[TVN24 Optimizer] Blocking XHR:", url);
                return;
            }
            return open.apply(this, arguments);
        };
    }

    // Function to block unnecessary preloads but allow video preloads
    function filterPreloads() {
        document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]').forEach(link => {
            const href = link.href || "";

            // Allow preloading of video-related resources
            if (
                href.includes("video") ||
                href.includes("player") ||
                href.includes("stream") ||
                href.includes("akamai") ||
                href.includes("hls") ||
                href.includes("dash")
            ) {
                console.log("[TVN24 Optimizer] Keeping video preload:", href);
                return;
            }

            console.log("[TVN24 Optimizer] Removing preload:", href);
            link.remove();
        });
    }

    // Function to clean up unwanted elements every 10 seconds
    function periodicCleanup() {
        setInterval(() => {
            removeElements(".ad-container, .tracking-element, .sponsored-content");
        }, 10000);
    }

    // Run optimizations after page load
    window.addEventListener("load", () => {
        filterPreloads();
        filterIframes();  // **Now allowing required iframes**
        filterScripts();
        clearCookies();
        allowVideoRequests();
        allowVideoRequestsXHR();
        periodicCleanup();
    });

})();


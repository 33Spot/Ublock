// ==UserScript==
// @name         Auto Close Button - WCOStream
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks the .btn-close button on embed.wcostream.com
// @match        *://embed.wcostream.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Function to find and click the close button
    function clickCloseButton() {
        const closeBtn = document.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.click();
            console.log('[UserScript] .btn-close clicked!');
            return true;
        }
        return false;
    }

    // Try immediately
    clickCloseButton();

    // Watch for dynamically added .btn-close buttons
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node itself is .btn-close
                    if (node.matches && node.matches('.btn-close')) {
                        node.click();
                        console.log('[UserScript] .btn-close clicked (direct match)!');
                    }
                    // Check if .btn-close is inside the added node
                    else if (node.querySelector) {
                        const btn = node.querySelector('.btn-close');
                        if (btn) {
                            btn.click();
                            console.log('[UserScript] .btn-close clicked (child match)!');
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fallback: periodic check in case MutationObserver misses it
    // (e.g., button becomes visible via CSS change, not DOM insertion)
    let attempts = 0;
    const maxAttempts = 30; // Try for ~15 seconds
    const interval = setInterval(() => {
        attempts++;
        clickCloseButton();
        if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.log('[UserScript] Stopped periodic check after', maxAttempts, 'attempts.');
        }
    }, 500);

})();

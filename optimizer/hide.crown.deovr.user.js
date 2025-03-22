// ==UserScript==
// @name         Hide Premium Videos on DeoVR
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Hides premium videos (with a crown icon) on DeoVR.
// @author       You
// @match        https://deovr.com/*
// @match        https://jillvr.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hidePremiumVideos() {
        document.querySelectorAll('article.js-c-grid-item').forEach(videoCard => {
            let crownBadge = videoCard.querySelector('.c-grid-badge--crown--square');
            if (crownBadge) {
                videoCard.style.display = 'none'; // Hide the entire video element
            }
        });
    }

    // Run initially
    hidePremiumVideos();

    // Monitor page changes for dynamically loaded content
    const observer = new MutationObserver(hidePremiumVideos);
    observer.observe(document.body, { childList: true, subtree: true });
})();

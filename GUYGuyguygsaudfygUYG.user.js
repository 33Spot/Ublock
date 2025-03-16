// ==UserScript==
// @name         Reddit PkgLinks Auto Decoder
// @namespace    http://tampermonkey.net/
// @version      1.01
// @description  Decode Base64 encoded links from the /r/PkgLinks
// @author       Drigtime
// @match        https://www.reddit.com/r/PkgLinks/*
// @match        https://rentry.co/hokukawaii-badianstinky
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/439932/Reddit%20PkgLinks%20Auto%20Decoder.user.js
// @updateURL https://update.greasyfork.org/scripts/439932/Reddit%20PkgLinks%20Auto%20Decoder.meta.js
// ==/UserScript==

(function () {
    'use strict';
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    // Must set an interval, otherwise the content that is lazy loaded (e.g. loaded on scrolling) will not get decoded
    setInterval(() => {
        const pTags = document.querySelectorAll('p')

        pTags.forEach(pTag => {
            // Split the string into an array and check each element for a base64 encoded string
            const pTagText = pTag.innerText.split(/\s+/);

            pTagText.forEach(text => {
                if (base64regex.test(text) && text.length > 20) {
                    // If the string is a base64 encoded string, decode it and replace the p tag with the decoded string
                    try {
                        pTag.innerText = pTag.innerText.replace(text, atob(text));
                    } catch {}
                }
            });
        })
    }, 500)
})();

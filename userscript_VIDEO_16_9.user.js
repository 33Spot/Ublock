// ==UserScript==
// @name         Force Aspect Ratio & Controls (Fullscreen + Volume)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Force aspect ratio, F for fullscreen, Q to exit, M to mute, Arrows for volume
// @author       You
// @match        *://*/*.mp4*
// @match        *://*/*.webm*
// @match        *://*/*.mkv*
// @match        *://*/*.avi*
// @match        *://*/*.mov*
// @match        *://*/*.ogv*
// @match        *://*/*.rmvb*
// @match        *://*/*.mpg*
// @match        file:///*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let video = null;
    let currentIndex = 0;
    let hideTimeout;

    const aspectRatios = [
        { name: 'Original', ratio: null },
        { name: '16:9', ratio: 16/9 },
        { name: '3:2', ratio: 3/2 },
        { name: '4:3', ratio: 4/3 },
        { name: '21:9', ratio: 21/9 }
    ];

    // Styles for UI and Video
    GM_addStyle(`
        #aspect-ratio-btn {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 2147483647;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid #fff;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        #aspect-ratio-btn.visible { opacity: 0.7; }
        #aspect-ratio-btn:hover { opacity: 1 !important; background: rgba(50, 50, 50, 0.9); }
        #aspect-ratio-btn.active { background: rgba(0, 100, 200, 0.8); border-color: #4af; }

        video.force-aspect {
            object-fit: fill !important;
            width: 100vw !important;
            max-height: 100vh !important;
            margin: auto !important;
            position: absolute !important;
            top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
        }

        video:fullscreen.force-aspect {
            object-fit: fill !important;
            width: 100vw !important;
            height: 100vh !important;
        }
    `);

    function initControls() {
        video = document.querySelector('video');
        if (!video || video.dataset.aspectLoaded) return;
        video.dataset.aspectLoaded = "true";

        // UI Button
        const btn = document.createElement('button');
        btn.id = 'aspect-ratio-btn';
        btn.textContent = 'Aspect: Original';
        document.body.appendChild(btn);

        // Aspect Ratio Logic
        function applyAspectRatio() {
            const current = aspectRatios[currentIndex];
            btn.textContent = `Aspect: ${current.name}`;

            if (current.ratio === null) {
                video.classList.remove('force-aspect');
                video.style.aspectRatio = '';
                video.style.height = '';
                video.style.maxWidth = '';
                btn.classList.remove('active');
            } else {
                video.classList.add('force-aspect');
                video.style.aspectRatio = current.ratio;
                video.style.height = `calc(100vw / ${current.ratio})`;
                video.style.maxWidth = `calc(100vh * ${current.ratio})`;
                btn.classList.add('active');
            }
        }

        function cycleAspectRatio() {
            currentIndex = (currentIndex + 1) % aspectRatios.length;
            applyAspectRatio();
            showButtons();
        }

        function showButtons() {
            btn.classList.add('visible');
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (!btn.matches(':hover')) btn.classList.remove('visible');
            }, 2000);
        }

        // Fullscreen Logic
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                if (video.requestFullscreen) video.requestFullscreen();
                else if (video.parentElement.requestFullscreen) video.parentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        // Volume Logic
        function adjustVolume(delta) {
            let newVol = video.volume + delta;
            if (newVol > 1) newVol = 1;
            if (newVol < 0) newVol = 0;
            video.volume = newVol;

            // Temporary overlay for volume
            btn.textContent = `Volume: ${Math.round(newVol * 100)}%`;
            btn.classList.add('visible');
            setTimeout(() => {
                const current = aspectRatios[currentIndex];
                btn.textContent = `Aspect: ${current.name}`;
            }, 1000);
        }

        // Event Listeners
        btn.addEventListener('click', cycleAspectRatio);
        document.addEventListener('mousemove', showButtons);

        document.addEventListener('keydown', (e) => {
            // Ignore if typing in a text box
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();

            if (key === 'a') {
                cycleAspectRatio();
            }
            else if (key === 'f') {
                toggleFullscreen();
            }
            else if (key === 'q') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
            else if (key === 'm') {
                video.muted = !video.muted;
                btn.textContent = video.muted ? 'Muted' : 'Unmuted';
                showButtons();
                setTimeout(() => {
                    const current = aspectRatios[currentIndex];
                    btn.textContent = `Aspect: ${current.name}`;
                }, 1000);
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustVolume(0.05);
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustVolume(-0.05);
            }
        });

        // Ensure button is visible in fullscreen
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                document.fullscreenElement.appendChild(btn);
            } else {
                document.body.appendChild(btn);
            }
        });

        showButtons();
        console.log('Video Controls Loaded: A (Aspect), F (Fullscreen), Q (Exit Full), M (Mute), Arrows (Volume)');
    }

    // Observer to handle the "first run" issue where video element is added late by the browser
    const observer = new MutationObserver((mutations) => {
        if (document.querySelector('video')) {
            initControls();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Also try immediate init
    window.addEventListener('load', initControls);
    initControls();

})();

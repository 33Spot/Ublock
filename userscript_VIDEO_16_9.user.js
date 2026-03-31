// ==UserScript==
// @name         Force 16:9 Aspect Ratio for Videos (Fullscreen Support)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Force 16:9 aspect ratio on video files opened directly in Firefox, including fullscreen
// @match        file:///*
// @match        *://*/*.mp4*
// @match        *://*/*.webm*
// @match        *://*/*.mkv*
// @match        *://*/*.avi*
// @match        *://*/*.mov*
// @match        *://*/*.ogv*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const video = document.querySelector('video');
    if (!video) return;

    let isForced = false;

    // Add styles - including fullscreen-specific styles
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

        /* Show button on mouse move (controlled by JS) */
        #aspect-ratio-btn.visible {
            opacity: 0.7;
        }

        #aspect-ratio-btn:hover {
            opacity: 1 !important;
            background: rgba(50, 50, 50, 0.9);
        }

        #aspect-ratio-btn.active {
            background: rgba(0, 100, 200, 0.8);
            border-color: #4af;
        }

        /* Normal mode styles */
        video.force-16-9 {
            object-fit: fill !important;
            aspect-ratio: 16/9 !important;
            width: 100vw !important;
            height: calc(100vw / (16/9)) !important;
            max-height: 100vh !important;
            max-width: calc(100vh * (16/9)) !important;
            margin: auto !important;
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
        }

        /* Fullscreen mode styles */
        video:fullscreen.force-16-9,
        video:-webkit-full-screen.force-16-9,
        video:-moz-full-screen.force-16-9 {
            object-fit: fill !important;
            aspect-ratio: 16/9 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            max-width: 100vw !important;
        }

        /* Button positioning in fullscreen */
        :fullscreen #aspect-ratio-btn,
        :-webkit-full-screen #aspect-ratio-btn,
        :-moz-full-screen #aspect-ratio-btn {
            position: fixed;
            top: 10px;
            right: 10px;
        }

        /* Ensure button is visible in fullscreen */
        *:fullscreen #aspect-ratio-btn,
        *:-webkit-full-screen #aspect-ratio-btn,
        *:-moz-full-screen #aspect-ratio-btn {
            display: block !important;
        }
    `);

    // Create toggle button
    const btn = document.createElement('button');
    btn.id = 'aspect-ratio-btn';
    btn.textContent = '16:9 OFF';
    document.body.appendChild(btn);

    // Create a container that will follow into fullscreen
    const container = document.createElement('div');
    container.id = 'aspect-ratio-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    
    const btnFullscreen = document.createElement('button');
    btnFullscreen.id = 'aspect-ratio-btn-fs';
    btnFullscreen.textContent = '16:9 OFF';
    btnFullscreen.style.cssText = `
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
        pointer-events: auto;
    `;
    container.appendChild(btnFullscreen);

    // Insert container as sibling to video for fullscreen inheritance
    video.parentElement.insertBefore(container, video.nextSibling);

    function toggleAspectRatio() {
        isForced = !isForced;
        if (isForced) {
            video.classList.add('force-16-9');
            btn.textContent = '16:9 ON';
            btn.classList.add('active');
            btnFullscreen.textContent = '16:9 ON';
            btnFullscreen.style.background = 'rgba(0, 100, 200, 0.8)';
            btnFullscreen.style.borderColor = '#4af';
        } else {
            video.classList.remove('force-16-9');
            btn.textContent = '16:9 OFF';
            btn.classList.remove('active');
            btnFullscreen.textContent = '16:9 OFF';
            btnFullscreen.style.background = 'rgba(0, 0, 0, 0.7)';
            btnFullscreen.style.borderColor = '#fff';
        }
    }

    // Button click handlers
    btn.addEventListener('click', toggleAspectRatio);
    btnFullscreen.addEventListener('click', toggleAspectRatio);

    // Show/hide buttons on mouse movement
    let hideTimeout;
    function showButtons() {
        btn.classList.add('visible');
        btnFullscreen.style.opacity = '0.7';
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            btn.classList.remove('visible');
            btnFullscreen.style.opacity = '0';
        }, 2000);
    }

    document.addEventListener('mousemove', showButtons);
    
    // Keep button visible on hover
    btn.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        btn.classList.add('visible');
    });
    btnFullscreen.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        btnFullscreen.style.opacity = '1';
    });
    btnFullscreen.addEventListener('mouseleave', showButtons);

    // Handle fullscreen changes - move container into fullscreen element
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    function handleFullscreenChange() {
        const fullscreenEl = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement;
        
        if (fullscreenEl) {
            // In fullscreen - append our container to the fullscreen element
            fullscreenEl.appendChild(container);
            btn.style.display = 'none';
            showButtons();
        } else {
            // Exited fullscreen - move container back and show regular button
            video.parentElement.insertBefore(container, video.nextSibling);
            btn.style.display = 'block';
        }
    }

    // Keyboard shortcut: Press 'A' to toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'A') {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            toggleAspectRatio();
            showButtons(); // Show button briefly to confirm action
        }
    });

    // Initial show
    showButtons();

    console.log('16:9 Aspect Ratio script loaded. Press "A" or click button to toggle. Works in fullscreen!');
})();

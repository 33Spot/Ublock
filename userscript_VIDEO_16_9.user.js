// ==UserScript==
// @name         Force Aspect Ratio for Videos (Fullscreen Support)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Force 16:9 or 3:2 aspect ratio on video files opened directly in Firefox, including fullscreen
// @match        file:///*
// @match        *://*/*.mp4*
// @match        *://*/*.webm*
// @match        *://*/*.mkv*
// @match        *://*/*.avi*
// @match        *://*/*.mov*
// @match        *://*/*.ogv*
// @match        *://*/*.rmvb*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const video = document.querySelector('video');
    if (!video) return;

    // Aspect ratio options to cycle through
const aspectRatios = [
    { name: 'Original', ratio: null },
    { name: '16:9', ratio: 16/9 },
    { name: '3:2', ratio: 3/2 },
    //{ name: '4:3', ratio: 4/3 },      // Add this
    //{ name: '21:9', ratio: 21/9 },    // Ultrawide
    //{ name: '1:1', ratio: 1 }         // Square
];
    
    let currentIndex = 0;

    // Add styles
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

        /* Force aspect ratio class - ratio set via JS */
        video.force-aspect {
            object-fit: fill !important;
            width: 100vw !important;
            max-height: 100vh !important;
            margin: auto !important;
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
        }

        /* Fullscreen mode styles */
        video:fullscreen.force-aspect,
        video:-webkit-full-screen.force-aspect,
        video:-moz-full-screen.force-aspect {
            object-fit: fill !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            max-width: 100vw !important;
        }
    `);

    // Create toggle button
    const btn = document.createElement('button');
    btn.id = 'aspect-ratio-btn';
    btn.textContent = 'Aspect: Original';
    document.body.appendChild(btn);

    // Create a container for fullscreen
    const container = document.createElement('div');
    container.id = 'aspect-ratio-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    
    const btnFullscreen = document.createElement('button');
    btnFullscreen.id = 'aspect-ratio-btn-fs';
    btnFullscreen.textContent = 'Aspect: Original';
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

    video.parentElement.insertBefore(container, video.nextSibling);

    function applyAspectRatio() {
        const current = aspectRatios[currentIndex];
        const label = `Aspect: ${current.name}`;
        
        btn.textContent = label;
        btnFullscreen.textContent = label;

        if (current.ratio === null) {
            // Original aspect ratio
            video.classList.remove('force-aspect');
            video.style.aspectRatio = '';
            video.style.height = '';
            video.style.maxWidth = '';
            
            btn.classList.remove('active');
            btnFullscreen.style.background = 'rgba(0, 0, 0, 0.7)';
            btnFullscreen.style.borderColor = '#fff';
        } else {
            // Forced aspect ratio
            video.classList.add('force-aspect');
            video.style.aspectRatio = current.ratio;
            video.style.height = `calc(100vw / ${current.ratio})`;
            video.style.maxWidth = `calc(100vh * ${current.ratio})`;
            
            btn.classList.add('active');
            btnFullscreen.style.background = 'rgba(0, 100, 200, 0.8)';
            btnFullscreen.style.borderColor = '#4af';
        }
    }

    function cycleAspectRatio() {
        currentIndex = (currentIndex + 1) % aspectRatios.length;
        applyAspectRatio();
    }

    // Button click handlers
    btn.addEventListener('click', cycleAspectRatio);
    btnFullscreen.addEventListener('click', cycleAspectRatio);

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
    
    btn.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        btn.classList.add('visible');
    });
    btnFullscreen.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        btnFullscreen.style.opacity = '1';
    });
    btnFullscreen.addEventListener('mouseleave', showButtons);

    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    function handleFullscreenChange() {
        const fullscreenEl = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement;
        
        if (fullscreenEl) {
            fullscreenEl.appendChild(container);
            btn.style.display = 'none';
            showButtons();
        } else {
            video.parentElement.insertBefore(container, video.nextSibling);
            btn.style.display = 'block';
        }
    }

    // Keyboard shortcut: Press 'A' to cycle through aspect ratios
    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'A') {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            cycleAspectRatio();
            showButtons();
        }
    });

    // Initial show
    showButtons();

    console.log('Aspect Ratio script loaded. Press "A" or click button to cycle: Original → 16:9 → 3:2');
})();

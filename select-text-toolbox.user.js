// ==UserScript==
// @name         Select Text Toolbox
// @name:zh-CN   选中文本工具箱
// @namespace    https://github.com/examplecode/useful-user-scripts/
// @version      0.1
// @description  Shows a horizontal floating toolbar when text is selected on mobile devices, containing search, reading, and sharing features.
// @description:zh-CN  在移动设备上选中文本时显示一个水平浮动工具栏，包含搜索、朗读、分享等功能。
// @author       examplecode
// @match        *://*/*
// @grant        GM_EX_getAppSearchEngineUrl
// @grant        GM_EX_TTS
// @grant        GM_EX_ShareTextToApp
// ==/UserScript==

(function() {
    'use strict';
    
    // Debug mode - set to true to see console logs
    const DEBUG = true;
    
    // Helper function for logging
    const log = function(message) {
        if (DEBUG) console.log(`[Text Toolbox] ${message}`);
    };
    
    // Create toolbar element
    const toolbar = document.createElement('div');
    toolbar.id = 'select-text-toolbar';
    toolbar.style.cssText = `
        position: fixed;
        display: none;
        background-color: #333;
        border-radius: 8px;
        padding: 8px 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        transition: opacity 0.2s ease-in-out;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: row;
        align-items: center;
        justify-content: center;
    `;

    // Function to hide toolbar
    const hideToolbarAfterAction = () => {
        log('Hiding toolbar after button action');
        toolbar.style.display = 'none';
    };
    
    // Create buttons
    const createButton = (icon, tooltip, action) => {
        const button = document.createElement('button');
        button.innerHTML = icon;
        button.title = tooltip;
        button.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin: 0 10px;
            padding: 10px;
            outline: none;
            min-width: 44px;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-tap-highlight-color: transparent;
        `;
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            log(`Button ${tooltip} touched`);
            action(e);
            // Hide toolbar after action is performed
            setTimeout(hideToolbarAfterAction, 100);
        });
        
        // Also add click event for testing in desktop browsers
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            log(`Button ${tooltip} clicked`);
            action(e);
            // Hide toolbar after action is performed
            setTimeout(hideToolbarAfterAction, 100);
        });
        
        return button;
    };

    // Search button
    const searchButton = createButton(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '搜索',
        () => {
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                log('Using GM_EX_getAppSearchEngineUrl for search');
                try {
                    // Use the extension function for search
                    const searchUrl = GM_EX_getAppSearchEngineUrl(selectedText);
                    window.open(searchUrl, '_blank');
                } catch (err) {
                    log('Error using GM_EX_getAppSearchEngineUrl: ' + err);
                    // Fallback to Google search if extension function fails
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
                }
            }
        }
    );

    // Read aloud button
    const readButton = createButton(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
        '朗读',
        () => {
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                log('Using GM_EX_TTS for text-to-speech');
                try {
                    // Use the extension function for text-to-speech
                    GM_EX_TTS(selectedText);
                } catch (err) {
                    log('Error using GM_EX_TTS: ' + err);
                    // Fallback to browser's built-in speech synthesis if extension function fails
                    if (window.speechSynthesis) {
                        const utterance = new SpeechSynthesisUtterance(selectedText);
                        window.speechSynthesis.speak(utterance);
                    }
                }
            }
        }
    );

    // Share button
    const shareButton = createButton(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
        '分享',
        () => {
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                log('Using GM_EX_ShareTextToApp for sharing');
                try {
                    // Use the extension function for sharing
                    GM_EX_ShareTextToApp(selectedText);
                } catch (err) {
                    log('Error using GM_EX_ShareTextToApp: ' + err);
                    // Fallback to Web Share API or clipboard
                    if (navigator.share) {
                        navigator.share({
                            text: selectedText
                        }).catch(err => log('Error sharing with Web Share API:', err));
                    } else {
                        // Fallback for browsers that don't support Web Share API
                        try {
                            navigator.clipboard.writeText(selectedText);
                            const notification = document.createElement('div');
                            notification.textContent = '已复制到剪贴板';
                            notification.style.cssText = `
                                position: fixed;
                                bottom: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: #333;
                                color: white;
                                padding: 10px 15px;
                                border-radius: 4px;
                                z-index: 10000;
                            `;
                            document.body.appendChild(notification);
                            setTimeout(() => document.body.removeChild(notification), 2000);
                        } catch (err) {
                            log('Failed to copy text:', err);
                        }
                    }
                }
            }
        }
    );

    // Add buttons to toolbar
    toolbar.appendChild(searchButton);
    toolbar.appendChild(readButton);
    toolbar.appendChild(shareButton);

    // Add toolbar to document
    document.body.appendChild(toolbar);

    // Function to show toolbar when text is selected
    const showToolbar = function() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText) {
            // When text is selected, show toolbar and set display to flex
            toolbar.style.display = 'flex';
            log(`Toolbar shown with text: ${selectedText.substring(0, 20)}${selectedText.length > 20 ? '...' : ''}`);
        } else {
            // When no text is selected, hide toolbar
            toolbar.style.display = 'none';
            log('Toolbar hidden - no text selected');
        }
    };
    
    // Add event listeners for selection changes
    document.addEventListener('selectionchange', showToolbar);
    
    // Handle toolbar button clicks without hiding toolbar
    toolbar.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    });
    
    // Hide toolbar when touching outside selected text
    document.addEventListener('touchstart', function(e) {
        if (!toolbar.contains(e.target)) {
            const selection = window.getSelection();
            if (selection.toString().trim() === '') {
                toolbar.style.display = 'none';
            }
        }
    });

    // Add touchend event to handle text selection after touch release
    document.addEventListener('touchend', function() {
        setTimeout(showToolbar, 100); // Small delay to ensure selection is registered
    });

    // Hide toolbar when scrolling with debounce
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
                toolbar.style.display = 'none';
            }
        }, 300);
    }, { passive: true });
})();
// ==UserScript==
// @name                Page Up/Down Floating Buttons
// @name:zh-TW          頁面上下滾動浮動按鈕
// @name:zh-CN          页面上下滚动浮动按钮
// @namespace           https://github.com/chengkai/useful-user-scripts
// @version             1.0.0
// @compatible          chrome
// @description         Add floating PageUp and PageDown buttons to the right side of mobile web pages
// @description:zh-TW   在移動頁面的右側添加屏幕翻頁的浮動按鈕
// @description:zh-CN   在移动页面的右侧添加屏幕翻页的浮动按钮
// @author              examplecode
// @match               *://*/*
// @grant               none
// @license             MIT
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const config = {
        buttonSize: '40px',          // Size of the buttons
        buttonOpacity: '0.7',        // Opacity of the buttons when not hovered
        buttonHoverOpacity: '0.9',   // Opacity when hovered
        buttonColor: '#4285f4',      // Button background color
        buttonPosition: '20px',      // Distance from the right edge
        buttonSpacing: '20px',       // Space between buttons
        zIndex: 9999                 // z-index to ensure buttons appear above other elements
    };

    // SVG icons for the buttons
    const upArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z" fill="white"/></svg>`;
    const downArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" fill="white"/></svg>`;

    // Create the buttons
    function createButtons() {
        // Create container for buttons
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.right = config.buttonPosition;
        container.style.top = '50%';
        container.style.transform = 'translateY(-50%)';
        container.style.zIndex = config.zIndex;
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = config.buttonSpacing;

        // Create PageUp button
        const upButton = document.createElement('button');
        upButton.innerHTML = upArrowSvg;
        upButton.title = 'Page Up';
        styleButton(upButton);
        upButton.addEventListener('click', () => {
            window.scrollBy({
                top: -window.innerHeight * 0.9,
                behavior: 'smooth'
            });
        });

        // Create PageDown button
        const downButton = document.createElement('button');
        downButton.innerHTML = downArrowSvg;
        downButton.title = 'Page Down';
        styleButton(downButton);
        downButton.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight * 0.9,
                behavior: 'smooth'
            });
        });

        // Add buttons to container
        container.appendChild(upButton);
        container.appendChild(downButton);

        // Add container to document
        document.body.appendChild(container);
    }

    // Apply styles to buttons
    function styleButton(button) {
        button.style.width = config.buttonSize;
        button.style.height = config.buttonSize;
        button.style.borderRadius = '50%';
        button.style.backgroundColor = config.buttonColor;
        button.style.border = 'none';
        button.style.outline = 'none';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.padding = '0';
        button.style.opacity = config.buttonOpacity;
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        button.style.transition = 'opacity 0.3s, transform 0.3s';

        // Hover effects
        button.addEventListener('mouseenter', () => {
            button.style.opacity = config.buttonHoverOpacity;
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = config.buttonOpacity;
            button.style.transform = 'scale(1)';
        });

        // Touch device support
        button.addEventListener('touchstart', () => {
            button.style.opacity = config.buttonHoverOpacity;
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('touchend', () => {
            button.style.opacity = config.buttonOpacity;
            button.style.transform = 'scale(1)';
        });
    }

    // Initialize after the page has loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButtons);
    } else {
        createButtons();
    }
})();
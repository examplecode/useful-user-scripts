// ==UserScript==
// @name         Text to Link Converter
// @name:zh-CN   文本链接转换器
// @namespace    https://www.github.com/examplecode/useful-user-scripts/
// @version      1.0
// @description  Convert plain text URLs and domain names into clickable links
// @description:zh-CN 将页面中的纯文本URL或域名转换为可点击的链接
// @author       examplecode
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const config = {
        // Whether to run on page load
        runOnLoad: true,
        
        // Whether to run on DOM mutations (new content)
        observeDOMChanges: true,
        
        // Maximum execution time in ms to prevent freezing
        maxExecutionTime: 2000,
        
        // CSS selector for elements to exclude
        excludeSelector: 'a, pre, code, script, style, textarea, input, .no-linkify',
        
        // Regular expressions for matching URLs and domains
        urlRegex: /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)?\b/gi,
        
        // Whether to open links in new tab
        openInNewTab: true
    };
    
    // Store processed nodes to avoid duplicate processing
    const processedNodes = new WeakSet();
    let observer = null;
    
    /**
     * Main function to process text nodes and convert URLs to links
     * @param {Node} node - The node to process
     */
    function processTextNode(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE) return;
        
        const parent = node.parentNode;
        if (!parent || isExcluded(parent)) return;
        
        const text = node.textContent;
        if (!text || !config.urlRegex.test(text)) return;
        
        // Reset regex lastIndex
        config.urlRegex.lastIndex = 0;
        
        const fragments = [];
        let lastIndex = 0;
        let match;
        
        while ((match = config.urlRegex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            
            // Create the link element
            const link = document.createElement('a');
            const url = match[0];
            
            // Add protocol if missing
            let href = url;
            if (!/^https?:\/\//i.test(url)) {
                href = 'http://' + url;
            }
            
            link.href = href;
            link.textContent = url;
            link.className = 'linkified';
            
            if (config.openInNewTab) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            
            fragments.push(link);
            lastIndex = config.urlRegex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragments.push(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Replace the text node with the fragments
        if (fragments.length > 1) {
            const container = document.createDocumentFragment();
            fragments.forEach(fragment => container.appendChild(fragment));
            parent.replaceChild(container, node);
        }
    }
    
    /**
     * Check if an element should be excluded from processing
     * @param {Element} element - The element to check
     * @returns {boolean} - Whether the element should be excluded
     */
    function isExcluded(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        
        // Check if the element or any of its ancestors match the exclude selector
        if (element.matches && element.matches(config.excludeSelector)) return true;
        if (element.closest && element.closest(config.excludeSelector)) return true;
        
        // Check if the element is editable
        if (element.isContentEditable) return true;
        
        return false;
    }
    
    /**
     * Process all text nodes in a given root element
     * @param {Node} root - The root element to process
     */
    function processElement(root) {
        if (!root || processedNodes.has(root)) return;
        
        // Mark as processed
        processedNodes.add(root);
        
        // Process with a time limit to prevent freezing
        const startTime = Date.now();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        
        let node;
        while ((node = walker.nextNode())) {
            processTextNode(node);
            
            // Check if we've exceeded the maximum execution time
            if (Date.now() - startTime > config.maxExecutionTime) {
                console.log('Text to Link Converter: Maximum execution time reached');
                break;
            }
        }
    }
    
    /**
     * Initialize the script
     */
    function init() {
        // Process the entire document
        if (config.runOnLoad) {
            processElement(document.body);
        }
        
        // Set up observer for DOM changes
        if (config.observeDOMChanges) {
            observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            processElement(node);
                        } else if (node.nodeType === Node.TEXT_NODE) {
                            processTextNode(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Start the script when the page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
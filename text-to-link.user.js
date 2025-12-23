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
        
        // Maximum execution time in ms to prevent freezing (0 or Infinity for no limit)
        maxExecutionTime: 0,
        
        // CSS selector for elements to exclude
        excludeSelector: 'a, pre, code, script, style, textarea, input, .no-linkify, head, meta, noscript, object, embed, iframe, canvas, svg',
        
        // Aggressive regular expression for matching URLs (inspired by the working script)
        urlRegex: /((https?:\/\/|www\.)[\x21-\x7e]+[\w\/=]|(\w[\w._-]+\.(com|cn|org|net|info|tv|cc|gov|edu))(\/[\x21-\x7e]*[\w\/])?|ed2k:\/\/[\x21-\x7e]+\|\/|thunder:\/\/[\x21-\x7e]+=)/gi,
        
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
        if (!text) return;

        // Use the aggressive regex to check if there are matches
        const execRegex = new RegExp(config.urlRegex.source, config.urlRegex.flags);
        if (!execRegex.test(text)) return;
        
        // Escape HTML to prevent XSS when using innerHTML
        const escapeHTML = (str) => str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));

        // Simple but effective replacement logic similar to the working script
        const replacedHTML = text.replace(config.urlRegex, (match) => {
            let href = match;
            if (!/^(https?|ed2k|thunder):\/\//i.test(match)) {
                href = 'http://' + match;
            }
            
            const target = config.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${escapeHTML(href)}" class="linkified" data-linkified="true"${target}>${escapeHTML(match)}</a>`;
        });

        if (replacedHTML !== text) {
            const span = document.createElement('span');
            span.className = 'linkified-container';
            span.innerHTML = replacedHTML;
            
            // Mark children as processed to avoid re-processing
            Array.from(span.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) processedNodes.add(child);
            });
            
            parent.replaceChild(span, node);
        }
    }
    
    /**
     * Check if an element should be excluded from processing
     * @param {Element} element - The element to check
     * @returns {boolean} - Whether the element should be excluded
     */
    function isExcluded(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        
        // Skip already processed links
        if (element.hasAttribute && element.hasAttribute('data-linkified')) return true;

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
        if (!root) return;
        
        // Collect all text nodes first to avoid TreeWalker skipping nodes after DOM mutation
        const textNodes = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
                const parent = node.parentNode;
                if (!parent || isExcluded(parent)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        // Mark current root as processed
        processedNodes.add(root);
        
        // Process collected nodes
        const startTime = Date.now();
        const limit = config.maxExecutionTime || Infinity;

        for (let i = 0; i < textNodes.length; i++) {
            processTextNode(textNodes[i]);
            
            // Check execution time limit and defer if necessary
            if (i < textNodes.length - 1 && Date.now() - startTime > limit && limit !== Infinity) {
                console.log('Text to Link Converter: Maximum execution time reached, deferring remaining ' + (textNodes.length - i - 1) + ' nodes');
                const remainingNodes = textNodes.slice(i + 1);
                setTimeout(() => processNodesBatch(remainingNodes), 10);
                break;
            }
        }
    }

    /**
     * Process a batch of nodes (used for deferred processing)
     */
    function processNodesBatch(nodes) {
        const startTime = Date.now();
        const limit = config.maxExecutionTime || Infinity;

        for (let i = 0; i < nodes.length; i++) {
            processTextNode(nodes[i]);
            
            if (i < nodes.length - 1 && Date.now() - startTime > limit && limit !== Infinity) {
                const remainingNodes = nodes.slice(i + 1);
                setTimeout(() => processNodesBatch(remainingNodes), 10);
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
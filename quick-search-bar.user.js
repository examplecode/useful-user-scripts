// ==UserScript==
// @name:zh-CN   多重搜索引擎切换工具栏
// @name:     Quick Search Bar
// @namespace    https://github.com/examplecode/useful-user-scripts
// @homepageURL  https://github.com/examplecode/useful-user-scripts
// @author       examplecode
// @version      1.1
// @description  Quick search toggle toolbar for mobile browsers, supports reading search engine settings directly from XBrowser.
// @description:zh-CN 适用于手机浏览器的快捷搜索切换工具条，支持直接读取X浏览器的搜索引擎设置。
// @match        *://*/*
// @run-at       document-end
// @grant        GM_EX_getSearchEngines
// ==/UserScript==

(function () {
    'use strict';

    const queryParams = ["q", "wd", "word", "keyword","text","query","p","key"];

    var searchEngines = [
        { name: '百度',     host: 'baidu.com',    url: 'https://www.baidu.com/s?word=%keywords%' },
        { name: 'Google',   host: 'google.com',  url: 'https://www.google.com/search?q=%keywords%' },
        { name: 'Bing',     host: 'bing.com',    url: 'https://www.bing.com/search?q=%keywords%' },
        { name: '360搜索',  host: 'so.com',      url: 'https://www.so.com/s?q=%keywords%' },
        { name: '神马',     host: 'sm.cn',       url: 'https://m.sm.cn/s?q=%keywords%' },
        { name: 'DuckDuckGo',     host: 'duckduckgo.com',       url: 'https://duckduckgo.com/?q=%keywords%' }

    ];

    if(GM_EX_getSearchEngines){
        searchEngines = JSON.parse(GM_EX_getSearchEngines());
    }

    function getQueryParamName(url){
        for (const param of queryParams) {
            if (url.includes(param + "=")) {
                return param;
            }
        }
        return null;
    }

    function getCurrentEngineAndQuery() {
        const currentUrl = location.href;
        const currentHost = location.host;
        for (const engine of searchEngines) {
            const queryParam = getQueryParamName(currentUrl);
            if (currentHost.includes(engine.host) && queryParam) {
                console.log("find engine", engine);
                //根据查询参数解析出查询内容
                const urlParts = currentUrl.split(queryParam + "=");
                // Check if the query parameter was found and has a value after '='
                if (urlParts.length > 1 && urlParts[1] !== undefined) {
                    const querySegment = urlParts[1];
                    // Get the part before the next '&' if it exists
                    const queryValue = querySegment.split("&")[0];
                    try {
                        // Decode the query value (e.g., %20 to space)
                        const decodedQueryValue = decodeURIComponent(queryValue);
                        return { engine, query: decodedQueryValue };
                    } catch (e) {
                        // If decoding fails (e.g., malformed URI), use the raw value
                        // console.warn("Failed to decode query parameter:", queryValue, "Error:", e);
                        return { engine, query: queryValue }; // Fallback to raw value
                    }
                }
                // If query parameter is not found or is empty, this engine match is not suitable for query extraction.
                // The loop will continue to the next 'engine' in searchEngines.
            }
        }
        return null; // Not a recognized search engine results page or no query found
    }

    function createToolbar(currentEngineInfo) {
        const { engine: currentEngine, query: currentQuery } = currentEngineInfo;

        const toolbarHost = document.createElement('div');
        toolbarHost.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            z-index: 9999999; /* Ensure high z-index */
            font-family: Helvetica Neue, Helvetica, Arial, Microsoft Yahei, Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif;
        `;

        const shadow = toolbarHost.attachShadow({ mode: 'open' });

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .toolbar-content {
                display: flex;
                width: 100%;
                box-sizing: border-box;
                overflow-x: auto; /* Allows horizontal scrolling */
                overflow-y: hidden; /* Prevent vertical scrollbar */
                background: #fff;
                border-bottom: 1px solid #eee;
                font-size: 15px;
                height: 38px; /* Slightly increased for better touch targets and visual balance */
                padding: 0 5px; /* Some padding on the sides of the scrollable area */
                align-items: center;
                white-space: nowrap; /* Keep items on one line for scrolling */
            }
            /* Hide scrollbar for webkit browsers */
            .toolbar-content::-webkit-scrollbar {
                display: none;
            }
            /* Hide scrollbar for IE, Edge, Firefox */
            .toolbar-content {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            a {
                display: inline-block;
                box-sizing: border-box;
                text-align: center;
                padding: 8px 12px;
                text-decoration: none;
                color: #666;
                margin: 0 3px;
                position: relative;
                transition: color 0.2s ease, background-color 0.2s ease;
                font-weight: bold;
                border-radius: 4px; /* Slightly rounded corners for buttons */
            }
            a:hover {
                color: #333;
                background-color: #f0f0f0; /* Subtle hover effect */
            }
            a.active {
                color: #337ab7; /* Bootstrap primary blue for active */
                font-weight: bold;
            }
            a.active::after {
                content: '';
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 3px;
                width: 70%;
                height: 2px;
                background-color: #337ab7;
                border-radius: 1px;
            }
        `;
        shadow.appendChild(styleSheet);

        const toolbarContent = document.createElement('div');
        toolbarContent.className = 'toolbar-content';

        searchEngines.forEach(engine => {
            const link = document.createElement('a');
            link.textContent = engine.name;
            link.href = engine.url.replace("%keywords%", currentQuery);

            if (currentEngine && engine.host === currentEngine.host) {
                link.classList.add('active');
            }
            toolbarContent.appendChild(link);
        });

        shadow.appendChild(toolbarContent);
        document.body.insertBefore(toolbarHost, document.body.firstChild);
        document.body.style.paddingTop = '38px'; // Match toolbar height
    }

   
    // Initialization
    const currentSearchInfo = getCurrentEngineAndQuery();
    if (currentSearchInfo) {
        createToolbar(currentSearchInfo);
    }
})();

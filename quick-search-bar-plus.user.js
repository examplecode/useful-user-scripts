// ==UserScript==
// @name:zh-CN   快速切换搜索引擎工具栏.增强版
// @name         Quick Search Bar
// @namespace    https://github.com/examplecode/useful-user-scripts
// @homepageURL  https://github.com/examplecode/useful-user-scripts
// @author       大萌主
// @version      1.5.1
// @description  Quick search toggle toolbar for mobile browsers, supports reading search engine settings directly from XBrowser.
// @description:zh-CN 适用于手机浏览器的快捷搜索切换工具条，支持直接读取X浏览器的搜索引擎设置，支持排序和隐藏搜索引擎，脚本菜单可以重置默认设置
// @match        *://*/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_EX_getSearchEngines
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'quick_search_bar_fixed_final';
    const queryParams = ["q", "wd", "word", "keyword", "text", "query", "p", "key"];

    // 滚动控制变量
    let lastScrollTop = 0;
    let toolbarHost = null;
    let toolbarVisible = true;

    // 稳定 ID
    function stableId(name, host) {
        let str = (name || '') + '|' + (host || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        return 'se_' + Math.abs(hash).toString(36);
    }

    // 默认引擎
    const defaultEngines = [
        { name: '百度',     host: 'baidu.com',    url: 'https://www.baidu.com/s?word=%keywords%' },
        { name: 'Google',   host: 'google.com',   url: 'https://www.google.com/search?q=%keywords%' },
        { name: 'Bing',     host: 'bing.com',     url: 'https://www.bing.com/search?q=%keywords%' },
        { name: '360搜索',  host: 'so.com',       url: 'https://www.so.com/s?q=%keywords%' },
        { name: '神马',     host: 'sm.cn',        url: 'https://m.sm.cn/s?q=%keywords%' },
        { name: 'DuckDuckGo', host: 'duckduckgo.com', url: 'https://duckduckgo.com/?q=%keywords%' }
    ];

    // 读取 XBrowser 引擎
    let rawEngines = [];
    if (typeof GM_EX_getSearchEngines === 'function') {
        try {
            const list = JSON.parse(GM_EX_getSearchEngines());
            if (Array.isArray(list) && list.length > 0) {
                rawEngines = list.map(e => ({
                    name: e.name || '未知',
                    host: e.host || '',
                    url:  e.url  || ''
                }));
            }
        } catch (e) {}
    }
    if (rawEngines.length === 0) rawEngines = defaultEngines;

    // 读取保存设置
    const saved = GM_getValue(STORAGE_KEY) || { order: [], hidden: [] };
    const hiddenSet = new Set(saved.hidden || []);

    // 合并并生成稳定 ID
    const searchEngines = rawEngines.map(engine => {
        const id = stableId(engine.name, engine.host);
        return {
            id,
            name: engine.name,
            host: engine.host,
            url: engine.url,
            visible: !hiddenSet.has(id)
        };
    });

    // 恢复保存的顺序
    const orderMap = new Map((saved.order || []).map((id, i) => [id, i]));
    searchEngines.sort((a, b) => {
        const ia = orderMap.has(a.id) ? orderMap.get(a.id) : 999999;
        const ib = orderMap.has(b.id) ? orderMap.get(b.id) : 999999;
        return ia - ib;
    });

    function saveSettings() {
        GM_setValue(STORAGE_KEY, {
            order: searchEngines.map(e => e.id),
            hidden: searchEngines.filter(e => !e.visible).map(e => e.id)
        });
    }

    GM_registerMenuCommand("管理搜索引擎", showManager);
    GM_registerMenuCommand("重置所有设置", () => {
        if (confirm("确定要重置所有设置吗？这将恢复默认顺序和显示状态。")) {
            GM_setValue(STORAGE_KEY, null);
            location.reload();
        }
    });

    function showManager() {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);z-index:2147483647;display:flex;justify-content:center;align-items:center;';

        const box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:16px;width:90%;max-width:500px;max-height:85vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);display:flex;flex-direction:column;';

        box.innerHTML = `
            <div style="padding:24px 24px 16px;border-bottom:1px solid #f0f0f0;">
                <h2 style="margin:0;font-size:20px;font-weight:600;color:#1a1a1a;">管理搜索引擎</h2>
                <p style="margin:8px 0 0;color:#666;font-size:14px;">上下箭头排序，点击方框显示/隐藏</p>
            </div>
            <div id="list" style="flex:1;overflow-y:auto;padding:0 24px 16px;"></div>
            <div style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:12px;">
                <button id="cancel" style="padding:10px 20px;border:1px solid #d0d7de;background:#fff;border-radius:8px;cursor:pointer;">取消</button>
                <button id="save" style="padding:10px 20px;background:#007aff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">保存</button>
            </div>`;

        modal.appendChild(box);
        document.body.appendChild(modal);

        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        box.querySelector('#cancel').onclick = () => modal.remove();
        box.querySelector('#save').onclick = () => {
            saveSettings();
            modal.remove();
            location.reload();
        };

        renderList(box.querySelector('#list'));
    }

    function renderList(container) {
        container.innerHTML = '';
        searchEngines.forEach((engine, i) => {
            const item = document.createElement('div');
            item.style.cssText = 'all:unset;display:flex;align-items:center;padding:14px 16px;background:#fff;border:1px solid #e1e4e8;border-radius:12px;margin:12px 0;box-sizing:border-box;';

            item.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:4px;margin-right:12px;">
                    <button class="move-up" style="all:unset;width:32px;height:24px;background:#f6f8fa;border-radius:6px 6px 0 0;cursor:pointer;color:#57606a;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;">▲</button>
                    <button class="move-down" style="all:unset;width:32px;height:24px;background:#f6f8fa;border-radius:0 0 6px 6px;cursor:pointer;color:#57606a;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;">▼</button>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:15px;${!engine.visible?'opacity:0.5;':''}">${engine.name}</div>
                    <div style="font-size:13px;color:#57606a;margin-top:2px;">${engine.host}</div>
                </div>
                <label style="cursor:pointer;margin-left:12px;">
                    <input type="checkbox" ${engine.visible?'checked':''} style="position:absolute;opacity:0;">
                    <span style="display:inline-block;width:26px;height:26px;border:2px solid ${engine.visible?'#007aff':'#ccc'};border-radius:7px;background:${engine.visible?'#007aff':'#fff'};position:relative;transition:all .2s;">
                        <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(${engine.visible?1:0});width:16px;height:16px;color:#fff;transition:all .2s;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>
                    </span>
                </label>`;

            container.appendChild(item);

            item.querySelector('.move-up').onclick = () => {
                if (i > 0) {
                    [searchEngines[i], searchEngines[i-1]] = [searchEngines[i-1], searchEngines[i]];
                    renderList(container);
                }
            };
            item.querySelector('.move-down').onclick = () => {
                if (i < searchEngines.length - 1) {
                    [searchEngines[i], searchEngines[i+1]] = [searchEngines[i+1], searchEngines[i]];
                    renderList(container);
                }
            };

            item.querySelector('label').onclick = e => {
                e.preventDefault();
                engine.visible = !engine.visible;
                renderList(container);
            };
        });
    }

    function getCurrentInfo() {
        const url = location.href;
        const host = location.host;
        for (const e of searchEngines) {
            if (host.includes(e.host)) {
                for (const p of queryParams) {
                    const match = url.match(new RegExp('[?&]' + p + '=([^&]+)'));
                    if (match) {
                        // 修复：直接提取原始查询字符串，不进行解码
                        // 这样空格会保持为+号（如果是+号编码）或%20（如果是%20编码）
                        // 然后在创建工具栏时直接使用这个原始字符串
                        const queryParam = match[1].split('&')[0];
                        return { engine: e, rawQuery: queryParam };
                    }
                }
            }
        }
        return null;
    }

    // 滚动控制函数
    function handleScroll() {
        if (!toolbarHost) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollingDown = scrollTop > lastScrollTop;
        
        // 设置滚动阈值，避免小幅度滚动时频繁显示/隐藏
        const scrollThreshold = 10;
        
        if (scrollingDown && scrollTop - lastScrollTop > scrollThreshold) {
            // 向下滚动，隐藏工具栏
            if (toolbarVisible) {
                toolbarHost.style.transform = 'translateY(100%)';
                toolbarVisible = false;
            }
        } else if (!scrollingDown && lastScrollTop - scrollTop > scrollThreshold) {
            // 向上滚动，显示工具栏
            if (!toolbarVisible) {
                toolbarHost.style.transform = 'translateY(0)';
                toolbarVisible = true;
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }

    function createToolbar(info) {
        const { engine: currentEngine, rawQuery } = info;

        toolbarHost = document.createElement('div');
        toolbarHost.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;z-index:9999999;font-family:-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;transform:translateY(0);transition:transform 0.3s ease;';

        const shadow = toolbarHost.attachShadow({mode: 'open'});

        const style = document.createElement('style');
        style.textContent = `
            .toolbar-content{
                display:flex;
                width:100%;
                box-sizing:border-box;
                overflow-x:auto;
                overflow-y:hidden;
                background:rgba(255,255,255,0.95);
                border-top:1px solid rgba(224,224,224,0.8);
                height:48px; /* 工具栏整体高度稍微调低 */
                padding:0 8px;
                align-items:center;
                white-space:nowrap;
                backdrop-filter:blur(20px);
                box-shadow:0 -2px 20px rgba(0,0,0,0.08);
            }
            .toolbar-content::-webkit-scrollbar{display:none;}
            
            /* 搜索按钮样式 - 高度改矮 */
            a{
                display:inline-flex;
                align-items:center;
                justify-content:center;
                padding:6px 14px; /* 内边距减小，使按钮更矮 */
                margin:0 4px;
                border-radius:8px; /* 圆角稍微减小 */
                text-decoration:none;
                font-weight:500;
                font-size:14px;
                min-width:fit-content;
                transition:all .3s;
                background:#ffffff;
                border:1px solid #c0c0c0;
                color:#000;
                box-shadow:0 1px 3px rgba(0,0,0,0.08);
                height:32px; /* 高度从36px改为32px，更矮 */
                line-height:1;
                box-sizing:border-box;
            }
            a:hover{
                background:#f5f5f5;
                border-color:#999;
                transform:translateY(-1px);
                box-shadow:0 3px 8px rgba(0,0,0,0.1);
            }
            a.active{
                color:#007aff !important;
                background:#fff !important;
                border:1px solid #007aff !important;
                font-weight:600;
                transform:translateY(-1px);
            }
            
            /* 管理按钮样式 - 高度改矮 */
            .manage-btn{
                display:inline-flex;
                align-items:center;
                justify-content:center;
                padding:8px 16px; /* 内边距减小 */
                margin:0 4px;
                color:#666;
                cursor:pointer;
                font-weight:500;
                border-radius:8px; /* 圆角稍微减小 */
                background:rgba(248,249,250,0.9);
                height:32px; /* 高度从36px改为32px，更矮 */
                line-height:1;
                box-sizing:border-box;
                border:1px solid #c0c0c0;
                transition:all .3s;
            }
            .manage-btn:hover{
                background:#f5f5f5;
                border-color:#999;
                transform:translateY(-1px);
                box-shadow:0 3px 8px rgba(0,0,0,0.1);
            }
            
            /* 管理图标样式 - 调整大小以适应更矮的按钮 */
            .manage-icon{
                display:inline-block;
                width:18px; /* 从20px改为18px，适应更矮的按钮 */
                height:18px; /* 从20px改为18px */
                position:relative;
                color:currentColor;
            }
            
            /* 使用SVG创建齿轮图标，确保居中 */
            .manage-icon::before {
                content: '';
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%, -50%);
                width:18px; /* 从20px改为18px */
                height:18px; /* 从20px改为18px */
                background:currentColor;
                mask-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1 -2.83 0l-.06-.06a1.65 1.65 0 0 0 -1.82 -.33 1.65 1.65 0 0 0 -1 1.51V21a2 2 0 0 1 -2 2 2 2 0 0 1 -2 -2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0 -1.82.33l-.06.06a2 2 0 0 1 -2.83 0 2 2 0 0 1 0 -2.83l-.06-.06a1.65 1.65 0 0 0 .33 -1.82 1.65 1.65 0 0 0 -1.51 -1H3a2 2 0 0 1 -2 -2 2 2 0 0 1 2 -2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 -.33 -1.82l-.06-.06a2 2 0 0 1 0 -2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2 -2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82 -.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 -.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1 -2 2h-.09a1.65 1.65 0 0 0 -1.51 1z"/></svg>');
                -webkit-mask-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1 -2.83 0l-.06-.06a1.65 1.65 0 0 0 -1.82 -.33 1.65 1.65 0 0 0 -1 1.51V21a2 2 0 0 1 -2 2 2 2 0 0 1 -2 -2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0 -1.82.33l-.06.06a2 2 0 0 1 -2.83 0 2 2 0 0 1 0 -2.83l-.06-.06a1.65 1.65 0 0 0 .33 -1.82 1.65 1.65 0 0 0 -1.51 -1H3a2 2 0 0 1 -2 -2 2 2 0 0 1 2 -2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 -.33 -1.82l-.06-.06a2 2 0 0 1 0 -2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 0 1 2 -2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82 -.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 -.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1 -2 2h-.09a1.65 1.65 0 0 0 -1.51 1z"/></svg>');
                mask-repeat:no-repeat;
                mask-position:center;
                mask-size:contain;
                -webkit-mask-repeat:no-repeat;
                -webkit-mask-position:center;
                -webkit-mask-size:contain;
            }
            
            .separator{
                height:20px; /* 分隔线高度也相应减小 */
                width:1px;
                background:#e0e0e0;
                margin:0 12px;
                opacity:0.6;
            }
            
            /* 移除所有按钮的焦点边框 */
            a:focus, .manage-btn:focus, button:focus {
                outline: none !important;
                box-shadow: none !important;
            }
            
            @media(max-width:768px){
                .toolbar-content{height:44px;} /* 移动端工具栏高度也相应减小 */
                a,.manage-btn{
                    height:30px; /* 移动端按钮高度也减小 */
                    padding:5px 12px;
                }
            }
            @media(max-width:480px){
                .toolbar-content{height:40px;} /* 更小的屏幕工具栏更矮 */
                a,.manage-btn{
                    height:28px; /* 更小的屏幕按钮更矮 */
                    padding:4px 10px;
                    font-size:13px;
                }
                .manage-icon{
                    width:16px;
                    height:16px;
                }
                .manage-icon::before {
                    width:16px;
                    height:16px;
                }
            }
        `;
        shadow.appendChild(style);

        const content = document.createElement('div');
        content.className = 'toolbar-content';

        searchEngines.filter(e => e.visible).forEach(engine => {
            const a = document.createElement('a');
            a.textContent = engine.name;
            // 修复：直接使用原始查询字符串，不进行额外编码
            a.href = engine.url.replace('%keywords%', rawQuery);
            if (currentEngine && engine.id === currentEngine.id) a.classList.add('active');
            a.onclick = e => { e.preventDefault(); location.href = a.href; };
            content.appendChild(a);
        });

        const sep = document.createElement('div');
        sep.className = 'separator';
        content.appendChild(sep);

        const btn = document.createElement('div');
        btn.className = 'manage-btn';
        btn.innerHTML = '<span class="manage-icon"></span>';
        btn.title = '管理搜索引擎';
        btn.onclick = showManager;
        content.appendChild(btn);

        shadow.appendChild(content);
        document.body.appendChild(toolbarHost);
        document.body.style.paddingBottom = '55px'; /* 底部间距也相应减小 */

        // 添加滚动监听
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const info = getCurrentInfo();
    if (info) createToolbar(info);
})();
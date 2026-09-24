// ==UserScript==
// @name         Cookie 管理器
// @namespace    https://github.com/examplecode/useful-user-scripts/
// @version      1.0.0
// @description  管理当前网站的Cookies：查看、编辑、添加、删除、导入导出。支持Tampermonkey/Greasemonkey的GM_cookie API。
// @author       examplecode
// @match        *://*/*
// @grant        GM_cookie
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        panelWidth: '380px',
        maxCookieAge: 365 * 24 * 60 * 60, // 1年（秒）
        storagePrefix: 'cookie_mgr_',
    };

    // ==================== 样式 ====================
    const STYLES = `
        /* 样式重置 - 只重置容易冲突的属性，不重置 margin/padding */
        #cookie-manager-panel,
        #cookie-manager-panel * {
            box-sizing: border-box !important;
            text-align: left !important;
            word-break: normal !important;
            word-wrap: normal !important;
            white-space: normal !important;
            vertical-align: baseline !important;
            float: none !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        #cookie-manager-panel {
            position: fixed !important;
            top: 0 !important;
            right: -${CONFIG.panelWidth} !important;
            width: ${CONFIG.panelWidth} !important;
            height: 100vh !important;
            height: 100dvh !important;
            background: #fff !important;
            box-shadow: -2px 0 12px rgba(0,0,0,0.15) !important;
            z-index: 2147483647 !important;
            transition: right 0.3s ease !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            color: #333 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
        }
        #cookie-manager-panel.open {
            right: 0 !important;
        }
        .cm-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            padding: 12px 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-shrink: 0 !important;
        }
        .cm-header h3 {
            margin: 0 !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            color: white !important;
            display: inline-block !important;
            width: auto !important;
        }
        .cm-header-actions {
            display: flex !important;
            gap: 8px !important;
            flex-shrink: 0 !important;
            width: auto !important;
        }
        .cm-header-btn {
            background: rgba(255,255,255,0.2) !important;
            color: white !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }
        .cm-header-btn:hover {
            background: rgba(255,255,255,0.35) !important;
        }
        .cm-toolbar {
            padding: 10px 12px !important;
            border-bottom: 1px solid #eee !important;
            display: flex !important;
            gap: 6px !important;
            flex-shrink: 0 !important;
            flex-wrap: wrap !important;
            width: 100% !important;
        }
        .cm-btn {
            padding: 6px 12px !important;
            border: 1px solid #ddd !important;
            background: #fff !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            color: #333 !important;
            transition: all 0.2s !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: auto !important;
            height: auto !important;
            line-height: 1.5 !important;
        }
        .cm-btn:hover {
            background: #f5f5f5 !important;
            border-color: #ccc !important;
        }
        .cm-btn-primary {
            background: #667eea !important;
            color: white !important;
            border-color: #667eea !important;
        }
        .cm-btn-primary:hover {
            background: #5a6fd6 !important;
        }
        .cm-btn-danger {
            color: #e74c3c !important;
            border-color: #e74c3c !important;
            background: #fff !important;
        }
        .cm-btn-danger:hover {
            background: #e74c3c !important;
            color: white !important;
        }
        .cm-search {
            padding: 8px 12px !important;
            border-bottom: 1px solid #eee !important;
            display: block !important;
            flex-shrink: 0 !important;
            width: 100% !important;
        }
        .cm-search input {
            width: 100% !important;
            padding: 6px 10px !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            font-size: 13px !important;
            outline: none !important;
            background: #fff !important;
            color: #333 !important;
            display: block !important;
        }
        .cm-search input:focus {
            border-color: #667eea !important;
        }
        .cm-cookie-list {
            flex: 1 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding: 8px 12px !important;
            display: block !important;
            width: 100% !important;
        }
        .cm-cookie-item {
            background: #f9f9f9 !important;
            border: 1px solid #eee !important;
            border-radius: 6px !important;
            margin-bottom: 8px !important;
            overflow: hidden !important;
            display: block !important;
            width: 100% !important;
        }
        .cm-cookie-header {
            display: flex !important;
            align-items: center !important;
            padding: 8px 10px !important;
            cursor: pointer !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            width: 100% !important;
        }
        .cm-cookie-header:hover {
            background: #f0f0f0 !important;
        }
        .cm-cookie-name {
            font-weight: 600 !important;
            font-size: 13px !important;
            color: #333 !important;
            flex: 1 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: inline-block !important;
            width: auto !important;
        }
        .cm-cookie-value-preview {
            font-size: 11px !important;
            color: #888 !important;
            max-width: 120px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            margin-left: 8px !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
            width: auto !important;
        }
        .cm-cookie-toggle {
            font-size: 12px !important;
            color: #999 !important;
            margin-left: 8px !important;
            transition: transform 0.2s !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
            width: auto !important;
        }
        .cm-cookie-toggle.expanded {
            transform: rotate(180deg) !important;
        }
        .cm-cookie-details {
            display: none !important;
            padding: 10px !important;
            background: #fff !important;
            border-top: 1px solid #eee !important;
        }
        .cm-cookie-details.show {
            display: block !important;
        }
        .cm-detail-row {
            display: flex !important;
            margin-bottom: 6px !important;
            font-size: 12px !important;
            align-items: flex-start !important;
            width: 100% !important;
        }
        .cm-detail-label {
            width: 70px !important;
            color: #666 !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
            white-space: nowrap !important;
        }
        .cm-detail-value {
            flex: 1 !important;
            color: #333 !important;
            word-break: break-all !important;
            white-space: normal !important;
            display: inline-block !important;
            min-width: 0 !important;
        }
        .cm-detail-actions {
            display: flex !important;
            gap: 6px !important;
            margin-top: 8px !important;
            flex-wrap: wrap !important;
            width: 100% !important;
        }
        .cm-empty {
            text-align: center !important;
            color: #999 !important;
            padding: 40px 20px !important;
            font-size: 14px !important;
        }
        .cm-status {
            padding: 6px 12px !important;
            background: #f5f5f5 !important;
            border-top: 1px solid #eee !important;
            font-size: 11px !important;
            color: #666 !important;
            flex-shrink: 0 !important;
            display: block !important;
            width: 100% !important;
        }
        /* 模态框 */
        .cm-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.4) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .cm-modal {
            background: white !important;
            border-radius: 8px !important;
            width: 340px !important;
            max-width: 90% !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
            display: block !important;
        }
        .cm-modal-header {
            padding: 14px 16px !important;
            border-bottom: 1px solid #eee !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            color: #333 !important;
            display: block !important;
        }
        .cm-modal-body {
            padding: 16px !important;
            display: block !important;
        }
        .cm-form-group {
            margin-bottom: 12px !important;
            display: block !important;
        }
        .cm-form-group label {
            display: block !important;
            font-size: 12px !important;
            color: #666 !important;
            margin-bottom: 4px !important;
            text-align: left !important;
        }
        .cm-form-group input,
        .cm-form-group select {
            width: 100% !important;
            padding: 8px 10px !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            font-size: 13px !important;
            outline: none !important;
            background: #fff !important;
            color: #333 !important;
            display: block !important;
            box-sizing: border-box !important;
        }
        .cm-form-group input:focus,
        .cm-form-group select:focus {
            border-color: #667eea !important;
        }
        .cm-form-group input[type="checkbox"] {
            width: auto !important;
            margin-right: 6px !important;
            display: inline-block !important;
        }
        .cm-modal-footer {
            padding: 12px 16px !important;
            border-top: 1px solid #eee !important;
            display: flex !important;
            justify-content: flex-end !important;
            gap: 8px !important;
        }
        /* 浮动按钮 */
        #cookie-manager-fab {
            position: fixed !important;
            bottom: 80px !important;
            right: 16px !important;
            width: 44px !important;
            height: 44px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 20px !important;
            cursor: pointer !important;
            z-index: 2147483646 !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: transform 0.2s !important;
            padding: 0 !important;
            margin: 0 !important;
            text-align: center !important;
            line-height: 1 !important;
        }
        #cookie-manager-fab:hover {
            transform: scale(1.1) !important;
        }
        /* Toast */
        .cm-toast {
            position: fixed !important;
            bottom: 140px !important;
            right: 20px !important;
            background: #333 !important;
            color: white !important;
            padding: 10px 18px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            z-index: 2147483647 !important;
            opacity: 0 !important;
            transform: translateY(10px) !important;
            transition: all 0.3s !important;
            display: block !important;
            white-space: nowrap !important;
            margin: 0 !important;
        }
        .cm-toast.show {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        /* 移动端适配 */
        @media (max-width: 480px) {
            #cookie-manager-panel {
                width: 100% !important;
                right: -100% !important;
            }
            .cm-modal {
                width: 90% !important;
            }
        }
    `;

    // ==================== 工具函数 ====================
    function showToast(msg, duration = 2000) {
        let toast = document.querySelector('.cm-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'cm-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatDate(timestamp) {
        if (!timestamp) return '会话';
        const d = new Date(timestamp * 1000);
        return d.toLocaleString('zh-CN');
    }

    function getDomain() {
        return location.hostname;
    }

    // ==================== Cookie 操作 ====================
    // 判断 GM_cookie 回调的 error 是否真的是错误
    function isRealError(error) {
        if (!error) return false;
        if (typeof error === 'string' && error.toLowerCase() === 'success') return false;
        return true;
    }

    const CookieAPI = {
        // 列出当前域名的cookies
        list(callback) {
            GM_cookie.list({ url: location.href }, (cookies, error) => {
                if (isRealError(error)) {
                    console.error('[Cookie Manager] 列出cookie失败:', error);
                    callback([], error);
                    return;
                }
                callback(cookies || [], null);
            });
        },

        // 设置cookie
        set(details, callback) {
            const cookieDetails = {
                url: location.href,
                name: details.name,
                value: details.value,
                path: details.path || '/',
                secure: details.secure || false,
                httpOnly: details.httpOnly || false,
                sameSite: details.sameSite || 'unspecified',
            };

            if (details.domain) {
                cookieDetails.domain = details.domain;
            }

            if (details.expirationDate) {
                cookieDetails.expirationDate = details.expirationDate;
            }

            GM_cookie.set(cookieDetails, (error) => {
                if (isRealError(error)) {
                    console.error('[Cookie Manager] 设置cookie失败:', error);
                    callback(error);
                    return;
                }
                callback(null);
            });
        },

        // 删除cookie
        delete(details, callback) {
            GM_cookie.delete({
                url: location.href,
                name: details.name,
                storeId: details.storeId,
            }, (error) => {
                if (isRealError(error)) {
                    console.error('[Cookie Manager] 删除cookie失败:', error);
                    callback(error);
                    return;
                }
                callback(null);
            });
        },

        // 删除所有cookies
        deleteAll(cookies, callback) {
            let count = 0;
            let failCount = 0;
            const total = cookies.length;

            if (total === 0) {
                callback(null, 0);
                return;
            }

            cookies.forEach((cookie) => {
                CookieAPI.delete(cookie, (error) => {
                    if (error) failCount++;
                    count++;
                    if (count === total) {
                        callback(failCount > 0 ? '部分删除失败' : null, count - failCount);
                    }
                });
            });
        },

        // 导出cookies为JSON
        exportJSON(cookies) {
            return JSON.stringify(cookies, null, 2);
        },

        // 导入cookies从JSON
        importJSON(jsonStr, callback) {
            try {
                const cookies = JSON.parse(jsonStr);
                if (!Array.isArray(cookies)) {
                    callback(new Error('无效格式：需要Cookie数组'));
                    return;
                }

                let count = 0;
                let failCount = 0;
                const total = cookies.length;

                cookies.forEach((cookie) => {
                    if (!cookie.name) {
                        count++;
                        if (count === total) callback(failCount > 0 ? '部分导入失败' : null, count - failCount);
                        return;
                    }

                    CookieAPI.set({
                        name: cookie.name,
                        value: cookie.value || '',
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        sameSite: cookie.sameSite,
                        expirationDate: cookie.expirationDate,
                    }, (error) => {
                        if (error) failCount++;
                        count++;
                        if (count === total) callback(failCount > 0 ? '部分导入失败' : null, count - failCount);
                    });
                });
            } catch (e) {
                callback(e);
            }
        },
    };

    // ==================== UI 组件 ====================
    class CookieManagerUI {
        constructor() {
            this.panel = null;
            this.fab = null;
            this.cookies = [];
            this.searchTerm = '';
            this.expandedItems = new Set();
            this.init();
        }

        init() {
            // 注入样式
            GM_addStyle(STYLES);

            // 创建浮动按钮
            this.createFAB();

            // 创建面板
            this.createPanel();

            // 注册菜单命令
            this.registerMenuCommands();

            // 监听快捷键
            this.registerShortcuts();
        }

        createFAB() {
            this.fab = document.createElement('button');
            this.fab.id = 'cookie-manager-fab';
            this.fab.innerHTML = '🍪';
            this.fab.title = 'Cookie 管理器';
            this.fab.addEventListener('click', () => this.togglePanel());
            document.body.appendChild(this.fab);
        }

        createPanel() {
            this.panel = document.createElement('div');
            this.panel.id = 'cookie-manager-panel';
            this.panel.innerHTML = `
                <div class="cm-header">
                    <h3>🍪 Cookie 管理器</h3>
                    <div class="cm-header-actions">
                        <button class="cm-header-btn" id="cm-refresh" title="刷新">↻</button>
                        <button class="cm-header-btn" id="cm-close" title="关闭">✕</button>
                    </div>
                </div>
                <div class="cm-toolbar">
                    <button class="cm-btn cm-btn-primary" id="cm-add">+ 添加</button>
                    <button class="cm-btn" id="cm-export">导出</button>
                    <button class="cm-btn" id="cm-import">导入</button>
                    <button class="cm-btn cm-btn-danger" id="cm-delete-all">清空</button>
                </div>
                <div class="cm-search">
                    <input type="text" id="cm-search-input" placeholder="搜索 Cookie 名称或值...">
                </div>
                <div class="cm-cookie-list" id="cm-cookie-list">
                    <div class="cm-empty">加载中...</div>
                </div>
                <div class="cm-status" id="cm-status">就绪</div>
            `;
            document.body.appendChild(this.panel);

            // 绑定事件
            this.bindEvents();
        }

        bindEvents() {
            // 关闭按钮
            document.getElementById('cm-close').addEventListener('click', () => this.closePanel());

            // 刷新按钮
            document.getElementById('cm-refresh').addEventListener('click', () => this.loadCookies());

            // 添加按钮
            document.getElementById('cm-add').addEventListener('click', () => this.showAddModal());

            // 导出按钮
            document.getElementById('cm-export').addEventListener('click', () => this.exportCookies());

            // 导入按钮
            document.getElementById('cm-import').addEventListener('click', () => this.showImportModal());

            // 清空按钮
            document.getElementById('cm-delete-all').addEventListener('click', () => this.deleteAllCookies());

            // 搜索框
            document.getElementById('cm-search-input').addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderCookies();
            });

            // 点击面板外关闭
            document.addEventListener('click', (e) => {
                if (this.panel.classList.contains('open') &&
                    !this.panel.contains(e.target) &&
                    e.target !== this.fab) {
                    this.closePanel();
                }
            });
        }

        registerMenuCommands() {
            GM_registerMenuCommand('🍪 Cookie 管理器', () => this.togglePanel());
            GM_registerMenuCommand('📋 导出当前域名 Cookies', () => this.exportCookies());
        }

        registerShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+C 打开面板
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    this.togglePanel();
                }
                // ESC 关闭面板
                if (e.key === 'Escape' && this.panel.classList.contains('open')) {
                    this.closePanel();
                }
            });
        }

        togglePanel() {
            if (this.panel.classList.contains('open')) {
                this.closePanel();
            } else {
                this.openPanel();
            }
        }

        openPanel() {
            this.panel.classList.add('open');
            this.loadCookies();
        }

        closePanel() {
            this.panel.classList.remove('open');
        }

        loadCookies() {
            this.setStatus('正在加载...');
            CookieAPI.list((cookies, error) => {
                if (error) {
                    this.setStatus('加载失败: ' + error);
                    showToast('加载Cookie失败');
                    return;
                }
                this.cookies = cookies;
                this.renderCookies();
                this.setStatus(`共 ${cookies.length} 个 Cookie`);
            });
        }

        renderCookies() {
            const list = document.getElementById('cm-cookie-list');
            const filtered = this.getFilteredCookies();

            if (filtered.length === 0) {
                list.innerHTML = '<div class="cm-empty">暂无 Cookie</div>';
                return;
            }

            list.innerHTML = filtered.map((cookie, index) => `
                <div class="cm-cookie-item" data-index="${index}">
                    <div class="cm-cookie-header" data-index="${index}">
                        <span class="cm-cookie-name">${escapeHtml(cookie.name)}</span>
                        <span class="cm-cookie-value-preview">${escapeHtml(cookie.value)}</span>
                        <span class="cm-cookie-toggle ${this.expandedItems.has(index) ? 'expanded' : ''}">▼</span>
                    </div>
                    <div class="cm-cookie-details ${this.expandedItems.has(index) ? 'show' : ''}" data-index="${index}">
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">名称:</span>
                            <span class="cm-detail-value">${escapeHtml(cookie.name)}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">值:</span>
                            <span class="cm-detail-value">${escapeHtml(cookie.value)}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">域名:</span>
                            <span class="cm-detail-value">${escapeHtml(cookie.domain)}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">路径:</span>
                            <span class="cm-detail-value">${escapeHtml(cookie.path)}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">过期:</span>
                            <span class="cm-detail-value">${formatDate(cookie.expirationDate)}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">安全:</span>
                            <span class="cm-detail-value">${cookie.secure ? '✓ 是' : '✗ 否'}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">HttpOnly:</span>
                            <span class="cm-detail-value">${cookie.httpOnly ? '✓ 是' : '✗ 否'}</span>
                        </div>
                        <div class="cm-detail-row">
                            <span class="cm-detail-label">SameSite:</span>
                            <span class="cm-detail-value">${cookie.sameSite || '未设置'}</span>
                        </div>
                        <div class="cm-detail-actions">
                            <button class="cm-btn cm-btn-primary cm-edit-btn" data-index="${index}">编辑</button>
                            <button class="cm-btn cm-btn-danger cm-delete-btn" data-index="${index}">删除</button>
                            <button class="cm-btn cm-copy-btn" data-index="${index}">复制值</button>
                        </div>
                    </div>
                </div>
            `).join('');

            // 绑定展开/折叠事件
            list.querySelectorAll('.cm-cookie-header').forEach((header) => {
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(header.dataset.index);
                    this.toggleExpand(idx);
                });
            });

            // 绑定编辑事件
            list.querySelectorAll('.cm-edit-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index);
                    this.showEditModal(idx);
                });
            });

            // 绑定删除事件
            list.querySelectorAll('.cm-delete-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index);
                    this.deleteCookie(idx);
                });
            });

            // 绑定复制事件
            list.querySelectorAll('.cm-copy-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index);
                    this.copyCookieValue(idx);
                });
            });
        }

        toggleExpand(index) {
            if (this.expandedItems.has(index)) {
                this.expandedItems.delete(index);
            } else {
                this.expandedItems.add(index);
            }
            this.renderCookies();
        }

        getFilteredCookies() {
            if (!this.searchTerm) return this.cookies;

            return this.cookies.filter((cookie) => {
                const nameMatch = cookie.name.toLowerCase().includes(this.searchTerm);
                const valueMatch = cookie.value.toLowerCase().includes(this.searchTerm);
                const domainMatch = cookie.domain.toLowerCase().includes(this.searchTerm);
                return nameMatch || valueMatch || domainMatch;
            });
        }

        // ==================== 模态框 ====================
        showModal(title, bodyHTML, onConfirm) {
            const overlay = document.createElement('div');
            overlay.className = 'cm-modal-overlay';
            overlay.innerHTML = `
                <div class="cm-modal">
                    <div class="cm-modal-header">${title}</div>
                    <div class="cm-modal-body">${bodyHTML}</div>
                    <div class="cm-modal-footer">
                        <button class="cm-btn cm-cancel-btn">取消</button>
                        <button class="cm-btn cm-btn-primary cm-confirm-btn">确定</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            overlay.querySelector('.cm-cancel-btn').addEventListener('click', () => {
                overlay.remove();
            });

            overlay.querySelector('.cm-confirm-btn').addEventListener('click', () => {
                onConfirm(overlay);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        }

        showAddModal() {
            const body = `
                <div class="cm-form-group">
                    <label>名称 *</label>
                    <input type="text" id="cm-cookie-name" placeholder="cookie_name">
                </div>
                <div class="cm-form-group">
                    <label>值</label>
                    <input type="text" id="cm-cookie-value" placeholder="cookie_value">
                </div>
                <div class="cm-form-group">
                    <label>域名</label>
                    <input type="text" id="cm-cookie-domain" placeholder="${getDomain()}" value="${getDomain()}">
                </div>
                <div class="cm-form-group">
                    <label>路径</label>
                    <input type="text" id="cm-cookie-path" placeholder="/" value="/">
                </div>
                <div class="cm-form-group">
                    <label>过期时间</label>
                    <input type="datetime-local" id="cm-cookie-expire">
                </div>
                <div class="cm-form-group">
                    <label>
                        <input type="checkbox" id="cm-cookie-secure">
                        Secure（仅HTTPS）
                    </label>
                </div>
                <div class="cm-form-group">
                    <label>
                        <input type="checkbox" id="cm-cookie-httponly">
                        HttpOnly
                    </label>
                </div>
                <div class="cm-form-group">
                    <label>SameSite</label>
                    <select id="cm-cookie-samesite">
                        <option value="unspecified">未指定</option>
                        <option value="no_restriction">None</option>
                        <option value="lax">Lax</option>
                        <option value="strict">Strict</option>
                    </select>
                </div>
            `;

            this.showModal('添加 Cookie', body, (overlay) => {
                const name = overlay.querySelector('#cm-cookie-name').value.trim();
                if (!name) {
                    showToast('请输入 Cookie 名称');
                    return;
                }

                const value = overlay.querySelector('#cm-cookie-value').value;
                const domain = overlay.querySelector('#cm-cookie-domain').value.trim();
                const path = overlay.querySelector('#cm-cookie-path').value || '/';
                const expireStr = overlay.querySelector('#cm-cookie-expire').value;
                const secure = overlay.querySelector('#cm-cookie-secure').checked;
                const httpOnly = overlay.querySelector('#cm-cookie-httponly').checked;
                const sameSite = overlay.querySelector('#cm-cookie-samesite').value;

                let expirationDate = undefined;
                if (expireStr) {
                    expirationDate = Math.floor(new Date(expireStr).getTime() / 1000);
                }

                CookieAPI.set({
                    name,
                    value,
                    domain,
                    path,
                    secure,
                    httpOnly,
                    sameSite,
                    expirationDate,
                }, (error) => {
                    if (error) {
                        showToast('添加失败: ' + error);
                    } else {
                        showToast('添加成功');
                        overlay.remove();
                        this.loadCookies();
                    }
                });
            });
        }

        showEditModal(index) {
            const cookie = this.getFilteredCookies()[index];
            if (!cookie) return;

            const expireDateStr = cookie.expirationDate
                ? new Date(cookie.expirationDate * 1000).toISOString().slice(0, 16)
                : '';

            const body = `
                <div class="cm-form-group">
                    <label>名称</label>
                    <input type="text" id="cm-edit-name" value="${escapeHtml(cookie.name)}" readonly style="background:#f5f5f5">
                </div>
                <div class="cm-form-group">
                    <label>值</label>
                    <input type="text" id="cm-edit-value" value="${escapeHtml(cookie.value)}">
                </div>
                <div class="cm-form-group">
                    <label>域名</label>
                    <input type="text" id="cm-edit-domain" value="${escapeHtml(cookie.domain)}">
                </div>
                <div class="cm-form-group">
                    <label>路径</label>
                    <input type="text" id="cm-edit-path" value="${escapeHtml(cookie.path)}">
                </div>
                <div class="cm-form-group">
                    <label>过期时间</label>
                    <input type="datetime-local" id="cm-edit-expire" value="${expireDateStr}">
                </div>
                <div class="cm-form-group">
                    <label>
                        <input type="checkbox" id="cm-edit-secure" ${cookie.secure ? 'checked' : ''}>
                        Secure（仅HTTPS）
                    </label>
                </div>
                <div class="cm-form-group">
                    <label>
                        <input type="checkbox" id="cm-edit-httponly" ${cookie.httpOnly ? 'checked' : ''}>
                        HttpOnly
                    </label>
                </div>
                <div class="cm-form-group">
                    <label>SameSite</label>
                    <select id="cm-edit-samesite">
                        <option value="unspecified" ${cookie.sameSite === 'unspecified' ? 'selected' : ''}>未指定</option>
                        <option value="no_restriction" ${cookie.sameSite === 'no_restriction' ? 'selected' : ''}>None</option>
                        <option value="lax" ${cookie.sameSite === 'lax' ? 'selected' : ''}>Lax</option>
                        <option value="strict" ${cookie.sameSite === 'strict' ? 'selected' : ''}>Strict</option>
                    </select>
                </div>
            `;

            this.showModal('编辑 Cookie', body, (overlay) => {
                const value = overlay.querySelector('#cm-edit-value').value;
                const domain = overlay.querySelector('#cm-edit-domain').value.trim();
                const path = overlay.querySelector('#cm-edit-path').value || '/';
                const expireStr = overlay.querySelector('#cm-edit-expire').value;
                const secure = overlay.querySelector('#cm-edit-secure').checked;
                const httpOnly = overlay.querySelector('#cm-edit-httponly').checked;
                const sameSite = overlay.querySelector('#cm-edit-samesite').value;

                let expirationDate = undefined;
                if (expireStr) {
                    expirationDate = Math.floor(new Date(expireStr).getTime() / 1000);
                }

                // 先删除旧cookie，再设置新的
                CookieAPI.delete(cookie, (error) => {
                    if (error) {
                        showToast('更新失败: ' + error);
                        return;
                    }

                    CookieAPI.set({
                        name: cookie.name,
                        value,
                        domain,
                        path,
                        secure,
                        httpOnly,
                        sameSite,
                        expirationDate,
                    }, (error) => {
                        if (error) {
                            showToast('更新失败: ' + error);
                        } else {
                            showToast('更新成功');
                            overlay.remove();
                            this.loadCookies();
                        }
                    });
                });
            });
        }

        deleteCookie(index) {
            const cookie = this.getFilteredCookies()[index];
            if (!cookie) return;

            if (confirm(`确定要删除 Cookie "${cookie.name}" 吗？`)) {
                CookieAPI.delete(cookie, (error) => {
                    if (error) {
                        showToast('删除失败: ' + error);
                    } else {
                        showToast('已删除');
                        this.loadCookies();
                    }
                });
            }
        }

        deleteAllCookies() {
            if (this.cookies.length === 0) {
                showToast('没有可删除的 Cookie');
                return;
            }

            if (confirm(`确定要删除当前域名的全部 ${this.cookies.length} 个 Cookie 吗？`)) {
                this.setStatus('正在删除...');
                CookieAPI.deleteAll(this.cookies, (error, count) => {
                    if (error) {
                        showToast('删除失败');
                    } else {
                        showToast(`已删除 ${count} 个 Cookie`);
                        this.loadCookies();
                    }
                });
            }
        }

        copyCookieValue(index) {
            const cookie = this.getFilteredCookies()[index];
            if (!cookie) return;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(cookie.value).then(() => {
                    showToast('已复制到剪贴板');
                }).catch(() => {
                    this.fallbackCopy(cookie.value);
                });
            } else {
                this.fallbackCopy(cookie.value);
            }
        }

        fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('已复制到剪贴板');
            } catch (e) {
                showToast('复制失败');
            }
            textarea.remove();
        }

        exportCookies() {
            if (this.cookies.length === 0) {
                showToast('没有可导出的 Cookie');
                return;
            }

            const json = CookieAPI.exportJSON(this.cookies);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cookies_${getDomain()}_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('导出成功');
        }

        showImportModal() {
            const body = `
                <div class="cm-form-group">
                    <label>粘贴 Cookie JSON 数据</label>
                    <textarea id="cm-import-data" style="width:100%;height:150px;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:monospace;resize:vertical" placeholder='[{"name":"example","value":"123","domain":".example.com"}]'></textarea>
                </div>
            `;

            this.showModal('导入 Cookies', body, (overlay) => {
                const jsonStr = overlay.querySelector('#cm-import-data').value.trim();
                if (!jsonStr) {
                    showToast('请输入 JSON 数据');
                    return;
                }

                CookieAPI.importJSON(jsonStr, (error, count) => {
                    if (error) {
                        showToast('导入失败: ' + error.message);
                    } else {
                        showToast(`成功导入 ${count} 个 Cookie`);
                        overlay.remove();
                        this.loadCookies();
                    }
                });
            });
        }

        setStatus(text) {
            const status = document.getElementById('cm-status');
            if (status) status.textContent = text;
        }
    }

    // ==================== 初始化 ====================
    // 等待 DOM 就绪
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new CookieManagerUI());
    } else {
        new CookieManagerUI();
    }
})();

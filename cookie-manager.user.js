// ==UserScript==
// @name         Cookie 管理器
// @namespace    https://github.com/examplecode/useful-user-scripts/
// @version      2.0.1
// @description  管理当前网站的Cookies：查看、复制、编辑、添加、删除、导入导出
// @author       examplecode
// @match        *://*/*
// @homepage     https://github.com/examplecode/useful-user-scripts/
// @grant        GM_cookie
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        panelWidth: '380px',
    };

    // ==================== 样式（Shadow DOM 内部，无需 !important）====================
    const STYLES = `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host {
            all: initial;
        }

        .panel {
            position: fixed;
            top: 0;
            right: -${CONFIG.panelWidth};
            width: ${CONFIG.panelWidth};
            height: 100vh;
            height: 100dvh;
            background: #fff;
            box-shadow: -2px 0 12px rgba(0,0,0,0.15);
            z-index: 2147483647;
            transition: right 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .panel.open {
            right: 0;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }
        .header h3 {
            font-size: 16px;
            font-weight: 600;
            color: white;
        }
        .header-actions {
            display: flex;
            gap: 8px;
        }
        .header-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .header-btn:hover {
            background: rgba(255,255,255,0.35);
        }
        .toolbar {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 6px;
            flex-shrink: 0;
            flex-wrap: wrap;
        }
        .btn {
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #333;
            transition: all 0.2s;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1.5;
        }
        .btn:hover {
            background: #f5f5f5;
            border-color: #ccc;
        }
        .btn-primary {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        .btn-primary:hover {
            background: #5a6fd6;
        }
        .btn-danger {
            color: #e74c3c;
            border-color: #e74c3c;
        }
        .btn-danger:hover {
            background: #e74c3c;
            color: white;
        }
        .search {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
            flex-shrink: 0;
        }
        .search input {
            width: 100%;
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
            background: #fff;
            color: #333;
        }
        .search input:focus {
            border-color: #667eea;
        }
        .cookie-list {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 8px 12px;
        }
        .cookie-item {
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 6px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        .cookie-header {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            cursor: pointer;
            user-select: none;
        }
        .cookie-header:hover {
            background: #f0f0f0;
        }
        .cookie-name {
            font-weight: 600;
            font-size: 13px;
            color: #333;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .cookie-value-preview {
            font-size: 11px;
            color: #888;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-left: 8px;
            flex-shrink: 0;
        }
        .cookie-toggle {
            font-size: 12px;
            color: #999;
            margin-left: 8px;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        .cookie-toggle.expanded {
            transform: rotate(180deg);
        }
        .cookie-details {
            display: none;
            padding: 10px;
            background: #fff;
            border-top: 1px solid #eee;
        }
        .cookie-details.show {
            display: block;
        }
        .detail-row {
            display: flex;
            margin-bottom: 6px;
            font-size: 12px;
            align-items: flex-start;
        }
        .detail-label {
            width: 70px;
            color: #666;
            flex-shrink: 0;
            white-space: nowrap;
        }
        .detail-value {
            flex: 1;
            color: #333;
            word-break: break-all;
            min-width: 0;
        }
        .detail-actions {
            display: flex;
            gap: 6px;
            margin-top: 8px;
            flex-wrap: wrap;
        }
        .empty {
            text-align: center;
            color: #999;
            padding: 40px 20px;
            font-size: 14px;
        }
        .status {
            padding: 6px 12px;
            background: #f5f5f5;
            border-top: 1px solid #eee;
            font-size: 11px;
            color: #666;
            flex-shrink: 0;
        }
        /* 模态框 */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.4);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal {
            background: white;
            border-radius: 8px;
            width: 340px;
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .modal-header {
            padding: 14px 16px;
            border-bottom: 1px solid #eee;
            font-weight: 600;
            font-size: 15px;
            color: #333;
        }
        .modal-body {
            padding: 16px;
        }
        .form-group {
            margin-bottom: 12px;
        }
        .form-group label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
            background: #fff;
            color: #333;
        }
        .form-group input:focus,
        .form-group select:focus {
            border-color: #667eea;
        }
        .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 6px;
        }
        .modal-footer {
            padding: 12px 16px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        /* 浮动按钮 */
        .fab {
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 2147483646;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .fab:hover {
            transform: scale(1.1);
        }
        /* Toast */
        .toast {
            position: fixed;
            bottom: 140px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            z-index: 2147483647;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s;
            white-space: nowrap;
        }
        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }
        /* 移动端适配 */
        @media (max-width: 480px) {
            .panel {
                width: 100%;
                right: -100%;
            }
            .modal {
                width: 90%;
            }
        }
    `;

    // ==================== 工具函数 ====================
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
    function isRealError(error) {
        if (!error) return false;
        if (typeof error === 'string' && error.toLowerCase() === 'success') return false;
        return true;
    }

    const CookieAPI = {
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
            if (details.domain) cookieDetails.domain = details.domain;
            if (details.expirationDate) cookieDetails.expirationDate = details.expirationDate;

            GM_cookie.set(cookieDetails, (error) => {
                if (isRealError(error)) {
                    console.error('[Cookie Manager] 设置cookie失败:', error);
                    callback(error);
                    return;
                }
                callback(null);
            });
        },

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

        deleteAll(cookies, callback) {
            let count = 0;
            let failCount = 0;
            const total = cookies.length;
            if (total === 0) { callback(null, 0); return; }

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

        exportJSON(cookies) {
            return JSON.stringify(cookies, null, 2);
        },

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

    // ==================== UI 组件（Shadow DOM）====================
    class CookieManagerUI {
        constructor() {
            this.cookies = [];
            this.searchTerm = '';
            this.expandedItems = new Set();
            this.init();
        }

        init() {
            // 创建 Shadow DOM 宿主
            this.host = document.createElement('div');
            this.host.id = 'cookie-manager-root';
            this.shadow = this.host.attachShadow({ mode: 'open' });

            // 注入样式到 Shadow DOM
            const styleEl = document.createElement('style');
            styleEl.textContent = STYLES;
            this.shadow.appendChild(styleEl);

            // 创建浮动按钮
            this.createFAB();

            // 创建面板
            this.createPanel();

            // 挂载到页面
            document.body.appendChild(this.host);

            // 注册菜单命令
            this.registerMenuCommands();

            // 监听快捷键
            this.registerShortcuts();
        }

        // 在 Shadow DOM 中查找元素
        $(selector) {
            return this.shadow.querySelector(selector);
        }

        $$(selector) {
            return this.shadow.querySelectorAll(selector);
        }

        showToast(msg, duration = 2000) {
            let toast = this.$('.toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'toast';
                this.shadow.appendChild(toast);
            }
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }

        createFAB() {
            this.fab = document.createElement('button');
            this.fab.className = 'fab';
            this.fab.innerHTML = '🍪';
            this.fab.addEventListener('click', () => this.togglePanel());
            this.shadow.appendChild(this.fab);
        }

        createPanel() {
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            this.panel.innerHTML = `
                <div class="header">
                    <h3>🍪 Cookie 管理器</h3>
                    <div class="header-actions">
                        <button class="header-btn" id="refresh" title="刷新">↻</button>
                        <button class="header-btn" id="close" title="关闭">✕</button>
                    </div>
                </div>
                <div class="toolbar">
                    <button class="btn btn-primary" id="add">+ 添加</button>
                    <button class="btn" id="copy-all">复制</button>
                    <button class="btn" id="export">导出</button>
                    <button class="btn" id="import">导入</button>
                    <button class="btn btn-danger" id="delete-all">清空</button>
                </div>
                <div class="search">
                    <input type="text" id="search-input" placeholder="搜索 Cookie 名称或值...">
                </div>
                <div class="cookie-list" id="cookie-list">
                    <div class="empty">加载中...</div>
                </div>
                <div class="status" id="status">就绪</div>
            `;
            this.shadow.appendChild(this.panel);

            // 绑定事件
            this.bindEvents();
        }

        bindEvents() {
            this.$('#close').addEventListener('click', () => this.closePanel());
            this.$('#refresh').addEventListener('click', () => this.loadCookies());
            this.$('#add').addEventListener('click', () => this.showAddModal());
            this.$('#copy-all').addEventListener('click', () => this.copyAllCookies());
            this.$('#export').addEventListener('click', () => this.exportCookies());
            this.$('#import').addEventListener('click', () => this.showImportModal());
            this.$('#delete-all').addEventListener('click', () => this.deleteAllCookies());

            this.$('#search-input').addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderCookies();
            });

            // 点击面板外关闭（Shadow DOM 中事件会冒泡到宿主）
            document.addEventListener('click', (e) => {
                if (this.panel.classList.contains('open') &&
                    e.target !== this.host && !this.shadow.contains(e.target)) {
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
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    this.togglePanel();
                }
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
                    this.showToast('加载Cookie失败');
                    return;
                }
                this.cookies = cookies;
                this.renderCookies();
                this.setStatus(`共 ${cookies.length} 个 Cookie`);
            });
        }

        renderCookies() {
            const list = this.$('#cookie-list');
            const filtered = this.getFilteredCookies();

            if (filtered.length === 0) {
                list.innerHTML = '<div class="empty">暂无 Cookie</div>';
                return;
            }

            list.innerHTML = filtered.map((cookie, index) => `
                <div class="cookie-item" data-index="${index}">
                    <div class="cookie-header" data-index="${index}">
                        <span class="cookie-name">${escapeHtml(cookie.name)}</span>
                        <span class="cookie-value-preview">${escapeHtml(cookie.value)}</span>
                        <span class="cookie-toggle ${this.expandedItems.has(index) ? 'expanded' : ''}">▼</span>
                    </div>
                    <div class="cookie-details ${this.expandedItems.has(index) ? 'show' : ''}" data-index="${index}">
                        <div class="detail-row">
                            <span class="detail-label">名称:</span>
                            <span class="detail-value">${escapeHtml(cookie.name)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">值:</span>
                            <span class="detail-value">${escapeHtml(cookie.value)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">域名:</span>
                            <span class="detail-value">${escapeHtml(cookie.domain)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">路径:</span>
                            <span class="detail-value">${escapeHtml(cookie.path)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">过期:</span>
                            <span class="detail-value">${formatDate(cookie.expirationDate)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">安全:</span>
                            <span class="detail-value">${cookie.secure ? '✓ 是' : '✗ 否'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">HttpOnly:</span>
                            <span class="detail-value">${cookie.httpOnly ? '✓ 是' : '✗ 否'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">SameSite:</span>
                            <span class="detail-value">${cookie.sameSite || '未设置'}</span>
                        </div>
                        <div class="detail-actions">
                            <button class="btn btn-primary edit-btn" data-index="${index}">编辑</button>
                            <button class="btn btn-danger delete-btn" data-index="${index}">删除</button>
                            <button class="btn copy-btn" data-index="${index}">复制值</button>
                        </div>
                    </div>
                </div>
            `).join('');

            // 绑定展开/折叠事件
            this.$$('.cookie-header').forEach((header) => {
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(header.dataset.index);
                    this.toggleExpand(idx);
                });
            });

            // 绑定编辑事件
            this.$$('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditModal(parseInt(btn.dataset.index));
                });
            });

            // 绑定删除事件
            this.$$('.delete-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCookie(parseInt(btn.dataset.index));
                });
            });

            // 绑定复制事件
            this.$$('.copy-btn').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyCookieValue(parseInt(btn.dataset.index));
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
                return cookie.name.toLowerCase().includes(this.searchTerm) ||
                       cookie.value.toLowerCase().includes(this.searchTerm) ||
                       cookie.domain.toLowerCase().includes(this.searchTerm);
            });
        }

        // ==================== 模态框 ====================
        showModal(title, bodyHTML, onConfirm) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">${title}</div>
                    <div class="modal-body">${bodyHTML}</div>
                    <div class="modal-footer">
                        <button class="btn cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">确定</button>
                    </div>
                </div>
            `;

            this.shadow.appendChild(overlay);

            overlay.querySelector('.cancel-btn').addEventListener('click', () => {
                overlay.remove();
            });

            overlay.querySelector('.confirm-btn').addEventListener('click', () => {
                onConfirm(overlay);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        }

        showAddModal() {
            const body = `
                <div class="form-group">
                    <label>名称 *</label>
                    <input type="text" id="cookie-name" placeholder="cookie_name">
                </div>
                <div class="form-group">
                    <label>值</label>
                    <input type="text" id="cookie-value" placeholder="cookie_value">
                </div>
                <div class="form-group">
                    <label>域名</label>
                    <input type="text" id="cookie-domain" placeholder="${getDomain()}" value="${getDomain()}">
                </div>
                <div class="form-group">
                    <label>路径</label>
                    <input type="text" id="cookie-path" placeholder="/" value="/">
                </div>
                <div class="form-group">
                    <label>过期时间</label>
                    <input type="datetime-local" id="cookie-expire">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="cookie-secure">
                        Secure（仅HTTPS）
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="cookie-httponly">
                        HttpOnly
                    </label>
                </div>
                <div class="form-group">
                    <label>SameSite</label>
                    <select id="cookie-samesite">
                        <option value="unspecified">未指定</option>
                        <option value="no_restriction">None</option>
                        <option value="lax">Lax</option>
                        <option value="strict">Strict</option>
                    </select>
                </div>
            `;

            this.showModal('添加 Cookie', body, (overlay) => {
                const name = overlay.querySelector('#cookie-name').value.trim();
                if (!name) {
                    this.showToast('请输入 Cookie 名称');
                    return;
                }

                const expireStr = overlay.querySelector('#cookie-expire').value;
                let expirationDate = undefined;
                if (expireStr) {
                    expirationDate = Math.floor(new Date(expireStr).getTime() / 1000);
                }

                CookieAPI.set({
                    name,
                    value: overlay.querySelector('#cookie-value').value,
                    domain: overlay.querySelector('#cookie-domain').value.trim(),
                    path: overlay.querySelector('#cookie-path').value || '/',
                    secure: overlay.querySelector('#cookie-secure').checked,
                    httpOnly: overlay.querySelector('#cookie-httponly').checked,
                    sameSite: overlay.querySelector('#cookie-samesite').value,
                    expirationDate,
                }, (error) => {
                    if (error) {
                        this.showToast('添加失败: ' + error);
                    } else {
                        this.showToast('添加成功');
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
                <div class="form-group">
                    <label>名称</label>
                    <input type="text" id="edit-name" value="${escapeHtml(cookie.name)}" readonly style="background:#f5f5f5">
                </div>
                <div class="form-group">
                    <label>值</label>
                    <input type="text" id="edit-value" value="${escapeHtml(cookie.value)}">
                </div>
                <div class="form-group">
                    <label>域名</label>
                    <input type="text" id="edit-domain" value="${escapeHtml(cookie.domain)}">
                </div>
                <div class="form-group">
                    <label>路径</label>
                    <input type="text" id="edit-path" value="${escapeHtml(cookie.path)}">
                </div>
                <div class="form-group">
                    <label>过期时间</label>
                    <input type="datetime-local" id="edit-expire" value="${expireDateStr}">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-secure" ${cookie.secure ? 'checked' : ''}>
                        Secure（仅HTTPS）
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-httponly" ${cookie.httpOnly ? 'checked' : ''}>
                        HttpOnly
                    </label>
                </div>
                <div class="form-group">
                    <label>SameSite</label>
                    <select id="edit-samesite">
                        <option value="unspecified" ${cookie.sameSite === 'unspecified' ? 'selected' : ''}>未指定</option>
                        <option value="no_restriction" ${cookie.sameSite === 'no_restriction' ? 'selected' : ''}>None</option>
                        <option value="lax" ${cookie.sameSite === 'lax' ? 'selected' : ''}>Lax</option>
                        <option value="strict" ${cookie.sameSite === 'strict' ? 'selected' : ''}>Strict</option>
                    </select>
                </div>
            `;

            this.showModal('编辑 Cookie', body, (overlay) => {
                const expireStr = overlay.querySelector('#edit-expire').value;
                let expirationDate = undefined;
                if (expireStr) {
                    expirationDate = Math.floor(new Date(expireStr).getTime() / 1000);
                }

                // 先删除旧cookie，再设置新的
                CookieAPI.delete(cookie, (error) => {
                    if (error) {
                        this.showToast('更新失败: ' + error);
                        return;
                    }

                    CookieAPI.set({
                        name: cookie.name,
                        value: overlay.querySelector('#edit-value').value,
                        domain: overlay.querySelector('#edit-domain').value.trim(),
                        path: overlay.querySelector('#edit-path').value || '/',
                        secure: overlay.querySelector('#edit-secure').checked,
                        httpOnly: overlay.querySelector('#edit-httponly').checked,
                        sameSite: overlay.querySelector('#edit-samesite').value,
                        expirationDate,
                    }, (error) => {
                        if (error) {
                            this.showToast('更新失败: ' + error);
                        } else {
                            this.showToast('更新成功');
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
                        this.showToast('删除失败: ' + error);
                    } else {
                        this.showToast('已删除');
                        this.loadCookies();
                    }
                });
            }
        }

        deleteAllCookies() {
            if (this.cookies.length === 0) {
                this.showToast('没有可删除的 Cookie');
                return;
            }

            if (confirm(`确定要删除当前域名的全部 ${this.cookies.length} 个 Cookie 吗？`)) {
                this.setStatus('正在删除...');
                CookieAPI.deleteAll(this.cookies, (error, count) => {
                    if (error) {
                        this.showToast('删除失败');
                    } else {
                        this.showToast(`已删除 ${count} 个 Cookie`);
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
                    this.showToast('已复制到剪贴板');
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
                this.showToast('已复制到剪贴板');
            } catch (e) {
                this.showToast('复制失败');
            }
            textarea.remove();
        }

        copyAllCookies() {
            if (this.cookies.length === 0) {
                this.showToast('没有可复制的 Cookie');
                return;
            }

            // 生成 name=value; 格式的字符串
            const cookieStr = this.cookies.map(c => `${c.name}=${c.value}`).join('; ');

            if (navigator.clipboard) {
                navigator.clipboard.writeText(cookieStr).then(() => {
                    this.showToast(`已复制 ${this.cookies.length} 个 Cookie`);
                }).catch(() => {
                    this.fallbackCopy(cookieStr);
                });
            } else {
                this.fallbackCopy(cookieStr);
            }
        }

        exportCookies() {
            if (this.cookies.length === 0) {
                this.showToast('没有可导出的 Cookie');
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
            this.showToast('导出成功');
        }

        showImportModal() {
            const body = `
                <div class="form-group">
                    <label>粘贴 Cookie JSON 数据</label>
                    <textarea id="import-data" style="width:100%;height:150px;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:monospace;resize:vertical" placeholder='[{"name":"example","value":"123","domain":".example.com"}]'></textarea>
                </div>
            `;

            this.showModal('导入 Cookies', body, (overlay) => {
                const jsonStr = overlay.querySelector('#import-data').value.trim();
                if (!jsonStr) {
                    this.showToast('请输入 JSON 数据');
                    return;
                }

                CookieAPI.importJSON(jsonStr, (error, count) => {
                    if (error) {
                        this.showToast('导入失败: ' + (error.message || error));
                    } else {
                        this.showToast(`成功导入 ${count} 个 Cookie`);
                        overlay.remove();
                        this.loadCookies();
                    }
                });
            });
        }

        setStatus(text) {
            const status = this.$('#status');
            if (status) status.textContent = text;
        }
    }

    // ==================== 初始化 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new CookieManagerUI());
    } else {
        new CookieManagerUI();
    }
})();

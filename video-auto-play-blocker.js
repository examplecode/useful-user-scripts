// ==UserScript==
// @name         阻止视频自动播放
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  阻止视频自动播放，用户交互后才允许播放；该脚本只针对移动端设备
// @author       KAI
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 用户是否已交互
    let userInteracted = false;

    const allowPlaybackAfterUserInteraction = () => {
        userInteracted = true;
    };

    // 监听用户交互
    window.addEventListener('click', allowPlaybackAfterUserInteraction, true);
    window.addEventListener('touchstart', allowPlaybackAfterUserInteraction, true);
    window.addEventListener('keydown', allowPlaybackAfterUserInteraction, true);

    // 拦截 play()
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
        if (this.tagName === 'VIDEO') {
            if (userInteracted) {
                return originalPlay.apply(this, arguments);
            } else {
                console.warn('[阻止自动播放]: 拦截 play()（用户未交互）');
                const p = Promise.resolve();
                p.catch(() => {});
                return p;
            }
        }
        return originalPlay.apply(this, arguments);
    };

    // 判断是否可能缺少控件
    const hasCustomControlsNearby = (video) => {
        const container = video.closest('div, section, article, body');
        if (!container) return false;

        const keywords = ['play', 'pause', 'btn', 'control', 'icon', 'player'];
        const controlsLike = container.querySelectorAll('button, [role="button"], [class], [id]');

        for (let el of controlsLike) {
            const cls = (el.className || '') + ' ' + (el.id || '');
            const clsLower = cls.toLowerCase();
            if (keywords.some(k => clsLower.includes(k))) {
                return true; // 有控件
            }
        }

        return false;
    };

    // 处理视频元素
    const handleVideo = (video) => {
        video.autoplay = false;
        video.removeAttribute('autoplay');
        video.preload = 'metadata';
        video.pause();

        const hasNativeControls = video.hasAttribute('controls');
        const hasCustomControls = hasCustomControlsNearby(video);

        if (!hasNativeControls && !hasCustomControls) {
            video.setAttribute('controls', 'true'); // 添加原生控件
        }
    };

    // 初始化视频
    const processVideos = () => {
        document.querySelectorAll('video').forEach(handleVideo);
    };

    // DOM 完成后处理
    document.addEventListener('DOMContentLoaded', processVideos);
    window.addEventListener('load', processVideos);

    // 动态插入的视频也处理
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.tagName === 'VIDEO') {
                    handleVideo(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('video').forEach(handleVideo);
                }
            });
        });
    });

    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });

})();

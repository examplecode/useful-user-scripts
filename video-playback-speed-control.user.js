// ==UserScript==
// @name         视频播放速度控制
// @namespace    https://github.com/examplecode/useful-user-scripts/
// @version      1.0.0
// @description  当页面中包含视频元素并且视频正在播放时，在页面底部显示浮动按钮控制播放速度
// @author       examplecode
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 配置参数
    const config = {
        speedStep: 0.5,      // 速度调整步长
        minSpeed: 0.5,      // 最低播放速度
        defaultSpeed: 1.0,  // 默认播放速度（正常速度）
        buttonSize: '40px', // 按钮大小
        buttonColor: '#333', // 按钮颜色
        buttonBgColor: 'rgba(255, 255, 255, 0.8)', // 按钮背景色
        containerBgColor: 'rgba(0, 0, 0, 0.1)', // 容器背景色
        containerPadding: '8px', // 容器内边距
        containerBorderRadius: '8px' // 容器圆角
    };

    // 全局变量
    let controlsContainer = null;
    let speedDisplay = null;
    let currentSpeed = config.defaultSpeed;
    let isPlaying = false;
    let activeVideos = [];
    let checkInterval = null;

    // 创建控制按钮容器
    function createControls() {
        // 如果已经创建，则不重复创建
        if (controlsContainer) return;

        // 创建容器
        controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '20px';
        controlsContainer.style.left = '50%';
        controlsContainer.style.transform = 'translateX(-50%)';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.padding = config.containerPadding;
        controlsContainer.style.backgroundColor = config.containerBgColor;
        controlsContainer.style.borderRadius = config.containerBorderRadius;
        controlsContainer.style.zIndex = '9999';
        controlsContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        controlsContainer.style.display = 'none'; // 默认隐藏

        // 创建减速按钮
        const decreaseButton = createButton('-', () => {
            adjustSpeed(-config.speedStep);
        });

        // 创建显示当前速度的元素
        speedDisplay = document.createElement('div');
        speedDisplay.textContent = `${currentSpeed.toFixed(1)}x`;
        speedDisplay.style.display = 'flex';
        speedDisplay.style.alignItems = 'center';
        speedDisplay.style.justifyContent = 'center';
        speedDisplay.style.fontSize = '18px';
        speedDisplay.style.fontWeight = 'bold';
        speedDisplay.style.minWidth = '60px';
        speedDisplay.style.textAlign = 'center';

        // 创建恢复正常速度按钮
        const resetButton = createButton('○', () => {
            setSpeed(config.defaultSpeed);
        });

        // 创建加速按钮
        const increaseButton = createButton('+', () => {
            adjustSpeed(config.speedStep);
        });

        // 添加按钮到容器
        controlsContainer.appendChild(decreaseButton);
        controlsContainer.appendChild(speedDisplay);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(increaseButton);

        // 添加容器到页面
        document.body.appendChild(controlsContainer);
    }

    // 创建按钮
    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.width = config.buttonSize;
        button.style.height = config.buttonSize;
        button.style.borderRadius = '50%';
        button.style.border = 'none';
        button.style.backgroundColor = config.buttonBgColor;
        button.style.color = config.buttonColor;
        button.style.fontSize = '20px';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        button.style.transition = 'transform 0.1s, background-color 0.2s';

        // 添加悬停效果
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = config.buttonBgColor;
        });
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });

        // 添加点击事件
        button.addEventListener('click', onClick);

        return button;
    }

    // 调整播放速度
    function adjustSpeed(step) {
        const newSpeed = Math.max(config.minSpeed, currentSpeed + step);
        setSpeed(newSpeed);
    }

    // 设置播放速度
    function setSpeed(speed) {
        currentSpeed = speed;
        updateSpeedDisplay();
        applySpeedToVideos();
    }

    // 更新速度显示
    function updateSpeedDisplay() {
        if (speedDisplay) {
            speedDisplay.textContent = `${currentSpeed.toFixed(1)}x`;
        }
    }

    // 应用速度到所有视频
    function applySpeedToVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.playbackRate = currentSpeed;
        });
    }

    // 检查视频状态
    function checkVideoStatus() {
        const videos = document.querySelectorAll('video');
        activeVideos = [];
        
        // 检查是否有正在播放的视频
        videos.forEach(video => {
            // 如果视频正在播放且不是暂停状态
            if (!video.paused && !video.ended && video.currentTime > 0) {
                activeVideos.push(video);
                // 确保视频使用当前设置的播放速度
                video.playbackRate = currentSpeed;
            }
        });

        // 根据是否有正在播放的视频来显示或隐藏控制按钮
        if (activeVideos.length > 0) {
            showControls();
        } else {
            hideControls();
        }
    }

    // 显示控制按钮
    function showControls() {
        if (controlsContainer && controlsContainer.style.display === 'none') {
            controlsContainer.style.display = 'flex';
        }
    }

    // 隐藏控制按钮
    function hideControls() {
        if (controlsContainer) {
            controlsContainer.style.display = 'none';
        }
    }

    // 监听视频元素
    function setupVideoListeners() {
        // 使用MutationObserver监听DOM变化，检测新添加的视频元素
        const observer = new MutationObserver(mutations => {
            let needsCheck = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    // 检查添加的节点中是否有video元素
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'VIDEO') {
                            needsCheck = true;
                        } else if (node.nodeType === 1) {
                            // 检查添加的DOM元素内是否包含video元素
                            const videos = node.querySelectorAll('video');
                            if (videos.length > 0) {
                                needsCheck = true;
                            }
                        }
                    });
                }
            });
            
            if (needsCheck) {
                checkVideoStatus();
            }
        });

        // 开始观察整个文档
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // 定期检查视频状态
        checkInterval = setInterval(checkVideoStatus, 1000);

        // 监听全局的播放和暂停事件
        document.addEventListener('play', event => {
            if (event.target.tagName === 'VIDEO') {
                event.target.playbackRate = currentSpeed;
                checkVideoStatus();
            }
        }, true);

        document.addEventListener('pause', event => {
            if (event.target.tagName === 'VIDEO') {
                checkVideoStatus();
            }
        }, true);
    }

    // 初始化
    function initialize() {
        createControls();
        checkVideoStatus();
        setupVideoListeners();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
// ==UserScript==
// @name         RawGithub 订阅一键导入 Loon Surge Stash QuantumultX
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  raw.githubusercontent.com 页面左下角悬浮一键导入订阅按钮
// @author       RW
// @match        https://raw.githubusercontent.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 获取当前raw链接
    const rawUrl = window.location.href;

    // 创建容器
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.left = '12px';
    box.style.bottom = '12px';
    box.style.zIndex = '99999';
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.gap = '6px';

    // 按钮基础样式
    function createBtn(text, linkPrefix) {
        const btn = document.createElement('a');
        btn.textContent = text;
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.color = '#fff';
        btn.style.textAlign = 'center';
        btn.style.textDecoration = 'none';
        btn.style.fontSize = '13px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 8px #0003';
        const importUrl = linkPrefix + encodeURIComponent(rawUrl);
        btn.href = importUrl;
        btn.target = '_blank';
        return btn;
    }

    // 各客户端导入 scheme
    const list = [
        { name: 'Loon', scheme: 'loon://import?sub=' },
        { name: 'Surge', scheme: 'surge:///install-config?url=' },
        { name: 'Stash', scheme: 'stash://import?sub=' },
        { name: 'QuantumultX', scheme: 'quantumult-x:///import?url=' }
    ];

    list.forEach(item => {
        const b = createBtn(item.name, item.scheme);
        // 区分颜色
        switch(item.name){
            case 'Loon': b.style.background='#28a745'; break;
            case 'Surge': b.style.background='#007bff'; break;
            case 'Stash': b.style.background='#9440ed'; break;
            case 'QuantumultX': b.style.background='#ff6c37'; break;
        }
        box.appendChild(b);
    });

    document.body.appendChild(box);

})();

// ==UserScript==

// @name         GitHub"Loon插件跳转添加到Loon"

// @version      1.0

// @description  适用于addons,stay,Alook扩展Js,更好的体验Github,修改自Baby的JS

// @author       Raphael

// @icon         https://raw.githubusercontent.com/Raphael689/RW/master/iCons/github.png

// @match        https://github.com/*

// @grant        可搭配Github汉化：https://github.com/maboloshi/github-chinese/raw/gh-pages/main.user.js

// ==/UserScript==

(function() {

    'use strict';

    function openLoonLink() {

        var LoonUrl = window.location.href.replace('/blob', '').replace('github.com', 'www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com');

        window.location.href = LoonUrl;

    }

    var LoonButton = document.createElement('button');

    LoonButton.innerHTML = '<i class="fas fa-external-link-alt"></i> Loon'; // 添加图标和文本

    LoonButton.style.position = 'fixed';

    LoonButton.style.right = '10px'; // 右侧距离

    LoonButton.style.bottom = '60px'; // 底部距离

    LoonButton.style.backgroundColor = '#00000000'; // 背景颜色

    LoonButton.style.color = '#333'; // 文本颜色

    LoonButton.style.border = 'none';

    LoonButton.style.padding = '1px 4px';

    LoonButton.style.borderRadius = '3px';

    LoonButton.style.cursor = 'pointer';

    LoonButton.addEventListener('click', openLoonLink);

    document.body.appendChild(LoonButton);

})();

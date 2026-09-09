// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit
// @namespace    GitHub / Script-Hub
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUxpcRgWFhsYGBgWFhcWFh8WFhoYGBgWFiUlJRcVFRkWFhgVFRgWFhgVFRsWFhgWFigeHhkWFv////////////r6+h4eHv///xcVFfLx8SMhIUNCQpSTk/r6+jY0NCknJ97e3ru7u+fn51BOTsPCwqGgoISDg6empmpoaK2srNDQ0FhXV3eXcCcAAAAXdFJOUwCBIZXMGP70BuRH2Ze/LpIMUunHkpQR34sfygAAAVpJREFUOMt1U+magjAMDAVb5BDU3W25b9T1/d9vaYpQKDs/rF9nSNJkArDA9ezQZ8wPbc8FE6eAiQUsOO1o19JolFibKCdHGHC0IJezOMD5snx/yE+KOYYr42fPSufSZyazqDoseTPw4lGJNOu6LBXVUPBG3lqYAOv/5ZwnNUfUifzBt8gkgfgINmjxOpgqUA147QWNaocLniqq3QsSVbQHNp45N/BAwoYQz9oUJEiE4GMGfoBSMj5gjeWRIMMqleD/CAzUHFqTLyjOA5zjNnwa4UCEZ2YK3khEcBXHjVBtEFeIZ6+NxYbPqWp1DLKV42t6Ujn2ydyiPi9nX0TTNAkVVZ/gozsl6FbrktkwaVvL2TRK0C8Ca7Hck7f5OBT6FFbLATkL2ugV0tm0RLM9fedDvhWstl8Wp9AFDjFX7yOY/lJrv8AkYuz7fuP8dv9izCYH+x3/LBnj9fYPBTpJDNzX+7cAAAAASUVORK5CYII=
// @version      3.2.0
// @description  增强 GitHub 原始链接按钮。支持 Loon/Surge/Stash/Shadowrocket 一键导入及 Script-Hub 编辑
// @author       baby,小一,Key
// @match        https://github.com/*
// @match        https://script.hub/file/*
// @match        http://script.hub/file/*
// @match        https://script.hub/convert/*
// @match        http://script.hub/convert/*
// @match        http://127.0.0.1:9101/file/*
// @match        http://127.0.0.1:9101/convert/*
// ==/UserScript==

(function () {
  "use strict";

  // 使用 DOMContentLoaded 确保页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }

  function initRouter() {
    if (/\/blob\//.test(window.location.pathname)) {
      initGitHubButtons();
    }
    if (/(file|convert)\//.test(window.location.pathname)) {
      initScriptHubButtons();
    }
  }

  function initGitHubButtons() {
    const container = createButtonContainer();
    
    // 按从上到下的视觉顺序添加（Flex column-reverse 会使第一个元素在最下方）
    const buttons = [
      { text: "Raw", handler: openRawLink },
      { text: "Code Hub", handler: openRawHiLink },
      { text: "ScriptHub", handler: openScriptHubLink },
      { text: "Loon", handler: openLoonLink },
      { text: "Surge", handler: openSurgeLink },
      { text: "Stash", handler: openStashLink },
      { text: "Shadowrocket", handler: openShadowrocketLink }
    ];

    buttons.forEach(btn => {
      container.appendChild(createButton(btn.text, btn.handler));
    });

    document.body.appendChild(container);
  }

  function initScriptHubButtons() {
    const container = createButtonContainer();
    container.appendChild(createButton("Script-Hub 编辑", reEditLink));
    document.body.appendChild(container);
  }

  // 创建固定定位的按钮容器，自动处理垂直堆叠
  function createButtonContainer() {
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      left: "10px",
      bottom: "20px",
      display: "flex",
      flexDirection: "column-reverse", // 让第一个添加的按钮显示在最底部
      gap: "8px",
      zIndex: "9999"
    });
    return container;
  }

  function createButton(text, clickHandler) {
    const button = document.createElement("button");
    Object.assign(button.style, {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      color: "#333",
      border: "1px solid #d0d7de",
      padding: "4px 8px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap"
    });
    button.textContent = text;
    
    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = "#0969da";
      button.style.color = "#fff";
      button.style.borderColor = "#0969da";
    });
    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      button.style.color = "#333";
      button.style.borderColor = "#d0d7de";
    });
    
    button.addEventListener("click", clickHandler);
    return button;
  }

  // --- URL 工具函数 ---
  function getRawUrl() {
    const url = new URL(window.location.href);
    if (url.hostname === 'github.com') {
      url.hostname = 'raw.githubusercontent.com';
      url.pathname = url.pathname.replace('/blob/', '/');
    }
    return url.toString();
  }

  // --- 按钮处理函数 ---
  function openRawLink() {
    window.open(getRawUrl(), "_blank");
  }

  function openRawHiLink() {
    const url = "https://app.linkey.store/EditCode?" + encodeURIComponent(getRawUrl());
    window.open(url, "_blank");
  }

  function openScriptHubLink() {
    // 修复：使用 https 避免混合内容拦截
    const url = `https://script.hub/convert/_start_/${getRawUrl()}/_end_/plain.txt?type=plain-text&target=plain-text`;
    window.open(url, "_blank");
  }

  function reEditLink() {
    const url = window.location.href.replace(/\/(convert|file)\//, "/edit/");
    window.open(url, "_blank");
  }

  function openLoonLink() {
    const rawUrl = getRawUrl();
    const loonUrl = `https://www.nsloon.com/openloon/import?plugin=${encodeURIComponent(rawUrl)}`;
    window.open(loonUrl, "_blank");
  }

  function openSurgeLink() {
    const rawUrl = getRawUrl();
    const surgeUrl = `https://api.boxjs.app/surge/install-module?url=${encodeURIComponent(rawUrl)}`;
    window.open(surgeUrl, "_blank");
  }

  // 🆕 Stash 支持
  function openStashLink() {
    const rawUrl = getRawUrl();
    // Stash 使用 stash:// 协议导入配置/脚本
    const stashUrl = `stash://install-config?url=${encodeURIComponent(rawUrl)}`;
    window.open(stashUrl, "_blank");
  }

  // 🆕 Shadowrocket 支持
  function openShadowrocketLink() {
    const rawUrl = getRawUrl();
    // Shadowrocket 支持直接通过 URL Scheme 添加模块/配置
    const shadowrocketUrl = `shadowrocket://install/module?url=${encodeURIComponent(rawUrl)}`;
    window.open(shadowrocketUrl, "_blank");
  }
})();

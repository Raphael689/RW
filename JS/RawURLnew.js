// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit
// @namespace    GitHub / Script-Hub
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUxpcRgWFhsYGBgWFhcWFh8WFhoYGBgWFiUlJRcVFRkWFhgVFRgWFhgVFRsWFhgWFigeHhkWFv////////////r6+h4eHv///xcVFfLx8SMhIUNCQpSTk/r6+jY0NCknJ97e3ru7u+fn51BOTsPCwqGgoISDg6empmpoaK2srNDQ0FhXV3eXcCcAAAAXdFJOUwCBIZXMGP70BuRH2Ze/LpIMUunHkpQR34sfygAAAVpJREFUOMt1U+magjAMDAVb5BDU3W25b9T1/d9vaYpQKDs/rF9nSNJkArDA9ezQZ8wPbc8FE6eAiQUsOO1o19JolFibKCdHGHC0IJezOMD5snx/yE+KOYYr42fPSufSZyazqDoseTPw4lGJNOu6LBXVUPBG3lqYAOv/5ZwnNUfUifzBt8gkgfgINmjxOpgqUA147QWNaocLniqq3QsSVbQHNp45N/BAwoYQz9oUJEiE4GMGfoBSMj5gjeWRIMMqleD/CAzUHFqTLyjOA5zjNnwa4UCEZ2YK3khEcBXHjVBtEFeIZ6+NxYbPqWp1DLKV42t6Ujn2ydyiPi9nX0TTNAkVVZ/gozsl6FbrktkwaVvL2TRK0C8Ca7Hck7f5OBT6FFbLATkL2ugV0tm0RLM9fedDvhWstl8Wp9AFDjFX7yOY/lJrv8AkYuz7fuP8dv9izCYH+x3/LBnj9fYPBTpJDNzX+7cAAAAASUVORK5CYII=
// @version      3.8.0
// @description  增强 GitHub 原始链接按钮。QX 按后缀精确匹配资源类型，点击变色自动恢复
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

  // ==========================================
  // 🎯 QX 资源映射配置（后缀优先 → 关键词兜底）
  // ==========================================
  // ext: 精确文件后缀匹配（优先级最高）
  // keyword: URL 路径关键词匹配（兜底）
  // type: QX remote-resource 字段名
  const QX_RESOURCE_MAP = [
    // --- 精确后缀匹配 ---
    { ext: "js",           type: "script_remote" },
    { ext: "mjs",          type: "script_remote" },
    { ext: "conf",         type: "filter_remote" },
    { ext: "rules",        type: "filter_remote" },
    { ext: "rule",         type: "filter_remote" },
    { ext: "snippet",      type: "rewrite_remote" },
    { ext: "sgmodule",     type: "rewrite_remote" },
    { ext: "list",         type: "policy_remote" },
    { ext: "policy",       type: "policy_remote" },
    { ext: "task",         type: "task_remote" },
    { ext: "json",         type: "server_remote" },
    { ext: "yaml",         type: "server_remote" },
    { ext: "yml",          type: "server_remote" },
    // --- 关键词兜底 ---
    { keyword: "filter",   type: "filter_remote" },
    { keyword: "rewrite",  type: "rewrite_remote" },
    { keyword: "mitm",     type: "rewrite_remote" },
    { keyword: "policy",   type: "policy_remote" },
    { keyword: "task",     type: "task_remote" },
    { keyword: "cron",     type: "task_remote" },
    { keyword: "dns",      type: "dns_remote" },
    { keyword: "server",   type: "server_remote" },
    { keyword: "sub",      type: "server_remote" },
    // --- 最终兜底 ---
    { keyword: "",         type: "script_remote" }
  ];

  // QX 对象格式类型（其余均为纯字符串数组）
  const QX_OBJECT_TYPES = new Set(["script_remote", "task_remote"]);

  // ==========================================
  // 样式 & 交互常量
  // ==========================================
  const STYLE_DEFAULT = {
    backgroundColor: "transparent", color: "#59636e",
    border: "none", padding: "2px 0", borderRadius: "0",
    cursor: "pointer", fontSize: "12px", fontWeight: "500",
    boxShadow: "none", transition: "color 0.2s ease",
    whiteSpace: "nowrap", outline: "none"
  };
  const COLOR_HOVER = "#0969da";
  const COLOR_CLICKED = "#8250df";
  const CLICK_RESET_DELAY = 1500;

  // ==========================================
  // 初始化路由
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }

  function initRouter() {
    if (/\/blob\//.test(window.location.pathname)) initGitHubButtons();
    if (/(file|convert)\//.test(window.location.pathname)) initScriptHubButtons();
  }

  function initGitHubButtons() {
    const container = createButtonContainer();
    [
      { text: "Raw", handler: openRawLink },
      { text: "Code Hub", handler: openRawHiLink },
      { text: "ScriptHub", handler: openScriptHubLink },
      { text: "Loon", handler: openLoonLink },
      { text: "Surge", handler: openSurgeLink },
      { text: "Stash", handler: openStashLink },
      { text: "Shadowrocket", handler: openShadowrocketLink },
      { text: "QuantumultX", handler: openQuantumultXLink }
    ].forEach(btn => container.appendChild(createButton(btn.text, btn.handler)));
    document.body.appendChild(container);
  }

  function initScriptHubButtons() {
    const container = createButtonContainer();
    container.appendChild(createButton("Script-Hub 编辑", reEditLink));
    document.body.appendChild(container);
  }

  // ==========================================
  // UI 组件
  // ==========================================
  function createButtonContainer() {
    const c = document.createElement("div");
    Object.assign(c.style, {
      position: "fixed", left: "10px", bottom: "20px",
      display: "flex", flexDirection: "column-reverse",
      gap: "4px", zIndex: "9999"
    });
    return c;
  }

  function createButton(text, clickHandler) {
    const b = document.createElement("button");
    Object.assign(b.style, STYLE_DEFAULT);
    b.textContent = text;

    b.addEventListener("mouseenter", () => {
      if (!b.dataset.clicked) b.style.color = COLOR_HOVER;
    });
    b.addEventListener("mouseleave", () => {
      if (!b.dataset.clicked) b.style.color = STYLE_DEFAULT.color;
    });
    b.addEventListener("click", () => {
      if (b._resetTimer) clearTimeout(b._resetTimer);
      b.dataset.clicked = "true";
      b.style.color = COLOR_CLICKED;
      clickHandler();
      b._resetTimer = setTimeout(() => {
        delete b.dataset.clicked;
        b.style.color = STYLE_DEFAULT.color;
        b._resetTimer = null;
      }, CLICK_RESET_DELAY);
    });
    return b;
  }

  // ==========================================
  // URL 工具 & 各平台跳转
  // ==========================================
  function getRawUrl() {
    const url = new URL(window.location.href);
    if (url.hostname === 'github.com') {
      url.hostname = 'raw.githubusercontent.com';
      url.pathname = url.pathname.replace('/blob/', '/');
    }
    return url.toString();
  }

  function openRawLink() { window.open(getRawUrl(), "_blank"); }
  function openRawHiLink() { window.open(`https://app.linkey.store/EditCode?${encodeURIComponent(getRawUrl())}`, "_blank"); }
  function openScriptHubLink() { window.open(`https://script.hub/convert/_start_/${getRawUrl()}/_end_/plain.txt?type=plain-text&target=plain-text`, "_blank"); }
  function reEditLink() { window.open(window.location.href.replace(/\/(convert|file)\//, "/edit/"), "_blank"); }
  function openLoonLink() { window.open(`https://www.nsloon.com/openloon/import?plugin=${encodeURIComponent(getRawUrl())}`, "_blank"); }
  function openSurgeLink() { window.open(`https://api.boxjs.app/surge/install-module?url=${encodeURIComponent(getRawUrl())}`, "_blank"); }
  function openStashLink() { window.open(`stash://install-config?url=${encodeURIComponent(getRawUrl())}`, "_blank"); }
  function openShadowrocketLink() { window.open(`shadowrocket://install/module?url=${encodeURIComponent(getRawUrl())}`, "_blank"); }

  // ==========================================
  // ✅ Quantumult X — 后缀精确匹配 + 正确数据结构
  // ==========================================
  function openQuantumultXLink() {
    const rawUrl = getRawUrl();
    const filename = decodeURIComponent(rawUrl.split('/').pop() || 'resource');
    const ext = (filename.match(/\.([^.]+)$/) || [])[1]?.toLowerCase() || '';

    // 双层匹配：先精确后缀，再关键词兜底
    let matchedType = "script_remote";
    for (const rule of QX_RESOURCE_MAP) {
      if (rule.ext && rule.ext === ext) { matchedType = rule.type; break; }
    }
    // 后缀未命中时走关键词
    if (matchedType === "script_remote" && ext !== "js" && ext !== "mjs") {
      for (const rule of QX_RESOURCE_MAP) {
        if (rule.keyword !== undefined && rule.keyword !== '' &&
            rawUrl.toLowerCase().includes(rule.keyword)) {
          matchedType = rule.type;
          break;
        }
      }
    }

    // 构建符合 QX 规范的 JSON
    const resourceObj = {
      server_remote: [], filter_remote: [], rewrite_remote: [],
      task_remote: [], dns_remote: [], policy_remote: [], script_remote: []
    };

    if (QX_OBJECT_TYPES.has(matchedType)) {
      // script_remote / task_remote → [{name, url, enabled}]
      resourceObj[matchedType] = [{ name: filename, url: rawUrl, enabled: true }];
    } else {
      // 其余类型 → ["url"]
      resourceObj[matchedType] = [rawUrl];
    }

    const jsonStr = JSON.stringify(resourceObj);
    console.log('[QX]', `ext=${ext}`, `type=${matchedType}`, jsonStr);
    window.open(`quantumult-x:///add?remote-resource=${encodeURIComponent(jsonStr)}`, "_blank");
  }
})();

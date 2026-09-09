// ==UserScript==
// @name         Raw Link Opener
// @namespace    GitHubRaw
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUxpcRgWFhsYGBgWFhcWFh8WFhoYGBgWFiUlJRcVFRkWFhgVFRgWFhgVFRsWFhgWFigeHhkWFv////////////r6+h4eHv///xcVFfLx8SMhIUNCQpSTk/r6+jY0NCknJ97e3ru7u+fn51BOTsPCwqGgoISDg6empmpoaK2srNDQ0FhXV3eXcCcAAAAXdFJOUwCBIZXMGP70BuRH2Ze/LpIMUunHkpQR34sfygAAAVpJREFUOMt1U+magjAMDAVb5BDU3W25b9T1/d9vaYpQKDs/rF9nSNJkArDA9ezQZ8wPbc8FE6eAiQUsOO1o19JolFibKCdHGHC0IJezOMD5snx/yE+KOYYr42fPSufSZyazqDoseTPw4lGJNOu6LBXVUPBG3lqYAOv/5ZwnNUfUifzBt8gkgfgINmjxOpgqUA147QWNaocLniqq3QsSVbQHNp45N/BAwoYQz9oUJEiE4GMGfoBSMj5gjeWRIMMqleD/CAzUHFqTLyjOA5zjNnwa4UCEZ2YK3khEcBXHjVBtEFeIZ6+NxYbPqWp1DLKV42t6Ujn2ydyiPi9nX0TTNAkVVZ/gozsl6FbrktkwaVvL2TRK0C8Ca7Hck7f5OBT6FFbLATkL2ugV0tm0RLM9fedDvhWstl8Wp9AFDjFX7yOY/lJrv8AkYuz7fuP8dv9izCYH+x3/LBnj9fYPBTpJDNzX+7cAAAAASUVORK5CYII=
// @version      1.0.1
// @description  增强 GitHubRaw 的原始链接按钮。
// @author       
// @match        https://raw.githubusercontent.com/*
// @match        https://script.hub/file/*
// @match        http://script.hub/file/*
// @match        https://script.hub/convert/*
// @match        http://script.hub/convert/*
// @match        http://127.0.0.1:9101/file/*
// @match        http://127.0.0.1:9101/convert/*
// ==/UserScript==
(function () {
  "use strict";
  const isRaw = location.hostname === "raw.githubusercontent.com";
  if (!isRaw && !/\/blob\//.test(location.pathname)) return;// 两种页面都放行
  if (document.querySelector("#loon-surge-importer")) return;// 防重复

  // raw 页面直接用当前地址；github blob 页面则先转换成 raw 地址
  const raw = isRaw
    ? window.location.href.split("?")[0] // 去掉可能的 query 参数
    : window.location.href
        .replace(/\/blob\//, "/")
        .replace("https://github.com/", "https://raw.githubusercontent.com/");

  const targets = [
    { text: "Loon", url: "https://www.nsloon.com/openloon/import?plugin=" + encodeURIComponent(raw) },
    { text: "Surge", url: "https://api.boxjs.app/surge/install-module?url=" + encodeURIComponent(raw) },
  ];

  const wrap = document.createElement("div");
  wrap.id = "loon-surge-importer";

  targets.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.textContent = t.text;
    Object.assign(btn.style, {
      position: "fixed",
      left: "10px",
      bottom: (110 + i * 30) + "px",
      zIndex: 9999,
      padding: "2px 8px",
      border: "1px solid #d0d7de",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "11px",
      color: "#333",
      background: "#fff",
    });
    btn.addEventListener("click", () => window.open(t.url, "_blank"));
    wrap.appendChild(btn);
  });

  document.body.appendChild(wrap);
})();

// ==UserScript==
// @name         Raw Loon/Surge 导入按钮
// @namespace    raw.githubusercontent.com/importer
// @version      1.1
// @description  在 raw.githubusercontent.com 页面左下角显示 Loon / Surge 一键导入按钮
// @match        https://raw.githubusercontent.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";
  if (location.hostname !== "raw.githubusercontent.com") return;
  if (document.querySelector("#loon-surge-importer")) return;  // 防重复

  const raw = window.location.href.split("?")[0];  // 去掉可能的 query 参数

  const targets = [
    { text: "Loon", url: "https://www.nsloon.com/openloon/import?plugin=" + encodeURIComponent(raw) },
    { text: "Surge", url: "https://api.boxjs.app/surge/install-module?url=" + encodeURIComponent(raw) },
  ];

  const wrap = document.createElement("div");
  wrap.id = "loon-surge-importer";

  targets.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.textContent = t.text;
    btn.title = t.url;
    Object.assign(btn.style, {
      position: "fixed",
      left: "10px",
      bottom: (110 + i * 30) + "px",
      zIndex: 9999,
      padding: "2px 10px",
      border: "1px solid #d0d7de",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "11px",
      lineHeight: "16px",
      color: "#333",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,.12)",
    });
    btn.addEventListener("click", () => window.open(t.url, "_blank"));
    wrap.appendChild(btn);
  });

  document.body.appendChild(wrap);
})();

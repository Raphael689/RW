// ==UserScript==
// @name         GitHub Raw Link Opener / Script-Hub edit
// @namespace    GitHub / Script-Hub
// @icon         https://raw.githubusercontent.com/Raphael689/RW/master/iCons/github.png     
// @version      3.1.0
// @description  增强 GitHub 的原始链接按钮。一键编辑 Script-Hub 生成的链接
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
  /\/blob\//.test(window.location.pathname) && init();
  /\/(file|convert)\//.test(window.location.pathname) && initeh();

  function init() {
    const rawButton = createButton("Raw", openRawLink);
    document.body.appendChild(rawButton);

    const rawViewButton = createButton("Code Hub", openRawHiLink);
    document.body.appendChild(rawViewButton);

    const scriptHubButton = createButton("ScriptHub", openScriptHubLink);
    document.body.appendChild(scriptHubButton);

    const loonButton = createButton("Loon",openLoonLink);
    document.body.appendChild(loonButton);
  }

  function initeh() {
    const scriptHubEdit = createButton("Script-Hub 编辑", reEditLink);
    document.body.appendChild(scriptHubEdit);
  }

  function createButton(text, clickHandler) {
    const button = document.createElement("button");
    const buttonStyle = {
      position: "fixed",
      backgroundColor: "#00000000",
      color: "#333",
      border: "none",
      padding: "1px 4px",
      borderRadius: "3px",
      cursor: "pointer",
      fontSize: "10px",
    };
    button.innerHTML = text;
    Object.assign(button.style, buttonStyle);

    if (text === "Raw") {
      button.style.right = "10px";
      button.style.bottom = "80px";
    }

    if (text === "Code Hub") {
      button.style.right = "10px";
      button.style.bottom = "50px";
    }

    if (text === "ScriptHub") {
      button.style.left = "10px";
      button.style.bottom = "50px";
    }

    if (text === "Script-Hub 编辑") {
      button.style.left = "10px";
      button.style.bottom = "80px";
    }

    if (text === "Loon") {
        button.style.right = "10px";
        button.style.bottom = "110px"; // 上移一些以适应页面
    }
    
    button.addEventListener("click", clickHandler);
    return button;
  }

  function getRawUrl() {
    return window.location.href
      .replace("/blob", "")
      .replace("github.com", "raw.githubusercontent.com");
  }

  function openRawLink() {
    window.open(getRawUrl(), "_blank");
  }

  function openRawHiLink() {
    const Url =
      "https://app.linkey.store/EditCode?" + encodeURIComponent(getRawUrl());
    window.open(Url, "_blank");
  }

  function reEditLink() {
    const Url = window.location.href.replace(/\/(convert|file)\//, "/edit/");
    window.open(Url, "_blank");
  }
  
  function openLoonLink() {
        // 提取
        const loonUrl = window.location.href.replace("/blob", "").replace("github.com", "www.nsloon.com/openloon/import?plugin=https://raw.githubusercontent.com");
        window.open(loonUrl, "_blank");
  }
  
  function openScriptHubLink() {
    const scriptHubUrl = `http://script.hub/convert/_start_/${getRawUrl()}/_end_/plain.txt?type=plain-text&target=plain-text`;
    window.open(scriptHubUrl, "_blank");
  }
})();



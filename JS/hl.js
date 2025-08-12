**
 * 人民币汇率监控（双向换算 + 每日推送 + 波动提醒）
 * Author: Mr.Eric
 * Version: 4.2
 * Last Updated: 2025-08-12
 */

const baseCurrency = "CNY";
const threshold = 1; // 波动百分比阈值
const googleCurrencies = ["USD", "EUR", "GBP", "HKD", "JPY", "KRW", "TRY"];
const apiUrls = [
  "https://open.er-api.com/v6/latest/CNY",
  "https://api.exchangerate-api.com/v4/latest/CNY",
  "https://api.frankfurter.app/latest?from=CNY"
];

// 币种配置
const currencyConfig = {
  USD: { name: "美元", decimals: 4, flag: "🇺🇸" },
  EUR: { name: "欧元", decimals: 4, flag: "🇪🇺" },
  GBP: { name: "英镑", decimals: 4, flag: "🇬🇧" },
  HKD: { name: "港币", decimals: 4, flag: "🇭🇰" },
  JPY: { name: "日元", decimals: 4, flag: "🇯🇵" },
  KRW: { name: "韩元", decimals: 4, flag: "🇰🇷" },
  TRY: { name: "里拉", decimals: 4, flag: "🇹🇷" }
};

let globalRates = {};
let globalLastUpdate = "未知";

fetchFromGoogle()
  .then(googleResult => {
    if (googleResult) {
      globalRates = { ...globalRates, ...googleResult.rates };
      globalLastUpdate = googleResult.lastUpdate;
    }
    const missing = googleCurrencies.filter(c => !(c in globalRates));
    if (missing.length > 0) {
      return fetchFromApiForCurrencies(missing);
    }
  })
  .then(apiResult => {
    if (apiResult) {
      globalRates = { ...globalRates, ...apiResult.rates };
      if (globalLastUpdate === "未知" && apiResult.lastUpdate) globalLastUpdate = apiResult.lastUpdate;
    }
    processRates(globalRates);
  })
  .catch(() => {
    fetchWithFallback(apiUrls);
  });

// Google 抓取
function fetchFromGoogle() {
  return new Promise(resolve => {
    const results = {};
    let done = 0, lastUpdate = 0;

    googleCurrencies.forEach(curr => {
      if (curr === baseCurrency) {
        results[curr] = 1;
        checkDone();
        return;
      }
      $httpClient.get(`https://www.google.com/finance/quote/${curr}-${baseCurrency}`, (err, res, data) => {
        if (!err && data) {
          const match = data.match(/data-last-price="([\d\.]+)".*data-last-normal-market-timestamp="(\d+)"/);
          if (match) {
            results[curr] = 1 / parseFloat(match[1]);
            lastUpdate = Math.max(lastUpdate, parseInt(match[2]));
          }
        }
        checkDone();
      });
    });

    function checkDone() {
      done++;
      if (done === googleCurrencies.length) {
        resolve(Object.keys(results).length ? {
          rates: results,
          lastUpdate: formatTime(lastUpdate * 1000)
        } : null);
      }
    }
  });
}

// API 补充
function fetchFromApiForCurrencies(list) {
  return new Promise(resolve => {
    let index = 0;
    function tryNext() {
      if (index >= apiUrls.length) return resolve(null);
      $httpClient.get(apiUrls[index], (err, res, data) => {
        if (!err && data) {
          try {
            const parsed = JSON.parse(data);
            const rates = parsed.rates || {};
            const filtered = {};
            list.forEach(c => { if (rates[c]) filtered[c] = rates[c]; });
            if (Object.keys(filtered).length) {
              return resolve({
                rates: filtered,
                lastUpdate: formatTime(parsed.time_last_update_utc || parsed.date || parsed.time_last_updated * 1000)
              });
            }
          } catch {}
        }
        index++;
        tryNext();
      });
    }
    tryNext();
  });
}

// Fallback
function fetchWithFallback(urls, i = 0) {
  if (i >= urls.length) return $done({ title: "汇率获取失败", content: "所有接口失败", icon: "xmark.octagon", "icon-color": "#FF3B30" });
  $httpClient.get(urls[i], (err, res, data) => {
    if (!err && data) {
      try {
        const parsed = JSON.parse(data);
        globalRates = parsed.rates || {};
        globalLastUpdate = formatTime(parsed.time_last_update_utc || parsed.date || parsed.time_last_updated * 1000);
        return processRates(globalRates);
      } catch {}
    }
    fetchWithFallback(urls, i + 1);
  });
}

// 数据处理 + 波动提醒
function processRates(rates) {
  const list = [];
  const fluctuationList = [];

  Object.keys(currencyConfig).forEach(key => {
    const cfg = currencyConfig[key];
    if (!rates[key]) return;

    const rate = rates[key]; // 1 CNY -> X 外币
    const rateInverse = 1 / rate; // 1 外币 -> Y CNY

    const prevRate = parseFloat($persistentStore.read("rate_" + key) || NaN);
    const prevInverse = parseFloat($persistentStore.read("rate_inverse_" + key) || NaN);

    // 检查波动，人民币兑外币
    if (!isNaN(prevRate)) {
      const change = ((rate - prevRate) / prevRate) * 100;
      if (Math.abs(change) >= threshold) {
        fluctuationList.push(`${cfg.flag} ${cfg.name} ${change > 0 ? "↑" : "↓"} ${change.toFixed(2)}%（1 RMB → ${rate.toFixed(cfg.decimals)}）`);
      }
    }

    // 检查波动，外币兑人民币
    if (!isNaN(prevInverse)) {
      const changeInv = ((rateInverse - prevInverse) / prevInverse) * 100;
      if (Math.abs(changeInv) >= threshold) {
        fluctuationList.push(`${cfg.flag} ${cfg.name} ${changeInv > 0 ? "↑" : "↓"} ${changeInv.toFixed(2)}%（1 ${cfg.name} → ${rateInverse.toFixed(cfg.decimals)} RMB）`);
      }
    }

    // 存储最新汇率
    $persistentStore.write(rate.toString(), "rate_" + key);
    $persistentStore.write(rateInverse.toString(), "rate_inverse_" + key);

    // 汇率展示，顺序：先人民币兑换外币，再外币兑换人民币
    list.push(`1 RMB🇨🇳 ≈ ${cfg.flag} ${cfg.name} ${rate.toFixed(cfg.decimals)}`);
    list.push(`1 ${cfg.flag} ${cfg.name} ≈ RMB🇨🇳 ${rateInverse.toFixed(cfg.decimals)}`);
    list.push(""); // 空行，增加阅读性
  });

  // 每日汇率通知
  const content = list.join("\n") + `\n更新时间：${globalLastUpdate}`;
  $notification.post("💱 人民币汇率", "每日更新", content);

  // 波动提醒
  if (fluctuationList.length > 0) {
    $notification.post(`📈 汇率波动提醒（>${threshold}%）`, "", fluctuationList.join("\n"));
  }

  $done({
    title: `人民币汇率 ${beijingTime()}`,
    content: content.trim(),
    icon: "arrow.left.arrow.right.circle",
    "icon-color": "#EF8F1C"
  });
}
// 工具函数
function beijingTime() { return new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }); }
function formatTime(t) { if (!t || t === "未知") return "未知"; return new Date(t).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }); }

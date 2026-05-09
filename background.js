const tabMap = {};
const RULE_ID = 1;

chrome.runtime.onMessage.addListener((msg, sender) => {

  if (msg.type === "FETCH_HEADER") {
    const email = msg.email;
    const sourceTabId = sender.tab.id;

    const url = `https://www.browserstack.com/admin/user_stats?utf8=%E2%9C%93&q=${encodeURIComponent(email)}&column_selected=Email&commit=Go`;

chrome.tabs.create({ url, active: false }, (tab) => {
  const adminTabId = tab.id;
  tabMap[adminTabId] = { sourceTabId, email };
  let scriptRan = false;

  function runScript() {
    if (scriptRan) return;
    scriptRan = true;
    chrome.scripting.executeScript({
      target: { tabId: adminTabId },
      func: extractHeader
    }).catch(() => {});
  }

  chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
    if (tabId === adminTabId && info.status === "complete") {
      chrome.tabs.onUpdated.removeListener(listener);
      setTimeout(runScript, 800);
    }
  });

  setTimeout(() => {
    if (!scriptRan) {
      scriptRan = true;
      const entry = tabMap[adminTabId];
      if (entry) {
        chrome.tabs.remove(adminTabId).catch(() => {});
        delete tabMap[adminTabId];
        chrome.tabs.sendMessage(entry.sourceTabId, {
          type: "HEADER_RESULT",
          success: false,
          debugInfo: "Admin page timed out."
        }).catch(() => {});
      }
    }
  }, 5000);
});
  }

  if (msg.type === "HEADER_RESULT") {
    const adminTabId = sender.tab.id;
    const entry = tabMap[adminTabId];
    if (!entry) return;

    const { sourceTabId } = entry;
    chrome.tabs.remove(adminTabId);
    delete tabMap[adminTabId];

    if (msg.header) {
      applyHeaderToAllRequests(msg.header, sourceTabId);
    } else {
      chrome.tabs.sendMessage(sourceTabId, {
        type: "HEADER_RESULT",
        success: false,
        header: null,
        debugInfo: msg.debugInfo || "No Mod Headers row found"
      });
    }
  }

  if (msg.type === "CLEAR_HEADER") {
    clearHeader();
  }

  if (msg.type === "GET_ACTIVE_HEADER") {
    chrome.storage.local.get(["activeHeader"], (data) => {
      chrome.runtime.sendMessage({ type: "ACTIVE_HEADER", header: data.activeHeader || null });
    });
  }
});

async function applyHeaderToAllRequests(rawHeader, sourceTabId) {

  const headerName = "X-Auth-override";
  const headerValue = rawHeader.trim();

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        id: RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{
            header: headerName,
            operation: "set",
            value: headerValue
          }]
        },
        condition: {
          urlFilter: "*",
          resourceTypes: [
            "main_frame", "sub_frame", "stylesheet", "script",
            "image", "font", "object", "xmlhttprequest",
            "ping", "csp_report", "media", "websocket", "other"
          ]
        }
      }]
    });

    await chrome.storage.local.set({
      activeHeader: { name: headerName, value: headerValue, raw: rawHeader }
    });

    chrome.tabs.sendMessage(sourceTabId, {
      type: "HEADER_RESULT",
      success: true,
      header: rawHeader,
      name: headerName,
      value: headerValue
    });

  } catch (err) {
    console.error("[BS Header Tool] Rule error:", err);
    chrome.tabs.sendMessage(sourceTabId, {
      type: "HEADER_RESULT",
      success: false,
      header: rawHeader,
      debugInfo: "Failed to set rule: " + err.message
    });
  }
}

async function clearHeader() {
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] });
  await chrome.storage.local.remove(["activeHeader"]);
}

function extractHeader() {
  console.log("[BS Header Tool] extractHeader() running");

  function getAllTableData() {
    const result = [];
    document.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        result.push({
          col0: cells[0].innerText.trim(),
          col1: cells[1].innerText.trim()
        });
      }
    });
    return result;
  }

  function findModHeader(rows) {
    for (const row of rows) {
      const label = row.col0.toLowerCase().replace(/[\s_-]/g, "");
      if (label === "modheaders" || label === "modheader") {
        const val = row.col1;
        if (val) return val;
      }
    }
    return null;
  }

  function attempt() {
    const rows = getAllTableData();
    console.log("[BS Header Tool] Table rows found:", JSON.stringify(rows));
    return findModHeader(rows);
  }

  const immediate = attempt();
  if (immediate) {
    console.log("[BS Header Tool] Found immediately:", immediate);
    chrome.runtime.sendMessage({ type: "HEADER_RESULT", header: immediate });
    return;
  }

  let attempts = 0;
  const maxAttempts = 6;

  const interval = setInterval(() => {
    attempts++;
    const val = attempt();

    if (val) {
      clearInterval(interval);
      console.log("[BS Header Tool] Found on poll attempt", attempts, ":", val);
      chrome.runtime.sendMessage({ type: "HEADER_RESULT", header: val });
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      const rows = getAllTableData();
      console.warn("[BS Header Tool] Timed out. All rows:", JSON.stringify(rows));
      chrome.runtime.sendMessage({
        type: "HEADER_RESULT",
        header: null,
        debugInfo: "Timed out. Rows found: " + JSON.stringify(rows.map(r => r.col0))
      });
    }
  }, 500);
}
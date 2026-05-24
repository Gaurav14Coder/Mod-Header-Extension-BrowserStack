const statusEl = document.getElementById("status-text");
const headerValue = document.getElementById("header-value");
const btnClear = document.getElementById("btn-clear");
const manualInput = document.getElementById("manual-input");

chrome.storage.local.get(["activeHeader"], (data) => {
  if (data.activeHeader) {
    statusEl.textContent = "✅ Mod_Header_Active";
    statusEl.className = "status-active";
    headerValue.textContent = data.activeHeader.value;
    headerValue.style.display = "block";
    btnClear.disabled = false;
    manualInput.placeholder = "Edit header value & press Enter...";
  } else {
    statusEl.textContent = "⭕ Mod_Header_Inactive";
    statusEl.className = "status-inactive";
    headerValue.style.display = "none";
    btnClear.disabled = true;
    manualInput.placeholder = "Enter header value & press Enter...";
  }
});

btnClear.addEventListener("click", () => {
  chrome.storage.local.remove(["activeHeader"]);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
  statusEl.textContent = "⭕ Mod_Header_Inactive";
  statusEl.className = "status-inactive";
  headerValue.style.display = "none";
  btnClear.disabled = true;
  manualInput.value = "";
  manualInput.placeholder = "Enter header value & press Enter...";
});

manualInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const headerVal = manualInput.value.trim();
    if (!headerVal) return;

    chrome.runtime.sendMessage({
      type: "APPLY_MANUAL_HEADER",
      header: headerVal
    }, (response) => {
      if (response && response.success) {
        statusEl.textContent = "✅ Mod_Header_Active";
        statusEl.className = "status-active";
        headerValue.textContent = headerVal;
        headerValue.style.display = "block";
        btnClear.disabled = false;
        manualInput.value = "";
        manualInput.placeholder = "Edit header value & press Enter...";
      }
    });
  }
});

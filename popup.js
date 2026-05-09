const statusEl = document.getElementById("status-text");
const headerValue = document.getElementById("header-value");
const btnClear = document.getElementById("btn-clear");

chrome.storage.local.get(["activeHeader"], (data) => {
  if (data.activeHeader) {
    statusEl.textContent = "✅ Mod_Header_Active";
    statusEl.className = "status-active";
    headerValue.textContent = data.activeHeader.value;
    headerValue.style.display = "block";
    btnClear.disabled = false;
  } else {
    statusEl.textContent = "⭕ Mod_Header_Inactive";
    statusEl.className = "status-inactive";
    headerValue.style.display = "none";
    btnClear.disabled = true;
  }
});

btnClear.addEventListener("click", () => {
  chrome.storage.local.remove(["activeHeader"]);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
  statusEl.textContent = "⭕ Mod_Header_Inactive";
  statusEl.className = "status-inactive";
  headerValue.style.display = "none";
  btnClear.disabled = true;
});

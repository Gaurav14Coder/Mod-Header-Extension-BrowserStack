chrome.storage.local.get(["activeHeader"], (data) => {
  const statusEl = document.getElementById("status-text");
  const headerInfo = document.getElementById("header-info");
  const headerName = document.getElementById("header-name");
  const headerValue = document.getElementById("header-value");
  const btnClear = document.getElementById("btn-clear");

  if (data.activeHeader) {
    statusEl.textContent = "✅ Mod_Header_Active";
    statusEl.className = "status-active";
    headerName.textContent = data.activeHeader.name;
    headerValue.textContent = data.activeHeader.value;
    headerInfo.style.display = "block";
    btnClear.disabled = false;
  } else {
    statusEl.textContent = "⭕ Mod_Header_Inactive";
    statusEl.className = "status-inactive";
    headerInfo.style.display = "none";
    btnClear.disabled = true;
  }

  btnClear.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLEAR_HEADER" });
    statusEl.textContent = "⭕ Mod_Header_Inactive";
    statusEl.className = "status-inactive";
    headerInfo.style.display = "none";
    btnClear.disabled = true;
  });
});

if (!window.__autModHeaderLoaded && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
  window.__autModHeaderLoaded = true;

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

  if (emailRegex.test(selectedText)) {
    showConfirmOverlay(selectedText);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HEADER_RESULT") {
    if (msg.success) {
      showOverlay(
        `✅ Header Applied!\n\nKey:   ${msg.name}\nValue: ${msg.value}\n\nNote: This header will be active for all tabs until cleared from the extension popup.`,
        "#145214", true
      );
    } else {
      const debug = msg.debugInfo ? `\n\nDebug: ${msg.debugInfo}` : "";
      showOverlay(`⚠️ No Mod Header found for this user.${debug}`, "#7a3010", true);
    }
  }
  if (msg.type === "HEADER_CLEARED") {
    showOverlay("🗑️ Header cleared.", "#333", true);
  }
});

function showConfirmOverlay(email) {
  const existing = document.getElementById("bs-header-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";

  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1e293b",
    color: "#fff",
    padding: "16px 18px",
    borderRadius: "12px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    zIndex: 2147483647,
    minWidth: "260px",
    maxWidth: "340px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    border: "1px solid #f26522"
  });

  overlay.innerHTML =
    `<div style="color:#f26522;font-weight:700;font-size:14px;margin-bottom:10px;">AUT MOD HEADER</div>` +
    `<div style="color:#aaa;font-size:11px;margin-bottom:4px;">Email selected:</div>` +
    `<div style="color:#fff;font-weight:600;margin-bottom:14px;word-break:break-all;">${escHtml(email)}</div>` +
    `<div style="display:flex;gap:8px;">` +
      `<button id="bs-apply-btn" style="flex:1;padding:10px;background:#f26522;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Fetch &amp; Apply</button>` +
      `<button id="bs-cancel-btn" style="padding:10px 14px;background:#374151;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Cancel</button>` +
    `</div>`;

  document.body.appendChild(overlay);

  document.getElementById("bs-cancel-btn").addEventListener("click", () => overlay.remove());

  document.getElementById("bs-apply-btn").addEventListener("click", () => {
    showOverlay("⏳ Fetching Mod Header...", "#333", false);
    chrome.runtime.sendMessage({ type: "FETCH_HEADER", email });
  });
}

function showOverlay(message, bgColor = "#111", autoDismiss = true) {
  let overlay = document.getElementById("bs-header-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";
  overlay.innerText = message;

  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: bgColor,
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "10px",
    fontSize: "12px",
    fontFamily: "monospace",
    zIndex: 2147483647,
    maxWidth: "380px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
    opacity: "1",
    transition: "opacity 0.4s ease"
  });

  document.body.appendChild(overlay);

  if (autoDismiss) {
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 400);
    }, 8000);
  }
}

function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

}

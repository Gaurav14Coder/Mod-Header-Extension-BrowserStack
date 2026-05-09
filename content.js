
if (window.self !== window.top) {
} else if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
} else {

let cancelled = false; 

document.addEventListener("mouseup", (e) => {
 
  if (cancelled) {
    cancelled = false;
    return;
  }

  const selectedText = window.getSelection().toString().trim();
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  if (emailRegex.test(selectedText)) {
    showConfirmOverlay(selectedText);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HEADER_RESULT") {
    if (msg.success) {
      showStatusOverlay("Header Applied", msg.value, "#145214");
    } else {
      showStatusOverlay("No Mod Header found for this user.", "#7a3010");
    }
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
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    zIndex: 2147483647,
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    border: "1px solid #f26522",
    pointerEvents: "all"
  });

  overlay.innerHTML =
    `<div style="color:#f26522;font-weight:700;font-size:13px;margin-bottom:12px;">AUT MOD HEADER</div>` +
    `<div style="display:flex;gap:8px;">` +
      `<button id="bs-apply-btn" style="flex:1;padding:10px;background:#f26522;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Fetch &amp; Apply</button>` +
      `<button id="bs-cancel-btn" style="padding:10px 14px;background:#374151;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Cancel</button>` +
    `</div>`;

  document.body.appendChild(overlay);

  document.getElementById("bs-cancel-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancelled = true; 
    overlay.remove();
    window.getSelection().removeAllRanges(); 
  });

  document.getElementById("bs-apply-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    showOverlay("⏳ Fetching...", "#1e293b", false);
    chrome.runtime.sendMessage({ type: "FETCH_HEADER", email });
  });
}

function showOverlay(message, bgColor, autoDismiss) {
  let overlay = document.getElementById("bs-header-overlay");
  if (overlay) overlay.remove();
  overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";
  overlay.innerText = message;
  Object.assign(overlay.style, {
    position: "fixed", bottom: "20px", right: "20px",
    background: bgColor, color: "#aaa",
    padding: "14px 18px", borderRadius: "10px",
    fontSize: "12px", fontFamily: "monospace",
    zIndex: 2147483647, boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    opacity: "1"
  });
  document.body.appendChild(overlay);
}

function showStatusOverlay(heading, value, bgColor) {
  let overlay = document.getElementById("bs-header-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";
  Object.assign(overlay.style, {
    position: "fixed", bottom: "20px", right: "20px",
    background: bgColor, color: "#fff",
    padding: "14px 18px", borderRadius: "10px",
    fontSize: "13px", fontFamily: "monospace",
    zIndex: 2147483647, maxWidth: "360px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    opacity: "1", transition: "opacity 0.4s ease"
  });

  overlay.innerHTML =
    `<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;font-family:sans-serif;">${heading}</div>` +
    `<div style="font-size:14px;font-weight:700;word-break:break-all;">${value}</div>`;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  }, 8000);
}

}
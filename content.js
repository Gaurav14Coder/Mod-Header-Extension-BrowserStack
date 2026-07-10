if (window.self !== window.top) {
} else if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
} else {

let cancelled = false;
let isFetching = false;

document.addEventListener("mouseup", (e) => {
  if (cancelled) { cancelled = false; return; }
  if (isFetching) return;

  const selectedText = window.getSelection().toString().trim();

  const modHeaderRegex = /^\d+_\d+$/;
  if (modHeaderRegex.test(selectedText)) {
    showConfirmOverlay(selectedText, true);
    return;
  }

  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  if (emailRegex.test(selectedText)) {
    showConfirmOverlay(selectedText, false);
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HEADER_RESULT") {
    isFetching = false;
    if (msg.success) {
      try { navigator.clipboard.writeText(msg.value); } catch(e) {}
      showStatusOverlay("Header Applied — Copied to clipboard", msg.value, "#145214");
    } else {
      showStatusOverlay("Not Found", "No Mod Header found for this user.", "#7a3010");
    }
  }
});

function showConfirmOverlay(value, isDirectModHeader) {
  const existing = document.getElementById("bs-header-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";
  Object.assign(overlay.style, {
    position: "fixed", bottom: "20px", right: "20px",
    background: "#1e293b", color: "#fff",
    padding: "10px 12px", borderRadius: "10px",   
    fontSize: "12px", fontFamily: "sans-serif",
    zIndex: 2147483647,
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    border: "1px solid #f26522", pointerEvents: "all",
    minWidth: "200px"
  });

  const buttonText = isDirectModHeader ? "Apply" : "Fetch &amp; Apply";

  overlay.innerHTML =
    '<div style="color:#f26522;font-weight:700;font-size:12px;margin-bottom:8px;">MOD HEADER</div>' +
    '<div style="display:flex;gap:6px;">' +
      '<button id="bs-apply-btn" style="flex:1;padding:7px 6px;background:#f26522;color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;">' + buttonText + '</button>' +
      (!isDirectModHeader ? '<button id="bs-admin-btn" style="padding:7px 8px;background:#0f3460;color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;">Admin</button>' : '') +
      '<button id="bs-cancel-btn" style="padding:7px 8px;background:#374151;color:#fff;border:none;border-radius:7px;font-size:11px;cursor:pointer;white-space:nowrap;">✕</button>' +
    '</div>';

  document.body.appendChild(overlay);

  document.getElementById("bs-cancel-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancelled = true;
    overlay.remove();
    setTimeout(() => window.getSelection().removeAllRanges(), 0);
  });

  document.getElementById("bs-apply-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    overlay.remove();
    setTimeout(() => window.getSelection().removeAllRanges(), 0);

    if (isDirectModHeader) {
      try {
        chrome.runtime.sendMessage({ type: "APPLY_MANUAL_HEADER", header: value });
        navigator.clipboard.writeText(value);
        showStatusOverlay("Header Applied — Copied to clipboard", value, "#145214");
      } catch(e) {
        showStatusOverlay("Error", "Extension reloaded — refresh the page.", "#7a3010");
      }
    } else {
      isFetching = true;

      const fetchEl = document.createElement("div");
      fetchEl.id = "bs-header-overlay";
      Object.assign(fetchEl.style, {
        position: "fixed", bottom: "20px", right: "20px",
        background: "#1e293b", color: "#fff",
        padding: "10px 14px", borderRadius: "10px",
        fontSize: "12px", fontFamily: "sans-serif",
        zIndex: 2147483647,
        boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
        border: "1px solid #f26522"
      });
      fetchEl.innerHTML =
        '<div style="color:#f26522;font-weight:700;font-size:12px;margin-bottom:6px;">MOD HEADER</div>' +
        '<div style="color:#aaa;font-size:11px;font-family:monospace;">⏳ Fetching Mod Header...</div>';
      document.body.appendChild(fetchEl);

      try {
        chrome.runtime.sendMessage({ type: "FETCH_HEADER", email: value });
      } catch(e) {
        isFetching = false;
        fetchEl.remove();
        showStatusOverlay("Error", "Extension reloaded — refresh the page.", "#7a3010");
      }
    }
  });

  if (!isDirectModHeader) {
    document.getElementById("bs-admin-btn").addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        chrome.runtime.sendMessage({ type: "OPEN_ADMIN", email: value });
      } catch(e) {}
      overlay.remove();
      setTimeout(() => window.getSelection().removeAllRanges(), 0);
    });
  }
}

function showStatusOverlay(heading, value, bgColor) {
  const existing = document.getElementById("bs-header-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "bs-header-overlay";
  Object.assign(overlay.style, {
    position: "fixed", bottom: "20px", right: "20px",
    background: bgColor, color: "#fff",
    padding: "10px 14px", borderRadius: "10px",
    fontSize: "12px", fontFamily: "monospace",
    zIndex: 2147483647, maxWidth: "320px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    opacity: "1", transition: "opacity 0.4s ease"
  });

  overlay.innerHTML =
    '<div style="font-size:10px;color:rgba(255,255,255,0.6);margin-bottom:3px;font-family:sans-serif;">' + heading + '</div>' +
    '<div style="font-size:13px;font-weight:700;word-break:break-all;">' + value + '</div>';

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  }, 6000);
}

}

# MOD HEADER EXTENSION

> A Chrome extension that instantly fetch and apply Mod Headers from the admin panel — without any manual copy-paste.

---

## What it does

When you're on a Freshdesk ticket and need to set a Mod Header for a user:

- **Before:** Open admin page → find Mod Headers row → copy value → open ModHeader extension → paste manually
- **After:** Highlight the user's email → click **Fetch & Apply** → done

---

## Setup

**Requirements**
- Google Chrome
- BrowserStack admin access

**Steps**

1. Download and unzip `MOD_HEADER_BROWSERSTACK.zip`
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the unzipped `MOD_HEADER_BROWSERSTACK` folder
6. The extension will appear in your toolbar

> ⚠️ If you're updating from an older version, click **Remove** first before loading the new one. Do not just hit the reload button.

---

## Clearing the header
Click the extension icon in the toolbar → click **Clear Active Header**

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Overlay not appearing | Make sure you fully removed the old version and loaded fresh via Load unpacked |
| "No Mod Header found" | The user may not have a Mod Header set in admin |

---

## Feedback & Issues
Found a bug or want a feature?
👉 [Open a GitHub Issue](https://github.com/Gaurav14Coder/AUT_MOD_HEADER/issues/new) or contact gaurav.si@browserstack.com or drop a comment on the GitHub repo.

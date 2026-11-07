import { API_URL, WEB_APP_URL } from "./config";
import { GCM_CONFIG, MESSAGES } from "./constants";
import { COLORS } from "./theme";

// Authenticated fetch helper with automatic token refresh
async function fetchWithAuth(url, options) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log('[background.js] 401 Unauthorized. Attempting token refresh...');
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.ok) {
      console.log('[background.js] Token refreshed. Retrying request...');
      response = await fetch(url, options);
    } else {
      console.error('[background.js] Token refresh failed. User must log in.');
    }
  }

  return response;
}

// Option A: Native chrome.gcm registration for Chrome MV3 Extensions
const syncFcmToken = async () => {
  if (typeof chrome === 'undefined' || !chrome.gcm) {
    console.warn('[background.js] chrome.gcm is not available');
    return;
  }

  chrome.gcm.register([GCM_CONFIG.SENDER_ID], async (registrationId) => {
    if (chrome.runtime.lastError) {
      console.error('[background.js]', MESSAGES.ERROR.TOKEN_SYNC_FAILED, chrome.runtime.lastError.message);
      return;
    }

    if (!registrationId) {
      console.warn('[background.js] No GCM registrationId returned');
      return;
    }

    console.log('[background.js] Native GCM token acquired:', registrationId);
    try {
      await fetchWithAuth(`${API_URL}/auth/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: registrationId })
      });
      console.log('[background.js]', MESSAGES.SUCCESS.TOKEN_SYNCED);
    } catch (err) {
      console.error('[background.js]', MESSAGES.ERROR.TOKEN_SYNC_FAILED, err);
    }
  });
};

// Native GCM push notification listener
if (typeof chrome !== 'undefined' && chrome.gcm) {
  chrome.gcm.onMessage.addListener((message) => {
    console.log('[background.js] Received GCM push message:', message);
    const title = message.data?.title || message.notification?.title || MESSAGES.UI.NOTIFICATION_TITLE;
    const body = message.data?.body || message.notification?.body || MESSAGES.UI.NOTIFICATION_BODY;

    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon.png'),
      title,
      message: body,
      priority: 2
    });
  });
}

// Focus or open web app on notification click
if (typeof chrome !== 'undefined' && chrome.notifications) {
  chrome.notifications.onClicked.addListener((notificationId) => {
    if (chrome.notifications.clear) {
      chrome.notifications.clear(notificationId);
    }
    const appUrl = `${WEB_APP_URL}/app`;
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find(t => t.url && t.url.includes(WEB_APP_URL));
      if (existingTab && existingTab.id) {
        chrome.tabs.update(existingTab.id, { active: true });
        if (existingTab.windowId) {
          chrome.windows.update(existingTab.windowId, { focused: true });
        }
      } else {
        chrome.tabs.create({ url: appUrl });
      }
    });
  });
}

// Helper to create menus
function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-to-ormayundo",
      title: "Save to Ormayundo",
      contexts: ["selection"]
    });
  });
}

// On startup, check if logged in
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['ormayundo_user'], (result) => {
    if (result.ormayundo_user) {
      createMenus();
    }
  });
});

// Create the right-click menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['ormayundo_user'], (result) => {
    if (result.ormayundo_user) {
      createMenus();
    }
  });
});

// Listen for clicks on the right-click menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-ormayundo") {

    const handleSave = async (selectedText) => {
      if (!selectedText || selectedText.trim().length < 20) {
        console.warn('[background.js] Selection too short or empty, aborting save.');
        return;
      }

      const sourceUrl = tab && tab.url ? tab.url : '';
      if (!sourceUrl) {
        console.error('[background.js] Tab URL missing, cannot save recall.');
        chrome.action.setBadgeText({ text: 'X' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
        return;
      }

      console.log('[background.js] Right-click menu clicked! Saving text:', selectedText);
      chrome.action.setBadgeText({ text: '...' });
      chrome.action.setBadgeBackgroundColor({ color: COLORS.brandLight });

      try {
        const payload = { selectedText, sourceUrl };
        console.log('[background.js] Payload being sent:', payload);
        const res = await fetchWithAuth(`${API_URL}/recall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Server returned ' + res.status);
        console.log('[background.js] Successfully saved to backend!');
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeSuccess });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
      } catch (error) {
        console.error('[background.js] Error saving from context menu:', error);
        chrome.action.setBadgeText({ text: 'X' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
      }
    };

    // Ask the content script on the active tab for the Markdown text
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_SELECTION' }, async (response) => {
      let selectedText = response?.text;

      if (chrome.runtime.lastError || !response || response.error || !selectedText) {
        // Fallback: If content script is missing or fails, just use the native selection text
        if (info.selectionText) {
          selectedText = info.selectionText;
        } else {
          console.error('[background.js] Error from content script and no native selection available:', chrome.runtime.lastError?.message || response?.error);
          chrome.action.setBadgeText({ text: 'X' });
          chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
          setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
          return;
        }
      }

      await handleSave(selectedText);
    });


  }
});

// Listen for Login/Logout events from App.jsx to manage menus dynamically
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'USER_LOGIN') {
    createMenus();
    syncFcmToken();
  } else if (request.action === 'USER_LOGOUT') {
    chrome.contextMenus.removeAll();
  } else if (request.action === 'SYNC_FCM_TOKEN') {
    syncFcmToken();
  }
});

// Listen for SAVE_FLASHCARD from the floating button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_FLASHCARD' && request.text) {
    console.log('[background.js] Floating button clicked! Saving text:', request.text);

    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: COLORS.brandLight });

    (async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/recall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ selectedText: request.text, sourceUrl: request.url })
        });

        if (!response.ok) throw new Error('Server returned ' + response.status);

        console.log('[background.js] Successfully saved to backend!');
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeSuccess });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: true });
      } catch (error) {
        console.error('[background.js] Error saving from floating button:', error);
        chrome.action.setBadgeText({ text: 'X' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep message channel open
  }
});

// --- HIGHLIGHT SAVED TEXT ON PAGE LOAD / TAB SWITCH ---
// Shared helper: inject content script (if not already present) then send HIGHLIGHT_PAGE
async function sendHighlights(tabId, url) {
  if (!url || !url.startsWith('http')) return;

  // Ignore our own web app dashboard URLs so the extension doesn't highlight card text inside the dashboard manager!
  if (url.includes('ormayundo-woad.vercel.app') || url.includes('localhost:5173') || url.includes('localhost:3000')) return;

  try {
    const response = await fetchWithAuth(`${API_URL}/recall?url=${encodeURIComponent(url)}`, {
      credentials: 'include'
    });

    if (!response.ok) return;

    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) return;

    const highlights = items
      .filter(item => item.selectedText && typeof item.selectedText === 'string')
      .map(item => ({ text: item.selectedText, createdAt: item.createdAt }));

    if (highlights.length === 0) return;

    // Inject the content script first (idempotent – safe to call even if already injected)
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['content.js']
      });
    } catch {
      // Already injected or restricted page – proceed anyway
    }

    // Small delay to let the injected script initialise
    await new Promise(r => setTimeout(r, 200));

    chrome.tabs.sendMessage(tabId, { action: 'HIGHLIGHT_PAGE', highlights }, () => {
      if (chrome.runtime.lastError) { /* ignore – content script may still be loading */ }
    });
  } catch {
    // User not logged in or network issue — don't surface errors
  }
}

// Trigger on page load completion
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  sendHighlights(tabId, tab.url);
});

// Trigger when the user switches to a tab (covers pages already loaded)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    sendHighlights(activeInfo.tabId, tab.url);
  } catch {
    // Ignore tab access errors
  }
});



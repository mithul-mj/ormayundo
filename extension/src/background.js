import { API_URL, WEB_APP_URL } from "./config";
import { GCM_CONFIG, MESSAGES } from "./constants";
import { COLORS } from "./theme";

// Authenticated fetch helper with automatic token refresh
async function fetchWithAuth(url, options) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log('[background.js] 401 Unauthorized. Attempting token refresh...');
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        console.log('[background.js] Token refreshed. Retrying request...');
        response = await fetch(url, options);
      } else {
        console.warn('[background.js] Token refresh failed. Clearing stale session.');
        chrome.storage.local.remove(['ormayundo_user']);
        chrome.contextMenus.removeAll();
      }
    } catch (err) {
      console.error('[background.js] Token refresh network error:', err);
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

// --- FEEDBACK & NOTIFICATION HELPERS ---
function notifyAuthRequired(tabId = null) {
  // 1. Informative Badge & Tooltip (replaces cryptic X with actionable feedback)
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
  chrome.action.setTitle({ title: 'Ormayundo: Please log in to save flashcards' });
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Ormayundo' });
  }, 4000);

  // 2. Native System Desktop Notification
  if (typeof chrome !== 'undefined' && chrome.notifications) {
    chrome.notifications.create('ormayundo-auth-error', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon.png'),
      title: 'Ormayundo — Login Required',
      message: 'Please log in to your account to save flashcards to your deck.',
      priority: 2
    });
  }

  // 3. In-page Toast on current active tab
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'SHOW_TOAST',
      type: 'auth_error',
      title: 'Login Required',
      message: 'Please log in to Ormayundo to save this card to your spaced repetition deck.',
      actionLabel: 'Log In'
    }, () => {
      if (chrome.runtime.lastError) { /* ignore tab communication quirks */ }
    });
  }
}

function notifySaveError(errorMessage, tabId = null) {
  chrome.action.setBadgeText({ text: '✕' });
  chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeError });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2500);

  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'SHOW_TOAST',
      type: 'error',
      title: 'Save Failed',
      message: errorMessage || 'Could not save flashcard. Please check your connection.'
    }, () => {
      if (chrome.runtime.lastError) { /* ignore tab communication quirks */ }
    });
  }
}

function notifySaveSuccess(tabId = null) {
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeSuccess });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'SHOW_TOAST',
      type: 'success',
      title: 'Flashcard Saved',
      message: 'Added to your active recall review deck.'
    }, () => {
      if (chrome.runtime.lastError) { /* ignore tab communication quirks */ }
    });
  }
}

// Listen for clicks on the right-click menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-ormayundo") {

    const handleSave = async (selectedText) => {
      if (!selectedText || selectedText.trim().length < 20) {
        console.warn('[background.js] Selection too short or empty, aborting save.');
        notifySaveError('Highlight at least 20 characters to create a flashcard.', tab?.id);
        return;
      }

      const sourceUrl = tab && tab.url ? tab.url : '';
      if (!sourceUrl) {
        console.error('[background.js] Tab URL missing, cannot save recall.');
        notifySaveError('Cannot save flashcard from this page.', tab?.id);
        return;
      }

      console.log('[background.js] Right-click menu clicked! Saving text:', selectedText);
      chrome.action.setBadgeText({ text: '...' });
      chrome.action.setBadgeBackgroundColor({ color: COLORS.brandLight });

      try {
        const payload = { selectedText, sourceUrl };
        const res = await fetchWithAuth(`${API_URL}/recall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        if (res.status === 401) {
          notifyAuthRequired(tab?.id);
          return;
        }

        if (!res.ok) {
          throw new Error('Server returned ' + res.status);
        }

        console.log('[background.js] Successfully saved to backend!');
        notifySaveSuccess(tab?.id);
      } catch (error) {
        console.error('[background.js] Error saving from context menu:', error);
        notifySaveError(error.message, tab?.id);
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
          notifySaveError('Could not extract selected text.', tab?.id);
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
  } else if (request.action === 'OPEN_LOGIN') {
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

        if (response.status === 401) {
          notifyAuthRequired(sender.tab?.id);
          sendResponse({
            success: false,
            status: 401,
            error: 'AUTH_REQUIRED',
            message: 'Please log in to Ormayundo to save flashcards.'
          });
          return;
        }

        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }

        console.log('[background.js] Successfully saved to backend!');
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: COLORS.badgeSuccess });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: true });
      } catch (error) {
        console.error('[background.js] Error saving from floating button:', error);
        notifySaveError(error.message, sender.tab?.id);
        sendResponse({
          success: false,
          status: error.status || 500,
          error: error.message || 'SERVER_ERROR',
          message: error.message || 'Could not save flashcard.'
        });
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
  if (url.includes('ormayundo-app.vercel.app') || url.includes('localhost:5173') || url.includes('localhost:3000')) return;

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



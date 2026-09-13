import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { API_URL } from "./config";

const firebaseConfig = {
  apiKey: "AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc",
  authDomain: "ormayundo-4f8c5.firebaseapp.com",
  projectId: "ormayundo-4f8c5",
  storageBucket: "ormayundo-4f8c5.firebasestorage.app",
  messagingSenderId: "261551023957",
  appId: "1:261551023957:web:5c28db3528f113244d31dc",
  measurementId: "G-1KZ9ST0Q4S"
};

// Initialize Firebase specifically for the Service Worker context
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Custom fetch wrapper to handle 401 Unauthorized and refresh the token
async function fetchWithAuth(url, options) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log('[background.js] 401 Unauthorized. Attempting to refresh token...');
    // Attempt to hit the refresh endpoint
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.ok) {
      console.log('[background.js] Token refreshed successfully! Retrying original request...');
      // Retry the original request
      response = await fetch(url, options);
    } else {
      console.error('[background.js] Refresh token failed. User must log in manually.');
    }
  }

  return response;
}

// Listen for Push Notifications from the backend
onBackgroundMessage(messaging, (payload) => {
  console.log('[background.js] Received Firebase push message', payload);

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: payload.notification?.title || 'Time for Ormayundo!',
    message: payload.notification?.body || 'You have flashcards due.',
    priority: 2
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('[background.js] Failed to show visual notification:', chrome.runtime.lastError.message);
    } else {
      console.log('[background.js] Visual notification displayed successfully! ID:', notificationId);
    }
  });
});

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

// Ask the content script on the active tab for the Markdown text
chrome.tabs.sendMessage(tab.id, {
  action: 'EXTRACT_SELECTION'
}, async (response) => {

  if (chrome.runtime.lastError) {
    console.error('[background.js] Content script runtime error:', chrome.runtime.lastError.message);
    chrome.action.setBadgeText({ text: 'X' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
    return;
  }

  if (!response || response.error) {
    console.error('[background.js] Error from content script:', response?.error || response);
    chrome.action.setBadgeText({ text: 'X' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
    return;
  }

  const selectedText = response.text;
  if (!selectedText || selectedText.trim().length < 20) {
    console.warn('[background.js] Selection too short or empty, aborting save.');
    return;
  }

  const sourceUrl = tab && tab.url ? tab.url : '';
  if (!sourceUrl) {
    console.error('[background.js] Tab URL missing, cannot save recall.');
    chrome.action.setBadgeText({ text: 'X' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
    return;
  }

  console.log('[background.js] Right-click menu clicked! Saving text:', selectedText);
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF5A5F' });

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
    chrome.action.setBadgeBackgroundColor({ color: '#00C853' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
  } catch (error) {
    console.error('[background.js] Error saving from context menu:', error);
    chrome.action.setBadgeText({ text: 'X' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
  }
});
  }
});

// Listen for Login/Logout events from App.jsx to manage menus dynamically
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'USER_LOGIN') {
    createMenus();
  } else if (request.action === 'USER_LOGOUT') {
    chrome.contextMenus.removeAll();
  }
});

// Listen for SAVE_FLASHCARD from the floating button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_FLASHCARD' && request.text) {
    console.log('[background.js] Floating button clicked! Saving text:', request.text);

    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF5A5F' });

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
        chrome.action.setBadgeBackgroundColor({ color: '#00C853' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: true });
      } catch (error) {
        console.error('[background.js] Error saving from floating button:', error);
        chrome.action.setBadgeText({ text: 'X' });
        chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
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
    } catch (_) {
      // Already injected or restricted page – proceed anyway
    }

    // Small delay to let the injected script initialise
    await new Promise(r => setTimeout(r, 200));

    chrome.tabs.sendMessage(tabId, { action: 'HIGHLIGHT_PAGE', highlights }, () => {
      if (chrome.runtime.lastError) { /* ignore – content script may still be loading */ }
    });
  } catch (e) {
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
  } catch (_) {}
});



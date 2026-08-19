import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

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

// Create the right-click menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-ormayundo",
    title: "Save to Ormayundo",
    contexts: ["selection"]
  });
});

// Listen for clicks on the right-click menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-ormayundo" && info.selectionText) {
    console.log('[background.js] Right-click menu clicked! Saving text:', info.selectionText);

    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF5A5F' });

    (async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ selectedText: info.selectionText, sourceUrl: tab.url })
        });

        if (!response.ok) throw new Error('Server returned ' + response.status);

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
    })();
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
        const response = await fetch('http://localhost:5000/api/recall', {
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

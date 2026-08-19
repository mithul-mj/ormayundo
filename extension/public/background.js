importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc",
  authDomain: "ormayundo-4f8c5.firebaseapp.com",
  projectId: "ormayundo-4f8c5",
  storageBucket: "ormayundo-4f8c5.firebasestorage.app",
  messagingSenderId: "261551023957",
  appId: "1:261551023957:web:5c28db3528f113244d31dc",
  measurementId: "G-1KZ9ST0Q4S"
};

// Initialize Firebase in the extension background
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fire native desktop notifications when Firebase sends a push message
messaging.onBackgroundMessage((payload) => {
  console.log('[background.js] Received Firebase push message ', payload);
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: payload.notification.title || 'Ormayundo',
    message: payload.notification.body,
    priority: 2
  });
});

// Handle token sync requests from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_FCM_TOKEN') {
    (async () => {
      try {
        console.log('[background.js] Requesting FCM Token...');
        const token = await firebase.messaging().getToken({
          vapidKey: "BH-3PZlKBc-8yvnygadCUQitn85ECyWa_iFrniI8YP1KHU1tX3X7kbc8fxw5q12NQiRhWUd2GeuX7M1JJdGgpXg",
          serviceWorkerRegistration: self.registration // Strictly required for Chrome Extensions!
        });
        
        if (token) {
          console.log('[background.js] Got Token! Sending to backend...', token);
          await fetch('http://localhost:5000/api/auth/fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token })
          });
          console.log('[background.js] Token synced with backend!');
          sendResponse({ success: true });
        }
      } catch (error) {
        console.error('[background.js] Failed to generate FCM token:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep message channel open
  }
});
// Create the right-click menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-ormayundo",
    title: "Save to Ormayundo",
    contexts: ["selection"]
  });
});

// Listen for messages from the content script (the floating button)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_FLASHCARD' && request.text) {

    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF5A5F' });

    // Use an async IIFE so we can await the fetch
    (async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recall', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            selectedText: request.text,
            sourceUrl: request.url
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Server returned ${response.status}`);
        }

        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#00C853' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: true });
      } catch (error) {
        console.error('Error saving to Ormayundo:', error);
        chrome.action.setBadgeText({ text: 'X' });
        chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);

        sendResponse({ success: false, error: error.message });
      }
    })();

    // Return true to tell Chrome we will send the response asynchronously!
    return true;
  }
});

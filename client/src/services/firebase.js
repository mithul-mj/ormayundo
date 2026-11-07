import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc",
  authDomain: "ormayundo-4f8c5.firebaseapp.com",
  projectId: "ormayundo-4f8c5",
  storageBucket: "ormayundo-4f8c5.firebasestorage.app",
  messagingSenderId: "261551023957",
  appId: "1:261551023957:web:5c28db3528f113244d31dc",
  measurementId: "G-1KZ9ST0Q4S"
};

export const VAPID_KEY = "BH-3PZlKBc-8yvnygadCUQitn85ECyWa_iFrniI8YP1KHU1tX3X7kbc8fxw5q12NQiRhWUd2GeuX7M1JJdGgpXg";

// Initialize Firebase for web client
const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' && 'Notification' in window ? getMessaging(app) : null;

// Initialize web push notifications, register service worker, and sync FCM token
export const initWebPush = async (apiUrl) => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('[WebPush] Push notifications not supported in this browser.');
    return null;
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[WebPush] Notification permission denied or dismissed.');
      return null;
    }

    // 2. Register Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // 3. Obtain FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[WebPush] Web FCM Token acquired. Syncing with backend...');
      await fetch(`${apiUrl}/auth/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token })
      });
      console.log('[WebPush] Web FCM Token synced successfully!');
    }

    // 4. Listen for incoming foreground messages
    onMessage(messaging, (payload) => {
      console.log('[WebPush] Foreground message received:', payload);
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Time for Ormayundo!', {
          body: payload.notification?.body || 'You have flashcards due for review.',
          icon: '/favicon.svg'
        });
      }
    });

    return token;
  } catch (error) {
    console.warn('[WebPush] Failed to register web push:', error);
    return null;
  }
};

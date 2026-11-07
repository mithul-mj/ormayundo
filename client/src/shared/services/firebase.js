import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { FIREBASE_CONFIG, VAPID_KEY, MESSAGES } from "../constants";

// Initialize Firebase for web client
const app = initializeApp(FIREBASE_CONFIG);
export const messaging = typeof window !== 'undefined' && 'Notification' in window
  ? getMessaging(app)
  : null;

// Initialize web push notifications, register service worker, and sync FCM token
export const initWebPush = async (apiUrl) => {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    console.log('[WebPush]', MESSAGES.ERROR.PUSH_UNSUPPORTED);
    return null;
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[WebPush]', MESSAGES.ERROR.PERMISSION_DENIED);
      return null;
    }

    // 2. Register Firebase messaging service worker
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    await navigator.serviceWorker.ready;

    // 3. Obtain FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('[WebPush] Web FCM Token acquired. Syncing with backend...');
      await fetch(`${apiUrl}/auth/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      console.log('[WebPush]', MESSAGES.SUCCESS.TOKEN_SYNCED);
    }

    // 4. Listen for incoming foreground messages
    onMessage(messaging, (payload) => {
      console.log('[WebPush] Foreground message received:', payload);
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Time for Ormayundo!', {
          body: payload.notification?.body || 'You have flashcards due for review.',
          icon: '/favicon.svg',
        });
      }
    });

    return token;
  } catch (error) {
    console.warn('[WebPush]', MESSAGES.ERROR.REGISTRATION_FAILED, error);
    return null;
  }
};


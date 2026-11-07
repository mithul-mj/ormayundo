import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request permission and get FCM Token in DOM/Window context
export const requestFirebaseToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      return currentToken;
    }
  } catch (error) {
    console.warn('[FCM] Token retrieval via Web SDK skipped/failed:', error.message);
  }
  return null;
};

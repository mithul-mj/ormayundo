import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './index.css';

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc",
  authDomain: "ormayundo-4f8c5.firebaseapp.com",
  projectId: "ormayundo-4f8c5",
  storageBucket: "ormayundo-4f8c5.firebasestorage.app",
  messagingSenderId: "261551023957",
  appId: "1:261551023957:web:5c28db3528f113244d31dc",
  measurementId: "G-1KZ9ST0Q4S"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // VAPID KEY
  const VAPID_KEY = "BH-3PZlKBc-8yvnygadCUQitn85ECyWa_iFrniI8YP1KHU1tX3X7kbc8fxw5q12NQiRhWUd2GeuX7M1JJdGgpXg";

  // 1. Check if we are already logged in when the popup opens!
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['ormayundo_user'], (result) => {
        if (result.ormayundo_user) {
          setUser(result.ormayundo_user);
          // Try to get and sync FCM token whenever popup opens while logged in
          syncFcmToken();
        }
        setIsLoading(false);
      });
    } else {
      const savedUser = localStorage.getItem('ormayundo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        syncFcmToken();
      }
      setIsLoading(false);
    }
  }, []);

  const syncFcmToken = async () => {
    try {
      console.log("Generating FCM Token...");
      
      // In Chrome Extensions, we must pass the existing background service worker registration!
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error("No service worker registration found for Firebase.");
        return;
      }

      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (fcmToken) {
        await fetch('http://localhost:5000/api/auth/fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token: fcmToken })
        });
        console.log("FCM Token successfully generated and saved to backend!");
      }
    } catch (e) {
      console.error("Failed to generate/sync FCM Token", e);
    }
  };

  // 2. Save the user data locally when they log in successfully
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    syncFcmToken(); // Sync token on fresh login

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ ormayundo_user: userData });
    } else {
      localStorage.setItem('ormayundo_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['ormayundo_user']);
    } else {
      localStorage.removeItem('ormayundo_user');
    }
    // Note: To be 100% secure, we should also call the backend /logout here to clear the HTTP-only cookies.
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-white"><p className="text-gray-400">Loading...</p></div>;
  }

  return (
    <div className="relative w-full h-full flex flex-col box-border bg-white text-gray-800">

      {/* Minimalist Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className="font-bold text-xl tracking-tight text-brand">Ormayundo.</h1>
        {user && (
          <span onClick={handleLogout} className="text-xs font-semibold text-gray-400 hover:text-brand cursor-pointer">
            Logout
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {!user ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard user={user} />
        )}
      </main>

    </div>
  );
}

export default App;

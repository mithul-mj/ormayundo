importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDysR_QcERUV1mH0OSjkIKeOo2nm9edobc",
  authDomain: "ormayundo-4f8c5.firebaseapp.com",
  projectId: "ormayundo-4f8c5",
  storageBucket: "ormayundo-4f8c5.firebasestorage.app",
  messagingSenderId: "261551023957",
  appId: "1:261551023957:web:5c28db3528f113244d31dc",
  measurementId: "G-1KZ9ST0Q4S"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Display push notification when web app is in background or closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const title = payload.notification?.title || payload.data?.title || 'Time for Ormayundo!';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'You have flashcards due for active recall.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: '/app' }
  };

  self.registration.showNotification(title, options);
});

// Focus or open dashboard on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/app');
      }
    })
  );
});


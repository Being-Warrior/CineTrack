// public/sw.js
// This file MUST be in the public/ folder (not src/)
// It runs in the background even when the app is closed

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyC7hz4E8ooO08W0Qw-WPjtd8OFch5Ya-K4",
  authDomain: "cinetrack-f6d60.firebaseapp.com",
  projectId: "cinetrack-f6d60",
  storageBucket: "cinetrack-f6d60.firebasestorage.app",
  messagingSenderId: "326511705519",
  appId: "1:326511705519:web:9db75f7a18134b48da035a",
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const { title, body } = payload.notification || {};
  const { url } = payload.data || {};

  self.registration.showNotification(title || "CineTrack", {
    body: body || "You have a new update",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: { url: url || "/" },
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) clients.openWindow(url);
      }),
  );
});

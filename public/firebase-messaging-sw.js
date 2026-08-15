importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "biljart-club-manager",
  appId: "1:744239322101:web:6ac63c76581cebb03486bc",
  apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ",
  authDomain: "biljart-club-manager.firebaseapp.com",
  storageBucket: "biljart-club-manager.firebasestorage.app",
  messagingSenderId: "744239322101",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Ontvangen in achtergrond: ', payload);
  const notificationTitle = payload.notification?.title || 'Nieuwe Melding';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/vite.svg', // Voeg hier later je app icoon toe (bijv. /icon-192x192.png)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

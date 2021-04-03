importScripts("/__/firebase/8.3.2/firebase-app.js");
importScripts("/__/firebase/8.3.2/firebase-messaging.js");
importScripts("/__/firebase/init.js?useEmulator=true");

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log(`[sw] Background message: ${JSON.stringify(payload)}`);
});
/* global importScripts, firebase */
/*
 * Untangle background push worker.
 * The Firebase web configuration is passed in the worker URL query string by
 * the app (sourced from GET /api/v1/config/public) — nothing is hardcoded and
 * no service-account credentials are ever present here.
 */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (config.apiKey && config.projectId && config.appId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    // Generic copy only — never expose document contents or amounts.
    self.registration.showNotification("Untangle reminder", {
      body: "You have a document deadline reminder.",
      icon: "/favicon.ico",
      tag: "untangle-reminder",
      data: { documentId: data.documentId || null },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const documentId = event.notification.data && event.notification.data.documentId;
  const target = documentId ? `/result?documentId=${encodeURIComponent(documentId)}` : "/reminders";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});

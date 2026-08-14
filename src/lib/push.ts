import { apiRequest, ApiError } from "./api-client";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type PushWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey?: string;
};

export type PushNotificationsConfig = {
  enabled: boolean;
  provider?: string;
  target?: string;
  webConfigured: boolean;
  web?: PushWebConfig | null;
};

export type PublicConfigResponse = {
  success: true;
  data: { pushNotifications?: PushNotificationsConfig | null };
};

export type EntitlementsResponse = {
  success: true;
  data: { entitlements: { pushRemindersEnabled?: boolean } & Record<string, unknown> };
};

export type PushDevice = {
  fid: string;
  platform: string;
  createdAt?: string;
};

export type ListPushDevicesResponse = {
  success: true;
  data: { devices: PushDevice[] };
};

/* ------------------------------------------------------------------ */
/* Backend calls — Railway is the source of truth                      */
/* ------------------------------------------------------------------ */

/** GET /api/v1/config/public */
export async function getPublicConfig(): Promise<PushNotificationsConfig | null> {
  const response = await apiRequest<PublicConfigResponse>("/api/v1/config/public", {
    method: "GET",
  });
  return response.data.pushNotifications ?? null;
}

/** GET /api/v1/entitlements */
export async function getEntitlements(): Promise<{ pushRemindersEnabled: boolean }> {
  const response = await apiRequest<EntitlementsResponse>("/api/v1/entitlements", {
    method: "GET",
  });
  return {
    pushRemindersEnabled: Boolean(response.data.entitlements?.pushRemindersEnabled),
  };
}

/** GET /api/v1/push/devices */
export async function listPushDevices(): Promise<PushDevice[]> {
  const response = await apiRequest<ListPushDevicesResponse>("/api/v1/push/devices", {
    method: "GET",
  });
  return response.data.devices ?? [];
}

/** POST /api/v1/push/devices */
export async function registerPushDevice(fid: string): Promise<void> {
  await apiRequest("/api/v1/push/devices", {
    method: "POST",
    body: JSON.stringify({ fid, platform: "WEB" }),
  });
}

/** DELETE /api/v1/push/devices */
export async function unregisterPushDevice(fid: string): Promise<void> {
  await apiRequest("/api/v1/push/devices", {
    method: "DELETE",
    body: JSON.stringify({ fid }),
  });
}

/* ------------------------------------------------------------------ */
/* Firebase — initialised once, always from backend configuration      */
/* ------------------------------------------------------------------ */

type FirebaseHandles = {
  app: import("firebase/app").FirebaseApp;
  installations: import("firebase/installations").Installations;
};

let firebaseHandles: FirebaseHandles | null = null;
let firebaseInitPromise: Promise<FirebaseHandles> | null = null;

async function initFirebase(web: PushWebConfig): Promise<FirebaseHandles> {
  if (firebaseHandles) return firebaseHandles;
  if (firebaseInitPromise) return firebaseInitPromise;

  firebaseInitPromise = (async () => {
    const [{ initializeApp, getApps, getApp }, { getInstallations }] = await Promise.all([
      import("firebase/app"),
      import("firebase/installations"),
    ]);
    const app = getApps().length ? getApp() : initializeApp(web);
    const handles: FirebaseHandles = { app, installations: getInstallations(app) };
    firebaseHandles = handles;
    return handles;
  })();

  return firebaseInitPromise;
}

export function isPushSupportedInBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    typeof indexedDB !== "undefined"
  );
}

/** Current Firebase Installation ID for this browser. Never logged. */
export async function getInstallationId(web: PushWebConfig): Promise<string> {
  const { installations } = await initFirebase(web);
  const { getId } = await import("firebase/installations");
  return getId(installations);
}

/**
 * Registers the Firebase messaging service worker. The public web config is
 * passed through the worker URL so nothing is hardcoded in the worker file.
 */
export async function registerMessagingServiceWorker(
  web: PushWebConfig,
): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const params = new URLSearchParams({
    apiKey: web.apiKey,
    authDomain: web.authDomain,
    projectId: web.projectId,
    storageBucket: web.storageBucket,
    messagingSenderId: web.messagingSenderId,
    appId: web.appId,
  });
  try {
    return await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`, {
      scope: "/",
    });
  } catch {
    return null;
  }
}

export type ForegroundReminder = {
  title: string;
  body: string;
  documentId?: string | undefined;
};

/**
 * Subscribes to foreground messages. Copy shown to the user stays generic —
 * no document contents are surfaced.
 */
export async function listenToForegroundMessages(
  web: PushWebConfig,
  onReminder: (reminder: ForegroundReminder) => void,
): Promise<() => void> {
  const { app } = await initFirebase(web);
  const { getMessaging, onMessage, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return () => {};
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    const data = (payload.data ?? {}) as Record<string, string>;
    onReminder({
      title: "Untangle reminder",
      body: "You have a document deadline reminder.",
      documentId: data['documentId'],
    });
  });
}

/** Reacts to Firebase rotating the installation ID (register/unregister lifecycle). */
export async function onInstallationIdChange(
  web: PushWebConfig,
  handler: (fid: string) => void,
): Promise<() => void> {
  const { installations } = await initFirebase(web);
  const { onIdChange } = await import("firebase/installations");
  return onIdChange(installations, handler);
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

/** Never surfaces provider stack traces or raw API errors. */
export function friendlyPushError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "FEATURE_REQUIRES_PLUS" || error.status === 403) {
      return "Browser reminders are part of Untangle Plus.";
    }
    if (error.status === 0) {
      return "We could not connect. Check your connection and try again.";
    }
    if (error.status >= 500) {
      return "Reminders are unavailable right now. Please try again shortly.";
    }
  }
  return "We could not turn on browser reminders. Please try again.";
}

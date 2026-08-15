import { useCallback, useEffect, useRef, useState } from "react";
import {
  friendlyPushError,
  getEntitlements,
  getInstallationId,
  getPublicConfig,
  isPushSupportedInBrowser,
  listPushDevices,
  onInstallationIdChange,
  registerMessagingServiceWorker,
  registerPushDevice,
  unregisterPushDevice,
  type PushWebConfig,
} from "@/lib/push";

export const PUSH_FID_STORAGE_KEY = "untangle.pushFid";

export function rememberPushFid(fid: string | null) {
  try {
    if (fid) window.localStorage.setItem(PUSH_FID_STORAGE_KEY, fid);
    else window.localStorage.removeItem(PUSH_FID_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function readPushFid(): string | null {
  try {
    return window.localStorage.getItem(PUSH_FID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export type PushState =
  | "loading"
  | "unsupported"
  | "not-configured"
  | "requires-plus"
  | "blocked"
  | "off"
  | "on";

export function usePushReminders() {
  const [state, setState] = useState<PushState>("loading");
  const [web, setWeb] = useState<PushWebConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fidRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!isPushSupportedInBrowser()) {
        if (active) setState("unsupported");
        return;
      }

      try {
        const config = await getPublicConfig();
        if (!active) return;
        if (!config?.enabled || !config.webConfigured || !config.web) {
          setState("not-configured");
          return;
        }
        setWeb(config.web);

        const entitlements = await getEntitlements();
        if (!active) return;
        if (!entitlements.pushRemindersEnabled) {
          setState("requires-plus");
          return;
        }

        if (Notification.permission === "denied") {
          setState("blocked");
          return;
        }

        const devices = await listPushDevices();
        if (!active) return;

        if (Notification.permission === "granted") {
          const fid = await getInstallationId(config.web);
          if (!active) return;
          fidRef.current = fid;
          const registered = devices.some((device) => device.fid === fid);
          if (registered) rememberPushFid(fid);
          setState(registered ? "on" : "off");
        } else {
          setState("off");
        }
      } catch (cause) {
        if (!active) return;
        setError(friendlyPushError(cause));
        setState("off");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Firebase can rotate the installation ID — keep the backend in sync.
  useEffect(() => {
    if (!web || state !== "on") return;
    let cleanup: (() => void) | undefined;
    let active = true;

    onInstallationIdChange(web, (fid) => {
      if (fid === fidRef.current) return;
      const previous = fidRef.current;
      fidRef.current = fid;
      rememberPushFid(fid);
      void registerPushDevice(fid).catch(() => {});
      if (previous) void unregisterPushDevice(previous).catch(() => {});
    })
      .then((unsubscribe) => {
        if (active) cleanup = unsubscribe;
        else unsubscribe();
      })
      .catch(() => {});

    return () => {
      active = false;
      cleanup?.();
    };
  }, [web, state]);

  const enable = useCallback(async () => {
    if (!web) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setState("blocked");
        return;
      }
      if (permission !== "granted") return;

      await registerMessagingServiceWorker(web);
      const fid = await getInstallationId(web);
      await registerPushDevice(fid);
      fidRef.current = fid;
      rememberPushFid(fid);
      setState("on");
    } catch (cause) {
      setError(friendlyPushError(cause));
    } finally {
      setBusy(false);
    }
  }, [web]);

  const disable = useCallback(async () => {
    if (!web) return;
    setBusy(true);
    setError(null);
    try {
      const fid = fidRef.current ?? (await getInstallationId(web));
      await unregisterPushDevice(fid);
      rememberPushFid(null);
      setState("off");
    } catch (cause) {
      setError(friendlyPushError(cause));
    } finally {
      setBusy(false);
    }
  }, [web]);

  return { state, busy, error, web, enable, disable };
}

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import { getPublicConfig, isPushSupportedInBrowser, listenToForegroundMessages } from "@/lib/push";

/**
 * Shows a generic in-app toast when a reminder push arrives while the app is
 * open. Background pushes are handled by /firebase-messaging-sw.js.
 */
export function PushForegroundListener() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId || !isPushSupportedInBrowser()) return;
    if (Notification.permission !== "granted") return;

    let active = true;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const config = await getPublicConfig();
        if (!active || !config?.enabled || !config.web) return;
        const unsubscribe = await listenToForegroundMessages(config.web, (reminder) => {
          toast(reminder.title, {
            description: reminder.body,
            action: reminder.documentId
              ? {
                  label: "View",
                  onClick: () =>
                    navigate({
                      to: "/result",
                      search: { documentId: reminder.documentId as string },
                    }),
                }
              : undefined,
          });
        });
        if (active) cleanup = unsubscribe;
        else unsubscribe();
      } catch {
        /* foreground notifications are best-effort */
      }
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [userId, navigate]);

  return null;
}

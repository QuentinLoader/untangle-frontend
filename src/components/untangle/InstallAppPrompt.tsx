import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Button } from "@/components/ui/button";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "untangle.install-prompt.dismissed";

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1" || isInstalled()) return;
    } catch {
      if (isInstalled()) return;
    }

    const userAgent = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(userAgent) && !("MSStream" in window);
    if (iosDevice) {
      setIsIos(true);
      setVisible(true);
      return;
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // The prompt can still close when private storage is unavailable.
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Install Untangle"
      className="pointer-events-none fixed inset-x-0 bottom-[76px] z-[70] px-3 min-[720px]:bottom-4"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[390px] items-center gap-2.5 rounded-[14px] border border-line bg-white p-2.5 shadow-lg">
        <BrandMark size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">Keep Untangle handy</p>
          {isIos ? (
            <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">
              Tap <Share2 className="inline h-3 w-3 align-[-1px]" aria-hidden /> then Add to Home
              Screen.
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => void install()}
              className="mt-0.5 h-auto min-h-[28px] justify-start gap-1 rounded-none p-0 text-[12px] font-semibold text-teal hover:bg-transparent hover:text-teal"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Add to phone
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Dismiss install message"
          className="h-11 w-11 shrink-0 rounded-full text-ink-soft"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
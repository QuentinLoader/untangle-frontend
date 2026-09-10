import { Link } from "@tanstack/react-router";
import { Bell, FolderClosed, House, UserRound } from "lucide-react";

/**
 * Four primary destinations. Analysis starts from a chosen product, so there is
 * no generic "Analyse" tab. The documents screen keeps the internal /vault
 * route but is called "Documents" everywhere the customer can see it.
 */
const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/vault", label: "Documents", icon: FolderClosed },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/profile", label: "Account", icon: UserRound },
] as const;

type TabLabel = (typeof TABS)[number]["label"];
/** Legacy labels still passed by some screens. */
type LegacyLabel = "Profile" | "Vault" | "Analyse";

const ALIASES: Record<LegacyLabel, TabLabel> = {
  Profile: "Account",
  Vault: "Documents",
  Analyse: "Home",
};

export function BottomTabBar({ active = "Home" }: { active?: TabLabel | LegacyLabel }) {
  const normalized = (ALIASES as Record<string, TabLabel>)[active] ?? (active as TabLabel);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex h-[64px] w-full max-w-md items-stretch px-2">
        {TABS.map((tab) => {
          const isActive = tab.label === normalized;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors"
              style={{ color: isActive ? "var(--teal)" : "var(--ink-soft)" }}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} aria-hidden />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link } from "@tanstack/react-router";
import { Bell, FolderArchive, Home, ScanLine, UserRound } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Analyze", icon: ScanLine },
  { to: "/vault", label: "Vault", icon: FolderArchive },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/profile", label: "Account", icon: UserRound },
] as const;

type TabLabel = (typeof TABS)[number]["label"] | "Profile";

export function BottomTabBar({ active = "Home" }: { active?: TabLabel }) {
  const normalizedActive = active === "Profile" ? "Account" : active;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex h-[68px] w-full max-w-md items-center px-1">
        {TABS.map((tab) => {
          const isActive = tab.label === normalizedActive;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[12px] py-2 text-[10.5px] font-semibold transition-colors"
              style={{ color: isActive ? "var(--teal)" : "var(--ink-soft)" }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`grid h-7 w-9 place-items-center rounded-full transition-colors ${
                  isActive ? "bg-teal-dim" : ""
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.4 : 2} aria-hidden />
              </span>
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

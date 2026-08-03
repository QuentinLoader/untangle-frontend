import { Link } from "@tanstack/react-router";

const TABS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/reminders", label: "Reminders", icon: "⏰" },
  { to: "/vault", label: "Vault", icon: "🗂️" },
  { to: "/profile", label: "Profile", icon: "⚙️" },
] as const;

export function BottomTabBar({ active = "Home" }: { active?: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[66px] items-center border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const isActive = tab.label === active;
        return (
          <Link
            key={tab.label}
            to={tab.to}
            className="flex flex-1 flex-col items-center gap-1 text-[11px] font-medium"
            style={{ color: isActive ? "var(--teal)" : "var(--ink-soft)" }}
          >
            <span className="text-[15px]" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

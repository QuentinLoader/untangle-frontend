import { createFileRoute } from "@tanstack/react-router";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Untangle" },
      { name: "description", content: "Your Untangle account and notification settings." },
      { property: "og:title", content: "Profile — Untangle" },
      { property: "og:description", content: "Your Untangle account and notification settings." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[100px]">
      <h1 className="font-display text-[21px] font-semibold">Profile</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Coming soon.</p>
      <BottomTabBar active="Profile" />
    </div>
  ),
});

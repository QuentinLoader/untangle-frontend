import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { BlockCard } from "@/components/untangle/BlockCard";
import { SecondaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Untangle" },
      { name: "description", content: "Your Untangle account and notification settings." },
      { property: "og:title", content: "Profile — Untangle" },
      { property: "og:description", content: "Your Untangle account and notification settings." },
    ],
  }),
  component: withAuth(Profile),
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </span>
      <span className="text-[13px] font-medium text-ink">{value}</span>
    </div>
  );
}

function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/landing", replace: true });
  };

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Profile</h1>

        <div className="mt-5 space-y-3">
          <BlockCard title="Account">
            <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
            <Row label="Name" value={profile?.displayName ?? "Not set"} />
            <Row label="Account type" value={profile?.userType ?? "Individual"} />
            <Row label="Plan" value={profile?.plan ?? "Free"} />
          </BlockCard>

          <SecondaryButton onClick={handleSignOut}>Log out</SecondaryButton>
        </div>
      </div>

      <BottomTabBar active="Profile" />
    </div>
  );
}

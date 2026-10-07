import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import { LandingPage } from "./landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Untangle South Africa — Understand what to do next" },
      {
        name: "description",
        content:
          "Untangle South Africa explains important tax, lease, insurance and employment documents in plain English.",
      },
      { property: "og:title", content: "Untangle South Africa — Understand what to do next" },
      {
        property: "og:description",
        content: "Understand the paperwork. Know what to do next.",
      },
    ],
  }),
  component: HomeGate,
});

function LoadingHome() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-teal" />
    </div>
  );
}

/** Public portfolio landing for signed-out visitors; signed-in users enter the app at /home. */
function HomeGate() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/home", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading || session) return <LoadingHome />;
  return <LandingPage />;
}

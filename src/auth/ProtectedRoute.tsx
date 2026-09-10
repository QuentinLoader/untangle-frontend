import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "./useAuth";

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-teal" />
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Loading</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || session || redirected.current) return;
    if (pathname.startsWith("/login")) return;
    redirected.current = true;
    navigate({ to: "/login", search: { redirect: pathname }, replace: true });
  }, [loading, session, navigate, pathname]);

  if (loading || !session) return <AuthLoading />;
  return <>{children}</>;
}

/** Wraps a route component so it only renders for authenticated users. */
export function withAuth<P extends object>(Component: (props: P) => ReactNode) {
  return function Guarded(props: P) {
    return <ProtectedRoute>{Component(props)}</ProtectedRoute>;
  };
}

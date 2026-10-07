import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { AuthShell, Field, FormError, FormNotice } from "@/components/untangle/AuthShell";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth-errors";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Untangle South Africa" },
      { name: "description", content: "Sign in to your Untangle South Africa account." },
      { property: "og:title", content: "Sign in — Untangle South Africa" },
      { property: "og:description", content: "Sign in to your Untangle South Africa account." },
    ],
  }),
  component: LoginPage,
});

function contextFromRedirect(redirect?: string) {
  if (redirect?.includes("taxsnap")) return "Continue to TaxSnap";
  if (redirect?.includes("leasecheck")) return "Continue to LeaseCheck";
  return undefined;
}

function LoginPage() {
  const { signInWithPassword, signInWithMagicLink, session, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: (redirect as never) ?? "/home", replace: true });
    }
  }, [loading, session, navigate, redirect]);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Enter your password (at least 8 characters).";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onMagicLink = async () => {
    setError("");
    setNotice("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: "Enter a valid email address." });
      return;
    }
    setSubmitting(true);
    try {
      await signInWithMagicLink(email.trim());
      setNotice("Check your email. We sent you a secure sign-in link.");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || session) {
    return (
      <AuthShell title="One moment" subtitle="Checking your account…" contextLabel={contextFromRedirect(redirect)}>
        <div className="h-1 w-full overflow-hidden bg-paper-2">
          <div className="h-full w-1/2 animate-pulse bg-teal" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your documents, reminders and results."
      contextLabel={contextFromRedirect(redirect)}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <FormError message={error} /> : null}
        {notice ? <FormNotice message={notice} /> : null}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.co.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
        />

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </PrimaryButton>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] text-ink-soft">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SecondaryButton type="button" onClick={onMagicLink} disabled={submitting}>
          Email me a secure sign-in link
        </SecondaryButton>
      </form>

      <div className="mt-6 space-y-3 text-center text-[13px]">
        <Link to="/forgot-password" className="font-medium text-teal">
          Forgot password?
        </Link>
        <p className="text-ink-soft">
          New here?{" "}
          <Link to="/signup" search={{ redirect }} className="font-semibold text-teal">
            Create a free account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

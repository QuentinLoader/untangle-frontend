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
      { title: "Sign in — Untangle" },
      { name: "description", content: "Sign in to Untangle to see your documents and deadlines." },
      { property: "og:title", content: "Sign in — Untangle" },
      { property: "og:description", content: "Sign in to Untangle to see your documents." },
    ],
  }),
  component: LoginPage,
});

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
      navigate({ to: (redirect as never) ?? "/", replace: true });
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

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see your documents, deadlines and vault.">
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
        />

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onMagicLink} disabled={submitting}>
          Email me a magic link
        </SecondaryButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-[13px]">
        <Link to="/forgot-password" className="font-medium text-teal">
          Forgot password?
        </Link>
        <p className="text-ink-soft">
          New here?{" "}
          <Link to="/signup" className="font-medium text-teal">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

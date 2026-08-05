import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell, Field, FormError, FormNotice } from "@/components/untangle/AuthShell";
import { PrimaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Untangle" },
      { name: "description", content: "Choose a new password for your Untangle account." },
      { property: "og:title", content: "Set a new password — Untangle" },
      { property: "og:description", content: "Choose a new password for your Untangle account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword, session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => {
      void signOut().then(() => navigate({ to: "/login", replace: true }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [done, navigate, signOut]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const next: { password?: string; confirm?: string } = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <AuthShell title="One moment" subtitle="Checking your reset link…">{null}</AuthShell>;
  }

  if (!session) {
    return (
      <AuthShell
        title="This link has expired"
        subtitle="Password reset links can only be used once, and expire after a short time."
      >
        <Link to="/forgot-password" className="text-[13px] font-medium text-teal">
          Request a new reset link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a password of at least 8 characters.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <FormError message={error} /> : null}
        {done ? <FormNotice message="Password updated. Taking you to sign in…" /> : null}

        <Field
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...(errors.password ? { error: errors.password } : {})}
        />
        <Field
          id="confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...(errors.confirm ? { error: errors.confirm } : {})}
        />

        <PrimaryButton type="submit" disabled={submitting || done}>
          {submitting ? "Updating…" : "Update password"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

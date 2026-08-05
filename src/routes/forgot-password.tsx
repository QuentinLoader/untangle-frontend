import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell, Field, FormNotice } from "@/components/untangle/AuthShell";
import { PrimaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Untangle" },
      { name: "description", content: "Request a password reset link for your Untangle account." },
      { property: "og:title", content: "Reset your password — Untangle" },
      { property: "og:description", content: "Request a password reset link for Untangle." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError("");
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
    } catch {
      // Neutral response either way — never reveal whether an account exists.
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {sent ? (
          <FormNotice message="If an account exists for this email address, we sent a password reset link." />
        ) : null}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.co.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...(fieldError ? { error: fieldError } : {})}
        />

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-soft">
        <Link to="/login" className="font-medium text-teal">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

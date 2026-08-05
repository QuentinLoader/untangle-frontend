import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { AuthShell, Field, FormError } from "@/components/untangle/AuthShell";
import { PrimaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";
import { friendlyAuthError } from "@/lib/auth-errors";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create your account — Untangle" },
      {
        name: "description",
        content: "Create a free Untangle account to have official letters explained in plain English.",
      },
      { property: "og:title", content: "Create your account — Untangle" },
      { property: "og:description", content: "Free Untangle account — official letters, explained." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUpWithPassword, session, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && session && !checkEmail) {
      navigate({ to: (redirect as never) ?? "/", replace: true });
    }
  }, [loading, session, navigate, redirect, checkEmail]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next['email'] = "Enter a valid email address.";
    if (password.length < 8) next['password'] = "Use at least 8 characters.";
    if (password !== confirm) next['confirm'] = "Passwords do not match.";
    if (!accepted) next['terms'] = "Please accept the Terms and Privacy Policy.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUpWithPassword(email.trim(), password);
      if (needsEmailConfirmation) setCheckEmail(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`We sent a confirmation link to ${email}. Open it to activate your Untangle account.`}
      >
        <Link to="/login" className="text-[13px] font-medium text-teal">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. Upload a letter and get it in plain English."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <FormError message={error} /> : null}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.co.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...(errors['email'] ? { error: errors['email'] } : {})}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...(errors['password'] ? { error: errors['password'] } : {})}
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...(errors['confirm'] ? { error: errors['confirm'] } : {})}
        />

        <div>
          <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--teal)]"
            />
            <span>I accept the Terms of Use and Privacy Policy.</span>
          </label>
          {errors['terms'] ? (
            <p className="mt-1.5 text-[12px] text-stamp-red">{errors['terms']}</p>
          ) : null}
        </div>

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-teal">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

/** Maps Supabase / network errors to friendly, non-technical messages. */
export function friendlyAuthError(error: unknown): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Something went wrong.";
  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials")) return "The email or password is incorrect.";
  if (message.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (message.includes("already registered") || message.includes("user already"))
    return "An account already exists for this email.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Too many attempts. Please wait and try again.";
  if (message.includes("failed to fetch") || message.includes("network"))
    return "We could not connect. Check your connection and try again.";
  if (message.includes("password should be") || message.includes("password must"))
    return "Please choose a password with at least 8 characters.";
  if (message.includes("not configured"))
    return "Sign-in isn't configured yet. Please try again shortly.";

  return "Something went wrong. Please try again.";
}

import type { User } from "@supabase/supabase-js";
import type { UntangleUser } from "@/auth/auth.types";

/**
 * Resolves the best available display name for the signed-in user:
 * the backend profile name first, then the Supabase user metadata
 * captured at signup. Never parses the email address.
 */
export function resolveDisplayName(
  profile: UntangleUser | null | undefined,
  user: User | null | undefined,
): string | null {
  const fromProfile = profile?.displayName?.trim();
  if (fromProfile) return fromProfile;
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const fromMetadata = metadata?.["full_name"];
  if (typeof fromMetadata === "string" && fromMetadata.trim()) return fromMetadata.trim();
  return null;
}

export function firstName(value: string | null | undefined): string | null {
  const name = value?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}

import type { Session, User } from "@supabase/supabase-js";

export type UntangleUserRole = "USER" | "ADMIN";

export type UntangleUserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETION_PENDING"
  | "DELETED";

export type UntangleUser = {
  id: string;
  authUserId: string;
  email: string | null;
  displayName: string | null;
  businessName: string | null;
  userType: "INDIVIDUAL" | "SOLE_PROPRIETOR" | "REGISTERED_BUSINESS";
  status: UntangleUserStatus;
  role: UntangleUserRole;
  isAnonymous: boolean;
  preferredLanguage: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthMeResponse = {
  success: boolean;
  data: { user: UntangleUser };
};

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UntangleUser | null;
  loading: boolean;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  updateDisplayName: (displayName: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

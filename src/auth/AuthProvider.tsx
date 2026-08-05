import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchAuthMe } from "@/lib/api-client";
import type { AuthContextValue, UntangleUser } from "./auth.types";

export const AuthContext = createContext<AuthContextValue | null>(null);

function requireConfig() {
  if (!isSupabaseConfigured) throw new Error("Authentication is not configured.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UntangleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const loadedProfileFor = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession) {
        setProfile(null);
        loadedProfileFor.current = null;
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Load the Untangle application profile from the backend once per session user.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || loadedProfileFor.current === userId) return;
    loadedProfileFor.current = userId;
    let active = true;
    fetchAuthMe()
      .then((untangleUser) => {
        if (active) setProfile(untangleUser);
      })
      .catch(() => {
        // Backend profile is optional for rendering; auth state stays valid.
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    requireConfig();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
    return { needsEmailConfirmation: data.session === null };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    requireConfig();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    requireConfig();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    requireConfig();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    requireConfig();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "public" });
    try {
      window.sessionStorage.removeItem("untangle.pendingUpload");
    } catch {
      /* storage unavailable */
    }
    await supabase.auth.signOut();
    setProfile(null);
    loadedProfileFor.current = null;
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      signUpWithPassword,
      signInWithPassword,
      signInWithMagicLink,
      sendPasswordReset,
      updatePassword,
      signOut,
    }),
    [
      user,
      session,
      profile,
      loading,
      signUpWithPassword,
      signInWithPassword,
      signInWithMagicLink,
      sendPasswordReset,
      updatePassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

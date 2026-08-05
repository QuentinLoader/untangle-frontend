import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = import.meta.env as Record<string, string | undefined>;

/**
 * Reads whichever public Supabase config is present. Lovable's native Supabase
 * integration injects VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
 * automatically; VITE_SUPABASE_ANON_KEY is supported as a fallback name.
 * Nothing here is secret — never reference a service-role key in the browser.
 */
const supabaseUrl = env['VITE_SUPABASE_URL'] || undefined;
const supabaseAnonKey =
  env['VITE_SUPABASE_PUBLISHABLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'] || undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);


/**
 * Single shared Supabase client for the whole app.
 * Never instantiate another one — session persistence and token refresh
 * depend on there being exactly one instance.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key-not-configured",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);

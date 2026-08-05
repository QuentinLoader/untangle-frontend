import { supabase } from "@/integrations/supabase/client";

const env = import.meta.env as Record<string, string | undefined>;

const supabaseUrl =
  env['VITE_SUPABASE_URL'] ||
  (typeof process !== "undefined" ? process.env['SUPABASE_URL'] : undefined);

const supabaseKey =
  env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
  env['VITE_SUPABASE_ANON_KEY'] ||
  (typeof process !== "undefined" ? process.env['SUPABASE_PUBLISHABLE_KEY'] : undefined);

export { supabase };
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a client-side Supabase client using @supabase/ssr.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. Please configure .env.local."
    );
  }

  return createBrowserClient(supabaseUrl || "", supabaseAnonKey || "");
}

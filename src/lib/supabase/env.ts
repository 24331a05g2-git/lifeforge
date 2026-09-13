/**
 * Safely resolves Supabase URL and anonymous / publishable key from environment variables.
 * Handles alternative naming conventions, trims extraneous whitespace or quotes,
 * and ensures reliable access across Client, Server Components, Server Actions, and Middleware.
 */
export function getSupabaseEnv() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    "";

  // Clean trailing spaces, newlines, or accidental quotes from dashboard copy-paste
  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, "");
  const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, "");

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  };
}

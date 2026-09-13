import type { NextConfig } from "next";

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

const cleanUrl = rawUrl.trim().replace(/^["']|["']$/g, "");
const cleanKey = rawKey.trim().replace(/^["']|["']$/g, "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: cleanUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: cleanKey,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: cleanKey,
  },
};

export default nextConfig;

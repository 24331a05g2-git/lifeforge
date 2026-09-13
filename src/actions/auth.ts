"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Translates raw Supabase authentication errors into friendly, immersive LIFEFORGE messages.
 */
function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return "An unknown enchantment disrupted your journey. Please try again.";

  const message = typeof error === "object" && error !== null && "message" in error
    ? String((error as { message: unknown }).message)
    : String(error);

  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Incorrect secret password or email. Check your credentials and try again.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An adventurer with this email is already registered. Please sign in to continue your journey.";
  }
  if (lower.includes("password should be at least") || lower.includes("weak password")) {
    return "Your secret password must contain at least 6 characters to shield your character.";
  }
  if (lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return "Please enter a valid realm email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts to contact the realm. Please rest at the campfire and try again shortly.";
  }
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("failed to fetch")) {
    return "The realm gateway could not be reached. Check your network connection.";
  }
  if (lower.includes("missing supabase") || lower.includes("url is required") || lower.includes("anon key")) {
    return "The realm gateway is not yet configured. Please configure your Supabase credentials in .env.local.";
  }

  return `Your journey could not begin yet. ${message}`;
}

/**
 * Signs up a new Adventurer using Supabase Auth.
 */
export async function signUpAction(formData: {
  email: string;
  password: string;
  characterName?: string;
  archetype?: string;
}): Promise<AuthActionResult> {
  const { email, password, characterName, archetype } = formData;

  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid realm email address.",
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Your secret password must contain at least 6 characters.",
    };
  }

  if (!getSupabaseEnv().isConfigured) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        character_name: characterName?.trim() || "Adventurer",
        archetype: archetype || "scholar",
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: getFriendlyAuthErrorMessage(error),
    };
  }

  // If user is created but session is null, Supabase has email confirmation enabled
  if (data.user && !data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message: "A summoning scroll has been sent to your email. Please verify your email to enter the realm.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/character-discovery");
}

/**
 * Logs in an existing Adventurer using Supabase Auth.
 */
export async function loginAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const { email, password } = formData;

  if (!email || !password) {
    return {
      success: false,
      error: "Please enter both your realm email and secret password.",
    };
  }

  if (!getSupabaseEnv().isConfigured) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      success: false,
      error: getFriendlyAuthErrorMessage(error),
    };
  }

  revalidatePath("/", "layout");
  redirect("/character-discovery");
}

/**
 * Signs out the current Adventurer and clears the session.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { AttributeScore, ProfileRecord } from "@/lib/assessment/types";

export interface SaveProfileResult {
  success: boolean;
  error?: string;
  profile?: ProfileRecord;
}

/**
 * Saves or finalizes the Character Discovery profile in Supabase PostgreSQL.
 * Server-authoritative: user_id is strictly derived from the authenticated session.
 */
export async function saveCharacterProfileAction(payload: {
  characterName: string;
  archetype: string;
  attributes: AttributeScore;
  selectedGoals: string[];
}): Promise<SaveProfileResult> {
  const { characterName, archetype, attributes, selectedGoals } = payload;

  if (!characterName || characterName.trim().length < 2) {
    return {
      success: false,
      error: "Character name must be at least 2 characters long.",
    };
  }

  // Check if Supabase credentials exist
  if (!getSupabaseEnv().isConfigured) {
    return {
      success: false,
      error: "Supabase credentials are not configured in .env.local. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();

  // Retrieve authenticated user from server session (never trust client)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Your session has expired. Please sign in to save your character.",
    };
  }

  // Validate attribute ranges (1-100)
  const stats = ["strength", "intellect", "focus", "discipline", "energy"] as const;
  for (const s of stats) {
    const val = attributes[s];
    if (typeof val !== "number" || val < 1 || val > 100) {
      return {
        success: false,
        error: `Invalid score for ${s}. Attributes must be between 1 and 100.`,
      };
    }
  }

  // Check if character already exists for this user
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile && existingProfile.assessment_completed) {
    // Character already exists - do not overwrite silently
    return {
      success: true,
      profile: existingProfile as ProfileRecord,
    };
  }

  // Prepare profile record
  const profileData = {
    user_id: user.id,
    character_name: characterName.trim(),
    archetype: archetype.trim(),
    level: 1,
    xp: 0,
    gold: 0,
    strength: attributes.strength,
    intellect: attributes.intellect,
    focus: attributes.focus,
    discipline: attributes.discipline,
    energy: attributes.energy,
    selected_goals: selectedGoals || [],
    assessment_completed: true,
  };

  // Insert or update profile
  const { data: savedProfile, error: saveError } = await supabase
    .from("profiles")
    .upsert(profileData, { onConflict: "user_id" })
    .select()
    .single();

  if (saveError) {
    console.error("Supabase profile save error:", saveError.message);
    return {
      success: false,
      error: `The forge could not record your character: ${saveError.message}`,
    };
  }

  revalidatePath("/character-discovery");
  revalidatePath("/dashboard");

  return {
    success: true,
    profile: savedProfile as ProfileRecord,
  };
}

/**
 * Retrieves the current user's character profile from Supabase.
 */
export async function getCharacterProfileAction(): Promise<{
  profile: ProfileRecord | null;
  error?: string;
}> {
  if (!getSupabaseEnv().isConfigured) {
    return { profile: null };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching character profile:", error.message);
    return { profile: null, error: error.message };
  }

  return { profile: data as ProfileRecord | null };
}

export type AttributeType = "strength" | "intellect" | "focus" | "discipline" | "energy";

export interface AttributeScore {
  strength: number;
  intellect: number;
  focus: number;
  discipline: number;
  energy: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  flavor?: string;
  statModifiers: Partial<Record<AttributeType, number>>;
  archetypeWeight?: Record<string, number>;
}

export interface Question {
  id: string;
  number: number;
  category: string;
  categoryIcon: string;
  prompt: string;
  subtitle?: string;
  isMultiSelect?: boolean;
  maxSelections?: number;
  options: QuestionOption[];
}

export interface ArchetypeInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  primaryAttributes: [AttributeType, AttributeType];
  quote: string;
  color: string;
  borderAccent: string;
}

export interface AssessmentResult {
  characterName: string;
  archetype: ArchetypeInfo;
  attributes: AttributeScore;
  strengths: { type: AttributeType; value: number; label: string; icon: string }[];
  growthAreas: { type: AttributeType; value: number; label: string; icon: string }[];
  selectedGoals: string[];
}

export interface ProfileRecord {
  id: string;
  user_id: string;
  character_name: string;
  archetype: string;
  level: number;
  xp: number;
  gold: number;
  strength: number;
  intellect: number;
  focus: number;
  discipline: number;
  energy: number;
  selected_goals?: string[];
  bedtime?: string;
  assessment_completed: boolean;
  created_at: string;
  updated_at: string;
}

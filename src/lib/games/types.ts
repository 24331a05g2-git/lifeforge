import { MiniGameType, Quest } from "@/lib/quests/types";
import { AuthoritativeRewardResult } from "@/lib/rpg/types";

export type GameSessionStatus = "active" | "completed" | "abandoned";

export interface GameSession {
  id: string;
  user_id: string;
  quest_id: string;
  game_type: MiniGameType;
  started_at: string;
  ended_at?: string | null;
  duration_seconds: number;
  status: GameSessionStatus;
  user_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSessionResult {
  session: GameSession;
  quest: Quest;
  reward?: AuthoritativeRewardResult;
}

export interface GameCompletionData {
  userNotes: string;
  confirmedRealWorld: boolean;
}

export type TimerStatus = "idle" | "running" | "paused" | "finished";

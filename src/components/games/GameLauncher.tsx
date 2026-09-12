"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Quest } from "@/lib/quests/types";
import { GameSession } from "@/lib/games/types";
import { AuthoritativeRewardResult } from "@/lib/rpg/types";
import { abandonGameSessionAction, completeGameSessionAction } from "@/actions/games";
import { GameShell } from "./GameShell";
import { KnowledgeDungeon } from "./KnowledgeDungeon";
import { TrainingArena } from "./TrainingArena";
import { FocusMission } from "./FocusMission";
import { HabitGarden } from "./HabitGarden";
import { GameCompletionScreen } from "./GameCompletionScreen";

interface GameLauncherProps {
  quest: Quest;
  initialSession: GameSession;
}

export function GameLauncher({ quest, initialSession }: GameLauncherProps) {
  const router = useRouter();
  const [session, setSession] = useState<GameSession>(initialSession);
  const [distractionFree, setDistractionFree] = useState(false);
  const [isCompleted, setIsCompleted] = useState(session.status === "completed");
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState(session.duration_seconds || 0);
  const [rewardResult, setRewardResult] = useState<AuthoritativeRewardResult | undefined>();

  // Abandon Handler: calls server action, navigates back to quest board
  const handleAbandon = async () => {
    await abandonGameSessionAction(session.id);
    router.push("/quests");
  };

  // Completion Handler: calls server action, updates state, shows completion screen
  const handleComplete = async (userNotes: string, confirmed: boolean) => {
    // Detect local timezone safely
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const res = await completeGameSessionAction(session.id, userNotes, confirmed, localTimezone);
    if (res.success && res.data) {
      setSession(res.data.session);
      setFinalElapsedSeconds(res.data.session.duration_seconds);
      if (res.data.reward) {
        setRewardResult(res.data.reward);
      }
      setIsCompleted(true);
    } else {
      throw new Error(res.error || "Could not record session completion.");
    }
  };

  if (isCompleted) {
    return (
      <GameShell quest={quest} session={session} onAbandon={handleAbandon}>
        <GameCompletionScreen
          quest={quest}
          session={session}
          elapsedSeconds={finalElapsedSeconds}
          rewardResult={rewardResult}
        />
      </GameShell>
    );
  }

  // Render the specific game engine inside the common GameShell
  return (
    <GameShell
      quest={quest}
      session={session}
      onAbandon={handleAbandon}
      distractionFree={distractionFree}
      onToggleDistractionFree={() => setDistractionFree(!distractionFree)}
    >
      {quest.game_type === "knowledge_dungeon" && (
        <KnowledgeDungeon
          quest={quest}
          session={session}
          onComplete={handleComplete}
        />
      )}

      {quest.game_type === "training_arena" && (
        <TrainingArena
          quest={quest}
          session={session}
          onComplete={handleComplete}
        />
      )}

      {quest.game_type === "focus_mission" && (
        <FocusMission
          quest={quest}
          session={session}
          onComplete={handleComplete}
          distractionFree={distractionFree}
          onToggleDistractionFree={() => setDistractionFree(!distractionFree)}
        />
      )}

      {quest.game_type === "habit_garden" && (
        <HabitGarden
          quest={quest}
          session={session}
          onComplete={handleComplete}
        />
      )}
    </GameShell>
  );
}

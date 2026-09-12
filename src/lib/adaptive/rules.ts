import { AdaptiveRecommendation, AdaptiveSignals } from "./types";

/**
 * Deterministic and explainable evaluation of player workload readiness.
 * Strict non-shaming, constructive RPG guidance.
 * No black-box machine learning or external LLMs.
 */
export function evaluateAdaptiveRecommendation(
  signals: AdaptiveSignals
): AdaptiveRecommendation {
  const generatedAt = new Date().toISOString();

  // 1. Insufficient Data Rule (< 3 quests in rolling window)
  if (!signals.hasSufficientData) {
    return {
      direction: "balanced",
      confidence: "low",
      title: "ARIA is Learning Your Rhythm",
      message:
        "Complete a few more trials and LIFEFORGE will begin recognizing your momentum and pacing.",
      reasons: [
        `Recorded ${signals.totalQuests} trial${
          signals.totalQuests === 1 ? "" : "s"
        } in the past 7 days (minimum 3 needed)`,
      ],
      suggestedAction:
        "Maintain a steady, manageable pace as you establish your daily routine.",
      signals,
      generatedAt,
    };
  }

  // 2. Lighter Rule (Struggling, backlog piling up, or heavy overload)
  const isLowCompletion = signals.completionRate < 0.60;
  const isBacklogged = signals.unfinishedQuests >= 4;
  const isOverloaded = signals.avgQuestsPerDay > 6.0;

  if (isLowCompletion || isBacklogged || isOverloaded) {
    const reasons: string[] = [];
    if (isLowCompletion) {
      reasons.push(
        `Recent completion rate is ${Math.round(signals.completionRate * 100)}% (below 60% threshold)`
      );
    }
    if (isBacklogged) {
      reasons.push(
        `${signals.unfinishedQuests} unfinished trials accumulated over the past week`
      );
    }
    if (isOverloaded) {
      reasons.push(
        `Demanding workload averaging ${signals.avgQuestsPerDay} quests per day`
      );
    }
    if (signals.currentStreak > 0) {
      reasons.push(
        `Active ${signals.currentStreak}-day streak momentum to protect`
      );
    }

    return {
      direction: "lighter",
      confidence: "high",
      title: "A Breath for Recovery",
      message:
        "Your recent trials have been demanding. Veteran heroes know when to pace themselves—a lighter day will help you protect your streak and rebuild momentum.",
      reasons,
      suggestedAction:
        "Focus on 1–2 high-priority quests tomorrow, or choose 'Easy' intensity at camp.",
      signals,
      generatedAt,
    };
  }

  // 3. Harder Rule (High completion rate, active streak, manageable volume)
  const isHighCompletion = signals.completionRate >= 0.85;
  const hasConsistentTrials = signals.completedQuests >= 4;
  const hasStrongStreak = signals.currentStreak >= 2;

  if (isHighCompletion && hasConsistentTrials && hasStrongStreak) {
    return {
      direction: "harder",
      confidence: "high",
      title: "Ready for Greater Glory",
      message:
        "Your discipline is steadfast and your completion rate is exceptional. The realm invites you to test your mettle with greater trials.",
      reasons: [
        `${Math.round(signals.completionRate * 100)}% quest completion rate across ${
          signals.totalQuests
        } trials`,
        `Strong ${signals.currentStreak}-day active momentum flame`,
        `Manageable daily cadence of ${signals.avgQuestsPerDay} quests/day`,
      ],
      suggestedAction:
        "Consider adding one 'Hard' or 'Epic' trial tomorrow, or choosing 'Challenge' intensity.",
      signals,
      generatedAt,
    };
  }

  // 4. Balanced Rule (Sustainable equilibrium)
  return {
    direction: "balanced",
    confidence: "medium",
    title: "In Sustainable Cadence",
    message:
      "Your quest pace is well-measured and sustainable. Continue this rhythm as you forge your attributes.",
    reasons: [
      `Balanced ${Math.round(signals.completionRate * 100)}% completion rate`,
      `Sustainable average of ${signals.avgQuestsPerDay} quests per day`,
      signals.currentStreak > 0
        ? `Momentum flame active at ${signals.currentStreak} days`
        : "Steady daily progression pattern",
    ],
    suggestedAction:
      "Keep your current quest balance for tomorrow's adventure.",
    signals,
    generatedAt,
  };
}

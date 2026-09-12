import { GameMasterContextData, GameMasterMessage, GameMasterProvider } from "./types";
import { detectGameMasterContext } from "./detector";
import { buildMessageForContext } from "./messages";

/**
 * Deterministic, rule-based implementation of GameMasterProvider.
 * Adheres to strict non-shaming, constructive RPG guidance.
 * Ready to be swapped with an AI/LLM provider in a future phase.
 */
export class RuleBasedGameMasterProvider implements GameMasterProvider {
  async generateMessage(contextData: GameMasterContextData): Promise<GameMasterMessage> {
    const detectedContext = detectGameMasterContext(contextData);
    const message = buildMessageForContext(detectedContext, contextData);
    return message;
  }
}

// Default singleton instance
export const gameMasterProvider: GameMasterProvider = new RuleBasedGameMasterProvider();

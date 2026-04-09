/**
 * Marionette Core
 * Centralized logic for AI, parsing, and cinematic data processing.
 */

export const AI_CONFIG = {
  defaultModel: "claude-3-5-sonnet-20241022",
  temperature: 0.7,
};

export function parseScript(content: string) {
  // Common script parsing logic placeholder
  return {
    content,
    timestamp: new Date().toISOString(),
  };
}

export const CINEMATIC_CONSTANTS = {
  GOLD_ACCENT: "#c9a84c",
  DARK_BG: "#080808",
};

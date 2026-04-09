/**
 * Marionette Core
 * Centralized logic for AI, parsing, and cinematic data processing.
 */
declare const AI_CONFIG: {
    defaultModel: string;
    temperature: number;
};
declare function parseScript(content: string): {
    content: string;
    timestamp: string;
};
declare const CINEMATIC_CONSTANTS: {
    GOLD_ACCENT: string;
    DARK_BG: string;
};

export { AI_CONFIG, CINEMATIC_CONSTANTS, parseScript };

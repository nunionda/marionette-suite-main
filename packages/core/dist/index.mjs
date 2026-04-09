// src/index.ts
var AI_CONFIG = {
  defaultModel: "claude-3-5-sonnet-20241022",
  temperature: 0.7
};
function parseScript(content) {
  return {
    content,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var CINEMATIC_CONSTANTS = {
  GOLD_ACCENT: "#c9a84c",
  DARK_BG: "#080808"
};
export {
  AI_CONFIG,
  CINEMATIC_CONSTANTS,
  parseScript
};

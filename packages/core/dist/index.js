"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AI_CONFIG: () => AI_CONFIG,
  CINEMATIC_CONSTANTS: () => CINEMATIC_CONSTANTS,
  parseScript: () => parseScript
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_CONFIG,
  CINEMATIC_CONSTANTS,
  parseScript
});

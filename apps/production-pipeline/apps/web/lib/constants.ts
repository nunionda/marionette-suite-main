// ─── Pipeline Constants ───────────────────────────────────────────────────────
// Single source of truth for agent names, phases, status colors.
// Import from here instead of defining locally in each page/component.

export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  script_writer: "Script Writer",
  scripter: "Scripter",
  concept_artist: "Concept Artist",
  casting_director: "Casting Director",
  location_scout: "Location Scout",
  previsualizer: "Previsualizer",
  cinematographer: "Cinematographer",
  generalist: "Generalist",
  asset_designer: "Asset Designer",
  vfx_compositor: "VFX Compositor",
  sound_designer: "Sound Designer",
  composer: "Composer",
  master_editor: "Master Editor",
  colorist: "Colorist",
  mixing_engineer: "Mixing Engineer",
}

// Phase → agent membership
export const PHASE_AGENTS = {
  "pre-production": ["concept_artist", "casting_director", "location_scout", "previsualizer"],
  production: ["cinematographer", "generalist", "asset_designer"],
  "post-production": ["vfx_compositor", "sound_designer", "composer", "master_editor", "colorist", "mixing_engineer"],
} as const

export const FULL_PIPELINE = [
  "script_writer", "scripter",
  "concept_artist", "casting_director", "location_scout", "previsualizer",
  "cinematographer", "generalist", "asset_designer",
  "vfx_compositor", "sound_designer", "composer",
  "master_editor", "colorist", "mixing_engineer",
] as const

// Used for the grouped progress display during a run
export const PHASE_GROUPS = [
  { label: "Pre-Production", agents: ["script_writer", "scripter", "concept_artist", "casting_director", "location_scout", "previsualizer"] },
  { label: "Production", agents: ["cinematographer", "generalist", "asset_designer"] },
  { label: "Post-Production", agents: ["vfx_compositor", "sound_designer", "composer", "master_editor", "colorist", "mixing_engineer"] },
] as const

// Pipeline-run / batch status → Tailwind classes (Marionette Design System 2026-03-30)
export const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-[#484848]/20 text-[#F0F0F0] border-[#484848]/40",
  completed: "bg-[#484848]/20 text-[#F0F0F0] border-[#484848]/40",
  RUNNING: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30",
  running: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30",
  QUEUED: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  queued: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  FAILED: "bg-[#1A0808] text-[#C0392B] border-[#C0392B]/40",
  failed: "bg-[#1A0808] text-[#C0392B] border-[#C0392B]/40",
  ERROR: "bg-[#1A0808] text-[#C0392B] border-[#C0392B]/40",
  error: "bg-[#1A0808] text-[#C0392B] border-[#C0392B]/40",
  CANCELLED: "bg-[#505050]/20 text-[#707070] border-[#505050]/40",
  cancelled: "bg-[#505050]/20 text-[#707070] border-[#505050]/40",
  REGENERATING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  regenerating: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  DRAFT: "bg-[#1E1E1E] text-[#707070] border-[#1E1E1E]",
  draft: "bg-[#1E1E1E] text-[#707070] border-[#1E1E1E]",
}

// Human-readable status labels (English)
export const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  completed: "Completed",
  RUNNING: "Running",
  running: "Running",
  QUEUED: "Queued",
  queued: "Queued",
  FAILED: "Failed",
  failed: "Failed",
  ERROR: "Error",
  error: "Error",
  CANCELLED: "Cancelled",
  cancelled: "Cancelled",
  REGENERATING: "Regenerating",
  regenerating: "Regenerating",
  DRAFT: "Draft",
  draft: "Draft",
}

// Status → emoji icon
export const STATUS_ICONS: Record<string, string> = {
  COMPLETED: "✅",
  completed: "✅",
  RUNNING: "⏳",
  running: "⏳",
  QUEUED: "⌛",
  queued: "⌛",
  FAILED: "❌",
  failed: "❌",
  CANCELLED: "⏹",
  cancelled: "⏹",
  REGENERATING: "🔁",
  regenerating: "🔁",
}

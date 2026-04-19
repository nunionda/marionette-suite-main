import type { ProviderHealth, ProviderMeta } from "@marionette/ai-providers";

/**
 * Serializable shape passed from server components (after `getHealthMatrix()`)
 * to the client component. Mirrors the registry's internal matrix format but
 * pre-resolved so the client never touches the registry directly.
 */
export interface ProviderSwitcherEntry {
  meta: ProviderMeta;
  health: ProviderHealth;
}

export interface ProviderSwitcherProps {
  /** Entries sorted by tier (top → free → local) for display. */
  entries: ProviderSwitcherEntry[];
  /** Currently selected provider id — typically `process.env.DEFAULT_TEXT_PROVIDER`. */
  selected?: string;
  /** Capability label for the heading ("TEXT" / "IMAGE" / ...). */
  capability: "text" | "image" | "video" | "audio" | "voice-clone";
  /** Called when user selects a provider. Receives the new id. */
  onSelect?: (providerId: string) => void | Promise<void>;
  /** Optional refresh callback — re-probe health matrix. */
  onRefresh?: () => void | Promise<void>;
}

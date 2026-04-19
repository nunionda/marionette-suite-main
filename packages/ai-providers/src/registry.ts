/**
 * Provider registry — Layer 1 dispatch.
 *
 * Upper layers call `resolve<Capability>Provider()` and receive a healthy
 * instance, never knowing which vendor answered. Fallback order:
 *
 *   1. `prefer` argument (UI switcher override)
 *   2. `DEFAULT_<CAPABILITY>_PROVIDER` env var
 *   3. Tier order: `top` → `free` → `local`, first healthy wins
 *
 * Provider probes are cached for PROBE_TTL_MS to avoid spamming vendor health
 * endpoints on every generate call. Cache is keyed by (capability, providerId)
 * so the same id string used for text vs image never collides.
 */
import {
  anthropicProvider,
  geminiProvider,
  groqProvider,
  lmStudioProvider,
  ollamaProvider,
} from "./text";
import type { TextProvider } from "./text/provider";
import {
  a1111Provider,
  comfyProvider,
  fluxHfProvider,
  nanoBananaProvider,
} from "./image";
import type { ImageProvider } from "./image/provider";
import {
  NoHealthyProviderError,
  type Capability,
  type ProviderHealth,
  type ProviderMeta,
} from "./types";

const PROBE_TTL_MS = 30_000;
const TIER_ORDER: Record<ProviderMeta["tier"], number> = { top: 0, free: 1, local: 2 };

interface CacheEntry {
  health: ProviderHealth;
  at: number;
}

// Union of all provider shapes the registry handles. `meta.capability` +
// `probe()` is the stable contract; capability-specific `generate()` shapes
// live in their own interfaces and are unioned for resolvers.
interface AnyProvider {
  meta: ProviderMeta;
  probe(): Promise<ProviderHealth>;
}

const _textProviders = new Map<string, TextProvider>();
const _imageProviders = new Map<string, ImageProvider>();
const _healthCache = new Map<string, CacheEntry>();

function cacheKey(capability: Capability, id: string): string {
  return `${capability}::${id}`;
}

// ─── TEXT ──────────────────────────────────────────────────────────────────

export function registerTextProvider(provider: TextProvider): void {
  _textProviders.set(provider.meta.id, provider);
}
export function listTextProviders(): TextProvider[] {
  return [..._textProviders.values()];
}
export function getTextProvider(id: string): TextProvider | undefined {
  return _textProviders.get(id);
}

// ─── IMAGE ─────────────────────────────────────────────────────────────────

export function registerImageProvider(provider: ImageProvider): void {
  _imageProviders.set(provider.meta.id, provider);
}
export function listImageProviders(): ImageProvider[] {
  return [..._imageProviders.values()];
}
export function getImageProvider(id: string): ImageProvider | undefined {
  return _imageProviders.get(id);
}

// ─── Shared health + resolve ───────────────────────────────────────────────

function getProvider(capability: Capability, id: string): AnyProvider | undefined {
  if (capability === "text") return _textProviders.get(id);
  if (capability === "image") return _imageProviders.get(id);
  return undefined;
}

function listProviders(capability: Capability): AnyProvider[] {
  if (capability === "text") return [..._textProviders.values()];
  if (capability === "image") return [..._imageProviders.values()];
  return [];
}

/**
 * Fetch cached health or probe fresh if stale. Callers should prefer the
 * capability-specific wrapper (`getTextHealth` / `getImageHealth`) when they
 * have it — the generic version is here for the health matrix and the
 * resolver.
 */
export async function getHealth(
  providerId: string,
  capability: Capability = "text",
): Promise<ProviderHealth> {
  const key = cacheKey(capability, providerId);
  const now = Date.now();
  const cached = _healthCache.get(key);
  if (cached && now - cached.at < PROBE_TTL_MS) return cached.health;

  const provider = getProvider(capability, providerId);
  if (!provider) return { state: "unknown" };

  const health = await provider.probe();
  _healthCache.set(key, { health, at: now });
  return health;
}

/** Clear the health cache. Without args clears all capabilities. */
export function invalidateHealth(providerId?: string, capability?: Capability): void {
  if (!providerId) {
    _healthCache.clear();
    return;
  }
  if (capability) {
    _healthCache.delete(cacheKey(capability, providerId));
    return;
  }
  // No capability given — best-effort purge from every known namespace
  for (const cap of ["text", "image", "video", "audio", "voice-clone"] as const) {
    _healthCache.delete(cacheKey(cap, providerId));
  }
}

function isUsable(h: ProviderHealth): boolean {
  return h.state === "ready";
}

async function resolveGeneric<P extends AnyProvider>(
  capability: Capability,
  envDefaultKey: string,
  all: P[],
  prefer?: string,
): Promise<P> {
  const attempted: string[] = [];
  const candidates: string[] = [];

  if (prefer) candidates.push(prefer);
  const envDefault = process.env[envDefaultKey];
  if (envDefault && envDefault !== prefer) candidates.push(envDefault);

  const byTier = all
    .filter((p) => !candidates.includes(p.meta.id))
    .sort((a, b) => TIER_ORDER[a.meta.tier] - TIER_ORDER[b.meta.tier])
    .map((p) => p.meta.id);
  candidates.push(...byTier);

  for (const id of candidates) {
    attempted.push(id);
    const provider = all.find((p) => p.meta.id === id);
    if (!provider) continue;
    const health = await getHealth(id, capability);
    if (isUsable(health)) return provider;
  }

  throw new NoHealthyProviderError(capability, attempted);
}

export async function resolveTextProvider(prefer?: string): Promise<TextProvider> {
  return resolveGeneric<TextProvider>(
    "text",
    "DEFAULT_TEXT_PROVIDER",
    [..._textProviders.values()],
    prefer,
  );
}

export async function resolveImageProvider(prefer?: string): Promise<ImageProvider> {
  return resolveGeneric<ImageProvider>(
    "image",
    "DEFAULT_IMAGE_PROVIDER",
    [..._imageProviders.values()],
    prefer,
  );
}

/**
 * Health matrix for the UI `/ai-ops` dashboard — parallel probes.
 * Default capability is `text` for backwards-compat with Sprint 11a callers.
 */
export async function getHealthMatrix(
  capability: Capability = "text",
): Promise<Array<{ meta: ProviderMeta; health: ProviderHealth }>> {
  const entries = listProviders(capability);
  const healths = await Promise.all(entries.map((p) => getHealth(p.meta.id, capability)));
  return entries.map((p, i) => ({ meta: p.meta, health: healths[i]! }));
}

// ─── Auto-registration of built-in providers ────────────────────────────────

// TEXT
registerTextProvider(anthropicProvider);
registerTextProvider(geminiProvider);
registerTextProvider(groqProvider);
registerTextProvider(ollamaProvider);
registerTextProvider(lmStudioProvider);

// IMAGE
registerImageProvider(nanoBananaProvider);
registerImageProvider(fluxHfProvider);
registerImageProvider(a1111Provider);
registerImageProvider(comfyProvider);

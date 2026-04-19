"use client";

import { useEffect, useRef, useState } from "react";
import {
  AD_STYLE_LIST,
  type AdStyleId,
} from "@marionette/engine-marketing/ad-styles";
import {
  PLATFORM_LIST,
  type MarketingPlatform,
} from "@marionette/engine-marketing/platforms";

const PROVIDER_OPTIONS = [
  { id: "auto", label: "Auto (registry fallback)" },
  { id: "seedance-2.0", label: "Seedance 2.0 (top)" },
  { id: "kling-3.0", label: "Kling 3.0" },
  { id: "hunyuan-hf", label: "HunyuanVideo (free)" },
];

interface ElementLite {
  id: string;
  name: string;
  kind: string;
  trained: boolean;
}

interface CampaignJobStatus {
  id: string;
  state: "queued" | "running" | "succeeded" | "failed" | "canceled";
  progress?: number;
  progressNote?: string;
  error?: string;
  output?: {
    providerId: string;
    variants: Array<{
      index: number;
      nodeId: string;
      videoUrl?: string;
    }>;
  };
}

interface Props {
  projectId: string;
  projectTitle: string;
  initialElements: ElementLite[];
}

const POLL_INTERVAL_MS = 2000;

/**
 * Marketing Studio — single-page form organized into 4 logical steps:
 *   1. Product brief (paste / URL / manual)
 *   2. Style (9 ad-style presets)
 *   3. Platform (9 platform specs)
 *   4. Generate (variants + provider)
 *
 * Visual stepper with back/next + step-gating is deferred to a future
 * sprint. All fields visible at once keeps this sprint tight while the
 * data contract + job flow get nailed down.
 */
export function MarketingClient({
  projectId: _projectId,
  projectTitle,
  initialElements,
}: Props) {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [productImageUrls, setProductImageUrls] = useState("");
  const [extractStatus, setExtractStatus] = useState<string | null>(null);

  const [styleId, setStyleId] = useState<AdStyleId>("ugc");
  const [platformId, setPlatformId] = useState<MarketingPlatform>(
    "instagram-reel",
  );
  const [variants, setVariants] = useState(1);
  const [durationSec, setDurationSec] = useState<number | "">("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [avatarElementId, setAvatarElementId] = useState("");
  const [preferProvider, setPreferProvider] = useState("auto");

  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<CampaignJobStatus | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!job) return;
    if (
      job.state === "succeeded" ||
      job.state === "failed" ||
      job.state === "canceled"
    )
      return;
    pollTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/marketing/campaigns/${job.id}`);
        if (!res.ok) return;
        const next = (await res.json()) as CampaignJobStatus;
        setJob(next);
      } catch (err) {
        console.error("poll failed", err);
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [job]);

  function parseImageUrls(raw: string): string[] {
    return raw
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return;
    setSubmitting(true);

    const body = {
      product: {
        name: productName,
        description: productDescription,
        imageUrls: parseImageUrls(productImageUrls),
        sourceUrl: productUrl || undefined,
        warnings: [],
      },
      style: styleId,
      platform: platformId,
      variants,
      durationSec: durationSec === "" ? undefined : durationSec,
      extraPrompt: extraPrompt || undefined,
      avatarElementId: avatarElementId || undefined,
      preferProvider: preferProvider === "auto" ? undefined : preferProvider,
    };

    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setJob({
          id: "-",
          state: "failed",
          error: err.error ?? `submit failed ${res.status}`,
        });
        return;
      }
      const { jobId } = (await res.json()) as { jobId: string };
      setJob({ id: jobId, state: "queued" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExtract() {
    if (!productUrl.trim()) return;
    setExtractStatus("Fetching…");
    try {
      // Lightweight client-side extraction: just set sourceUrl.
      // Real HTML parsing lives in @marionette/engine-marketing/product —
      // a future API route can expose it. For now we rely on the operator
      // to paste name + description.
      setExtractStatus(
        "URL saved. (Auto-parsing via server endpoint ships in Sprint 15b+).",
      );
    } catch (err) {
      setExtractStatus(
        err instanceof Error ? err.message : "extract failed",
      );
    }
  }

  async function handleCancel() {
    if (!job) return;
    await fetch(`/api/marketing/campaigns/${job.id}`, { method: "DELETE" });
  }

  const styleDef = AD_STYLE_LIST.find((s) => s.id === styleId);
  const platformDef = PLATFORM_LIST.find((p) => p.id === platformId);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Marketing Studio — {projectTitle}
        </h1>
        <p className="text-sm text-neutral-500">
          Higgsfield-style ad engine. 9 creative styles × 9 platforms ×
          up to 4 variants. Built atop the Cinema Orchestrator so camera,
          motion, and speed ramps come baked in per style preset.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Product */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold">1 · Product</h2>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Product name *</span>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="rounded border px-3 py-2"
              placeholder="Nike Pegasus 41"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={2}
              className="rounded border px-3 py-2"
              placeholder="A responsive daily trainer for city runners…"
            />
          </label>
          <div className="grid gap-1">
            <span className="text-sm font-medium">
              Source URL (optional — for audit trail)
            </span>
            <div className="flex gap-2">
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="flex-1 rounded border px-3 py-2"
                placeholder="https://nike.com/p/pegasus-41"
              />
              <button
                type="button"
                onClick={handleExtract}
                className="rounded bg-neutral-200 px-3 py-2 text-sm hover:bg-neutral-300"
              >
                Save URL
              </button>
            </div>
            {extractStatus && (
              <p className="text-xs text-neutral-500">{extractStatus}</p>
            )}
          </div>
          <label className="grid gap-1">
            <span className="text-sm font-medium">
              Product image URLs (one per line)
            </span>
            <textarea
              value={productImageUrls}
              onChange={(e) => setProductImageUrls(e.target.value)}
              rows={2}
              className="rounded border px-3 py-2 font-mono text-sm"
              placeholder={"https://cdn.example/nike-1.jpg\nhttps://cdn.example/nike-2.jpg"}
            />
          </label>
        </section>

        {/* Step 2: Style */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold">2 · Style</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {AD_STYLE_LIST.map((s) => {
              const selected = s.id === styleId;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStyleId(s.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-neutral-200 bg-white hover:border-neutral-400"
                  }`}
                >
                  <div className="font-medium">{s.label}</div>
                  <div className="mt-1 text-xs text-neutral-600">
                    {s.description}
                  </div>
                </button>
              );
            })}
          </div>
          {styleDef && (
            <p className="text-xs text-neutral-500">
              Defaults: camera{" "}
              <code>{styleDef.defaultCameraBody ?? "—"}</code> · ramp{" "}
              <code>{styleDef.suggestsRamp ?? "none"}</code> · duration{" "}
              {styleDef.durationRangeSec[0]}–{styleDef.durationRangeSec[1]}s
            </p>
          )}
        </section>

        {/* Step 3: Platform */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold">3 · Platform</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {PLATFORM_LIST.map((p) => {
              const selected = p.id === platformId;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatformId(p.id)}
                  className={`rounded-lg border p-3 text-left ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-neutral-200 bg-white hover:border-neutral-400"
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="mt-1 text-xs text-neutral-600">
                    {p.aspectRatio} · up to {p.maxDurationSec}s · {p.fps}fps
                  </div>
                </button>
              );
            })}
          </div>
          {platformDef?.framingNotes && (
            <p className="text-xs text-neutral-500">
              Framing: {platformDef.framingNotes}
            </p>
          )}
        </section>

        {/* Step 4: Generate */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold">4 · Generate</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Variants</span>
              <select
                value={variants}
                onChange={(e) => setVariants(Number(e.target.value))}
                className="rounded border px-3 py-2"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">
                Duration (s, optional)
              </span>
              <input
                type="number"
                min={1}
                max={platformDef?.maxDurationSec ?? 120}
                value={durationSec}
                onChange={(e) =>
                  setDurationSec(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="rounded border px-3 py-2"
                placeholder={`${platformDef?.recommendedDurationSec ?? 15}`}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Provider</span>
              <select
                value={preferProvider}
                onChange={(e) => setPreferProvider(e.target.value)}
                className="rounded border px-3 py-2"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Avatar (optional)</span>
              <select
                value={avatarElementId}
                onChange={(e) => setAvatarElementId(e.target.value)}
                className="rounded border px-3 py-2"
              >
                <option value="">— none —</option>
                {initialElements
                  .filter((el) => el.kind === "character")
                  .map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.name}
                      {el.trained ? " (trained)" : ""}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-medium">
              Extra prompt / CTA (optional)
            </span>
            <input
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              className="rounded border px-3 py-2"
              placeholder="Tagline: Run wild."
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !productName.trim()}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:bg-neutral-400"
          >
            {submitting ? "Submitting…" : `Generate ${variants} variant${variants > 1 ? "s" : ""}`}
          </button>
        </section>
      </form>

      {job && (
        <section className="rounded-lg border p-4 space-y-3">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Campaign <code className="text-sm">{job.id}</code>
            </h2>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-sm">
              {job.state}
            </span>
          </header>
          {job.progress !== undefined && (
            <div className="h-2 overflow-hidden rounded bg-neutral-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.round(job.progress * 100)}%` }}
              />
            </div>
          )}
          {job.progressNote && (
            <p className="text-sm text-neutral-600">{job.progressNote}</p>
          )}
          {job.error && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700">
              {job.error}
            </p>
          )}
          {job.output?.variants && job.output.variants.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {job.output.variants.map((v) => (
                <div key={v.index} className="rounded border p-2">
                  <div className="mb-1 text-xs text-neutral-500">
                    Variant {v.index + 1}
                  </div>
                  {v.videoUrl ? (
                    <video
                      src={v.videoUrl}
                      controls
                      className="w-full rounded bg-black"
                    />
                  ) : (
                    <div className="aspect-video rounded bg-neutral-100" />
                  )}
                </div>
              ))}
            </div>
          )}
          {(job.state === "queued" || job.state === "running") && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded border px-3 py-1 text-sm hover:bg-neutral-100"
            >
              Cancel
            </button>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CAMERA_PRESET_LIST } from "@marionette/engine-cinema/camera";
import { SPEED_RAMP_LIST } from "@marionette/engine-cinema/ramp";

const MOTION_OPTIONS = [
  "dolly",
  "pan",
  "tilt",
  "zoom",
  "orbit",
  "crane",
  "handheld",
  "whip",
  "roll",
  "push-in",
  "pull-out",
] as const;

const ASPECT_OPTIONS = [
  "16:9",
  "9:16",
  "1:1",
  "21:9",
  "2.35:1",
  "4:5",
  "1.85:1",
] as const;

const PROVIDER_OPTIONS = [
  { id: "auto", label: "Auto (registry fallback)" },
  { id: "seedance-2.0", label: "Seedance 2.0 (top)" },
  { id: "kling-3.0", label: "Kling 3.0" },
  { id: "hunyuan-hf", label: "HunyuanVideo (free)" },
  { id: "wan-hf", label: "Wan 2.2 (free)" },
  { id: "ltx-hf", label: "LTX-Video (free)" },
];

interface ElementLite {
  id: string;
  name: string;
  kind: string;
  trained: boolean;
}

interface JobStatus {
  id: string;
  state: "queued" | "running" | "succeeded" | "failed" | "canceled";
  progress?: number;
  progressNote?: string;
  error?: string;
  output?: {
    providerId: string;
    nodeId: string;
    videoUrl?: string;
  };
}

interface Props {
  projectId: string;
  projectTitle: string;
  initialElements: ElementLite[];
}

const POLL_INTERVAL_MS = 1500;

export function CinemaClient({ projectId, projectTitle, initialElements }: Props) {
  const [elements, setElements] = useState<ElementLite[]>(initialElements);
  const [prompt, setPrompt] = useState("");
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [cameraBody, setCameraBody] = useState("unspecified");
  const [motion, setMotion] = useState("");
  const [ramp, setRamp] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [durationSec, setDurationSec] = useState<number>(5);
  const [preferProvider, setPreferProvider] = useState("auto");

  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<JobStatus | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll while job is pre-terminal.
  useEffect(() => {
    if (!job) return;
    if (
      job.state === "succeeded" ||
      job.state === "failed" ||
      job.state === "canceled"
    ) {
      return;
    }
    pollTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cinema/shots/${job.id}`);
        if (!res.ok) return;
        const next = (await res.json()) as JobStatus;
        setJob(next);
      } catch (err) {
        console.error("poll failed", err);
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [job]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cinema/shots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sceneId: `s-${Date.now()}`,
          shotId: `sh-1`,
          prompt,
          elementIds: selectedElementIds.length ? selectedElementIds : undefined,
          cameraBody: cameraBody === "unspecified" ? undefined : cameraBody,
          motion: motion || undefined,
          ramp: ramp || undefined,
          aspectRatio,
          durationSec,
          preferProvider: preferProvider === "auto" ? undefined : preferProvider,
        }),
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

  async function handleCancel() {
    if (!job) return;
    await fetch(`/api/cinema/shots/${job.id}`, { method: "DELETE" });
  }

  async function handleCreateElement() {
    const name = window.prompt("Element name (e.g. Jane)");
    if (!name) return;
    const kind = window.prompt(
      "Kind (character, location, prop, costume, style, lighting, vehicle, vfx)",
      "character",
    );
    if (!kind) return;
    const res = await fetch("/api/elements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, name, kind, references: [] }),
    });
    if (res.ok) {
      const { element } = await res.json();
      setElements((prev) => [
        ...prev,
        {
          id: element.id,
          name: element.name,
          kind: element.kind,
          trained: element.identity?.trained === true,
        },
      ]);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Cinema Studio 3.5 — {projectTitle}</h1>
        <p className="text-sm text-neutral-500">
          Higgsfield-style video generation with 9-ref anchoring, 8 camera bodies,
          3-axis motion stack, and 8 speed-ramp presets. Backed by the Layer 1
          provider registry (Seedance / Kling / Hunyuan / Wan / LTX).
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="rounded border px-3 py-2"
            placeholder="Jane walks down a neon-lit alley in heavy rain…"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Camera body</span>
            <select
              value={cameraBody}
              onChange={(e) => setCameraBody(e.target.value)}
              className="rounded border px-3 py-2"
            >
              {CAMERA_PRESET_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Motion</span>
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value)}
              className="rounded border px-3 py-2"
            >
              <option value="">— none —</option>
              {MOTION_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Speed ramp</span>
            <select
              value={ramp}
              onChange={(e) => setRamp(e.target.value)}
              className="rounded border px-3 py-2"
            >
              <option value="">— none —</option>
              {SPEED_RAMP_LIST.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Aspect</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="rounded border px-3 py-2"
            >
              {ASPECT_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Duration (s)</span>
            <input
              type="number"
              min={1}
              max={15}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="rounded border px-3 py-2"
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
        </div>

        <fieldset className="grid gap-2 rounded border p-3">
          <legend className="flex items-center gap-3 px-1 text-sm font-medium">
            Elements on camera
            <button
              type="button"
              onClick={handleCreateElement}
              className="rounded bg-neutral-200 px-2 py-0.5 text-xs hover:bg-neutral-300"
            >
              + create
            </button>
          </legend>
          {elements.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No elements yet. Click &quot;+ create&quot; to add a character,
              prop, or location. The shot will still generate without any —
              Elements only come into play when you need consistent identity
              across shots.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {elements.map((el) => {
                const selected = selectedElementIds.includes(el.id);
                return (
                  <button
                    type="button"
                    key={el.id}
                    onClick={() =>
                      setSelectedElementIds((prev) =>
                        selected
                          ? prev.filter((id) => id !== el.id)
                          : [...prev, el.id],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-sm ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {el.name}
                    <span className="ml-1 text-xs text-neutral-500">
                      ({el.kind}
                      {el.trained ? " · trained" : ""})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={submitting || !prompt.trim()}
          className="self-start rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:bg-neutral-400"
        >
          {submitting ? "Submitting…" : "Generate shot"}
        </button>
      </form>

      {job && (
        <section className="rounded-lg border p-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Job <code className="text-sm">{job.id}</code>
            </h2>
            <span className="rounded px-2 py-0.5 text-sm bg-neutral-100">
              {job.state}
            </span>
          </header>
          {job.progress !== undefined && (
            <div className="mt-3 h-2 overflow-hidden rounded bg-neutral-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.round(job.progress * 100)}%` }}
              />
            </div>
          )}
          {job.progressNote && (
            <p className="mt-2 text-sm text-neutral-600">{job.progressNote}</p>
          )}
          {job.error && (
            <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
              {job.error}
            </p>
          )}
          {job.output?.videoUrl && (
            <div className="mt-4">
              <video
                src={job.output.videoUrl}
                controls
                className="max-h-[60vh] w-full rounded border bg-black"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Provider: {job.output.providerId} · Node: {job.output.nodeId}
              </p>
            </div>
          )}
          {(job.state === "queued" || job.state === "running") && (
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 rounded border px-3 py-1 text-sm hover:bg-neutral-100"
            >
              Cancel
            </button>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Element as ElementType,
  ElementKind,
} from "@marionette/elements-core";

const KIND_OPTIONS: ElementKind[] = [
  "character",
  "location",
  "prop",
  "costume",
  "style",
  "lighting",
  "vehicle",
  "vfx",
];

interface TrainJobStatus {
  id: string;
  state: "queued" | "running" | "succeeded" | "failed" | "canceled";
  progress?: number;
  progressNote?: string;
  error?: string;
  output?: {
    elementId: string;
    modelId: string;
    provider: string;
    consistencyScore?: number;
  };
}

interface Props {
  projectId: string;
  projectTitle: string;
  initialElements: ElementType[];
}

const POLL_INTERVAL_MS = 1000;

export function ElementsClient({
  projectId,
  projectTitle,
  initialElements,
}: Props) {
  const [elements, setElements] = useState<ElementType[]>(initialElements);
  const [kindFilter, setKindFilter] = useState<"" | ElementKind>("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialElements[0]?.id ?? null,
  );

  // Per-element training job state. Keyed by element id.
  const [trainJobs, setTrainJobs] = useState<Record<string, TrainJobStatus>>({});
  const pollTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const visible = kindFilter
    ? elements.filter((e) => e.kind === kindFilter)
    : elements;

  async function reloadElements() {
    const res = await fetch(
      `/api/elements?projectId=${encodeURIComponent(projectId)}`,
    );
    if (res.ok) {
      const { elements: fresh } = (await res.json()) as {
        elements: ElementType[];
      };
      setElements(fresh);
    }
  }

  async function handleCreate() {
    const name = window.prompt("Element name");
    if (!name) return;
    const kind =
      window.prompt(
        `Kind (${KIND_OPTIONS.join(" / ")})`,
        "character",
      ) ?? "character";
    if (!KIND_OPTIONS.includes(kind as ElementKind)) {
      alert(`Invalid kind: ${kind}`);
      return;
    }
    const res = await fetch("/api/elements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, name, kind, references: [] }),
    });
    if (res.ok) {
      const { element } = await res.json();
      setElements((prev) => [...prev, element]);
      setSelectedId(element.id);
    }
  }

  async function handleAddReference(el: ElementType) {
    const url = window.prompt("Reference image URL");
    if (!url) return;
    const newRefs = [
      ...el.references,
      { kind: "url" as const, url },
    ].slice(0, 9);
    const res = await fetch(`/api/elements/${el.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ references: newRefs }),
    });
    if (res.ok) {
      const { element } = await res.json();
      setElements((prev) =>
        prev.map((e) => (e.id === element.id ? element : e)),
      );
    }
  }

  async function handleRemove(el: ElementType) {
    if (!confirm(`Remove element "${el.name}"?`)) return;
    const res = await fetch(`/api/elements/${el.id}`, { method: "DELETE" });
    if (res.ok) {
      setElements((prev) => prev.filter((e) => e.id !== el.id));
      if (selectedId === el.id) setSelectedId(null);
    }
  }

  async function handleTrain(el: ElementType) {
    if (el.references.length === 0) {
      alert("Add at least one reference image before training.");
      return;
    }
    const res = await fetch(`/api/elements/${el.id}/train`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? `train submit failed ${res.status}`);
      return;
    }
    const { jobId } = (await res.json()) as { jobId: string };
    setTrainJobs((prev) => ({
      ...prev,
      [el.id]: { id: jobId, state: "queued" },
    }));
  }

  // Poll every active training job.
  useEffect(() => {
    for (const [elementId, job] of Object.entries(trainJobs)) {
      if (
        job.state === "succeeded" ||
        job.state === "failed" ||
        job.state === "canceled"
      ) {
        continue;
      }
      if (pollTimers.current[elementId]) continue;
      pollTimers.current[elementId] = setTimeout(async () => {
        delete pollTimers.current[elementId];
        try {
          const res = await fetch(`/api/jobs/${job.id}`);
          if (res.ok) {
            const next = (await res.json()) as TrainJobStatus;
            setTrainJobs((prev) => ({ ...prev, [elementId]: next }));
            if (next.state === "succeeded") {
              await reloadElements();
            }
          }
        } catch (err) {
          console.error("train poll failed", err);
        }
      }, POLL_INTERVAL_MS);
    }
    return () => {
      for (const t of Object.values(pollTimers.current)) clearTimeout(t);
      pollTimers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainJobs]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Elements — {projectTitle}
          </h1>
          <p className="text-sm text-neutral-500">
            Cross-cutting library of characters, locations, props, costumes.
            Each Element holds up to 9 references and can be locked with a
            Soul ID for consistency across shots.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
        >
          + New element
        </button>
      </header>

      <div className="flex gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span>Filter:</span>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as "" | ElementKind)}
            className="rounded border px-2 py-1"
          >
            <option value="">All kinds</option>
            {KIND_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-neutral-500 self-center">
          {visible.length} element{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="max-h-[70vh] overflow-y-auto rounded-lg border">
          {visible.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">
              No elements yet. Click &quot;+ New element&quot; to create one.
            </p>
          ) : (
            <ul>
              {visible.map((el) => {
                const active = el.id === selectedId;
                const trained = el.identity?.trained === true;
                return (
                  <li key={el.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(el.id)}
                      className={`flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0 ${
                        active ? "bg-blue-50" : "hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{el.name}</div>
                        <div className="text-xs text-neutral-500">
                          {el.kind} · {el.references.length} refs ·{" "}
                          {el.usedIn.length} usages
                        </div>
                      </div>
                      {trained && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          trained
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="rounded-lg border p-4 space-y-4">
          {!selected ? (
            <p className="text-sm text-neutral-500">Select an element.</p>
          ) : (
            <>
              <header className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-neutral-500">
                    {selected.kind}
                    {selected.identity?.trained && (
                      <>
                        {" · "}
                        <span className="text-green-700">
                          Soul ID: {selected.identity.provider} /{" "}
                          <code>{selected.identity.modelId}</code>
                          {selected.identity.consistencyScore !== undefined && (
                            <>
                              {" "}
                              (consistency{" "}
                              {selected.identity.consistencyScore.toFixed(2)})
                            </>
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddReference(selected)}
                    disabled={selected.references.length >= 9}
                    className="rounded border px-3 py-1 text-sm hover:bg-neutral-50 disabled:opacity-50"
                  >
                    + reference
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTrain(selected)}
                    disabled={selected.references.length === 0}
                    className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white disabled:bg-neutral-400"
                  >
                    {selected.identity?.trained ? "Retrain Soul ID" : "Train Soul ID"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(selected)}
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </header>

              {selected.description && (
                <p className="text-sm text-neutral-600">{selected.description}</p>
              )}

              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  References ({selected.references.length}/9)
                </h3>
                {selected.references.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No references yet. Click &quot;+ reference&quot; to add one.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
                    {selected.references.map((ref, i) => {
                      const src =
                        ref.kind === "url"
                          ? ref.url
                          : ref.kind === "dataUrl"
                            ? ref.dataUrl
                            : undefined;
                      return (
                        <div
                          key={i}
                          className="aspect-square overflow-hidden rounded border bg-neutral-50"
                        >
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={`ref ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                              {ref.kind}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {trainJobs[selected.id] && (
                <div className="rounded border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Training · {trainJobs[selected.id]!.state}
                    </span>
                    <code className="text-xs text-neutral-500">
                      {trainJobs[selected.id]!.id}
                    </code>
                  </div>
                  {trainJobs[selected.id]!.progress !== undefined && (
                    <div className="h-2 overflow-hidden rounded bg-neutral-200">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${Math.round(
                            trainJobs[selected.id]!.progress! * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                  {trainJobs[selected.id]!.progressNote && (
                    <p className="mt-1 text-xs text-neutral-600">
                      {trainJobs[selected.id]!.progressNote}
                    </p>
                  )}
                  {trainJobs[selected.id]!.error && (
                    <p className="mt-1 text-xs text-red-700">
                      {trainJobs[selected.id]!.error}
                    </p>
                  )}
                </div>
              )}

              {selected.usedIn.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Usages ({selected.usedIn.length})
                  </h3>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    {selected.usedIn.slice(0, 10).map((u, i) => (
                      <li key={i} className="flex gap-2">
                        <code className="text-xs">{u.nodeId}</code>
                        {u.sceneId && (
                          <span className="text-xs text-neutral-500">
                            scene {u.sceneId}
                            {u.shotId ? ` · shot ${u.shotId}` : ""}
                          </span>
                        )}
                      </li>
                    ))}
                    {selected.usedIn.length > 10 && (
                      <li className="text-xs text-neutral-500">
                        … and {selected.usedIn.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import { PipelineStepper } from "./PipelineStepper";
import { PipelineStepCard } from "./PipelineStepCard";
import { useProjectProgress } from "./useProjectProgress";
import type { ProjectMeta, DeepLink, StepKey } from "./types";
import { STEPS } from "./types";

interface Props {
  meta: ProjectMeta;
  /** Map of stepKey → external app URL. Phase 1: static, passed in by app. */
  deepLinks?: Partial<Record<StepKey, DeepLink>>;
}

export function CreativePipelineShell({ meta, deepLinks }: Props) {
  const { progress, currentStep } = useProjectProgress(meta.id);

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--studio-bg-base)",
        color: "var(--studio-text)",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--studio-border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-wider">{meta.title}</h1>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--studio-bg-hover)",
                  color: "var(--studio-text-dim)",
                  border: "1px solid var(--studio-border)",
                }}
              >
                {meta.ownerStudio}
              </span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor:
                    meta.priority === "P0"
                      ? "rgba(239, 68, 68, 0.15)"
                      : meta.priority === "P1"
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(107, 114, 128, 0.15)",
                  color:
                    meta.priority === "P0"
                      ? "var(--studio-danger)"
                      : meta.priority === "P1"
                        ? "var(--studio-warning)"
                        : "var(--studio-text-dim)",
                  border: `1px solid ${
                    meta.priority === "P0"
                      ? "var(--studio-danger)"
                      : meta.priority === "P1"
                        ? "var(--studio-warning)"
                        : "var(--studio-border)"
                  }`,
                }}
              >
                {meta.priority}
              </span>
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--studio-text-dim)" }}
            >
              {meta.category}
              {meta.genre && ` · ${meta.genre}`}
              {meta.budgetKRW && ` · ₩${(meta.budgetKRW / 1_000_000_000).toFixed(1)}B`}
            </p>
          </div>
          <a
            href="/paperclip"
            className="text-xs underline opacity-70 hover:opacity-100"
            style={{ color: "var(--studio-text-dim)" }}
          >
            ← Paperclip HQ
          </a>
        </div>
      </header>

      {/* Sticky stepper */}
      <PipelineStepper progress={progress} currentStep={currentStep} />

      {/* 8 cards */}
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="flex flex-col gap-4">
          {STEPS.map((step) => {
            const p =
              progress.find((pr) => pr.key === step.key) ?? {
                key: step.key,
                status: "not_started" as const,
              };
            return (
              <PipelineStepCard
                key={step.key}
                stepKey={step.key}
                progress={p}
                deepLink={deepLinks?.[step.key]}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

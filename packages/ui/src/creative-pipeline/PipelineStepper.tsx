"use client";

import { STEPS, type StepKey, type StepProgress } from "./types";

interface Props {
  progress: StepProgress[];
  currentStep?: StepKey;
  onStepClick?: (key: StepKey) => void;
}

export function PipelineStepper({ progress, currentStep, onStepClick }: Props) {
  const byKey = new Map(progress.map((p) => [p.key, p]));

  return (
    <nav
      aria-label="Creative pipeline steps"
      className="sticky top-0 z-10 border-b px-6 py-3"
      style={{
        backgroundColor: "var(--studio-bg-surface)",
        borderColor: "var(--studio-border)",
      }}
    >
      <ol className="flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const p = byKey.get(step.key);
          const active = currentStep === step.key;
          const done = p?.status === "locked";
          return (
            <li key={step.key} className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.key)}
                className="flex items-center gap-2 rounded px-3 py-2 text-xs transition"
                style={{
                  color: active ? "var(--studio-text)" : "var(--studio-text-dim)",
                  backgroundColor: active ? "var(--studio-bg-hover)" : "transparent",
                  cursor: onStepClick ? "pointer" : "default",
                }}
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: done
                      ? "var(--accent-mint)"
                      : active
                        ? "var(--accent-violet)"
                        : "var(--studio-bg-elevated)",
                    color: done || active ? "var(--studio-bg-base)" : "var(--studio-text-dim)",
                  }}
                >
                  {done ? "✓" : step.order}
                </span>
                <span className="font-medium">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="mx-1 h-px w-4"
                  style={{ backgroundColor: "var(--studio-border)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

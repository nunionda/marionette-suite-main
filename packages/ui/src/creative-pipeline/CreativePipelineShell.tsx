"use client";

import { PipelineStepper } from "./PipelineStepper";
import { PipelineStepCard } from "./PipelineStepCard";
import { PostProductionPanel } from "./PostProductionPanel";
import { DistributionPanel } from "./DistributionPanel";
import { SchedulePanel } from "./SchedulePanel";
import { BudgetPanel } from "./BudgetPanel";
import { CastingPanel } from "./CastingPanel";
import { LocationsPanel } from "./LocationsPanel";
import { RehearsalsPanel } from "./RehearsalsPanel";
import { IngestPanel } from "./IngestPanel";
import { TitlesPanel } from "./TitlesPanel";
import { FestivalsPanel } from "./FestivalsPanel";
import { MarketingPanel } from "./MarketingPanel";
import { BoxOfficePanel } from "./BoxOfficePanel";
import { ReviewsPanel } from "./ReviewsPanel";
import { AssemblyPanel } from "./AssemblyPanel";
import { useProjectProgress } from "./useProjectProgress";
import type { ProjectMeta, DeepLink, StepKey } from "./types";
import { STEPS } from "./types";

interface Props {
  meta: ProjectMeta;
  /** Map of stepKey → external app URL. Phase 1: static, passed in by app. */
  deepLinks?: Partial<Record<StepKey, DeepLink>>;
  onExport?: () => void;
}

export function CreativePipelineShell({ meta, deepLinks, onExport }: Props) {
  const { progress, currentStep, postProduction, distribution, schedule, budget, casting, locations, rehearsals, ingest, titles, festivals, marketing, boxOffice, reviews, assembly } = useProjectProgress(meta.id);

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
          <div className="flex items-center gap-3">
            {onExport && (
              <button
                onClick={onExport}
                className="rounded px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--accent-violet)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Export to Higgsfield ↓
              </button>
            )}
            <a
              href="/paperclip"
              className="text-xs underline opacity-70 hover:opacity-100"
              style={{ color: "var(--studio-text-dim)" }}
            >
              ← Paperclip HQ
            </a>
          </div>
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

        {/* Sprint 1+: pre-production + production + post-production + distribution panels */}
        {(schedule || budget || casting || locations || rehearsals || ingest || postProduction || titles || festivals || marketing || distribution || boxOffice || reviews || assembly) && (
          <div className="mt-6 flex flex-col gap-4">
            {schedule && <SchedulePanel status={schedule} />}
            {budget && <BudgetPanel status={budget} />}
            {casting && <CastingPanel status={casting} />}
            {locations && <LocationsPanel status={locations} />}
            {rehearsals && <RehearsalsPanel status={rehearsals} />}
            {ingest && <IngestPanel status={ingest} />}
            {postProduction && <PostProductionPanel status={postProduction} />}
            {assembly && <AssemblyPanel status={assembly} />}
            {titles && <TitlesPanel status={titles} />}
            {distribution && <DistributionPanel status={distribution} />}
            {festivals && <FestivalsPanel status={festivals} />}
            {marketing && <MarketingPanel status={marketing} />}
            {boxOffice && <BoxOfficePanel status={boxOffice} />}
            {reviews && <ReviewsPanel status={reviews} />}
          </div>
        )}
      </main>
    </div>
  );
}

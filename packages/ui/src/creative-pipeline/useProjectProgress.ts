"use client";

import { useEffect, useState } from "react";
import type { StepProgress, StepKey } from "./types";
import { STEPS } from "./types";

export interface PostProductionStatus {
  paperclipId: string;
  steps: {
    edit: boolean;
    vfx: boolean;
    sound: boolean;
    color: boolean;
    delivery: boolean;
  };
  progress: {
    edit: number;
    vfx: { done: number; total: number };
    sound: { done: number; total: number };
    color: { done: number; total: number };
  };
}

export interface DistributionStatus {
  paperclipId: string;
  published: boolean;
  entry: {
    id: string;
    title: string;
    channels: string[];
    deliverables: string[];
    releaseDate?: string;
  } | null;
  /** Charter #69: Streaming/VOD release detail — null for theatrical-only or unreleased. */
  streaming: {
    exclusivity: "exclusive" | "non-exclusive" | "day-and-date" | null;
    windowEnd: string | null;
    platforms: Array<{
      platform: string;
      status: "scheduled" | "live" | "ended" | "withdrawn";
      liveDate: string | null;
      endDate: string | null;
      regions: string[];
      drm: Array<"widevine" | "fairplay" | "playready" | "none">;
      maxResolution: "480p" | "720p" | "1080p" | "4K";
      hasHDR: boolean;
      hasAtmos: boolean;
      codecs: Array<"h264" | "h265" | "av1" | "vp9">;
      variantCount: number;
    }>;
  } | null;
  /** Charter #69 step flags (derived in progress endpoint) */
  streamingScheduled: boolean;
  streamingLive: boolean;
}

export interface ScheduleStatus {
  paperclipId: string;
  steps: {
    scheduled: boolean;
    shooting: boolean;
    wrapped: boolean;
  };
  progress: {
    totalDays: number;
    wrappedDays: number;
    inProgressDays: number;
    scheduledDays: number;
  };
  nextDay: {
    id: string;
    day: number;
    date: string;
    location: string;
    interior: boolean;
    callTime: string;
    wrapTime: string;
  } | null;
  activeDay: ScheduleStatus["nextDay"];
}

export interface BudgetStatus {
  paperclipId: string;
  steps: {
    drafted: boolean;
    approved: boolean;
  };
  status: "draft" | "submitted" | "approved" | "locked";
  totalAllocated: number;
  currency: "KRW";
  summary: {
    spent: number;
    remaining: number;
    burnRatePct: number;
  };
  departments: Array<{
    department: string;
    allocated: number;
    spent: number;
  }>;
}

export interface CastingStatus {
  paperclipId: string;
  steps: {
    started: boolean;
    auditioning: boolean;
    locked: boolean;
  };
  summary: {
    total: number;
    signed: number;
    auditioning: number;
    open: number;
  };
  leads: Array<{
    characterName: string;
    actorName: string | null;
    state: "open" | "audition" | "offer" | "confirmed" | "signed";
  }>;
}

export interface LocationsStatus {
  paperclipId: string;
  steps: {
    scouting: boolean;
    permitted: boolean;
    locked: boolean;
  };
  summary: {
    total: number;
    confirmed: number;
    permitted: number;
    scouting: number;
  };
  topLocations: Array<{
    name: string;
    interior: boolean;
    status: "scouting" | "shortlisted" | "permitted" | "confirmed" | "rejected";
  }>;
}

export interface RehearsalsStatus {
  paperclipId: string;
  steps: {
    scheduled: boolean;
    started: boolean;
    done: boolean;
  };
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
    totalHours: number;
  };
  next: {
    id: string;
    date: string;
    type: string;
    venue: string;
    durationHours: number;
    attendees: string[];
  } | null;
  active: RehearsalsStatus["next"];
}

export interface IngestStatus {
  paperclipId: string;
  steps: {
    ingesting: boolean;
    verified: boolean;
    archived: boolean;
  };
  summary: {
    total: number;
    verified: number;
    ingesting: number;
    totalSizeGB: number;
    totalTakes: number;
    archived: number;
  };
  latestBatch: {
    shootDate: string;
    cameraRoll: string;
    cameraModel: string;
    codec: string;
    sizeGB: number;
    takes: number;
  } | null;
}

export interface TitlesStatus {
  paperclipId: string;
  steps: {
    drafted: boolean;
    inReview: boolean;
    approved: boolean;
  };
  summary: {
    total: number;
    approved: number;
    review: number;
    draft: number;
  };
  mainTitle: {
    text: string | null;
    font: string | null;
    durationSec: number | null;
    status: "draft" | "review" | "approved" | "locked";
  } | null;
}

export interface FestivalsStatus {
  paperclipId: string;
  steps: {
    planned: boolean;
    submitted: boolean;
    selected: boolean;
  };
  summary: {
    total: number;
    submitted: number;
    selected: number;
    awarded: number;
    pending: number;
    aListFestivals: number;
  };
  nextDeadline: {
    festivalName: string;
    deadline: string;
    country: string;
    tier: "A" | "B" | "specialty" | "regional";
  } | null;
}

export interface MarketingStatus {
  paperclipId: string;
  steps: {
    drafted: boolean;
    inReview: boolean;
    approved: boolean;
  };
  summary: {
    total: number;
    approved: number;
    inReview: number;
    aiGenerated: number;
    videoAssets: number;
    imageAssets: number;
  };
  flagship: {
    trailer: {
      label: string;
      durationSec: number | null;
      status: "draft" | "in_review" | "approved" | "delivered" | "live";
      aiGenerated: boolean;
    } | null;
    poster: {
      label: string;
      kind: string;
      status: "draft" | "in_review" | "approved" | "delivered" | "live";
      aiGenerated: boolean;
    } | null;
  };
}

export interface BoxOfficeStatus {
  paperclipId: string;
  steps: {
    released: boolean;
    week1Done: boolean;
    breakeven: boolean;
  };
  summary: {
    krRevenue: number;
    krAdmissions: number;
    weeksInRelease: number;
    peakScreens: number;
    peakRank: number;
    territoriesLive: number;
    breakevenPct: number;
    breakeven: boolean;
  };
  meta: {
    releaseDate: string | null;
    pattern: "wide" | "platform" | "limited" | "streaming" | "festival_only";
    budgetKRW: number;
  };
  latestWeek: {
    weekNumber: number;
    weekStarting: string;
    admissions: number;
    revenue: number;
    screens: number;
    rank: number;
    weekOverWeekPct: number | null;
  } | null;
}

export interface AssemblyStatus {
  paperclipId: string;
  steps: {
    queued: boolean;
    rendering: boolean;
    mastered: boolean;
  };
  summary: {
    total: number;
    done: number;
    running: number;
    failed: number;
    queued: number;
    mastered: number;
    totalSizeGB: number;
    pctOverall: number;
    presetsDelivered: string[];
  };
  latestJob: {
    id: string;
    version: string;
    status: "queued" | "running" | "done" | "failed";
    preset: string;
    resolution: "720p" | "1080p" | "2K" | "4K";
    hdr: "sdr" | "hdr10" | "dolby_vision";
    audioFormat: "stereo" | "5_1" | "atmos";
    renderedSec: number;
    durationSec: number;
    pct: number;
    outputSizeGB: number | null;
    outputPath: string | null;
    completedAt: string | null;
  } | null;
}

export interface ReviewsStatus {
  paperclipId: string;
  steps: {
    published: boolean;
    criticsAggregated: boolean;
    audienceAggregated: boolean;
  };
  summary: {
    total: number;
    avgScore: number | null;
    criticsAvg: number | null;
    audienceAvg: number | null;
    criticsCount: number;
    audienceCount: number;
    positive: number;
    mixed: number;
    negative: number;
    positivePct: number;
  };
  topReview: {
    outlet: string;
    reviewer: string | null;
    score: number | null;
    headline: string | null;
    sentiment: "positive" | "mixed" | "negative";
    publishedAt: string;
  } | null;
}

// ── Sprint 19: Development Phase ────────────────────────────────────────────

export interface IdeaStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  status: string;
  format: string | null;
  genre: string | null;
  logline: string | null;
}

export interface ResearchStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  overallStatus: string;
  completedCategories: number;
  totalCategories: number;
  marketSize: string | null;
}

export interface RightsStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  overallStatus: string;
  hasIssues: boolean;
  allClear: boolean;
  legalCounsel: string | null;
}

export interface PitchStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  status: string;
  deckVersion: string | null;
  meetingCount: number;
  interestedCount: number;
  askAmount: number | null;
}

export interface FinancingStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  status: string;
  totalBudget: number | null;
  totalRaised: number | null;
  raisedPercent: number | null;
  greenlitDate: string | null;
}

// ── Sprint 10: Pre-production Ops ───────────────────────────────────────────

export interface ContractsStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topContracts: Array<Record<string, unknown>>;
}

export interface TalentContractsStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  leads: Array<Record<string, unknown>>;
}

export interface CrewStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  departments: Array<Record<string, unknown>>;
}

export interface EquipmentStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  categories: Array<Record<string, unknown>>;
}

export interface InsuranceStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  policyTypes: Array<Record<string, unknown>>;
}

export interface ProductionOfficeStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  categories: Array<Record<string, unknown>>;
}

// ── On-set Ops ───────────────────────────────────────────────────────────────

export interface DailyReportStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  latestReport: Record<string, unknown> | null;
}

export interface WrapReportStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  wrapDate: string | null;
}

// ── Pre-production Creative ───────────────────────────────────────────────────

export interface ScriptDoctoringStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topDoctors: Array<Record<string, unknown>>;
}

export interface LightingDesignStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topSetups: Array<Record<string, unknown>>;
}

export interface VfxPrevisStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topShots: Array<Record<string, unknown>>;
}

export interface StuntStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topSequences: Array<Record<string, unknown>>;
}

export interface ScriptSupervisorPrepStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topDocs: Array<Record<string, unknown>>;
}

// ── Production / On-set ──────────────────────────────────────────────────────

export interface PhotographyStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  nextDay: Record<string, unknown> | null;
}

export interface OnSetSoundStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topSessions: Array<Record<string, unknown>>;
}

export interface ContinuityStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  criticalCount: number;
}

// ── Post-production (Sprint 21) ──────────────────────────────────────────────

export interface DailiesStatus {
  paperclipId: string;
  steps: Array<{ label: string; done: boolean }> | Record<string, boolean>;
  summary: Record<string, number>;
  topSessions: Array<Record<string, unknown>>;
}

export interface PictureLockStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topVersions: Array<Record<string, unknown>>;
}

export interface VfxReviewStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topShots: Array<Record<string, unknown>>;
}

export interface FinalMixStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topSessions: Array<Record<string, unknown>>;
}

export interface DeliverablesStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topDeliverables: Array<Record<string, unknown>>;
}

export interface ConformStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  deliveredCount: number;
}

// ── Distribution / Post-release ──────────────────────────────────────────────

export interface MusicLicensingStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topTracks: Array<Record<string, unknown>>;
}

export interface QCStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  passRate: number | null;
}

export interface DCPStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  masterFile: string | null;
}

export interface SalesStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  topDeals: Array<Record<string, unknown>>;
}

export interface TheatricalStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  openingDate: string | null;
}

export interface PressKitStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  readyCount: number;
}

export interface InternationalStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  closedDeals: number;
  totalMG: number | null;
}

export interface AwardsStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  wonCount: number;
  nominatedCount: number;
}

export interface ArchiveStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  activeCount: number;
  restrictedCount: number;
}

// ── PART B Engines ───────────────────────────────────────────────────────────

export interface CinemaEngineStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  totalUsages: number;
  distinctNodeIds: number;
}

export interface MarketingEngineStatus {
  paperclipId: string;
  steps: Record<string, boolean>;
  summary: Record<string, number>;
  totalUsages: number;
  distinctNodeIds: number;
}

// ── Aggregator contract (52 legs) ────────────────────────────────────────────

interface AggregatorResponse {
  creativeSteps: StepProgress[];
  postProduction: PostProductionStatus | null;
  distribution: DistributionStatus | null;
  schedule: ScheduleStatus | null;
  budget: BudgetStatus | null;
  casting: CastingStatus | null;
  locations: LocationsStatus | null;
  rehearsals: RehearsalsStatus | null;
  ingest: IngestStatus | null;
  titles: TitlesStatus | null;
  festivals: FestivalsStatus | null;
  marketing: MarketingStatus | null;
  boxOffice: BoxOfficeStatus | null;
  reviews: ReviewsStatus | null;
  assembly: AssemblyStatus | null;
  // Sprint 19
  idea: IdeaStatus | null;
  research: ResearchStatus | null;
  rights: RightsStatus | null;
  pitch: PitchStatus | null;
  financing: FinancingStatus | null;
  // Sprint 10
  contracts: ContractsStatus | null;
  talentContracts: TalentContractsStatus | null;
  crew: CrewStatus | null;
  equipment: EquipmentStatus | null;
  insurance: InsuranceStatus | null;
  productionOffice: ProductionOfficeStatus | null;
  dailyReport: DailyReportStatus | null;
  wrapReport: WrapReportStatus | null;
  // Pre-production creative
  scriptDoctoring: ScriptDoctoringStatus | null;
  lightingDesign: LightingDesignStatus | null;
  vfxPrevis: VfxPrevisStatus | null;
  stunt: StuntStatus | null;
  scriptSupervisorPrep: ScriptSupervisorPrepStatus | null;
  // Production
  photography: PhotographyStatus | null;
  onSetSound: OnSetSoundStatus | null;
  continuity: ContinuityStatus | null;
  // Post-production
  conform: ConformStatus | null;
  dailies: DailiesStatus | null;
  pictureLock: PictureLockStatus | null;
  vfxReview: VfxReviewStatus | null;
  finalMix: FinalMixStatus | null;
  deliverables: DeliverablesStatus | null;
  // Distribution / post-release
  musicLicensing: MusicLicensingStatus | null;
  qc: QCStatus | null;
  dcp: DCPStatus | null;
  sales: SalesStatus | null;
  theatrical: TheatricalStatus | null;
  pressKit: PressKitStatus | null;
  international: InternationalStatus | null;
  awards: AwardsStatus | null;
  archive: ArchiveStatus | null;
  // Engines (PART B)
  cinemaEngine: CinemaEngineStatus | null;
  marketingEngine: MarketingEngineStatus | null;
}

/**
 * Fetches progress for all 8 creative steps plus post-production and
 * distribution status. Returns all-empty defaults on failure.
 */
export function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState<StepProgress[]>(
    STEPS.map((s) => ({ key: s.key, status: "not_started" })),
  );
  const [postProduction, setPostProduction] =
    useState<PostProductionStatus | null>(null);
  const [distribution, setDistribution] = useState<DistributionStatus | null>(
    null,
  );
  const [schedule, setSchedule] = useState<ScheduleStatus | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [casting, setCasting] = useState<CastingStatus | null>(null);
  const [locations, setLocations] = useState<LocationsStatus | null>(null);
  const [rehearsals, setRehearsals] = useState<RehearsalsStatus | null>(null);
  const [ingest, setIngest] = useState<IngestStatus | null>(null);
  const [titles, setTitles] = useState<TitlesStatus | null>(null);
  const [festivals, setFestivals] = useState<FestivalsStatus | null>(null);
  const [marketing, setMarketing] = useState<MarketingStatus | null>(null);
  const [boxOffice, setBoxOffice] = useState<BoxOfficeStatus | null>(null);
  const [reviews, setReviews] = useState<ReviewsStatus | null>(null);
  const [assembly, setAssembly] = useState<AssemblyStatus | null>(null);
  // Sprint 19 — Development Phase
  const [idea, setIdea] = useState<IdeaStatus | null>(null);
  const [research, setResearch] = useState<ResearchStatus | null>(null);
  const [rights, setRights] = useState<RightsStatus | null>(null);
  const [pitch, setPitch] = useState<PitchStatus | null>(null);
  const [financing, setFinancing] = useState<FinancingStatus | null>(null);
  // Sprint 10 — Pre-production Ops
  const [contracts, setContracts] = useState<ContractsStatus | null>(null);
  const [talentContracts, setTalentContracts] = useState<TalentContractsStatus | null>(null);
  const [crew, setCrew] = useState<CrewStatus | null>(null);
  const [equipment, setEquipment] = useState<EquipmentStatus | null>(null);
  const [insurance, setInsurance] = useState<InsuranceStatus | null>(null);
  const [productionOffice, setProductionOffice] = useState<ProductionOfficeStatus | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReportStatus | null>(null);
  const [wrapReport, setWrapReport] = useState<WrapReportStatus | null>(null);
  // Pre-production creative
  const [scriptDoctoring, setScriptDoctoring] = useState<ScriptDoctoringStatus | null>(null);
  const [lightingDesign, setLightingDesign] = useState<LightingDesignStatus | null>(null);
  const [vfxPrevis, setVfxPrevis] = useState<VfxPrevisStatus | null>(null);
  const [stunt, setStunt] = useState<StuntStatus | null>(null);
  const [scriptSupervisorPrep, setScriptSupervisorPrep] = useState<ScriptSupervisorPrepStatus | null>(null);
  // Production
  const [photography, setPhotography] = useState<PhotographyStatus | null>(null);
  const [onSetSound, setOnSetSound] = useState<OnSetSoundStatus | null>(null);
  const [continuity, setContinuity] = useState<ContinuityStatus | null>(null);
  // Post-production
  const [conform, setConform] = useState<ConformStatus | null>(null);
  const [dailies, setDailies] = useState<DailiesStatus | null>(null);
  const [pictureLock, setPictureLock] = useState<PictureLockStatus | null>(null);
  const [vfxReview, setVfxReview] = useState<VfxReviewStatus | null>(null);
  const [finalMix, setFinalMix] = useState<FinalMixStatus | null>(null);
  const [deliverables, setDeliverables] = useState<DeliverablesStatus | null>(null);
  // Distribution / post-release
  const [musicLicensing, setMusicLicensing] = useState<MusicLicensingStatus | null>(null);
  const [qc, setQc] = useState<QCStatus | null>(null);
  const [dcp, setDcp] = useState<DCPStatus | null>(null);
  const [sales, setSales] = useState<SalesStatus | null>(null);
  const [theatrical, setTheatrical] = useState<TheatricalStatus | null>(null);
  const [pressKit, setPressKit] = useState<PressKitStatus | null>(null);
  const [international, setInternational] = useState<InternationalStatus | null>(null);
  const [awards, setAwards] = useState<AwardsStatus | null>(null);
  const [archive, setArchive] = useState<ArchiveStatus | null>(null);
  // Engines (PART B)
  const [cinemaEngine, setCinemaEngine] = useState<CinemaEngineStatus | null>(null);
  const [marketingEngine, setMarketingEngine] = useState<MarketingEngineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AggregatorResponse;
        if (!cancelled) {
          setProgress(data.creativeSteps);
          setPostProduction(data.postProduction);
          setDistribution(data.distribution);
          setSchedule(data.schedule);
          setBudget(data.budget);
          setCasting(data.casting);
          setLocations(data.locations);
          setRehearsals(data.rehearsals);
          setIngest(data.ingest);
          setTitles(data.titles);
          setFestivals(data.festivals);
          setMarketing(data.marketing);
          setBoxOffice(data.boxOffice);
          setReviews(data.reviews);
          setAssembly(data.assembly);
          // Sprint 19 — Development Phase
          setIdea(data.idea);
          setResearch(data.research);
          setRights(data.rights);
          setPitch(data.pitch);
          setFinancing(data.financing);
          // Sprint 10 — Pre-production Ops
          setContracts(data.contracts);
          setTalentContracts(data.talentContracts);
          setCrew(data.crew);
          setEquipment(data.equipment);
          setInsurance(data.insurance);
          setProductionOffice(data.productionOffice);
          setDailyReport(data.dailyReport);
          setWrapReport(data.wrapReport);
          // Pre-production creative
          setScriptDoctoring(data.scriptDoctoring);
          setLightingDesign(data.lightingDesign);
          setVfxPrevis(data.vfxPrevis);
          setStunt(data.stunt);
          setScriptSupervisorPrep(data.scriptSupervisorPrep);
          // Production
          setPhotography(data.photography);
          setOnSetSound(data.onSetSound);
          setContinuity(data.continuity);
          // Post-production
          setConform(data.conform);
          setDailies(data.dailies);
          setPictureLock(data.pictureLock);
          setVfxReview(data.vfxReview);
          setFinalMix(data.finalMix);
          setDeliverables(data.deliverables);
          // Distribution / post-release
          setMusicLicensing(data.musicLicensing);
          setQc(data.qc);
          setDcp(data.dcp);
          setSales(data.sales);
          setTheatrical(data.theatrical);
          setPressKit(data.pressKit);
          setInternational(data.international);
          setAwards(data.awards);
          setArchive(data.archive);
          // Engines (PART B)
          setCinemaEngine(data.cinemaEngine);
          setMarketingEngine(data.marketingEngine);
        }
      } catch {
        // Silent fail: keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const currentStep: StepKey | undefined = progress.find(
    (p) => p.status === "in_progress" || p.status === "review",
  )?.key;

  return {
    progress, currentStep, loading,
    postProduction, distribution,
    schedule, budget, casting, locations, rehearsals,
    ingest, titles, festivals, marketing, boxOffice, reviews, assembly,
    // Sprint 19 — Development Phase
    idea, research, rights, pitch, financing,
    // Sprint 10 — Pre-production Ops
    contracts, talentContracts, crew, equipment, insurance, productionOffice,
    dailyReport, wrapReport,
    // Pre-production creative
    scriptDoctoring, lightingDesign, vfxPrevis, stunt, scriptSupervisorPrep,
    // Production
    photography, onSetSound, continuity,
    // Post-production
    conform, dailies, pictureLock, vfxReview, finalMix, deliverables,
    // Distribution / post-release
    musicLicensing, qc, dcp, sales, theatrical, pressKit, international, awards, archive,
    // Engines (PART B)
    cinemaEngine, marketingEngine,
  };
}

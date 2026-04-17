import type { ContentCategory, ContentMetrics } from "@marionette/types-content";

/**
 * Polymorphic metrics renderer.
 * Each category maps to a different set of KPIs.
 * This is the Sprint 8 "category-polymorphic metrics" delivery point.
 */

function fmtInt(n?: number) {
  return n != null ? n.toLocaleString("ko-KR") : "—";
}
function fmtPct(n?: number) {
  return n != null ? `${(n * 100).toFixed(1)}%` : "—";
}
function fmtMoney(n?: number) {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `₩${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₩${(n / 1_000_000).toFixed(1)}M`;
  return `₩${n.toLocaleString("ko-KR")}`;
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      className="rounded border p-3"
      style={{
        borderColor: "var(--studio-border)",
        backgroundColor: "var(--studio-bg-surface)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--studio-text-dim)" }}>
        {label}
      </div>
      <div
        className="mt-1 text-xl font-bold"
        style={{ color: accent ?? "var(--studio-text)" }}
      >
        {value}
      </div>
    </div>
  );
}

export function MetricsWidget({
  category,
  metrics,
}: {
  category: ContentCategory;
  metrics: ContentMetrics;
}) {
  if (category === "film") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <KPI label="박스오피스" value={fmtMoney(metrics.box_office)} accent="#d4af37" />
        <KPI label="관객수" value={fmtInt(metrics.admissions)} />
        <KPI label="페스티벌" value={`${metrics.festival_selections?.length ?? 0}건`} />
        {metrics.festival_selections && metrics.festival_selections.length > 0 && (
          <div
            className="col-span-3 rounded border p-3 text-xs"
            style={{
              borderColor: "var(--studio-border)",
              color: "var(--studio-text-dim)",
            }}
          >
            {metrics.festival_selections.join(" · ")}
          </div>
        )}
      </div>
    );
  }

  if (category === "drama") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <KPI label="평점" value={metrics.rating != null ? `${metrics.rating}/10` : "—"} accent="#60a5fa" />
        <KPI label="OTT 순위" value={metrics.ott_rank != null ? `#${metrics.ott_rank}` : "—"} />
        <KPI label="완주율" value={fmtPct(metrics.episode_completion_rate)} />
      </div>
    );
  }

  if (category === "commercial") {
    return (
      <div className="grid grid-cols-4 gap-3">
        <KPI label="CPM" value={metrics.cpm != null ? `₩${metrics.cpm.toLocaleString()}` : "—"} />
        <KPI label="CTR" value={fmtPct(metrics.ctr)} accent="#4ade80" />
        <KPI label="전환율" value={fmtPct(metrics.conversion_rate)} />
        <KPI label="브랜드 상승" value={fmtPct(metrics.brand_lift)} accent="#fbbf24" />
      </div>
    );
  }

  // youtube
  return (
    <div className="grid grid-cols-3 gap-3">
      <KPI label="조회수" value={fmtInt(metrics.views)} accent="#f87171" />
      <KPI label="시청 시간" value={metrics.watch_time_hours != null ? `${fmtInt(metrics.watch_time_hours)}h` : "—"} />
      <KPI label="구독자 +" value={fmtInt(metrics.subscribers_gained)} />
      <KPI label="RPM" value={metrics.rpm != null ? `$${metrics.rpm.toFixed(2)}` : "—"} />
      <KPI label="썸네일 CTR" value={fmtPct(metrics.thumbnail_ctr)} accent="#4ade80" />
    </div>
  );
}

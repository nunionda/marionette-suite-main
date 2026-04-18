import Link from "next/link";
import { mockEntries } from "@/lib/mock-entries";
import { rollup } from "@/lib/metrics-aggregator";

const labels: Record<string, string> = {
  film: "영화",
  drama: "드라마",
  commercial: "광고",
  youtube: "유튜브",
};

export default function DashboardPage() {
  const rolls = rollup(mockEntries);
  const total = mockEntries.length;

  return (
    <div className="min-h-screen">
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--studio-border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wider">LIBRARY DASHBOARD</h1>
            <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
              카테고리별 성과 요약 · 총 {total}개 작품
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <Link href="/" className="underline opacity-70 hover:opacity-100">
              📚 Library
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:4001"}/projects`}
              className="underline opacity-70 hover:opacity-100"
            >
              ← Hub
            </a>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rolls.map((r) => (
            <section
              key={r.category}
              className="rounded border p-5"
              style={{
                borderColor: "var(--studio-border)",
                backgroundColor: "var(--studio-bg-surface)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{labels[r.category]}</h2>
                <span
                  className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "var(--studio-text-dim)",
                    border: "1px solid var(--studio-border)",
                  }}
                >
                  {r.count} 작품
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {r.headline.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded border p-3"
                    style={{
                      borderColor: "var(--studio-border)",
                      backgroundColor: "var(--studio-bg-elevated)",
                    }}
                  >
                    <div
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color: "var(--studio-text-dim)" }}
                    >
                      {kpi.label}
                    </div>
                    <div className="mt-1 text-lg font-bold" style={{ color: kpi.accent }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section
          className="mt-6 rounded border p-5"
          style={{
            borderColor: "var(--studio-border)",
            backgroundColor: "var(--studio-bg-surface)",
          }}
        >
          <h3
            className="mb-3 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--studio-text-dim)" }}
          >
            Polymorphism at Work
          </h3>
          <p className="text-sm" style={{ color: "var(--studio-text-dim)" }}>
            이 대시보드는{" "}
            <span style={{ color: "var(--studio-text)" }}>
              카테고리별로 다른 KPI 세트
            </span>
            를 렌더링합니다. 영화는 박스오피스, 드라마는 OTT 순위, 광고는 CTR,
            유튜브는 조회수 — 하나의{" "}
            <code
              className="rounded px-1 font-mono text-[11px]"
              style={{
                backgroundColor: "var(--studio-bg-hover)",
                color: "var(--studio-text)",
              }}
            >
              ContentMetrics
            </code>{" "}
            타입 위에 polymorphic 렌더링 계층이 얹혀 있습니다. 카테고리가 추가되면{" "}
            <code
              className="rounded px-1 font-mono text-[11px]"
              style={{
                backgroundColor: "var(--studio-bg-hover)",
                color: "var(--studio-text)",
              }}
            >
              metrics-aggregator.ts
            </code>
            와{" "}
            <code
              className="rounded px-1 font-mono text-[11px]"
              style={{
                backgroundColor: "var(--studio-bg-hover)",
                color: "var(--studio-text)",
              }}
            >
              MetricsWidget.tsx
            </code>{" "}
            만 확장하면 됩니다.
          </p>
        </section>
      </main>
    </div>
  );
}

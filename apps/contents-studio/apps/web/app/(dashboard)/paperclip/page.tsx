import { STUDIOS, PAPERCLIP_PROJECTS, recommendStudio, health } from "@marionette/paperclip-bridge";

const PRIORITY_COLOR: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#6b7280",
};

function fmtBudget(krw: number): string {
  const billion = krw / 1_000_000_000;
  return `₩${billion.toFixed(0)}억`;
}

export default async function PaperclipPage() {
  const hq = await health();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--font-anton, serif)" }}
          >
            Paperclip HQ
          </h1>
          <span
            className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: hq.status === "ok" ? "#052e16" : "#1c1917",
              color: hq.status === "ok" ? "#4ade80" : "#78716c",
              border: `1px solid ${hq.status === "ok" ? "#166534" : "#44403c"}`,
            }}
          >
            {hq.status === "ok" ? "● ONLINE" : "○ OFFLINE"} · {hq.host}
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted, #707070)" }}>
          3개 스튜디오 · Marionette 프로덕션 오케스트레이션
        </p>
      </div>

      {/* Studios */}
      <section className="mb-8">
        <h2
          className="mb-3 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--color-muted, #707070)" }}
        >
          Studios
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {STUDIOS.map((studio) => (
            <div
              key={studio.code}
              className="rounded-lg border p-4"
              style={{
                borderColor: "var(--color-border, #1e1e1e)",
                background: "var(--color-bg-2, #111)",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">{studio.emoji}</span>
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "monospace",
                    background: "#0f0f0f",
                    color: "var(--color-green, #00FF41)",
                    border: "1px solid #1e1e1e",
                  }}
                >
                  {studio.code}
                </span>
              </div>
              <p
                className="mb-0.5 text-sm font-semibold"
                style={{ color: "var(--color-white, #f0f0f0)" }}
              >
                {studio.name}
              </p>
              <p
                className="mb-3 text-[11px]"
                style={{ color: "var(--color-muted, #707070)" }}
              >
                {studio.role}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px]"
                  style={{ color: "var(--color-subtle, #505050)" }}
                >
                  {studio.agentCount} agents
                </span>
                <div className="flex gap-1">
                  {studio.defaultFor.map((cat) => (
                    <span
                      key={cat}
                      className="rounded px-1.5 py-0.5 text-[8px] uppercase tracking-wide"
                      style={{
                        background: "#1a1a1a",
                        color: "var(--color-muted, #707070)",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2
          className="mb-3 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--color-muted, #707070)" }}
        >
          Active Projects
        </h2>
        <div className="rounded-lg border" style={{ borderColor: "var(--color-border, #1e1e1e)" }}>
          {PAPERCLIP_PROJECTS.map((project, i) => {
            const studio = STUDIOS.find((s) => s.code === project.ownerStudio)!;
            return (
              <div
                key={project.id}
                className="flex items-center gap-4 px-4 py-3"
                style={{
                  borderBottom:
                    i < PAPERCLIP_PROJECTS.length - 1
                      ? "1px solid var(--color-border, #1e1e1e)"
                      : "none",
                  background: i % 2 === 0 ? "transparent" : "#0a0a0a",
                }}
              >
                {/* Priority */}
                <span
                  className="w-6 shrink-0 text-center text-[10px] font-bold"
                  style={{ color: PRIORITY_COLOR[project.priority] }}
                >
                  {project.priority}
                </span>

                {/* ID */}
                <span
                  className="w-16 shrink-0 text-[10px]"
                  style={{
                    fontFamily: "monospace",
                    color: "var(--color-subtle, #505050)",
                  }}
                >
                  {project.id}
                </span>

                {/* Title + genre */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-white, #f0f0f0)" }}
                  >
                    {project.title}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--color-muted, #707070)" }}
                  >
                    {project.genre}
                  </p>
                </div>

                {/* Budget */}
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{ color: "#d4af37" }}
                >
                  {fmtBudget(project.budgetKRW)}
                </span>

                {/* Studio badge */}
                <span
                  className="shrink-0 text-[10px]"
                  style={{
                    fontFamily: "monospace",
                    color: "var(--color-muted, #707070)",
                  }}
                >
                  {studio.emoji} {project.ownerStudio}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommend studio */}
      <section>
        <h2
          className="mb-3 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--color-muted, #707070)" }}
        >
          Studio Routing Logic
        </h2>
        <div
          className="rounded-lg border p-4 text-[11px]"
          style={{
            borderColor: "var(--color-border, #1e1e1e)",
            background: "#0a0a0a",
            fontFamily: "monospace",
            color: "var(--color-muted, #707070)",
            lineHeight: 1.8,
          }}
        >
          {(["film", "drama", "commercial", "youtube"] as const).map((cat) => {
            const small = recommendStudio(cat);
            const big = recommendStudio(cat, 35_000_000_000);
            return (
              <div key={cat}>
                <span style={{ color: "var(--color-green, #00FF41)" }}>{cat}</span>
                {" → "}
                <span style={{ color: "#d4af37" }}>{small}</span>
                {big !== small && (
                  <span style={{ color: "var(--color-subtle, #505050)" }}>
                    {" "}(≥35억: <span style={{ color: "#60a5fa" }}>{big}</span>)
                  </span>
                )}
              </div>
            );
          })}
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "1px solid var(--color-border, #1e1e1e)" }}
          >
            <span style={{ color: "var(--color-subtle, #505050)" }}>
              Sprint 9+: dispatch() → http://127.0.0.1:3100/api (currently offline)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

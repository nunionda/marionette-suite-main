"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  PostProject,
  EditCut,
  VFXShot,
  SoundReel,
  ColorReel,
  DeliveryItem,
} from "@/lib/mock-data";

type TabKey = "edit" | "vfx" | "sound" | "color" | "delivery";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "edit", label: "Edit", icon: "✂️" },
  { key: "vfx", label: "VFX", icon: "✨" },
  { key: "sound", label: "Sound", icon: "🎚" },
  { key: "color", label: "Color", icon: "🎨" },
  { key: "delivery", label: "Delivery", icon: "📦" },
];

interface Props {
  projects: PostProject[];
  edit: EditCut[];
  vfx: VFXShot[];
  sound: SoundReel[];
  color: ColorReel[];
  delivery: DeliveryItem[];
}

export function PostStudioClient(props: Props) {
  const [activeProject, setActiveProject] = useState(props.projects[0]?.id ?? "");
  const [tab, setTab] = useState<TabKey>("edit");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("paperclipId");
    if (pid && props.projects.some((p) => p.id === pid)) {
      setActiveProject(pid);
    }
  }, [props.projects]);

  const project = props.projects.find((p) => p.id === activeProject);
  const filter = <T extends { projectId: string }>(arr: T[]) =>
    arr.filter((x) => x.projectId === activeProject);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--studio-border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wider">POST STUDIO</h1>
            <p className="text-xs" style={{ color: "var(--studio-text-dim)" }}>
              편집 · VFX · 사운드 · 컬러 · 납품
            </p>
          </div>
          <a
            href="http://localhost:4001/projects"
            className="text-xs underline opacity-70 hover:opacity-100"
          >
            ← Hub
          </a>
        </div>
      </header>

      <div className="grid grid-cols-[240px_1fr] gap-0">
        {/* Project sidebar */}
        <aside
          className="border-r p-4"
          style={{ borderColor: "var(--studio-border)", minHeight: "calc(100vh - 69px)" }}
        >
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wider opacity-60">
            Projects in POST
          </h2>
          {props.projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className="mb-2 w-full rounded p-3 text-left text-sm transition"
              style={{
                backgroundColor:
                  p.id === activeProject ? "var(--studio-bg-hover)" : "transparent",
                border: "1px solid",
                borderColor:
                  p.id === activeProject
                    ? "var(--studio-accent)"
                    : "var(--studio-border)",
              }}
            >
              <div className="font-semibold">{p.title}</div>
              <div
                className="mt-1 flex items-center gap-2 text-[10px]"
                style={{ color: "var(--studio-text-dim)" }}
              >
                <span>{p.category}</span>
                <span>· {p.studio}</span>
                <span>· edit {p.editProgress}%</span>
              </div>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="p-6">
          {project ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{project.title}</h2>
                <span
                  className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: "var(--studio-accent-muted, #2d2d5a)",
                    color: "var(--studio-accent)",
                  }}
                >
                  POST
                </span>
              </div>

              {/* Tabs */}
              <div
                className="mb-6 flex gap-1 border-b"
                style={{ borderColor: "var(--studio-border)" }}
              >
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="px-4 py-2 text-sm transition"
                    style={{
                      borderBottom: "2px solid",
                      borderBottomColor:
                        tab === t.key ? "var(--studio-accent)" : "transparent",
                      color: tab === t.key ? "var(--studio-text)" : "var(--studio-text-dim)",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "edit" && <EditTab rows={filter(props.edit)} />}
              {tab === "vfx" && <VFXTab rows={filter(props.vfx)} />}
              {tab === "sound" && <SoundTab rows={filter(props.sound)} />}
              {tab === "color" && <ColorTab rows={filter(props.color)} />}
              {tab === "delivery" && <DeliveryTab rows={filter(props.delivery)} project={project} />}
            </>
          ) : (
            <p style={{ color: "var(--studio-text-dim)" }}>No project selected.</p>
          )}
        </main>
      </div>
    </div>
  );
}

/* --- Tab implementations --- */

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "#4ade80",
    locked: "#4ade80",
    delivered: "#4ade80",
    done: "#4ade80",
    review: "#fbbf24",
    online: "#fbbf24",
    encoding: "#fbbf24",
    "in-progress": "#fbbf24",
    wip: "#60a5fa",
    offline: "#a78bfa",
    brief: "#a78bfa",
    pending: "#a78bfa",
    queued: "#a78bfa",
    rejected: "#f87171",
  };
  const c = colors[status] ?? "var(--studio-text-dim)";
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color: c, border: `1px solid ${c}44`, backgroundColor: `${c}11` }}
    >
      {status}
    </span>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded border"
      style={{ borderColor: "var(--studio-border)" }}
    >
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: "var(--studio-bg-hover)",
        color: "var(--studio-text-dim)",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="border-t px-3 py-2" style={{ borderColor: "var(--studio-border)", ...style }}>{children}</td>;
}

function EditTab({ rows }: { rows: EditCut[] }) {
  return (
    <Table>
      <thead><tr><Th>Scene</Th><Th>Duration</Th><Th>Status</Th><Th>Editor</Th><Th>Note</Th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>#{r.sceneNumber}</Td>
            <Td>{r.duration}s</Td>
            <Td><StatusPill status={r.status} /></Td>
            <Td>{r.editor}</Td>
            <Td style={{ color: "var(--studio-text-dim)" }}>{r.note ?? "—"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function VFXTab({ rows }: { rows: VFXShot[] }) {
  return (
    <Table>
      <thead><tr><Th>Shot</Th><Th>Complexity</Th><Th>Vendor</Th><Th>Status</Th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{r.shotCode}</Td>
            <Td>{r.complexity}</Td>
            <Td>{r.vendor}</Td>
            <Td><StatusPill status={r.status} /></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function SoundTab({ rows }: { rows: SoundReel[] }) {
  return (
    <Table>
      <thead><tr><Th>Reel</Th><Th>ADR</Th><Th>Foley</Th><Th>Mix</Th><Th>Status</Th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>R{r.reelNumber}</Td>
            <Td>{r.adr.recorded}/{r.adr.total}</Td>
            <Td><StatusPill status={r.foley} /></Td>
            <Td>{r.mix}</Td>
            <Td><StatusPill status={r.status} /></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function ColorTab({ rows }: { rows: ColorReel[] }) {
  return (
    <Table>
      <thead><tr><Th>Reel</Th><Th>Pass</Th><Th>Colorist</Th><Th>LUT</Th><Th>Status</Th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>R{r.reelNumber}</Td>
            <Td>{r.pass}</Td>
            <Td>{r.colorist}</Td>
            <Td>{r.lut}</Td>
            <Td><StatusPill status={r.status} /></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

type PublishState = "idle" | "loading" | "done" | "error";

function DeliveryTab({ rows, project }: { rows: DeliveryItem[]; project: PostProject }) {
  const [publishState, setPublishState] = useState<PublishState>("idle");

  const hasDelivered = rows.some((r) => r.status === "delivered");
  const channels = rows
    .filter((r) => r.status === "delivered" && r.deliveredTo)
    .map((r) => r.deliveredTo as string);

  const handlePublish = useCallback(async () => {
    setPublishState("loading");
    try {
      const res = await fetch("http://localhost:4003/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          category: project.category,
          studio: project.studio,
          deliverables: project.deliveryFormats,
          channels,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPublishState("done");
    } catch (err) {
      console.error("[post-studio] publish failed:", err);
      setPublishState("error");
    }
  }, [project, channels]);

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <thead><tr><Th>Format</Th><Th>Resolution</Th><Th>Codec</Th><Th>To</Th><Th>Date</Th><Th>Status</Th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.format}</Td>
              <Td>{r.resolution}</Td>
              <Td>{r.codec}</Td>
              <Td>{r.deliveredTo ?? "—"}</Td>
              <Td style={{ color: "var(--studio-text-dim)" }}>{r.deliveryDate ?? "—"}</Td>
              <Td><StatusPill status={r.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="flex items-center gap-3">
        <button
          onClick={publishState === "done" ? undefined : handlePublish}
          disabled={!hasDelivered || publishState === "loading" || publishState === "done"}
          className="rounded px-4 py-2 text-sm font-bold tracking-wide transition disabled:opacity-40"
          style={{
            backgroundColor: publishState === "done" ? "#052e16" : "var(--studio-accent-muted, #1e1b4b)",
            color: publishState === "done" ? "#4ade80" : "var(--studio-accent)",
            border: "1px solid",
            borderColor: publishState === "done" ? "#166534" : "var(--studio-accent)",
            cursor: !hasDelivered || publishState === "loading" || publishState === "done" ? "not-allowed" : "pointer",
          }}
        >
          {publishState === "loading" && "⏳ Publishing…"}
          {publishState === "done" && "✅ Published to Library"}
          {publishState === "error" && "⚠️ Retry Publish"}
          {publishState === "idle" && "📤 Publish to Library"}
        </button>
        {!hasDelivered && (
          <span className="text-[11px]" style={{ color: "var(--studio-text-dim)" }}>
            No delivered items yet — publish unlocks when at least one delivery is done.
          </span>
        )}
        {publishState === "error" && (
          <span className="text-[11px]" style={{ color: "#f87171" }}>
            Content Library offline? Check that :4003 is running.
          </span>
        )}
      </div>
    </div>
  );
}

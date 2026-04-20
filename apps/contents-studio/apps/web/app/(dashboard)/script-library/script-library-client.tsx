"use client";

import { useCallback, useRef, useState } from "react";
import type { ScenarioSummary } from "./page";

interface Props {
  scenarios: ScenarioSummary[];
}

const FORMAT_LABEL: Record<string, string> = {
  fdx: "Final Draft",
  fountain: "Fountain",
  pdf: "PDF",
  text: "Plain Text",
};

const SOURCE_LABEL: Record<string, string> = {
  "script-writer": "CineScript",
  upload: "Upload",
  manual: "Manual",
};

const SOURCE_COLOR: Record<string, string> = {
  "script-writer": "#a78bfa",
  upload: "#34d399",
  manual: "#60a5fa",
};

// ── Simple FDX → plain text stripping ─────────────────────────────────────
function stripFdxToText(xml: string): string {
  // Remove XML tags, keep text content with line breaks
  return xml
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Viewer modal ───────────────────────────────────────────────────────────
function ScenarioViewer({
  scenario,
  onClose,
}: {
  scenario: ScenarioSummary;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (content !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/scenarios/${scenario.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { content: string };
      setContent(data.content);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [scenario.id, content, loading]);

  // Load on mount
  if (content === null && !loading && !error) {
    void loadContent();
  }

  const meta = scenario.metadata;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: 12,
          width: "min(900px, 100%)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>{scenario.title}</h2>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
              {meta?.pageCount && (
                <span style={{ color: "#888", fontSize: "0.8rem" }}>{meta.pageCount} pages</span>
              )}
              {meta?.sceneCount && (
                <span style={{ color: "#888", fontSize: "0.8rem" }}>· {meta.sceneCount} scenes</span>
              )}
              {meta?.characterCount && (
                <span style={{ color: "#888", fontSize: "0.8rem" }}>· {meta.characterCount} characters</span>
              )}
              {meta?.wordCount && (
                <span style={{ color: "#888", fontSize: "0.8rem" }}>· {meta.wordCount.toLocaleString()} words</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #444",
              borderRadius: 6,
              color: "#888",
              cursor: "pointer",
              padding: "0.3rem 0.7rem",
              flexShrink: 0,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "1.5rem", flex: 1 }}>
          {loading && <p style={{ color: "#888", textAlign: "center" }}>Loading screenplay…</p>}
          {error && <p style={{ color: "#ef4444" }}>Error: {error}</p>}
          {content !== null && (
            <pre
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: "#ddd",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Import modal ───────────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: (s: ScenarioSummary) => void }) {
  const [tab, setTab] = useState<"script-writer" | "upload">("script-writer");
  const [swId, setSwId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function importFromScriptWriter() {
    const id = parseInt(swId.trim(), 10);
    if (isNaN(id)) {
      setError("Enter a numeric project ID from CineScript Writer");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/scenarios/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "script-writer", scriptWriterProjectId: id }),
      });
      const data = await res.json() as ScenarioSummary & { error?: string; existing?: { id: string; title: string } };
      if (!res.ok) {
        if (res.status === 409 && data.existing) {
          setError(`Already imported as "${data.existing.title}"`);
        } else {
          setError(data.error ?? `HTTP ${res.status}`);
        }
        return;
      }
      onImported(data);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  }

  async function importFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const raw = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "txt";
      const format = ext === "fdx" ? "fdx" : ext === "fountain" ? "fountain" : "text";
      const content = format === "fdx" ? stripFdxToText(raw) : raw;
      const title = file.name.replace(/\.[^.]+$/, "");

      const res = await fetch("/api/scenarios/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "upload",
          format,
          content,
          title,
          originalFilename: file.name,
        }),
      });
      const data = await res.json() as ScenarioSummary & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      onImported(data);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1.2rem",
    background: active ? "#1a1a1a" : "none",
    border: "none",
    borderBottom: active ? "2px solid #a78bfa" : "2px solid transparent",
    color: active ? "#fff" : "#666",
    cursor: "pointer",
    fontSize: "0.9rem",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: 12,
          width: "min(520px, 100%)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>Import Screenplay</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #222" }}>
          <button style={tabStyle(tab === "script-writer")} onClick={() => setTab("script-writer")}>
            ✍️ From CineScript
          </button>
          <button style={tabStyle(tab === "upload")} onClick={() => setTab("upload")}>
            📁 File Upload
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {tab === "script-writer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, color: "#aaa", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Enter the numeric project ID from CineScript Writer (port 3006). The screenplay will be fetched and stored in the hub database.
              </p>
              <input
                type="number"
                placeholder="Project ID (e.g. 28)"
                value={swId}
                onChange={(e) => setSwId(e.target.value)}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #444",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "0.6rem 0.8rem",
                  fontSize: "0.95rem",
                }}
                onKeyDown={(e) => { if (e.key === "Enter") void importFromScriptWriter(); }}
              />
              <button
                onClick={() => void importFromScriptWriter()}
                disabled={uploading || !swId.trim()}
                style={{
                  background: "#7c3aed",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: uploading ? "wait" : "pointer",
                  fontSize: "0.9rem",
                  opacity: uploading || !swId.trim() ? 0.5 : 1,
                  padding: "0.65rem 1.2rem",
                }}
              >
                {uploading ? "Importing…" : "Import Project"}
              </button>
            </div>
          )}

          {tab === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, color: "#aaa", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Upload a screenplay file. Supported formats: <strong style={{ color: "#ddd" }}>.fountain</strong>, <strong style={{ color: "#ddd" }}>.fdx</strong> (Final Draft), <strong style={{ color: "#ddd" }}>.txt</strong>.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".fountain,.fdx,.txt"
                style={{ display: "none" }}
                onChange={(e) => void importFromFile(e)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  background: "#1a2e1a",
                  border: "2px dashed #34d399",
                  borderRadius: 8,
                  color: "#34d399",
                  cursor: uploading ? "wait" : "pointer",
                  fontSize: "0.9rem",
                  opacity: uploading ? 0.5 : 1,
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                {uploading ? "Importing…" : "Click to choose file (.fountain · .fdx · .txt)"}
              </button>
            </div>
          )}

          {error && (
            <p style={{ margin: "1rem 0 0", color: "#ef4444", fontSize: "0.85rem" }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main client component ──────────────────────────────────────────────────
export function ScriptLibraryClient({ scenarios: initial }: Props) {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>(initial);
  const [viewing, setViewing] = useState<ScenarioSummary | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this scenario? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScenarios((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  function handleImported(s: ScenarioSummary) {
    setScenarios((prev) => [s, ...prev]);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", margin: 0 }}>📚 Script Library</h1>
          <p style={{ color: "#888", marginTop: "0.4rem", fontSize: "0.9rem" }}>
            {scenarios.length} screenplay{scenarios.length !== 1 ? "s" : ""} · imported from CineScript Writer or uploaded files
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          style={{
            background: "#7c3aed",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.9rem",
            padding: "0.65rem 1.2rem",
          }}
        >
          + Import Screenplay
        </button>
      </div>

      {/* Empty state */}
      {scenarios.length === 0 && (
        <div
          style={{
            border: "2px dashed #333",
            borderRadius: 12,
            padding: "4rem 2rem",
            textAlign: "center",
            color: "#555",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <p style={{ margin: 0 }}>No screenplays yet.</p>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
            Import from CineScript Writer or upload a .fountain / .fdx file.
          </p>
        </div>
      )}

      {/* Scenario grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {scenarios.map((s) => {
          const meta = s.metadata;
          return (
            <div
              key={s.id}
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 10,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {/* Title + source badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    margin: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textDecorationColor: "#555",
                  }}
                  onClick={() => setViewing(s)}
                >
                  {s.title}
                </h3>
                <span
                  style={{
                    background: SOURCE_COLOR[s.source] + "22",
                    border: `1px solid ${SOURCE_COLOR[s.source]}55`,
                    borderRadius: 4,
                    color: SOURCE_COLOR[s.source],
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.5rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {SOURCE_LABEL[s.source] ?? s.source}
                </span>
              </div>

              {/* Metadata pills */}
              {meta && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {meta.pageCount != null && (
                    <span style={{ color: "#aaa", fontSize: "0.78rem" }}>{meta.pageCount}p</span>
                  )}
                  {meta.sceneCount != null && (
                    <span style={{ color: "#aaa", fontSize: "0.78rem" }}>· {meta.sceneCount} scenes</span>
                  )}
                  {meta.characterCount != null && (
                    <span style={{ color: "#aaa", fontSize: "0.78rem" }}>· {meta.characterCount} chars</span>
                  )}
                  {meta.wordCount != null && (
                    <span style={{ color: "#aaa", fontSize: "0.78rem" }}>· {meta.wordCount.toLocaleString()}w</span>
                  )}
                </div>
              )}

              {/* Format + date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#666", fontSize: "0.75rem" }}>
                  {FORMAT_LABEL[s.format] ?? s.format}
                  {s.sourceRef ? ` · ref ${s.sourceRef}` : ""}
                </span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>
                  {new Date(s.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                <button
                  onClick={() => setViewing(s)}
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #4444aa",
                    borderRadius: 6,
                    color: "#a0a0ff",
                    cursor: "pointer",
                    flex: 1,
                    fontSize: "0.8rem",
                    padding: "0.4rem",
                  }}
                >
                  View
                </button>
                <button
                  onClick={() => void handleDelete(s.id)}
                  disabled={deleting === s.id}
                  style={{
                    background: "none",
                    border: "1px solid #441111",
                    borderRadius: 6,
                    color: "#cc4444",
                    cursor: deleting === s.id ? "wait" : "pointer",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.8rem",
                    opacity: deleting === s.id ? 0.5 : 1,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
      {viewing && <ScenarioViewer scenario={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

import React, { useState } from "react";

interface ProjectCreatorProps {
  onSubmit: (data: { title: string; category: string; genre: string; logline: string; idea: string }) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const categories = [
  { id: "film", label: "Film", icon: "🎬", desc: "Full 14-agent Hollywood pipeline" },
  { id: "drama-series", label: "Drama Series", icon: "📺", desc: "Episodic production with continuity" },
  { id: "commercial", label: "Commercial", icon: "📢", desc: "Fast 7-agent ad pipeline" },
  { id: "youtube", label: "YouTube", icon: "▶️", desc: "Minimal 5-agent content pipeline" },
];

const fonts = {
  title: "'Playfair Display', serif",
  body: "'Inter', sans-serif",
  data: "'Space Grotesk', monospace",
};

const colors = {
  gold: "#D4AF37",
  silver: "#A8A9AD",
  cardBg: "rgba(18,18,18,0.95)",
  border: "rgba(255,255,255,0.08)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.data,
  fontSize: 11,
  color: colors.silver,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const textBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: colors.silver,
  fontFamily: fonts.body,
  fontSize: 14,
  cursor: "pointer",
  padding: "8px 16px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  color: "#fff",
  fontFamily: fonts.body,
  fontSize: 14,
  outline: "none",
};

export default function ProjectCreator({ onSubmit, onCancel, isOpen }: ProjectCreatorProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [logline, setLogline] = useState("");
  const [idea, setIdea] = useState("");

  if (!isOpen) return null;

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), category, genre, logline, idea });
    setStep(1);
    setCategory("");
    setTitle("");
    setGenre("");
    setLogline("");
    setIdea("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: colors.cardBg,
          backdropFilter: "blur(24px)",
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 36,
          width: 520,
          maxWidth: "90vw",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: fonts.title, fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
            New Project
          </h2>
          <p style={{ fontFamily: fonts.data, fontSize: 11, color: colors.silver, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Step {step} of 2 — {step === 1 ? "Category" : "Details"}
          </p>
        </div>

        {step === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {categories.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      background: selected ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${selected ? colors.gold : colors.border}`,
                      borderRadius: 14,
                      padding: "20px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      boxShadow: selected ? `0 0 20px rgba(212,175,55,0.15)` : "none",
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{cat.icon}</span>
                    <div style={{ fontFamily: fonts.title, fontSize: 16, fontWeight: 700, color: selected ? colors.gold : "#fff", marginTop: 8 }}>
                      {cat.label}
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.silver, marginTop: 4, lineHeight: 1.4 }}>
                      {cat.desc}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                onClick={onCancel}
                style={textBtnStyle}
              >
                Cancel
              </button>
              <button
                onClick={() => category && setStep(2)}
                disabled={!category}
                style={{
                  background: category ? colors.gold : "rgba(212,175,55,0.3)",
                  color: "#000",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 28px",
                  fontFamily: fonts.body,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: category ? "pointer" : "not-allowed",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Genre
              </label>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Sci-Fi, Thriller, Comedy"
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Logline
              </label>
              <input
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="One-sentence summary"
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your creative vision..."
                rows={3}
                style={{ ...inputStyle, marginTop: 6, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button
                onClick={() => setStep(1)}
                style={textBtnStyle}
              >
                ← Back
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={onCancel}
                  style={textBtnStyle}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    background: canSubmit ? colors.gold : "rgba(212,175,55,0.3)",
                    color: "#000",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 28px",
                    fontFamily: fonts.body,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

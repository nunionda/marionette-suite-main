"use client";

import React from "react";

type AgentStatus = "idle" | "running" | "queued" | "completed" | "failed" | "error";

interface StageCardProps {
  title: string;
  status: AgentStatus;
  progress: number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const STATUS_CONFIG: Record<AgentStatus, {
  dot: string;
  bg: string;
  border: string;
  text: string;
  label: string;
}> = {
  running: {
    dot: "#00FF41",
    bg: "rgba(0,255,65,0.06)",
    border: "rgba(0,255,65,0.25)",
    text: "#00FF41",
    label: "RUNNING",
  },
  queued: {
    dot: "#F59E0B",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.25)",
    text: "#F59E0B",
    label: "QUEUED",
  },
  completed: {
    dot: "#484848",
    bg: "rgba(72,72,72,0.12)",
    border: "rgba(72,72,72,0.35)",
    text: "#F0F0F0",
    label: "COMPLETE",
  },
  failed: {
    dot: "#C0392B",
    bg: "#1A0808",
    border: "rgba(192,57,43,0.35)",
    text: "#C0392B",
    label: "ERROR",
  },
  error: {
    dot: "#C0392B",
    bg: "#1A0808",
    border: "rgba(192,57,43,0.35)",
    text: "#C0392B",
    label: "ERROR",
  },
  idle: {
    dot: "#505050",
    bg: "transparent",
    border: "#1E1E1E",
    text: "#707070",
    label: "IDLE",
  },
};

export function StageCard({ title, status, progress, icon, onClick }: StageCardProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const isError = status === "failed" || status === "error";
  const isRunning = status === "running";

  return (
    <div
      onClick={onClick}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: "2px",
      }}
      className={`flex flex-col gap-3 p-4 transition-colors${onClick ? " cursor-pointer" : ""}${
        onClick ? " hover:brightness-125" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: cfg.dot,
              flexShrink: 0,
              ...(isRunning
                ? { animation: "ms-pulse 1.4s ease-in-out infinite" }
                : {}),
            }}
          />
          {icon && (
            <span className="text-sm leading-none" style={{ color: "#707070" }}>
              {icon}
            </span>
          )}
          <h3
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              color: "#F0F0F0",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Status label */}
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-geist-mono, monospace)",
            color: cfg.text,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 2,
          background: "#1E1E1E",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: isError ? "#C0392B" : isRunning ? "#00FF41" : cfg.dot,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Progress percentage */}
      <div
        className="text-[10px]"
        style={{
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "#505050",
          marginTop: -8,
        }}
      >
        {progress}%
      </div>

      <style>{`
        @keyframes ms-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

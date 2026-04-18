"use client";

import React from "react";

export interface PipelineNode {
  id: string;
  type: "agent" | "input" | "output" | "branch";
  agentId?: string;
  label: string;
  position: { x: number; y: number };
  params: Record<string, unknown>;
  status: "idle" | "queued" | "running" | "completed" | "failed" | "skipped";
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
}

interface NodeGraphViewerProps {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const STATUS_COLORS: Record<PipelineNode["status"], string> = {
  idle: "#A8A9AD",
  queued: "#A8A9AD",
  running: "#3498DB",
  completed: "#27AE60",
  failed: "#C0392B",
  skipped: "#3C3C3E",
};

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const SMALL_NODE_WIDTH = 120;
const SMALL_NODE_HEIGHT = 40;

function getNodeSize(type: PipelineNode["type"]) {
  const isSmall = type === "input" || type === "output";
  return {
    w: isSmall ? SMALL_NODE_WIDTH : NODE_WIDTH,
    h: isSmall ? SMALL_NODE_HEIGHT : NODE_HEIGHT,
  };
}

export default function NodeGraphViewer({
  nodes,
  edges,
  onNodeClick,
}: NodeGraphViewerProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Compute canvas size from node positions
  let maxX = 0;
  let maxY = 0;
  for (const n of nodes) {
    const { w, h } = getNodeSize(n.type);
    maxX = Math.max(maxX, n.position.x + w + 40);
    maxY = Math.max(maxY, n.position.y + h + 40);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "auto",
        background: "#0a0a0a",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ position: "relative", minWidth: maxX, minHeight: maxY }}>
        {/* SVG edges layer */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {edges.map((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;
            const srcSize = getNodeSize(src.type);
            const tgtSize = getNodeSize(tgt.type);
            const x1 = src.position.x + srcSize.w / 2;
            const y1 = src.position.y + srcSize.h / 2;
            const x2 = tgt.position.x + tgtSize.w / 2;
            const y2 = tgt.position.y + tgtSize.h / 2;
            // Bezier curve for smoother edges
            const mx = (x1 + x2) / 2;
            return (
              <path
                key={edge.id}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(212,175,55,0.3)"
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* Node layer */}
        {nodes.map((node) => {
          const { w, h } = getNodeSize(node.type);
          const borderColor =
            node.type === "agent" ? "#D4AF37" : "#A8A9AD";
          const statusColor = STATUS_COLORS[node.status];
          const isRunning = node.status === "running";

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick?.(node.id)}
              style={{
                position: "absolute",
                left: node.position.x,
                top: node.position.y,
                width: w,
                height: h,
                borderRadius: 8,
                border: `1.5px solid ${borderColor}`,
                background: "rgba(26,26,26,0.9)",
                cursor: onNodeClick ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transition: "box-shadow 0.3s ease",
                boxShadow: isRunning
                  ? `0 0 12px ${statusColor}40`
                  : "none",
                animation: isRunning
                  ? "node-pulse 2s ease-in-out infinite"
                  : "none",
              }}
            >
              <span
                style={{
                  fontSize: node.type === "agent" ? 12 : 10,
                  fontFamily:
                    "'Inter', -apple-system, sans-serif",
                  color: "#E1E1E1",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: w - 16,
                }}
              >
                {node.label}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily:
                    "'JetBrains Mono', monospace",
                  color: statusColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {node.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Keyframe for pulsing running nodes */}
      <style>{`
        @keyframes node-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

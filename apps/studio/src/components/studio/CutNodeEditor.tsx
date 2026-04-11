'use client';
import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type OnNodesChange,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ScriptNode } from './nodes/ScriptNode';
import { ImagePromptNode } from './nodes/ImagePromptNode';
import { ImageGenNode } from './nodes/ImageGenNode';
import { ImagePickNode } from './nodes/ImagePickNode';
import { VideoPromptNode } from './nodes/VideoPromptNode';
import { VideoGenNode } from './nodes/VideoGenNode';
import { AudioNode } from './nodes/AudioNode';
import { FinalCutNode } from './nodes/FinalCutNode';
import { NodePreviewPanel } from './NodePreviewPanel';
import {
  buildInitialNodes,
  buildInitialEdges,
  loadNodePositions,
  saveNodePositions,
} from '@/lib/studio/flow-data';

// nodeTypes MUST be defined outside the component to prevent React Flow edge flicker
const nodeTypes = {
  scriptNode: ScriptNode,
  imagePromptNode: ImagePromptNode,
  imageGenNode: ImageGenNode,
  imagePickNode: ImagePickNode,
  videoPromptNode: VideoPromptNode,
  videoGenNode: VideoGenNode,
  audioNode: AudioNode,
  finalCutNode: FinalCutNode,
};

interface Cut {
  slug: string;
  displayId: string;
}

interface Props {
  projectId: string;
  sceneSlug: string;
  cutSlug: string;
  script: string;
  displayId: string;
  prevCut: Cut | null;
  nextCut: Cut | null;
  cutIndex: number;
  cutTotal: number;
}

export function CutNodeEditor({
  projectId,
  sceneSlug,
  cutSlug,
  script,
  displayId,
  prevCut,
  nextCut,
  cutIndex,
  cutTotal,
}: Props) {
  const initialNodes = useMemo(() => {
    const nodes = buildInitialNodes(cutSlug, displayId, script);
    const saved = loadNodePositions(cutSlug);
    if (saved) {
      return nodes.map((n) => ({
        ...n,
        position: saved[n.id] ?? n.position,
      }));
    }
    return nodes;
  }, [cutSlug, displayId, script]);

  const initialEdges = useMemo(() => buildInitialEdges(cutSlug), [cutSlug]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Persist positions after drag
      setNodes((nds) => {
        saveNodePositions(cutSlug, nds);
        return nds;
      });
    },
    [onNodesChange, setNodes, cutSlug]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const cutUrl = (slug: string) =>
    `/projects/${projectId}/scenes/${sceneSlug}/cuts/${slug}`;

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--studio-bg)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 border-b border-[var(--studio-border)]"
        style={{ height: 48, background: 'var(--studio-bg-elevated)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <a
            href={`/projects/${projectId}`}
            className="text-[11px] text-[var(--studio-text-muted)] hover:text-[var(--studio-text-dim)] transition-colors"
          >
            ← Project
          </a>
          <span className="text-[var(--studio-border)]">/</span>
          <a
            href={`/projects/${projectId}/scenes/${sceneSlug}`}
            className="text-[11px] text-[var(--studio-text-muted)] hover:text-[var(--studio-text-dim)] transition-colors"
          >
            Scene
          </a>
          <span className="text-[var(--studio-border)]">/</span>
          <span className="text-[11px] text-[var(--studio-text-dim)] font-mono">{displayId}</span>
        </div>
        <span className="text-[10px] text-[var(--studio-text-muted)] uppercase tracking-widest">
          Cut Node Editor
        </span>
      </div>

      {/* Main split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas — 65% */}
        <div style={{ flex: '0 0 65%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'var(--studio-bg)' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--studio-border)"
            />
            <Controls
              style={{
                background: 'var(--studio-bg-elevated)',
                border: '1px solid var(--studio-border)',
                borderRadius: 8,
              }}
            />
            <MiniMap
              style={{
                background: 'var(--studio-bg-elevated)',
                border: '1px solid var(--studio-border)',
                borderRadius: 8,
              }}
              nodeColor="var(--studio-accent)"
            />
          </ReactFlow>
        </div>

        {/* Preview panel — 35% */}
        <div
          style={{
            flex: '0 0 35%',
            borderLeft: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className="px-4 border-b border-[var(--studio-border)]"
            style={{ height: 40, display: 'flex', alignItems: 'center', flexShrink: 0, background: 'var(--studio-bg-elevated)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--studio-text-muted)]">
              Node Preview
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <NodePreviewPanel node={selectedNode} />
          </div>
        </div>
      </div>

      {/* Bottom cut navigation bar */}
      <div
        className="flex items-center justify-between px-4 border-t border-[var(--studio-border)]"
        style={{ height: 44, background: 'var(--studio-bg-elevated)', flexShrink: 0 }}
      >
        <div>
          {prevCut ? (
            <a
              href={cutUrl(prevCut.slug)}
              className="text-[11px] text-[var(--studio-text-muted)] hover:text-[var(--studio-text-dim)] transition-colors flex items-center gap-1"
            >
              ← <span className="font-mono">{prevCut.displayId}</span>
            </a>
          ) : (
            <span className="text-[11px] text-[var(--studio-border)]">←</span>
          )}
        </div>

        <span className="text-[11px] text-[var(--studio-text-muted)]">
          Cut <span className="font-mono text-[var(--studio-text-dim)]">{cutIndex}</span>
          {' '}/ <span className="font-mono">{cutTotal}</span>
        </span>

        <div>
          {nextCut ? (
            <a
              href={cutUrl(nextCut.slug)}
              className="text-[11px] text-[var(--studio-text-muted)] hover:text-[var(--studio-text-dim)] transition-colors flex items-center gap-1"
            >
              <span className="font-mono">{nextCut.displayId}</span> →
            </a>
          ) : (
            <span className="text-[11px] text-[var(--studio-border)]">→</span>
          )}
        </div>
      </div>
    </div>
  );
}

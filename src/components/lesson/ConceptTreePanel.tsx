'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Panel,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ConceptTreeNode } from '@/lib/ai/schemas';
import { parseConceptNodeId } from '@/core/moduleConceptTree';
import type { LearnerProfile } from '@/types/progress';

function confidenceColor(score: number | undefined): string {
  if (typeof score !== 'number') return '#94a3b8';
  if (score >= 75) return '#22c55e';
  if (score >= 45) return '#818cf8';
  return '#f59e0b';
}

function kindLabel(kind: ConceptTreeNode['kind']): string {
  if (kind === 'topic') return 'Main topic';
  if (kind === 'subtopic') return 'Subtopic';
  if (kind === 'concept') return 'Concept';
  return 'Node';
}

interface TreeNodeData {
  label: string;
  kind: ConceptTreeNode['kind'];
  confidence?: number;
  isDone: boolean;
  node: ConceptTreeNode;
  hasChildren: boolean;
  isExpanded: boolean;
  /** Set when filtering/focus dims non-matching nodes */
  isDimmed?: boolean;
  /** Toggle expand/collapse for this branch (chevron control) */
  onToggleBranch?: (nodeId: string) => void;
}

function CustomTreeNode({
  data,
  selected,
  isDimmed,
}: {
  data: TreeNodeData;
  selected: boolean;
  isDimmed?: boolean;
}) {
  const isDone = data.isDone;
  const confColor = confidenceColor(data.confidence);

  return (
    <div
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: selected ? '2px solid #818cf8' : '1px solid rgba(99,102,241,0.35)',
        background: selected 
          ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 100%)'
          : isDimmed 
            ? 'rgba(15,23,42,0.4)'
            : 'rgba(15,23,42,0.85)',
        boxShadow: selected 
          ? '0 0 16px rgba(129,140,248,0.35), 0 2px 6px rgba(0,0,0,0.25)' 
          : '0 1px 4px rgba(0,0,0,0.2)',
        opacity: isDimmed ? 0.35 : 1,
        minWidth: 90,
        textAlign: 'center',
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#818cf8', width: 6, height: 6 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isDimmed ? '#64748b' : '#e2e8f0' }}>
          {data.label}
        </span>
        {data.hasChildren && (
          <button
            type="button"
            className="nodrag nopan"
            title={data.isExpanded ? 'Collapse branch' : 'Expand branch'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              data.onToggleBranch?.(data.node.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              fontSize: '0.65rem',
              color: isDimmed ? '#64748b' : '#a5b4fc',
              fontWeight: 700,
              border: 'none',
              background: 'rgba(99,102,241,0.15)',
              borderRadius: '4px',
              padding: '0 0.2rem',
              cursor: 'pointer',
              lineHeight: 1.2,
            }}
          >
            {data.isExpanded ? '▼' : '▶'}
          </button>
        )}
        {isDone && (
          <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>✓</span>
        )}
        {data.confidence !== undefined && !isDimmed && (
          <span style={{ fontSize: '0.55rem', color: confColor, fontWeight: 600 }}>
            {data.confidence}%
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#818cf8', width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  customTreeNode: CustomTreeNode,
};

function tutoringStepIdForNode(
  node: ConceptTreeNode,
  jumpableStepIds: Set<string> | undefined,
  anchorStepId: string,
): string {
  if (node.kind === 'subtopic' && jumpableStepIds?.has(node.id)) return node.id;
  if (node.kind === 'concept') {
    const p = parseConceptNodeId(node.id);
    if (p?.stepId && jumpableStepIds?.has(p.stepId)) return p.stepId;
  }
  if (jumpableStepIds?.has(node.id)) return node.id;
  return anchorStepId;
}

type ChatTurn = { role: 'user' | 'assistant'; content: string };

function buildNodeChatIntro(n: ConceptTreeNode): string {
  const lines: string[] = [];
  lines.push(`Here’s everything we have on this ${kindLabel(n.kind).toLowerCase()} in your map.`);
  lines.push('');
  if (n.summary?.trim()) {
    lines.push('Summary', n.summary.trim(), '');
  }
  if (n.insight?.trim()) {
    lines.push('Insight', n.insight.trim(), '');
  }
  if (n.detail?.trim()) {
    lines.push('Lesson notes', n.detail.trim(), '');
  }
  if (n.deeperExplanation?.trim()) {
    lines.push('Deeper explanation', n.deeperExplanation.trim(), '');
  }
  if (n.authorNote?.trim()) {
    lines.push('Author note', n.authorNote.trim(), '');
  }
  if (n.prerequisites.length > 0) {
    lines.push('Prerequisites', n.prerequisites.map((p) => `• ${p}`).join('\n'), '');
  }
  lines.push('—', 'Ask a follow-up below. I’ll use this context plus your lesson.');
  return lines.join('\n').trim();
}

function NodeDetailModal({
  node,
  onClose,
  jumpableStepIds,
  onJumpToLesson,
  moduleId,
  moduleTitle,
  anchorStepId,
  learnerProfile,
}: {
  node: ConceptTreeNode | null;
  onClose: () => void;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
  moduleId: string;
  moduleTitle: string;
  anchorStepId: string;
  learnerProfile: LearnerProfile;
}) {
  const [followQuestion, setFollowQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatTurn[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!node) {
      setChatMessages([]);
      return;
    }
    setChatMessages([{ role: 'assistant', content: buildNodeChatIntro(node) }]);
    setFollowQuestion('');
    setFollowError(null);
    setFollowLoading(false);
  }, [node?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!node) return null;

  const currentNode = node;
  const parsed = parseConceptNodeId(currentNode.id);
  let jumpStepId: string | undefined;
  if (currentNode.kind === 'concept') jumpStepId = parsed?.stepId;
  else if (currentNode.kind === 'subtopic') jumpStepId = currentNode.id;
  else jumpStepId = parsed?.stepId;
  if (!jumpStepId && jumpableStepIds?.has(currentNode.id)) jumpStepId = currentNode.id;
  const canJump = Boolean(jumpStepId && jumpableStepIds?.has(jumpStepId) && onJumpToLesson);

  const tutorStepId = tutoringStepIdForNode(currentNode, jumpableStepIds, anchorStepId);
  const canAsk = Boolean(moduleId && tutorStepId);

  async function sendFollowUp() {
    const q = followQuestion.trim();
    if (!q || !moduleId || !tutorStepId || followLoading) return;
    setFollowLoading(true);
    setFollowError(null);
    setChatMessages((prev) => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setFollowQuestion('');
    const context = [
      `[Mind map — ${currentNode.kind ?? 'node'}: "${currentNode.title}"]`,
      currentNode.summary ? `Summary: ${currentNode.summary}` : '',
      currentNode.detail ? `Lesson notes:\n${currentNode.detail}` : '',
      currentNode.deeperExplanation ? `Deeper explanation:\n${currentNode.deeperExplanation}` : '',
      currentNode.authorNote ? `Author note:\n${currentNode.authorNote}` : '',
      currentNode.insight ? `Insight:\n${currentNode.insight}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    const message = `${context}\n\n---\nLearner follow-up question:\n${q}`;

    try {
      const res = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          moduleTitle,
          stepId: tutorStepId,
          level: 'standard',
          message,
          learnerProfile: {
            weakConcepts: learnerProfile.weakConcepts,
            strongConcepts: learnerProfile.strongConcepts,
            skillByConcept: learnerProfile.skillByConcept,
            preferredPace: learnerProfile.preferredPace,
          },
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? res.statusText);
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setChatMessages((prev) => {
            const next = [...prev];
            if (next.length === 0) return next;
            next[next.length - 1] = { role: 'assistant', content: acc };
            return next;
          });
        }
      }
    } catch (e) {
      setFollowError(e instanceof Error ? e.message : 'Request failed');
      setChatMessages((prev) => (prev.length >= 2 ? prev.slice(0, -2) : prev));
    } finally {
      setFollowLoading(false);
    }
  }

  function handleComposerKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendFollowUp();
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        padding: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Node chat"
        style={{
          background: 'linear-gradient(180deg, rgba(30,27,75,0.97) 0%, rgba(15,23,42,0.99) 100%)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '18px',
          width: 'min(720px, 100%)',
          height: 'min(88vh, 820px)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 28px 64px rgba(0,0,0,0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flexShrink: 0,
            padding: '1rem 1.1rem',
            borderBottom: '1px solid rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 700, letterSpacing: '0.08em' }}>
              {kindLabel(node.kind).toUpperCase()} · {moduleTitle}
            </div>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', color: '#f8fafc', fontWeight: 800, lineHeight: 1.25 }}>
              {node.title}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
            {canJump && jumpStepId && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onJumpToLesson?.(jumpStepId)}
                style={{ whiteSpace: 'nowrap' }}
              >
                Open guided lesson →
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: '8px',
                padding: '0.35rem 0.55rem',
                color: '#c7d2fe',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '92%',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.86rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: msg.role === 'user' ? '#f1f5f9' : '#e2e8f0',
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.45) 0%, rgba(79,70,229,0.35) 100%)'
                      : 'rgba(15,23,42,0.75)',
                  border:
                    msg.role === 'user'
                      ? '1px solid rgba(165,180,252,0.45)'
                      : '1px solid rgba(99,102,241,0.22)',
                }}
              >
                {msg.role === 'assistant' && i === 0 && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.35rem' }}>
                    EXPLANATION
                  </div>
                )}
                {msg.role === 'assistant' && i > 0 && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.35rem' }}>
                    TUTOR
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e0e7ff', marginBottom: '0.35rem' }}>
                    YOU
                  </div>
                )}
                {msg.content || (msg.role === 'assistant' && followLoading ? '…' : '')}
              </div>
            </div>
          ))}
          {followError && (
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', padding: '0 0.25rem' }}>{followError}</div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(99,102,241,0.28)',
            padding: '0.85rem 1rem 1rem',
            background: 'rgba(15,23,42,0.92)',
          }}
        >
          {!canAsk && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
              Tutor follow-up needs a linked lesson step. Use the map from a module with steps, or open the guided
              lesson first.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <textarea
              value={followQuestion}
              onChange={(e) => setFollowQuestion(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={
                canAsk
                  ? 'Ask the tutor anything about this node… (Enter to send, Shift+Enter for newline)'
                  : 'Follow-up unavailable for this node'
              }
              rows={2}
              disabled={followLoading || !canAsk}
              style={{
                flex: 1,
                resize: 'none',
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.3)',
                background: 'rgba(15,23,42,0.9)',
                color: '#f1f5f9',
                fontSize: '0.88rem',
                padding: '0.55rem 0.7rem',
                fontFamily: 'inherit',
                lineHeight: 1.45,
                minHeight: '48px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              className="btn btn--primary"
              disabled={followLoading || !canAsk || !followQuestion.trim()}
              onClick={() => void sendFollowUp()}
              style={{ flexShrink: 0, padding: '0.55rem 1rem', alignSelf: 'stretch' }}
            >
              {followLoading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildRadialTree(
  treeNodes: ConceptTreeNode[],
  completedNodeIds: Set<string>,
  conceptConfidence: Record<string, number> = {},
  expandedNodeIds: Set<string> = new Set<string>()
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!treeNodes || treeNodes.length === 0) return { nodes, edges };

  const root = treeNodes[0];
  const rootId = root.id;
  const centerX = 0;
  const centerY = 0;

  nodes.push({
    id: rootId,
    type: 'customTreeNode',
    position: { x: centerX, y: centerY },
    data: {
      label: root.title,
      kind: root.kind,
      confidence: conceptConfidence[rootId],
      isDone: completedNodeIds.has(rootId),
      node: root,
      hasChildren: (root.children?.length ?? 0) > 0,
      isExpanded: expandedNodeIds.has(rootId),
    },
  });

  function getAllDescendants(node: ConceptTreeNode, level: number = 1): { node: ConceptTreeNode; level: number }[] {
    const result: { node: ConceptTreeNode; level: number }[] = [];
    if (!node.children || node.children.length === 0) return result;

    // Show children only when parent is expanded.
    if (!expandedNodeIds.has(node.id)) return result;

    node.children.forEach((child) => {
      result.push({ node: child, level });
      result.push(...getAllDescendants(child, level + 1));
    });
    return result;
  }

  const allDescendants = getAllDescendants(root);
  const maxLevel = Math.max(...allDescendants.map(d => d.level), 1);

  const nodesByLevel = new Map<number, ConceptTreeNode[]>();
  allDescendants.forEach(({ node, level }) => {
    const arr = nodesByLevel.get(level) || [];
    arr.push(node);
    nodesByLevel.set(level, arr);
  });

  const radiusByLevel = new Map<number, number>();
  const baseRadius = 280;
  for (let level = 1; level <= maxLevel; level++) {
    radiusByLevel.set(level, baseRadius + (level - 1) * 200);
  }

  const levelPositions = new Map<string, { x: number; y: number; level: number }>();

  nodesByLevel.forEach((levelNodes, level) => {
    const radius = radiusByLevel.get(level) || baseRadius;
    const angleStep = (2 * Math.PI) / levelNodes.length;

    levelNodes.forEach((node, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      levelPositions.set(node.id, { x, y, level });

      nodes.push({
        id: node.id,
        type: 'customTreeNode',
        position: { x, y },
        data: {
          label: node.title,
          kind: node.kind,
          confidence: conceptConfidence[node.id],
          isDone: completedNodeIds.has(node.id),
          node: node,
          hasChildren: (node.children?.length ?? 0) > 0,
          isExpanded: expandedNodeIds.has(node.id),
        },
      });
    });
  });

  function connectParentToChildren(parentId: string, children: ConceptTreeNode[]) {
    children.forEach((child) => {
      const parentPos = parentId === rootId 
        ? { x: centerX, y: centerY }
        : levelPositions.get(parentId);
      const childPos = levelPositions.get(child.id);

      if (parentPos && childPos) {
        edges.push({
          id: `e-${parentId}-${child.id}`,
          source: parentId,
          target: child.id,
          type: 'smoothstep',
          style: { stroke: 'rgba(129, 140, 248, 0.4)', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(129, 140, 248, 0.4)' },
        });
      }

      if (child.children && child.children.length > 0 && expandedNodeIds.has(child.id)) {
        connectParentToChildren(child.id, child.children);
      }
    });
  }

  if (root.children && root.children.length > 0 && expandedNodeIds.has(rootId)) {
    connectParentToChildren(rootId, root.children);
  }

  return { nodes, edges };
}

function countAllNodes(node: ConceptTreeNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += countAllNodes(child);
    });
  }
  return count;
}

type FilterType = 'all' | 'not-completed' | 'low-confidence';

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function collectTreeNodeIds(tree: ConceptTreeNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (n: ConceptTreeNode) => {
    ids.add(n.id);
    for (const ch of n.children ?? []) walk(ch);
  };
  for (const root of tree) walk(root);
  return ids;
}

/** Exposed to toolbar without subscribing TreeContent to the React Flow store (avoids update-depth loops). */
type ConceptTreeViewportApi = {
  setViewport: (viewport: { x: number; y: number; zoom: number }, options?: { duration?: number }) => void;
};

/** React Flow canvas; remounted per `moduleId` so switching modules resets viewport cleanly. */
function ConceptTreeFlowCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  viewportApiRef,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (e: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick: (e: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  viewportApiRef: MutableRefObject<ConceptTreeViewportApi | null>;
}) {
  const rf = useReactFlow();
  const rfRef = useRef(rf);
  rfRef.current = rf;
  const fitViewRef = useRef(rf.fitView);
  fitViewRef.current = rf.fitView;

  useEffect(() => {
    viewportApiRef.current = {
      setViewport: (viewport, options) => rfRef.current.setViewport(viewport, options),
    };
    return () => {
      viewportApiRef.current = null;
    };
  }, [viewportApiRef]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      fitViewRef.current({ padding: 0.4, duration: 300 });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={initialEdges}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      minZoom={0.15}
      maxZoom={3}
      defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      nodesDraggable={false}
      nodesConnectable={false}
      panOnScroll
      zoomOnScroll
    >
      <Background color="rgba(129,140,248,0.08)" gap={30} />
      <Controls
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '8px',
        }}
      />
      <MiniMap
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '8px',
        }}
        nodeColor={(node) => {
          const data = node.data as TreeNodeData;
          if (data.isDone) return 'rgba(34,197,94,0.6)';
          if (typeof data.confidence === 'number' && data.confidence < 45) return 'rgba(245,158,11,0.5)';
          return 'rgba(129,140,248,0.5)';
        }}
      />
    </ReactFlow>
  );
}

function TreeContent({
  treeNodes,
  completedNodeIds,
  expandedNodeIds,
  conceptConfidence = {},
  conceptTrends,
  modelName,
  generatedAt,
  isCached,
  onExpandedChange,
  jumpableStepIds,
  onJumpToLesson,
  moduleId,
  moduleTitle,
  anchorStepId,
  learnerProfile,
}: {
  treeNodes: ConceptTreeNode[];
  completedNodeIds?: Set<string>;
  expandedNodeIds?: string[];
  conceptConfidence?: Record<string, number>;
  conceptTrends?: Record<string, string>;
  modelName?: string;
  generatedAt?: string;
  isCached?: boolean;
  onExpandedChange?: (nodeIds: string[]) => void;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
  moduleId: string;
  moduleTitle: string;
  anchorStepId: string;
  learnerProfile: LearnerProfile;
}) {
  const [selectedNode, setSelectedNode] = useState<ConceptTreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [focusMode, setFocusMode] = useState(false);
  const [expandedNodeIdSet, setExpandedNodeIdSet] = useState<Set<string>>(new Set<string>());
  const viewportApiRef = useRef<ConceptTreeViewportApi | null>(null);
  const nodeClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedIdsKey = useMemo(() => {
    if (!completedNodeIds || completedNodeIds.size === 0) return '';
    return [...completedNodeIds].sort().join('|');
  }, [completedNodeIds]);

  const doneIds = useMemo(() => {
    if (!completedNodeIds) return new Set<string>();
    return new Set(completedNodeIds);
  }, [completedIdsKey]);

  const allNodes = useMemo(() => {
    return buildRadialTree(treeNodes, doneIds, conceptConfidence, expandedNodeIdSet);
  }, [treeNodes, doneIds, conceptConfidence, expandedNodeIdSet]);

  const expandedIdsKey = useMemo(() => (expandedNodeIds ?? []).join('|'), [expandedNodeIds]);
  const lastExpandedIdsKeyRef = useRef<string | null>(null);

  /** Sync from parent when storage changes; when only the tree shape changes, prune/merge without clobbering local expansion. */
  useEffect(() => {
    const rootId = treeNodes?.[0]?.id;
    if (!rootId) return;
    const validIds = collectTreeNodeIds(treeNodes);
    const incoming = expandedNodeIds ?? [];
    const base = incoming.length > 0 ? incoming : [rootId];
    const fromParent = new Set<string>();
    for (const id of base) {
      if (validIds.has(id)) fromParent.add(id);
    }
    if (fromParent.size === 0) fromParent.add(rootId);

    const keyChanged = lastExpandedIdsKeyRef.current !== expandedIdsKey;
    lastExpandedIdsKeyRef.current = expandedIdsKey;

    setExpandedNodeIdSet((prev) => {
      if (keyChanged) {
        return setsEqual(prev, fromParent) ? prev : fromParent;
      }
      const next = new Set<string>(fromParent);
      for (const id of prev) {
        if (validIds.has(id)) next.add(id);
      }
      if (next.size === 0) next.add(rootId);
      return setsEqual(prev, next) ? prev : next;
    });
  }, [expandedIdsKey, treeNodes, expandedNodeIds]);

  const stats = useMemo(() => {
    const total = treeNodes && treeNodes.length > 0 ? countAllNodes(treeNodes[0]) : 0;
    const completed = doneIds.size;
    const lowConfidence = Object.entries(conceptConfidence).filter(
      ([, score]) => typeof score === 'number' && score < 45
    ).length;
    return { total, completed, lowConfidence };
  }, [treeNodes, doneIds, conceptConfidence]);

  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    
    allNodes.nodes?.forEach?.(node => {
      const data = node.data as TreeNodeData;
      const matchesSearch = searchQuery 
        ? data.label.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'not-completed' && !data.isDone) ||
        (filter === 'low-confidence' && typeof data.confidence === 'number' && data.confidence < 45);
      
      if (!matchesSearch || !matchesFilter) {
        hidden.add(node.id);
      }
    });
    
    return hidden;
  }, [allNodes, searchQuery, filter]);

  const focusedNodeId = focusMode && selectedNode ? selectedNode.id : null;

  const toggleBranchExpand = useCallback(
    (nodeId: string) => {
      setExpandedNodeIdSet((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        onExpandedChange?.([...next]);
        return next;
      });
    },
    [onExpandedChange],
  );

  const clearNodeClickTimer = useCallback(() => {
    if (nodeClickTimerRef.current) {
      clearTimeout(nodeClickTimerRef.current);
      nodeClickTimerRef.current = null;
    }
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as TreeNodeData;
    clearNodeClickTimer();
    nodeClickTimerRef.current = setTimeout(() => {
      nodeClickTimerRef.current = null;
      setSelectedNode(nodeData.node);
    }, 280);
  }, [clearNodeClickTimer]);

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      clearNodeClickTimer();
      const nodeData = node.data as TreeNodeData;
      if (!nodeData.hasChildren) return;
      toggleBranchExpand(node.id);
    },
    [clearNodeClickTimer, toggleBranchExpand],
  );

  const onPaneClick = useCallback(() => {
    clearNodeClickTimer();
    setSelectedNode(null);
  }, [clearNodeClickTimer]);

  useEffect(() => () => clearNodeClickTimer(), [clearNodeClickTimer]);

  const visibleNodes = useMemo(() => {
    return allNodes?.nodes?.map?.(node => ({
      ...node,
      data: {
        ...node.data,
        isDimmed: focusedNodeId && node.id !== focusedNodeId && !hiddenNodeIds.has(node.id),
        onToggleBranch: toggleBranchExpand,
      },
    })) ?? [];
  }, [allNodes, focusedNodeId, hiddenNodeIds, toggleBranchExpand]);

  /** React Flow only applies initial `nodes` on mount; remount when tree shape changes (e.g. AI lesson map). */
  const reactFlowMountKey = useMemo(() => {
    let total = 0;
    const childCounts: number[] = [];
    const walk = (n: ConceptTreeNode) => {
      total++;
      const kids = n.children ?? [];
      childCounts.push(kids.length);
      for (const ch of kids) walk(ch);
    };
    for (const root of treeNodes) walk(root);
    return `${moduleId}:${total}:${childCounts.join('.')}`;
  }, [moduleId, treeNodes]);

  const handleResetView = useCallback(() => {
    viewportApiRef.current?.setViewport({ x: 0, y: 0, zoom: 0.5 }, { duration: 400 });
  }, []);

  const handleExport = useCallback(() => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    import('html-to-image').then(({ toPng }) => {
      toPng(flowElement, {
        backgroundColor: '#0f172a',
        filter: (node) => {
          const exclusionClasses = ['react-flow__minimap', 'react-flow__controls'];
          return !exclusionClasses.some(cls => node.classList?.contains(cls));
        },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'knowledge-tree.png';
        link.href = dataUrl;
        link.click();
      });
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Node chat modal: never change map selection / tutor context from keys here.
      if (target?.closest('[aria-label="Node chat"]')) return;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'Home' || e.key === 'End') return;

      const isArrow =
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp';
      if (!isArrow) return;

      if (!selectedNode) return;

      const currentNodeIds = visibleNodes.map((n) => n.id);
      const currentIdx = currentNodeIds.indexOf(selectedNode.id);
      if (currentIdx < 0 || currentNodeIds.length === 0) return;

      let nextIdx = currentIdx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = (currentIdx + 1) % currentNodeIds.length;
      } else {
        nextIdx = (currentIdx - 1 + currentNodeIds.length) % currentNodeIds.length;
      }

      const nextNodeId = currentNodeIds[nextIdx];
      const nextNodeData = visibleNodes.find((n) => n.id === nextNodeId)?.data as TreeNodeData | undefined;
      if (nextNodeData) {
        setSelectedNode(nextNodeData.node);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedNode, visibleNodes]);

  if (!treeNodes || treeNodes.length === 0) {
    return (
      <div
        style={{
          border: '1px solid rgba(99,102,241,0.22)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          background: 'rgba(15,23,42,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - var(--topnav-height) - 3rem)',
        }}
      >
        <div style={{ fontSize: '1rem', color: '#94a3b8' }}>No concepts available</div>
      </div>
    );
  }

  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div
      style={{
        border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(145deg, rgba(30,27,75,0.3) 0%, rgba(15,23,42,0.9) 100%)',
        boxShadow: '0 12px 26px rgba(2,6,23,0.35)',
        minHeight: 'calc(100vh - var(--topnav-height) - 3rem)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>Knowledge tree</div>
          <span style={{ fontSize: '0.62rem', color: '#64748b', maxWidth: '18rem', lineHeight: 1.35 }}>
            Click for details (or ▶/▼) · double-click also expands/collapses
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 80, height: 6, background: 'rgba(99,102,241,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#818cf8', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{stats.completed}/{stats.total} ({progressPercent}%)</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              fontSize: '0.7rem',
              color: '#e2e8f0',
              width: 100,
              outline: 'none',
            }}
          />
          
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['all', 'not-completed', 'low-confidence'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(129,140,248,0.3)' : 'rgba(15,23,42,0.6)',
                  border: filter === f ? '1px solid #818cf8' : '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.6rem',
                  color: filter === f ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'all' ? 'All' : f === 'not-completed' ? 'To do' : 'Low'}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setFocusMode(!focusMode)}
            style={{
              background: focusMode ? 'rgba(129,140,248,0.3)' : 'rgba(15,23,42,0.6)',
              border: focusMode ? '1px solid #818cf8' : '1px solid rgba(99,102,241,0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.6rem',
              color: focusMode ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Focus
          </button>
          
          <button
            onClick={handleResetView}
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.6rem',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.6rem',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Export
          </button>
        </div>
      </div>

      {(modelName || generatedAt) && (
        <div style={{ fontSize: '0.6rem', color: '#64748b', position: 'absolute', top: '2.5rem', left: '0.75rem', zIndex: 10 }}>
          {modelName ? `Model: ${modelName}` : ''}
          {modelName && generatedAt ? ' • ' : ''}
          {generatedAt ? `Generated: ${new Date(generatedAt).toLocaleTimeString()}` : ''}
          {isCached ? ' • cache hit' : ''}
        </div>
      )}

      <div
        style={{
          height: 'calc(100vh - var(--topnav-height) - 4rem)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <ConceptTreeFlowCanvas
          key={reactFlowMountKey}
          nodes={visibleNodes}
          edges={allNodes.edges ?? []}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          viewportApiRef={viewportApiRef}
        />
      </div>

      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        jumpableStepIds={jumpableStepIds}
        onJumpToLesson={onJumpToLesson}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        anchorStepId={anchorStepId}
        learnerProfile={learnerProfile}
      />
    </div>
  );
}

export function ConceptTreePanel(props: {
  nodes: ConceptTreeNode[];
  moduleId: string;
  moduleTitle: string;
  anchorStepId: string;
  learnerProfile: LearnerProfile;
  completedNodeIds?: Set<string>;
  expandedNodeIds?: string[];
  conceptConfidence?: Record<string, number>;
  conceptTrends?: Record<string, string>;
  modelName?: string;
  generatedAt?: string;
  isCached?: boolean;
  onExpandedChange?: (nodeIds: string[]) => void;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
}) {
  const {
    nodes,
    moduleId,
    moduleTitle,
    anchorStepId,
    learnerProfile,
    completedNodeIds,
    expandedNodeIds,
    conceptConfidence,
    conceptTrends,
    modelName,
    generatedAt,
    isCached,
    onExpandedChange,
    jumpableStepIds,
    onJumpToLesson,
  } = props;

  return (
    <ReactFlowProvider>
      <TreeContent
        treeNodes={nodes}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        anchorStepId={anchorStepId}
        learnerProfile={learnerProfile}
        completedNodeIds={completedNodeIds}
        expandedNodeIds={expandedNodeIds}
        conceptConfidence={conceptConfidence}
        conceptTrends={conceptTrends}
        modelName={modelName}
        generatedAt={generatedAt}
        isCached={isCached}
        onExpandedChange={onExpandedChange}
        jumpableStepIds={jumpableStepIds}
        onJumpToLesson={onJumpToLesson}
      />
    </ReactFlowProvider>
  );
}
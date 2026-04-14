'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
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
          <span style={{ fontSize: '0.65rem', color: isDimmed ? '#64748b' : '#a5b4fc', fontWeight: 700 }}>
            {data.isExpanded ? '▼' : '▶'}
          </span>
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

function NodeDetailModal({
  node,
  onClose,
  jumpableStepIds,
  onJumpToLesson,
}: {
  node: ConceptTreeNode | null;
  onClose: () => void;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!node) return null;

  const parsed = parseConceptNodeId(node.id);
  let jumpStepId: string | undefined;
  if (node.kind === 'concept') jumpStepId = parsed?.stepId;
  else if (node.kind === 'subtopic') jumpStepId = node.id;
  else jumpStepId = parsed?.stepId;
  if (!jumpStepId && jumpableStepIds?.has(node.id)) jumpStepId = node.id;
  const canJump = Boolean(jumpStepId && jumpableStepIds?.has(jumpStepId) && onJumpToLesson);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.98) 100%)',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: '16px',
          padding: '1.5rem',
          maxWidth: 560,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              {kindLabel(node.kind).toUpperCase()}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f1f5f9', fontWeight: 700 }}>
              {node.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: '#a5b4fc',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1rem' }}>
          {node.summary}
        </div>

        {node.insight && (
          <div
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: '#f1f5f9',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(129,140,248,0.3)',
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontWeight: 700, color: '#818cf8', marginRight: '0.4rem' }}>💡 Insight</span>
            {node.insight}
          </div>
        )}

        {node.detail && (
          <div
            style={{
              fontSize: '0.88rem',
              lineHeight: 1.65,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(99,102,241,0.2)',
              marginBottom: '1rem',
              maxHeight: '30vh',
              overflowY: 'auto',
            }}
          >
            {node.detail}
          </div>
        )}

        {node.prerequisites.length > 0 && (
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>Prerequisites: </span>
            {node.prerequisites.join(', ')}
          </div>
        )}

        {canJump && jumpStepId && (
          <button
            type="button"
            className="btn btn--primary"
            style={{ width: '100%', padding: '0.75rem' }}
            onClick={() => onJumpToLesson?.(jumpStepId)}
          >
            Open in guided lesson →
          </button>
        )}
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

function TreeContent({
  treeNodes,
  completedNodeIds,
  conceptConfidence = {},
  modelName,
  generatedAt,
  isCached,
  jumpableStepIds,
  onJumpToLesson,
}: {
  treeNodes: ConceptTreeNode[];
  completedNodeIds?: Set<string>;
  conceptConfidence?: Record<string, number>;
  modelName?: string;
  generatedAt?: string;
  isCached?: boolean;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
}) {
  const [nodesState, setNodes, onNodesChange] = useNodesState([]);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ConceptTreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [focusMode, setFocusMode] = useState(false);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set<string>());
  const { fitView, setViewport, getViewport } = useReactFlow();

  const doneIds = completedNodeIds ?? new Set<string>();

  const allNodes = useMemo(() => {
    return buildRadialTree(treeNodes, doneIds, conceptConfidence, expandedNodeIds);
  }, [treeNodes, doneIds, conceptConfidence, expandedNodeIds]);

  useEffect(() => {
    const rootId = treeNodes?.[0]?.id;
    if (!rootId) return;
    setExpandedNodeIds(new Set<string>([rootId]));
  }, [treeNodes]);

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

  const visibleNodes = useMemo(() => {
    return allNodes?.nodes?.map?.(node => ({
      ...node,
      data: {
        ...node.data,
        isDimmed: focusedNodeId && node.id !== focusedNodeId && !hiddenNodeIds.has(node.id),
      },
    })) ?? [];
  }, [allNodes, focusedNodeId, hiddenNodeIds]);

  useEffect(() => {
    setNodes(visibleNodes);
    setEdges(allNodes?.edges ?? []);
  }, [visibleNodes, allNodes, setNodes, setEdges]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ padding: 0.4, duration: 300 });
    }, 100);
    return () => clearTimeout(timeout);
  }, [treeNodes, fitView]);

  const handleResetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 0.5 }, { duration: 400 });
  }, [setViewport]);

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

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const nodeData = node.data as TreeNodeData;
      setSelectedNode(nodeData.node);
      if (nodeData.hasChildren) {
        setExpandedNodeIds((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
      }
    },
    []
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedNode) return;
      
      const currentNodeIds = visibleNodes.map(n => n.id);
      const currentIdx = currentNodeIds.indexOf(selectedNode.id);
      
      let nextIdx = currentIdx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = (currentIdx + 1) % currentNodeIds.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = (currentIdx - 1 + currentNodeIds.length) % currentNodeIds.length;
      } else {
        return;
      }
      
      const nextNodeId = currentNodeIds[nextIdx];
      const nextNodeData = visibleNodes.find(n => n.id === nextNodeId)?.data as TreeNodeData | undefined;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>Knowledge tree</div>
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
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.15}
          maxZoom={3}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          nodesDraggable={true}
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
      </div>

      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        jumpableStepIds={jumpableStepIds}
        onJumpToLesson={onJumpToLesson}
      />
    </div>
  );
}

export function ConceptTreePanel(props: {
  nodes: ConceptTreeNode[];
  completedNodeIds?: Set<string>;
  conceptConfidence?: Record<string, number>;
  modelName?: string;
  generatedAt?: string;
  isCached?: boolean;
  jumpableStepIds?: Set<string>;
  onJumpToLesson?: (stepId: string) => void;
}) {
  const {
    nodes,
    completedNodeIds,
    conceptConfidence,
    modelName,
    generatedAt,
    isCached,
    jumpableStepIds,
    onJumpToLesson,
  } = props;

  return (
    <ReactFlowProvider>
      <TreeContent
        treeNodes={nodes}
        completedNodeIds={completedNodeIds}
        conceptConfidence={conceptConfidence}
        modelName={modelName}
        generatedAt={generatedAt}
        isCached={isCached}
        jumpableStepIds={jumpableStepIds}
        onJumpToLesson={onJumpToLesson}
      />
    </ReactFlowProvider>
  );
}
'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface LandscapeFn {
  f: (x: number, y: number) => number;
  grad: (x: number, y: number) => [number, number];
  name: string;
  range: number;          // half-width of domain
  heightScale: number;    // visual scaling for z
  startPos: [number, number]; // default start position for optimizer
}

interface OptimizerState {
  pos: [number, number];
  vel: [number, number];
  m: [number, number];     // Adam first moment
  v: [number, number];     // Adam second moment
  cache: [number, number]; // RMSProp cache
  t: number;
  loss: number;
}

type OptimizerType = 'sgd' | 'momentum' | 'rmsprop' | 'adam';
type LandscapeType = 'bowl' | 'ravine' | 'saddle' | 'multimodal' | 'plateau' | 'zigzag' | 'rosenbrock';

export interface LossLandscape3DProps {
  landscape?: LandscapeType;
  optimizer?: OptimizerType;
  optimizers?: OptimizerType[];        // race mode
  startPosition?: { x: number; y: number };

  learningRate?: number;
  momentum?: number;
  beta1?: number;
  beta2?: number;

  showGradientField?: boolean;
  showContours?: boolean;
  showHeatmap?: boolean;
  showLossCurve?: boolean;
  showSaddleMarkers?: boolean;
  showMathPanel?: boolean;
  showLRPulse?: boolean;

  showLRSlider?: boolean;
  showMomentumSlider?: boolean;
  showOptimizerSelector?: boolean;
  showLandscapeSelector?: boolean;
  showAnimation?: boolean;
  showRaceMode?: boolean;
  showBatchSizeSlider?: boolean;
  showScheduleSelector?: boolean;
  showLiveGradientPanel?: boolean;
  showStepCalculator?: boolean;
  showTangentPlane?: boolean;
  interactive?: boolean;

  onLossChange?: (loss: number, step: number) => void;
  onConverged?: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// Landscape Functions
// ═══════════════════════════════════════════════════════════════════

const landscapes: Record<LandscapeType, LandscapeFn> = {
  bowl: {
    f: (x, y) => x * x + y * y,
    grad: (x, y) => [2 * x, 2 * y],
    name: '🍜 Bowl',
    range: 3,
    heightScale: 0.5,
    startPos: [2.5, 2.5],
  },
  ravine: {
    f: (x, y) => 10 * x * x + y * y,
    grad: (x, y) => [20 * x, 2 * y],
    name: '🐍 Ravine',
    range: 3,
    heightScale: 0.15,
    startPos: [0.5, 2.5],
  },
  saddle: {
    f: (x, y) => x * x - y * y,
    grad: (x, y) => [2 * x, -2 * y],
    name: '🏔 Saddle',
    range: 3,
    heightScale: 0.4,
    startPos: [0.1, 0.1],
  },
  multimodal: {
    f: (x, y) => Math.sin(3 * x) * Math.sin(3 * y) + 0.2 * (x * x + y * y),
    grad: (x, y) => [
      3 * Math.cos(3 * x) * Math.sin(3 * y) + 0.4 * x,
      3 * Math.sin(3 * x) * Math.cos(3 * y) + 0.4 * y,
    ],
    name: '🌋 Multi-modal',
    range: 3,
    heightScale: 0.8,
    startPos: [2.0, 2.0],
  },
  plateau: {
    f: (x, y) => 1 - Math.exp(-(x * x + y * y) * 0.3),
    grad: (x, y) => {
      const e = Math.exp(-(x * x + y * y) * 0.3);
      return [0.6 * x * e, 0.6 * y * e];
    },
    name: '🏜 Plateau',
    range: 4,
    heightScale: 3.0,
    startPos: [3.0, 3.0],
  },
  zigzag: {
    f: (x, y) => x * x + 10 * Math.sin(3 * y) * Math.sin(3 * y),
    grad: (x, y) => [2 * x, 60 * Math.sin(3 * y) * Math.cos(3 * y)],
    name: '🎢 Zigzag',
    range: 3,
    heightScale: 0.25,
    startPos: [2.0, 2.0],
  },
  rosenbrock: {
    f: (x, y) => (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x),
    grad: (x, y) => [
      -2 * (1 - x) - 400 * x * (y - x * x),
      200 * (y - x * x),
    ],
    name: '🗻 Rosenbrock',
    range: 2.5,
    heightScale: 0.003,
    startPos: [-2.0, 2.0],
  },
};

// ═══════════════════════════════════════════════════════════════════
// Optimizer Step Functions
// ═══════════════════════════════════════════════════════════════════

function makeInitialState(pos: [number, number], loss: number): OptimizerState {
  return {
    pos: [...pos],
    vel: [0, 0],
    m: [0, 0],
    v: [0, 0],
    cache: [0, 0],
    t: 0,
    loss,
  };
}

function stepOptimizer(
  st: OptimizerState,
  grad: [number, number],
  type: OptimizerType,
  lr: number,
  beta: number,
  beta1: number,
  beta2: number,
  eps = 1e-8,
): OptimizerState {
  const next = { ...st, t: st.t + 1 };

  switch (type) {
    case 'sgd':
      next.pos = [st.pos[0] - lr * grad[0], st.pos[1] - lr * grad[1]];
      break;

    case 'momentum': {
      next.vel = [
        beta * st.vel[0] + lr * grad[0],
        beta * st.vel[1] + lr * grad[1],
      ];
      next.pos = [st.pos[0] - next.vel[0], st.pos[1] - next.vel[1]];
      break;
    }

    case 'rmsprop': {
      next.cache = [
        beta * st.cache[0] + (1 - beta) * grad[0] * grad[0],
        beta * st.cache[1] + (1 - beta) * grad[1] * grad[1],
      ];
      next.pos = [
        st.pos[0] - (lr / (Math.sqrt(next.cache[0]) + eps)) * grad[0],
        st.pos[1] - (lr / (Math.sqrt(next.cache[1]) + eps)) * grad[1],
      ];
      break;
    }

    case 'adam': {
      const t = next.t;
      next.m = [
        beta1 * st.m[0] + (1 - beta1) * grad[0],
        beta1 * st.m[1] + (1 - beta1) * grad[1],
      ];
      next.v = [
        beta2 * st.v[0] + (1 - beta2) * grad[0] * grad[0],
        beta2 * st.v[1] + (1 - beta2) * grad[1] * grad[1],
      ];
      const mHat = [next.m[0] / (1 - Math.pow(beta1, t)), next.m[1] / (1 - Math.pow(beta1, t))];
      const vHat = [next.v[0] / (1 - Math.pow(beta2, t)), next.v[1] / (1 - Math.pow(beta2, t))];
      next.pos = [
        st.pos[0] - (lr / (Math.sqrt(vHat[0]) + eps)) * mHat[0],
        st.pos[1] - (lr / (Math.sqrt(vHat[1]) + eps)) * mHat[1],
      ];
      break;
    }
  }

  return next;
}

// ═══════════════════════════════════════════════════════════════════
// Optimizer colors
// ═══════════════════════════════════════════════════════════════════

const OPTIMIZER_COLORS: Record<OptimizerType, string> = {
  sgd: '#6366f1',
  momentum: '#34d399',
  rmsprop: '#fb923c',
  adam: '#a855f7',
};

const OPTIMIZER_LABELS: Record<OptimizerType, string> = {
  sgd: 'SGD',
  momentum: 'Momentum',
  rmsprop: 'RMSProp',
  adam: 'Adam',
};

// ═══════════════════════════════════════════════════════════════════
// 3D Sub-Components
// ═══════════════════════════════════════════════════════════════════

const GRID_RES = 80;

// ── Terrain Mesh ──
const TerrainMesh = memo(function TerrainMesh({
  landscape,
  showHeatmap,
}: {
  landscape: LandscapeFn;
  showHeatmap: boolean;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      landscape.range * 2,
      landscape.range * 2,
      GRID_RES,
      GRID_RES,
    );

    const pos = geo.attributes.position;
    const colors: number[] = [];
    let maxGrad = 0;

    // First pass: compute heights + gradient magnitudes
    const gradMags: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = landscape.f(x, y) * landscape.heightScale;
      pos.setZ(i, z);

      const g = landscape.grad(x, y);
      const gm = Math.sqrt(g[0] * g[0] + g[1] * g[1]);
      gradMags.push(gm);
      if (gm > maxGrad) maxGrad = gm;
    }

    // Second pass: vertex colors based on gradient magnitude
    for (let i = 0; i < pos.count; i++) {
      const t = maxGrad > 0 ? Math.min(gradMags[i] / maxGrad, 1) : 0;
      if (showHeatmap) {
        // Red(steep) → Blue(flat)
        const r = t;
        const g = 0.15 + (1 - t) * 0.2;
        const b = 1 - t * 0.6;
        colors.push(r, g, b);
      } else {
        // Subtle blue tint
        const elev = Math.max(0, Math.min(1, pos.getZ(i) / 5));
        colors.push(0.08 + elev * 0.15, 0.12 + elev * 0.08, 0.35 + elev * 0.15);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [landscape, showHeatmap]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0.1}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
});

// ── Contour Lines ──
const ContourLines = memo(function ContourLines({
  landscape,
}: {
  landscape: LandscapeFn;
}) {
  const lines = useMemo(() => {
    // Sample terrain and create contour lines at fixed z levels
    const range = landscape.range;
    const res = 60;
    const step = (range * 2) / res;
    const levels = 10;

    // Get min/max z
    let minZ = Infinity, maxZ = -Infinity;
    for (let ix = 0; ix <= res; ix++) {
      for (let iy = 0; iy <= res; iy++) {
        const x = -range + ix * step;
        const y = -range + iy * step;
        const z = landscape.f(x, y) * landscape.heightScale;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }

    // Marching squares for each level (simplified)
    const contourPts: THREE.Vector3[][] = [];
    for (let l = 0; l < levels; l++) {
      const zLevel = minZ + ((maxZ - minZ) * (l + 1)) / (levels + 1);
      const pts: THREE.Vector3[] = [];

      for (let ix = 0; ix < res; ix++) {
        for (let iy = 0; iy < res; iy++) {
          const x0 = -range + ix * step;
          const y0 = -range + iy * step;
          const x1 = x0 + step;
          const y1 = y0 + step;

          const z00 = landscape.f(x0, y0) * landscape.heightScale;
          const z10 = landscape.f(x1, y0) * landscape.heightScale;
          const z01 = landscape.f(x0, y1) * landscape.heightScale;

          // Check horizontal edge
          if ((z00 - zLevel) * (z10 - zLevel) < 0) {
            const t = (zLevel - z00) / (z10 - z00);
            const cx = x0 + t * step;
            pts.push(new THREE.Vector3(cx, -0.01, y0));
          }
          // Check vertical edge
          if ((z00 - zLevel) * (z01 - zLevel) < 0) {
            const t = (zLevel - z00) / (z01 - z00);
            const cy = y0 + t * step;
            pts.push(new THREE.Vector3(x0, -0.01, cy));
          }
        }
      }
      if (pts.length > 0) contourPts.push(pts);
    }
    return contourPts;
  }, [landscape]);

  return (
    <group>
      {lines.map((pts, i) => {
        const posArray = new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]));
        return (
          <points key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[posArray, 3]}
              />
            </bufferGeometry>
            <pointsMaterial color="#4f8fff" size={0.03} transparent opacity={0.4} />
          </points>
        );
      })}
    </group>
  );
});

// ── Gradient Arrows ──
const GradientArrows = memo(function GradientArrows({
  landscape,
}: {
  landscape: LandscapeFn;
}) {
  const arrows = useMemo(() => {
    const range = landscape.range;
    const spacing = range / 4;
    const result: { origin: THREE.Vector3; dir: THREE.Vector3; len: number }[] = [];

    for (let x = -range; x <= range; x += spacing) {
      for (let y = -range; y <= range; y += spacing) {
        const z = landscape.f(x, y) * landscape.heightScale;
        const g = landscape.grad(x, y);
        const gm = Math.sqrt(g[0] * g[0] + g[1] * g[1]);
        if (gm < 0.01) continue;

        // Arrow points downhill (-gradient), lives on the surface
        const dir = new THREE.Vector3(-g[0], 0, -g[1]).normalize();
        const len = Math.min(gm * 0.15, spacing * 0.6);
        result.push({
          origin: new THREE.Vector3(x, z + 0.05, y),
          dir,
          len,
        });
      }
    }
    return result;
  }, [landscape]);

  return (
    <group>
      {arrows.map((a, i) => (
        <arrowHelper
          key={i}
          args={[a.dir, a.origin, a.len, 0xff6b6b, a.len * 0.3, a.len * 0.15]}
        />
      ))}
    </group>
  );
});

// ── Saddle Markers ──
const SaddleMarkers = memo(function SaddleMarkers({
  landscape,
}: {
  landscape: LandscapeFn;
}) {
  const markers = useMemo(() => {
    // Find points where gradient ≈ 0
    const range = landscape.range;
    const spacing = range / 8;
    const result: THREE.Vector3[] = [];

    for (let x = -range; x <= range; x += spacing) {
      for (let y = -range; y <= range; y += spacing) {
        const g = landscape.grad(x, y);
        const gm = Math.sqrt(g[0] * g[0] + g[1] * g[1]);
        if (gm < 0.3) {
          const z = landscape.f(x, y) * landscape.heightScale;
          result.push(new THREE.Vector3(x, z + 0.15, y));
        }
      }
    }
    return result;
  }, [landscape]);

  return (
    <group>
      {markers.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.8} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// ── Optimizer Ball ──
function OptimizerBall({
  state,
  landscape,
  color,
  label,
  showLRPulse,
  lr,
}: {
  state: OptimizerState;
  landscape: LandscapeFn;
  color: string;
  label: string;
  showLRPulse?: boolean;
  lr?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const x = state.pos[0];
  const y = state.pos[1];
  const z = landscape.f(x, y) * landscape.heightScale + 0.12;
  const radius = showLRPulse ? 0.08 + Math.min((lr ?? 0.01) * 0.5, 0.15) : 0.1;

  useFrame(() => {
    if (meshRef.current) {
      // Smooth lerp to target
      meshRef.current.position.lerp(new THREE.Vector3(x, z, y), 0.15);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[x, z, y]}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      <Text
        position={[x, z + 0.25, y]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

// ── Path Trail ──
function PathTrail({
  trail,
  landscape,
  color,
}: {
  trail: [number, number][];
  landscape: LandscapeFn;
  color: string;
}) {
  const points = useMemo(() => {
    return trail.map(([x, y]) => {
      const z = landscape.f(x, y) * landscape.heightScale + 0.05;
      return new THREE.Vector3(x, z, y);
    });
  }, [trail, landscape]);

  const lineGeo = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!lineGeo) return null;

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeo} />
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.7} />
    </line>
  );
}

// ── Camera Adjuster (set initial view on landscape change) ──
function CameraSetup({ range }: { range: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const dist = range * 2.5;
    camera.position.set(dist, dist * 0.8, dist);
    camera.lookAt(0, 0, 0);
  }, [range, camera]);
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export function LossLandscape3D(props: LossLandscape3DProps) {
  const {
    landscape: landscapeKey = 'bowl',
    optimizer: initOptimizer = 'sgd',
    optimizers: initOptimizers,
    startPosition,
    learningRate: initLR = 0.01,
    momentum: initMomentum = 0.9,
    beta1: initBeta1 = 0.9,
    beta2: initBeta2 = 0.999,
    showGradientField = false,
    showContours = false,
    showHeatmap = true,
    showLossCurve = false,
    showSaddleMarkers = false,
    showLRPulse = false,
    showLRSlider = false,
    showMomentumSlider = false,
    showOptimizerSelector = false,
    showLandscapeSelector = false,
    showAnimation = false,
    showRaceMode = false,
    interactive = false,
  } = props;

  // ── State ──
  const [currentLandscape, setCurrentLandscape] = useState<LandscapeType>(landscapeKey);
  const land = landscapes[currentLandscape];

  const [lr, setLr] = useState(initLR);
  const [momentumBeta, setMomentumBeta] = useState(initMomentum);

  // Active optimizers for race mode
  const [activeOptimizers, setActiveOptimizers] = useState<OptimizerType[]>(
    initOptimizers ?? [initOptimizer]
  );

  // Optimizer states — indexed by optimizer type
  const getStartPos = useCallback((): [number, number] => {
    if (startPosition) return [startPosition.x, startPosition.y];
    return [...land.startPos] as [number, number];
  }, [startPosition, land]);

  const initOptimizerStates = useCallback(() => {
    const sp = getStartPos();
    const states: Record<string, OptimizerState> = {};
    for (const opt of activeOptimizers) {
      states[opt] = makeInitialState(sp, land.f(sp[0], sp[1]));
    }
    return states;
  }, [activeOptimizers, getStartPos, land]);

  const [optimizerStates, setOptimizerStates] = useState<Record<string, OptimizerState>>(
    initOptimizerStates
  );
  const [trails, setTrails] = useState<Record<string, [number, number][]>>(() => {
    const t: Record<string, [number, number][]> = {};
    const sp = getStartPos();
    for (const opt of activeOptimizers) {
      t[opt] = [sp];
    }
    return t;
  });

  const [losses, setLosses] = useState<Record<string, number[]>>(() => {
    const l: Record<string, number[]> = {};
    const sp = getStartPos();
    for (const opt of activeOptimizers) {
      l[opt] = [land.f(sp[0], sp[1])];
    }
    return l;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const animRef = useRef<number>(0);
  const lastStepTime = useRef(0);

  // Reset on landscape or optimizer change
  useEffect(() => {
    resetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLandscape, activeOptimizers.join(',')]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setStepCount(0);
    setOptimizerStates(initOptimizerStates());
    const sp = getStartPos();
    const t: Record<string, [number, number][]> = {};
    const l: Record<string, number[]> = {};
    for (const opt of activeOptimizers) {
      t[opt] = [sp];
      l[opt] = [land.f(sp[0], sp[1])];
    }
    setTrails(t);
    setLosses(l);
  }, [initOptimizerStates, getStartPos, activeOptimizers, land]);

  // Single step
  const doStep = useCallback(() => {
    setOptimizerStates(prev => {
      const next = { ...prev };
      const newTrails: Record<string, [number, number][]> = { ...trails };
      const newLosses: Record<string, number[]> = { ...losses };

      for (const opt of activeOptimizers) {
        const st = prev[opt];
        if (!st) continue;

        const g = land.grad(st.pos[0], st.pos[1]);
        const stepped = stepOptimizer(
          st, g, opt as OptimizerType, lr, momentumBeta, initBeta1, initBeta2,
        );

        // Clamp to range
        stepped.pos[0] = Math.max(-land.range, Math.min(land.range, stepped.pos[0]));
        stepped.pos[1] = Math.max(-land.range, Math.min(land.range, stepped.pos[1]));
        stepped.loss = land.f(stepped.pos[0], stepped.pos[1]);

        next[opt] = stepped;

        if (!newTrails[opt]) newTrails[opt] = [];
        newTrails[opt] = [...(trails[opt] ?? []), [...stepped.pos] as [number, number]];

        if (!newLosses[opt]) newLosses[opt] = [];
        newLosses[opt] = [...(losses[opt] ?? []), stepped.loss];
      }

      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        setTrails(newTrails);
        setLosses(newLosses);
        setStepCount(s => {
          const nextStep = s + 1;
          // Fire onLossChange with first optimizer's loss
          const firstOpt = activeOptimizers[0];
          const firstState = next[firstOpt];
          if (firstState && props.onLossChange) {
            props.onLossChange(firstState.loss, nextStep);
          }
          return nextStep;
        });
      }, 0);

      return next;
    });
  }, [activeOptimizers, land, lr, momentumBeta, initBeta1, initBeta2, trails, losses]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (t: number) => {
      if (t - lastStepTime.current > 120) { // ~8 steps/sec
        lastStepTime.current = t;
        doStep();
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, doStep]);

  // Toggle race optimizer
  const toggleRaceOptimizer = useCallback((opt: OptimizerType) => {
    setActiveOptimizers(prev => {
      if (prev.includes(opt)) {
        if (prev.length <= 1) return prev; // need at least one
        return prev.filter(o => o !== opt);
      }
      return [...prev, opt];
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#0a0e27',
      borderRadius: 'var(--radius-md, 8px)',
      overflow: 'hidden',
    }}>
      {/* ── Three.js Canvas ── */}
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45, near: 0.1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#0a0e27'); }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 8, -5]} intensity={0.3} color="#6366f1" />
        <fog attach="fog" args={['#0a0e27', 10, 30]} />

        <CameraSetup range={land.range} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI * 0.48}
        />

        {/* Ground grid */}
        <gridHelper
          args={[land.range * 2, 20, '#1a1a3e', '#1a1a3e']}
          position={[0, -0.02, 0]}
        />

        {/* Terrain */}
        <TerrainMesh landscape={land} showHeatmap={showHeatmap} />

        {/* Contour lines */}
        {showContours && <ContourLines landscape={land} />}

        {/* Gradient arrows */}
        {showGradientField && <GradientArrows landscape={land} />}

        {/* Saddle markers */}
        {showSaddleMarkers && <SaddleMarkers landscape={land} />}

        {/* Optimizer balls */}
        {activeOptimizers.map((opt, i) => {
          const st = optimizerStates[opt];
          if (!st) return null;
          return (
            <OptimizerBall
              key={`${opt}-${i}`}
              state={st}
              landscape={land}
              color={OPTIMIZER_COLORS[opt]}
              label={OPTIMIZER_LABELS[opt]}
              showLRPulse={showLRPulse}
              lr={lr}
            />
          );
        })}

        {/* Path trails */}
        {activeOptimizers.map((opt, i) => (
          <PathTrail
            key={`trail-${opt}-${i}`}
            trail={trails[opt] ?? []}
            landscape={land}
            color={OPTIMIZER_COLORS[opt]}
          />
        ))}
      </Canvas>

      {/* ── 2D Overlay: Controls ── */}
      <div style={{
        position: 'absolute',
        bottom: '0.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        background: 'rgba(10, 14, 39, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '0.4rem 0.75rem',
        zIndex: 10,
      }}>
        {/* Animation controls */}
        {showAnimation && (
          <>
            <button onClick={() => setIsPlaying(p => !p)} style={btnStyle}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={doStep} disabled={isPlaying} style={btnStyle}>
              Step
            </button>
            <button onClick={resetSimulation} style={btnStyle}>
              ↺ Reset
            </button>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              step: {stepCount}
            </span>
          </>
        )}
      </div>

      {/* ── Left Panel: Sliders + Selectors ── */}
      {(showLRSlider || showMomentumSlider || showOptimizerSelector || showLandscapeSelector || showRaceMode) && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          background: 'rgba(10, 14, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '0.6rem',
          zIndex: 10,
          minWidth: '180px',
          maxHeight: 'calc(100% - 4rem)',
          overflowY: 'auto',
        }}>
          {/* Landscape selector */}
          {showLandscapeSelector && (
            <div>
              <label style={labelStyle}>Landscape</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {(Object.keys(landscapes) as LandscapeType[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setCurrentLandscape(k)}
                    style={{
                      ...chipStyle,
                      background: k === currentLandscape ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                      border: k === currentLandscape ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {landscapes[k].name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optimizer selector */}
          {showOptimizerSelector && !showRaceMode && (
            <div>
              <label style={labelStyle}>Optimizer</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {(['sgd', 'momentum', 'rmsprop', 'adam'] as OptimizerType[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setActiveOptimizers([opt])}
                    style={{
                      ...chipStyle,
                      color: OPTIMIZER_COLORS[opt],
                      background: activeOptimizers.includes(opt) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: activeOptimizers.includes(opt) ? `1px solid ${OPTIMIZER_COLORS[opt]}` : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {OPTIMIZER_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Race mode */}
          {showRaceMode && (
            <div>
              <label style={labelStyle}>Race Mode</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {(['sgd', 'momentum', 'rmsprop', 'adam'] as OptimizerType[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleRaceOptimizer(opt)}
                    style={{
                      ...chipStyle,
                      color: OPTIMIZER_COLORS[opt],
                      background: activeOptimizers.includes(opt) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: activeOptimizers.includes(opt) ? `1px solid ${OPTIMIZER_COLORS[opt]}` : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {activeOptimizers.includes(opt) ? '✓ ' : ''}{OPTIMIZER_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LR slider */}
          {showLRSlider && (
            <div>
              <label style={labelStyle}>
                Learning Rate: <span style={{ color: '#6366f1', fontWeight: 600 }}>{lr.toFixed(4)}</span>
              </label>
              <input
                type="range"
                min={-4}
                max={1}
                step={0.01}
                value={Math.log10(lr)}
                onChange={e => setLr(Math.pow(10, parseFloat(e.target.value)))}
                style={sliderStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                <span>0.0001</span>
                <span>10</span>
              </div>
            </div>
          )}

          {/* Momentum slider */}
          {showMomentumSlider && (
            <div>
              <label style={labelStyle}>
                Momentum β: <span style={{ color: '#34d399', fontWeight: 600 }}>{momentumBeta.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={0.99}
                step={0.01}
                value={momentumBeta}
                onChange={e => setMomentumBeta(parseFloat(e.target.value))}
                style={sliderStyle}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Loss Curve Panel ── */}
      {showLossCurve && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '200px',
          height: '130px',
          background: 'rgba(10, 14, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '0.4rem',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontFamily: 'var(--font-heading, sans-serif)' }}>
            LOSS CURVE
          </div>
          <LossCurveChart losses={losses} optimizers={activeOptimizers} />
        </div>
      )}

      {/* ── Math Panel ── */}
      {props.showMathPanel && (
        <div style={{
          position: 'absolute',
          bottom: '3.5rem',
          right: '0.5rem',
          background: 'rgba(10, 14, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '0.5rem 0.6rem',
          zIndex: 10,
          fontFamily: 'monospace',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '230px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
            UPDATE RULE
          </div>
          {activeOptimizers.map(opt => (
            <div key={opt} style={{ marginBottom: '4px', color: OPTIMIZER_COLORS[opt] }}>
              <strong>{OPTIMIZER_LABELS[opt]}:</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
                {opt === 'sgd' && `θ ← θ - ${lr.toFixed(4)} · ∇L`}
                {opt === 'momentum' && `v ← ${momentumBeta}v + ${lr.toFixed(4)}·∇L, θ ← θ - v`}
                {opt === 'rmsprop' && `c ← 0.9c + 0.1·g², θ ← θ - ${lr.toFixed(4)}·g/√c`}
                {opt === 'adam' && `m,v updated, θ ← θ - ${lr.toFixed(4)}·m̂/√v̂`}
              </div>
            </div>
          ))}
          {activeOptimizers.map(opt => {
            const st = optimizerStates[opt];
            if (!st) return null;
            return (
              <div key={`loss-${opt}`} style={{ fontSize: '10px', color: OPTIMIZER_COLORS[opt] }}>
                Loss: {st.loss.toFixed(4)}
              </div>
            );
          })}
        </div>
      )}
      {/* ── Live Gradient Panel (step 6 & 7) ── */}
      {props.showLiveGradientPanel && (() => {
        // Use first optimizer's current position
        const firstOpt = activeOptimizers[0];
        const st = optimizerStates[firstOpt];
        if (!st) return null;
        const [gx, gy] = land.grad(st.pos[0], st.pos[1]);
        const gmag = Math.sqrt(gx * gx + gy * gy);
        return (
          <div style={{
            position: 'absolute',
            bottom: '3.5rem',
            left: '0.5rem',
            background: 'rgba(10,14,39,0.88)',
            backdropFilter: 'blur(10px)',
            borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.3)',
            padding: '0.6rem 0.8rem',
            zIndex: 10,
            fontFamily: 'monospace',
            fontSize: '11px',
            minWidth: '190px',
          }}>
            <div style={{ fontWeight: 700, fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Gradient</div>
            <div style={{ color: '#a5b4fc', marginBottom: 3 }}>θ₁ = <strong style={{ color: '#e2e8f0' }}>{st.pos[0].toFixed(3)}</strong></div>
            <div style={{ color: '#a5b4fc', marginBottom: 3 }}>θ₂ = <strong style={{ color: '#e2e8f0' }}>{st.pos[1].toFixed(3)}</strong></div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '5px 0' }} />
            <div style={{ color: '#f97316', marginBottom: 3 }}>∂L/∂θ₁ = <strong>{gx.toFixed(4)}</strong></div>
            <div style={{ color: '#f97316', marginBottom: 3 }}>∂L/∂θ₂ = <strong>{gy.toFixed(4)}</strong></div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '5px 0' }} />
            <div style={{ color: '#34d399' }}>∇L = [<strong>{gx.toFixed(3)}</strong>, <strong>{gy.toFixed(3)}</strong>]</div>
            <div style={{ color: '#fbbf24', fontSize: 10 }}>|∇L| = {gmag.toFixed(4)}</div>
          </div>
        );
      })()}

      {/* ── Step Calculator Panel (step 8) ── */}
      {props.showStepCalculator && (() => {
        const firstOpt = activeOptimizers[0];
        const st = optimizerStates[firstOpt];
        if (!st) return null;
        const [gx, gy] = land.grad(st.pos[0], st.pos[1]);
        const newθ1 = st.pos[0] - lr * gx;
        const newθ2 = st.pos[1] - lr * gy;
        return (
          <div style={{
            position: 'absolute',
            bottom: '3.5rem',
            right: props.showMathPanel ? '245px' : '0.5rem',
            background: 'rgba(10,14,39,0.88)',
            backdropFilter: 'blur(10px)',
            borderRadius: 10,
            border: '1px solid rgba(251,191,36,0.3)',
            padding: '0.6rem 0.8rem',
            zIndex: 10,
            fontFamily: 'monospace',
            fontSize: '11px',
            minWidth: '220px',
          }}>
            <div style={{ fontWeight: 700, fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step Calculator — θ ← θ − η∇L</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto auto', gap: '2px 4px', alignItems: 'center', fontSize: 10 }}>
              {[['θ₁', st.pos[0], gx, newθ1], ['θ₂', st.pos[1], gy, newθ2]].map(([label, curr, g, next]) => (
                <React.Fragment key={String(label)}>
                  <span style={{ color: '#a5b4fc' }}>{label}:</span>
                  <span style={{ color: '#e2e8f0' }}>{Number(curr).toFixed(3)}</span>
                  <span style={{ color: '#64748b' }}>− {lr.toFixed(4)} ×</span>
                  <span style={{ color: '#f97316' }}>{Number(g).toFixed(3)}</span>
                  <span style={{ color: '#34d399' }}>= {Number(next).toFixed(3)}</span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 6, paddingTop: 5 }}>
              <button
                onClick={doStep}
                disabled={isPlaying}
                style={{ padding: '3px 10px', background: '#6366f133', border: '1px solid #6366f155', borderRadius: 5, color: '#a5b4fc', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Next Step →
              </button>
              <span style={{ marginLeft: 8, color: '#64748b', fontSize: 9 }}>step {stepCount}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Loss Curve Chart (pure SVG, inline)
// ═══════════════════════════════════════════════════════════════════

function LossCurveChart({
  losses,
  optimizers,
}: {
  losses: Record<string, number[]>;
  optimizers: OptimizerType[];
}) {
  const w = 190;
  const h = 95;
  const pad = { top: 5, right: 5, bottom: 15, left: 30 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  // Find global max for y-axis
  let maxLoss = 1;
  let maxSteps = 1;
  for (const opt of optimizers) {
    const l = losses[opt];
    if (!l) continue;
    maxSteps = Math.max(maxSteps, l.length);
    for (const v of l) {
      if (isFinite(v) && v > maxLoss) maxLoss = v;
    }
  }

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + ph} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + ph} x2={pad.left + pw} y2={pad.top + ph} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

      {/* Labels */}
      <text x={pad.left - 3} y={pad.top + 5} fill="rgba(255,255,255,0.35)" fontSize={8} textAnchor="end">
        {maxLoss > 100 ? maxLoss.toFixed(0) : maxLoss.toFixed(2)}
      </text>
      <text x={pad.left + pw} y={h - 2} fill="rgba(255,255,255,0.35)" fontSize={8} textAnchor="end">
        step
      </text>

      {/* Curves */}
      {optimizers.map(opt => {
        const l = losses[opt];
        if (!l || l.length < 2) return null;
        const pts = l.map((v, i) => {
          const x = pad.left + (i / maxSteps) * pw;
          const y = pad.top + ph - (Math.min(v, maxLoss) / maxLoss) * ph;
          return `${x},${y}`;
        });
        return (
          <polyline
            key={opt}
            points={pts.join(' ')}
            fill="none"
            stroke={OPTIMIZER_COLORS[opt]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Shared Styles
// ═══════════════════════════════════════════════════════════════════

const btnStyle: React.CSSProperties = {
  background: 'rgba(99, 102, 241, 0.2)',
  border: '1px solid rgba(99, 102, 241, 0.4)',
  borderRadius: '6px',
  color: '#a5b4fc',
  fontSize: '11px',
  fontWeight: 600,
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'var(--font-heading, sans-serif)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  marginBottom: '2px',
  display: 'block',
  fontFamily: 'var(--font-heading, sans-serif)',
};

const chipStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.7)',
  fontFamily: 'var(--font-heading, sans-serif)',
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: '#6366f1',
  cursor: 'pointer',
};

// ═══════════════════════════════════════════════════════════════════
// OptimizationViz — top-level dispatcher
// Routes to the correct sub-component based on `component` prop.
// This is the export used as Module['Visualization'].
// ═══════════════════════════════════════════════════════════════════

import {
  SlopeExplorer,
  DerivativeExplorer,
  PartialDerivativeSlicer,
  type SlopeExplorerProps,
  type DerivativeExplorerProps,
  type PartialDerivativeSlicerProps,
} from './Calculators';

type OptVizProps = { component?: string } & LossLandscape3DProps & SlopeExplorerProps & DerivativeExplorerProps & PartialDerivativeSlicerProps;

export function OptimizationViz({ component = 'LossLandscape3D', ...rest }: OptVizProps) {
  if (component === 'SlopeExplorer') {
    return <SlopeExplorer {...rest as SlopeExplorerProps} />;
  }
  if (component === 'DerivativeExplorer') {
    return <DerivativeExplorer {...rest as DerivativeExplorerProps} />;
  }
  if (component === 'PartialDerivativeSlicer') {
    return <PartialDerivativeSlicer {...rest as PartialDerivativeSlicerProps} />;
  }
  // Default: the full 3D loss landscape
  return <LossLandscape3D {...rest as LossLandscape3DProps} />;
}

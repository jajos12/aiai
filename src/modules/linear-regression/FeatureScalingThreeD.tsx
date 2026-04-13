'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

/** `compare` = side-by-side (avoid id `split` — can collide with R3F/reconciler edge cases). */
type CompareMode = 'compare' | 'bad' | 'good';

function lossHeight(u: number, v: number, a: number, b: number) {
  return a * u * u + b * v * v;
}

function gradDescentPath(
  a: number,
  b: number,
  start: [number, number],
  lr: number,
  steps: number,
): THREE.Vector3[] {
  let u = start[0];
  let v = start[1];
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < steps; i++) {
    const gu = 2 * a * u;
    const gv = 2 * b * v;
    pts.push(new THREE.Vector3(u, lossHeight(u, v, a, b), v));
    u -= lr * gu;
    v -= lr * gv;
    if (gu * gu + gv * gv < 1e-8) break;
  }
  return pts;
}

function LossBowl({
  a,
  b,
  color,
  emissive,
  segments = 56,
  range = 2.2,
}: {
  a: number;
  b: number;
  color: string;
  emissive: string;
  segments?: number;
  range?: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(range * 2, range * 2, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getZ(i);
      const h = lossHeight(u, v, a, b);
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, [a, b, segments, range]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.12}
        metalness={0.15}
        roughness={0.55}
        side={THREE.DoubleSide}
        transparent
        opacity={0.94}
      />
    </mesh>
  );
}

function PathOnSurface({
  points,
  color,
  animateTip,
}: {
  points: THREE.Vector3[];
  color: string;
  animateTip?: boolean;
}) {
  const tipRef = useRef<THREE.Mesh>(null);
  const t0 = useRef(0);

  useFrame((_, delta) => {
    if (!animateTip || !tipRef.current || points.length < 2) return;
    t0.current += delta * 0.38;
    const u = (t0.current % 1) * (points.length - 1);
    const i = Math.floor(u);
    const f = u - i;
    const p0 = points[i];
    const p1 = points[Math.min(i + 1, points.length - 1)];
    tipRef.current.position.lerpVectors(p0, p1, f);
  });

  if (points.length < 2) return null;

  const end = points[points.length - 1];

  return (
    <group>
      <Line points={points} color={color} lineWidth={2} />
      {animateTip ? (
        <mesh ref={tipRef} position={points[0].clone()}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.55} />
        </mesh>
      ) : (
        <>
          <mesh position={points[0].clone().add(new THREE.Vector3(0, 0.08, 0))}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={end.clone().add(new THREE.Vector3(0, 0.06, 0))}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
          </mesh>
        </>
      )}
    </group>
  );
}

function SceneBlock({
  offsetX,
  a,
  b,
  lr,
  title,
  subtitle,
  pathColor,
  bowlColor,
  emissive,
  animatePath,
}: {
  offsetX: number;
  a: number;
  b: number;
  lr: number;
  title: string;
  subtitle: string;
  pathColor: string;
  bowlColor: string;
  emissive: string;
  animatePath: boolean;
}) {
  const start: [number, number] = [1.35, 1.25];
  const path = useMemo(() => gradDescentPath(a, b, start, lr, 80), [a, b, lr]);

  return (
    <group position={[offsetX, 0, 0]}>
      <LossBowl a={a} b={b} color={bowlColor} emissive={emissive} />
      <PathOnSurface points={path} color={pathColor} animateTip={animatePath} />
      <Text position={[0, 0.15, -2.85]} fontSize={0.22} color="#e2e8f0" anchorX="center" anchorY="bottom" maxWidth={4}>
        {title}
      </Text>
      <Text position={[0, -0.05, -2.85]} fontSize={0.12} color="#94a3b8" anchorX="center" anchorY="top" maxWidth={4.2}>
        {subtitle}
      </Text>
    </group>
  );
}

function ScalingWorld({ mode, animatePaths }: { mode: CompareMode; animatePaths: boolean }) {
  const showBad = mode === 'compare' || mode === 'bad';
  const showGood = mode === 'compare' || mode === 'good';
  const badX = mode === 'compare' ? -3.6 : 0;
  const goodX = mode === 'compare' ? 3.6 : 0;

  return (
    <>
      <ambientLight key="fs-ambient" intensity={0.35} />
      <directionalLight key="fs-dir-main" position={[8, 14, 6]} intensity={1.1} castShadow />
      <directionalLight key="fs-dir-fill" position={[-6, 8, -4]} intensity={0.35} color="#818cf8" />

      <gridHelper key="fs-grid" args={[24, 24, 0x334155, 0x1e293b]} position={[0, -0.02, 0]} />

      {showBad && (
        <SceneBlock
          key="fs-scene-bad"
          offsetX={badX}
          a={22}
          b={0.45}
          lr={0.04}
          title="Mismatched effective scales"
          subtitle="Steep along one axis · many zig-zag steps"
          pathColor="#fb923c"
          bowlColor="#451a03"
          emissive="#7c2d12"
          animatePath={animatePaths}
        />
      )}
      {showGood && (
        <SceneBlock
          key="fs-scene-good"
          offsetX={goodX}
          a={1.2}
          b={1.2}
          lr={0.14}
          title="Balanced (after scaling)"
          subtitle="Rounder bowl · descent aims at the minimum"
          pathColor="#4ade80"
          bowlColor="#14532d"
          emissive="#166534"
          animatePath={animatePaths}
        />
      )}
    </>
  );
}

export default function FeatureScalingThreeD() {
  const [mode, setMode] = useState<CompareMode>('compare');
  const [animatePaths, setAnimatePaths] = useState(true);

  const camPos = useMemo((): [number, number, number] => {
    if (mode === 'compare') return [0, 9.2, 12.5];
    /* Single-bowl modes place geometry at origin — do not offset camera (was wrongly aimed at ±3.6). */
    return [0, 8.6, 11.2];
  }, [mode]);

  return (
    <div className="flex h-full min-h-[420px] w-full flex-col bg-slate-950">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-800 px-3 py-2 md:px-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90">View</span>
        {(
          [
            ['compare', 'Side-by-side'],
            ['bad', 'Narrow valley only'],
            ['good', 'Balanced only'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={`fs-view-${id}`}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={animatePaths}
            onChange={(e) => setAnimatePaths(e.target.checked)}
            className="rounded border-slate-600"
          />
          Animate descent dot
        </label>
      </div>

      <div className="relative min-h-0 flex-1">
        <Canvas key={`fs-canvas-${mode}`} shadows className="h-full w-full" dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={camPos} fov={48} near={0.1} far={80} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={4}
            maxDistance={28}
            maxPolarAngle={Math.PI / 2.05}
            target={[0, 1.05, 0] as [number, number, number]}
          />
          <ScalingWorld mode={mode} animatePaths={animatePaths} />
        </Canvas>
      </div>
    </div>
  );
}

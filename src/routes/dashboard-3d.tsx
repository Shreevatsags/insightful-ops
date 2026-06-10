import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { mockServers } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/dashboard-3d")({ component: Dashboard3D });

type Node = {
  id: string;
  name: string;
  region: string;
  status: string;
  position: [number, number, number];
  load: number;
};

const STATUS_COLOR: Record<string, string> = {
  online: "#4ade80",
  degraded: "#facc15",
  offline: "#ef4444",
};

const EASINGS = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

type EasingName = keyof typeof EASINGS;

function ServerNode({ node, onSelect, selected }: { node: Node; onSelect: (n: Node) => void; selected: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const color = STATUS_COLOR[node.status] ?? "#64748b";
  const height = 0.4 + node.load * 2.4;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.scale.y = THREE.MathUtils.lerp(
        ref.current.scale.y,
        height + Math.sin(t * 2 + node.position[0]) * 0.1,
        0.08,
      );
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.6;
      const s = selected ? 1.15 + Math.sin(t * 3) * 0.05 : 1;
      ringRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={ref}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.45, 0.55, 1, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1.2 : 0.45}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>

      {/* glow ring on ground */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0.7, 0.95, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* vertical beam */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 6, 8]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.7 : 0.15} />
      </mesh>

      <Float speed={2} rotationIntensity={0} floatIntensity={0.4}>
        <Html distanceFactor={10} position={[0, 3.4, 0]} center>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-border bg-popover/90 px-2 py-1 font-mono text-[10px] text-foreground backdrop-blur">
            <span style={{ color }}>●</span> {node.name}
            <span className="ml-1 text-muted-foreground">
              {Math.round(node.load * 100)}%
            </span>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function AnimatedGroup({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) setRendered(true);
  }, [visible]);

  useFrame(() => {
    const target = visible ? 1 : 0;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    ref.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh && Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          if (m.transparent) {
            m.opacity = THREE.MathUtils.lerp(m.opacity, target * (obj.userData.baseOpacity ?? 1), 0.08);
          }
        });
      } else if (obj instanceof THREE.Mesh && obj.material instanceof THREE.Material && obj.material.transparent) {
        (obj.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
          (obj.material as THREE.MeshBasicMaterial).opacity,
          target * (obj.userData.baseOpacity ?? 1),
          0.08,
        );
      }
    });
    if (!visible && ref.current.scale.x < 0.01) setRendered(false);
  });

  if (!rendered) return null;
  return <group ref={ref}>{children}</group>;
}

function AnimatedFog({ visible }: { visible: boolean }) {
  const fogRef = useRef<THREE.Fog>(null!);
  const progress = useRef(visible ? 1 : 0);

  useFrame(() => {
    const target = visible ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, 0.05);
    if (fogRef.current) {
      fogRef.current.near = THREE.MathUtils.lerp(55, 22, progress.current);
      fogRef.current.far = THREE.MathUtils.lerp(80, 55, progress.current);
    }
  });

  return <fog ref={fogRef} attach="fog" args={["#070b15", visible ? 22 : 55, visible ? 55 : 80]} />;
}

function WaveGrid() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const geom = ref.current.geometry as THREE.PlaneGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.4 + t) * 0.15 + Math.cos(y * 0.4 + t * 0.8) * 0.15;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} userData={{ baseOpacity: 0.55 }}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshBasicMaterial color="#2a3a5c" wireframe transparent opacity={0} />
    </mesh>
  );
}

function PulseRing({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame((s) => {
    const t = (s.clock.elapsedTime + delay) % 2.5;
    const k = t / 2.5;
    const scale = 0.5 + k * 4;
    ref.current.scale.set(scale, scale, scale);
    mat.current.opacity = (1 - k) * 0.6;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.5, 48]} />
      <meshBasicMaterial ref={mat} color={color} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function DataPacket({ from, to, speed = 1, color = "#4ade80" }: { from: [number, number, number]; to: [number, number, number]; speed?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const offset = useRef(Math.random());
  useFrame((s) => {
    const k = ((s.clock.elapsedTime * speed * 0.4 + offset.current) % 1);
    // quadratic bezier arc with elevated control point
    const cx = (from[0] + to[0]) / 2;
    const cz = (from[2] + to[2]) / 2;
    const arcH = 3 + Math.hypot(to[0] - from[0], to[2] - from[2]) * 0.2;
    const x = (1 - k) * (1 - k) * from[0] + 2 * (1 - k) * k * cx + k * k * to[0];
    const y = (1 - k) * (1 - k) * from[1] + 2 * (1 - k) * k * arcH + k * k * to[1];
    const z = (1 - k) * (1 - k) * from[2] + 2 * (1 - k) * k * cz + k * k * to[2];
    ref.current.position.set(x, y, z);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function CoreOrb() {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.35;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    groupRef.current.position.y = 1.2 + Math.sin(t * 1.2) * 0.15;
    if (innerRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.1;
      innerRef.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.5} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshBasicMaterial color="#a7f3d0" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Grid() {
  return <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} position={[0, -0.01, 0]} />;
}

function CameraRig({
  target,
  controlsRef,
  duration,
  easing,
}: {
  target: Node | null;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  duration: number;
  easing: EasingName;
}) {
  const { camera, clock } = useThree();
  const tween = useRef<{
    startTime: number;
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null>(null);
  const lastId = useRef<string | null>(null);

  if ((target?.id ?? null) !== lastId.current) {
    lastId.current = target?.id ?? null;
    const now = clock.elapsedTime;
    const fromPos = camera.position.clone();
    const fromTarget = controlsRef.current?.target.clone() ?? new THREE.Vector3(0, 1, 0);

    let toPos: THREE.Vector3;
    let toTarget: THREE.Vector3;

    if (target) {
      const [x, y, z] = target.position;
      toTarget = new THREE.Vector3(x, y + 0.6, z);
      const dir = new THREE.Vector3(x, 0, z).normalize();
      if (dir.lengthSq() === 0) dir.set(1, 0, 0);
      const offset = dir.multiplyScalar(4.5);
      toPos = new THREE.Vector3(x + offset.x, y + 3.2, z + offset.z);
    } else {
      toPos = new THREE.Vector3(10, 8, 14);
      toTarget = new THREE.Vector3(0, 1, 0);
    }

    tween.current = { startTime: now, fromPos, fromTarget, toPos, toTarget };
  }

  useFrame(() => {
    if (!tween.current) return;
    const elapsed = clock.elapsedTime - tween.current.startTime;
    const rawT = Math.min(elapsed / duration, 1);
    const easedT = EASINGS[easing](rawT);

    camera.position.lerpVectors(tween.current.fromPos, tween.current.toPos, easedT);
    const c = controlsRef.current;
    if (c) {
      c.target.lerpVectors(tween.current.fromTarget, tween.current.toTarget, easedT);
      c.update();
    }

    if (rawT >= 1) tween.current = null;
  });

  return null;
}

function Scene({
  nodes,
  selectedId,
  onSelect,
  controlsRef,
  selectedNode,
  duration,
  easing,
  showStars,
  showFog,
  showPackets,
  showWaveGrid,
}: {
  nodes: Node[];
  selectedId: string | null;
  onSelect: (n: Node) => void;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  selectedNode: Node | null;
  duration: number;
  easing: EasingName;
  showStars: boolean;
  showFog: boolean;
  showPackets: boolean;
  showWaveGrid: boolean;
}) {
  const packets = useMemo(() => {
    const arr: { from: [number, number, number]; to: [number, number, number]; color: string; speed: number }[] = [];
    for (let i = 0; i < 22; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let b = nodes[Math.floor(Math.random() * nodes.length)];
      if (!a || !b || a.id === b.id) continue;
      arr.push({
        from: a.position,
        to: b.position,
        color: STATUS_COLOR[a.status] ?? "#4ade80",
        speed: 0.6 + Math.random() * 1.4,
      });
    }
    return arr;
  }, [nodes]);

  return (
    <>
      <color attach="background" args={["#070b15"]} />
      <AnimatedFog visible={showFog} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 12, 6]} intensity={0.7} castShadow />
      <pointLight position={[0, 8, 0]} intensity={1.1} color="#4ade80" />
      <AnimatedGroup visible={showStars}>
        <Stars radius={90} depth={50} count={3500} factor={3.5} fade speed={1.2} />
      </AnimatedGroup>
      <Grid />
      <AnimatedGroup visible={showWaveGrid}>
        <WaveGrid />
      </AnimatedGroup>
      <CoreOrb />
      {nodes.map((n, i) => (
        <PulseRing
          key={`p-${n.id}`}
          position={[n.position[0], 0, n.position[2]]}
          color={STATUS_COLOR[n.status] ?? "#64748b"}
          delay={i * 0.18}
        />
      ))}
      <AnimatedGroup visible={showPackets}>
        {packets.map((p, i) => (
          <DataPacket key={i} from={p.from} to={p.to} color={p.color} speed={p.speed} />
        ))}
      </AnimatedGroup>
      {nodes.map((n) => (
        <ServerNode key={n.id} node={n} onSelect={onSelect} selected={selectedId === n.id} />
      ))}
      <Environment preset="night" />
      <CameraRig target={selectedNode} controlsRef={controlsRef} duration={duration} easing={easing} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={5}
        maxDistance={32}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={!selectedNode}
        autoRotateSpeed={0.65}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function Dashboard3D() {
  const baseNodes: Node[] = useMemo(() => {
    // arrange servers on concentric rings
    const list = [...mockServers, ...mockServers.map((s, i) => ({ ...s, id: s.id + "-b", name: s.name + "-b" }))];
    return list.map((s, i) => {
      const ring = i < 5 ? 0 : 1;
      const count = ring === 0 ? 5 : list.length - 5;
      const idx = ring === 0 ? i : i - 5;
      const radius = ring === 0 ? 3 : 6;
      const angle = (idx / count) * Math.PI * 2;
      return {
        id: s.id,
        name: s.name,
        region: s.region,
        status: s.status,
        position: [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius] as [number, number, number],
        load: Math.random() * 0.9 + 0.1,
      };
    });
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = baseNodes.find((n) => n.id === selectedId) ?? null;
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const [tweenDuration, setTweenDuration] = useState<number>(1.2);
  const [tweenEasing, setTweenEasing] = useState<EasingName>("easeOut");
  const [showStars, setShowStars] = useState(true);
  const [showFog, setShowFog] = useState(true);
  const [showPackets, setShowPackets] = useState(true);
  const [showWaveGrid, setShowWaveGrid] = useState(true);

  const counts = baseNodes.reduce(
    (acc, n) => {
      acc.total += 1;
      if (n.status === "online") acc.online += 1;
      if (n.status === "degraded") acc.degraded += 1;
      if (n.status === "offline") acc.offline += 1;
      acc.avgLoad += n.load;
      return acc;
    },
    { total: 0, online: 0, degraded: 0, offline: 0, avgLoad: 0 },
  );
  counts.avgLoad = counts.avgLoad / Math.max(counts.total, 1);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="overview · 3d"
        description="Spatial view of monitored infrastructure. Click a node to inspect."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-gradient relative h-[640px] overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)]"
        >
          <Canvas
            shadows
            camera={{ position: [10, 8, 14], fov: 50 }}
            dpr={[1, 2]}
            onPointerMissed={() => setSelectedId(null)}
          >
            <Suspense fallback={null}>
              <Scene
                nodes={baseNodes}
                selectedId={selectedId}
                selectedNode={selected}
                controlsRef={controlsRef}
                duration={tweenDuration}
                easing={tweenEasing}
                onSelect={(n) => setSelectedId(n.id)}
                showStars={showStars}
                showFog={showFog}
                showPackets={showPackets}
                showWaveGrid={showWaveGrid}
              />
            </Suspense>
          </Canvas>

          {/* HUD overlay */}
          <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2 font-mono text-[11px]">
            <div className="rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur">
              <div className="text-muted-foreground">FLEET</div>
              <div className="text-lg text-foreground">{counts.total} <span className="text-xs text-muted-foreground">nodes</span></div>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-[#4ade80]">● {counts.online}</span>
                <span className="text-[#facc15]">● {counts.degraded}</span>
                <span className="text-[#ef4444]">● {counts.offline}</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur">
              <div className="text-muted-foreground">AVG LOAD</div>
              <div className="text-lg text-primary">{Math.round(counts.avgLoad * 100)}%</div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] text-muted-foreground">
            drag · scroll · click a node
          </div>
        </motion.div>

        {/* Inspector */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-gradient flex h-[640px] flex-col rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
        >
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Inspector</h3>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id ?? selected.name}
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 space-y-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Hostname</p>
                  <p className="font-mono text-lg text-foreground">{selected.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Region</p>
                    <p className="font-mono text-sm">{selected.region}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-mono text-sm" style={{ color: STATUS_COLOR[selected.status] }}>{selected.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Load</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.load * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: STATUS_COLOR[selected.status] }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{Math.round(selected.load * 100)}%</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground"
              >
                Select a node in the scene to view details.
              </motion.div>
            )}
          </AnimatePresence>


          <div className="mt-auto border-t border-border pt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Camera Tween</p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="font-mono text-xs text-foreground">{tweenDuration.toFixed(1)}s</span>
                </div>
                <Slider
                  value={[tweenDuration]}
                  onValueChange={(v) => setTweenDuration(v[0])}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Easing</span>
                <Select value={tweenEasing} onValueChange={(v) => setTweenEasing(v as EasingName)}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">linear</SelectItem>
                    <SelectItem value="easeIn">ease-in</SelectItem>
                    <SelectItem value="easeOut">ease-out</SelectItem>
                    <SelectItem value="easeInOut">ease-in-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Scene Effects</p>
              <div className="flex gap-1">
                {[
                  { label: "Cinematic", stars: true, fog: true, packets: true, wave: true },
                  { label: "Minimal", stars: false, fog: false, packets: false, wave: false },
                  { label: "Dramatic", stars: false, fog: true, packets: true, wave: true },
                ].map((preset) => {
                  const active =
                    showStars === preset.stars &&
                    showFog === preset.fog &&
                    showPackets === preset.packets &&
                    showWaveGrid === preset.wave;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setShowStars(preset.stars);
                        setShowFog(preset.fog);
                        setShowPackets(preset.packets);
                        setShowWaveGrid(preset.wave);
                      }}
                      className="relative rounded-md border border-border px-2 py-0.5 text-[10px] transition-colors hover:text-accent-foreground"
                    >
                      {active && (
                        <motion.span
                          layoutId="preset-active"
                          className="absolute inset-0 rounded-md bg-primary/20 ring-1 ring-primary/40"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className={`relative ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <TooltipProvider delayDuration={200}>
              <div className="mt-3 space-y-3">
                {[
                  { label: "Stars", desc: "Background starfield that adds depth to the scene", perf: "Low", state: showStars, set: setShowStars },
                  { label: "Fog", desc: "Atmospheric depth fade that softens distant objects", perf: "Low", state: showFog, set: setShowFog },
                  { label: "Glow Packets", desc: "Animated data-flow particles traveling between nodes", perf: "High", state: showPackets, set: setShowPackets },
                  { label: "Wave Grid", desc: "Dynamic wireframe ground plane with wave motion", perf: "Medium", state: showWaveGrid, set: setShowWaveGrid },
                ].map(({ label, desc, perf, state, set }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <span className="text-xs text-foreground">{label}</span>
                          <p className="text-[10px] leading-tight text-muted-foreground">{desc}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={8}>
                        <div className="max-w-[180px]">
                          <p className="mb-1">{desc}</p>
                          <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            perf === "Low" ? "bg-emerald-500/10 text-emerald-400" :
                            perf === "Medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          }`}>
                            {perf} impact
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <Switch
                      checked={state}
                      onCheckedChange={(v) => set(v)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Legend</p>
            <div className="mt-2 space-y-1 text-xs">
              <p><span style={{ color: STATUS_COLOR.online }}>■</span> online</p>
              <p><span style={{ color: STATUS_COLOR.degraded }}>■</span> degraded</p>
              <p><span style={{ color: STATUS_COLOR.offline }}>■</span> offline</p>
              <p className="text-muted-foreground">column height = current load</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


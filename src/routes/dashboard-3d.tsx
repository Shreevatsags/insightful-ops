import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { mockServers } from "@/lib/mockData";

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

function Grid() {
  return (
    <gridHelper
      args={[40, 40, "#1e293b", "#0f172a"]}
      position={[0, -0.01, 0]}
    />
  );
}

function Scene({ nodes, selectedId, onSelect }: { nodes: Node[]; selectedId: string | null; onSelect: (n: Node) => void }) {
  return (
    <>
      <color attach="background" args={["#0a0f1c"]} />
      <fog attach="fog" args={["#0a0f1c", 18, 48]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 12, 6]} intensity={0.6} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#4ade80" />
      <Stars radius={80} depth={40} count={2000} factor={3} fade speed={1} />
      <Grid />
      {nodes.map((n) => (
        <ServerNode key={n.id} node={n} onSelect={onSelect} selected={selectedId === n.id} />
      ))}
      <Environment preset="night" />
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.4}
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
              <Scene nodes={baseNodes} selectedId={selectedId} onSelect={(n) => setSelectedId(n.id)} />
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
            drag to orbit · scroll to zoom
          </div>
        </motion.div>

        {/* Inspector */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-gradient flex h-[640px] flex-col rounded-xl border border-border p-5 shadow-[var(--shadow-card)]"
        >
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Inspector</h3>
          {selected ? (
            <div className="mt-4 space-y-4">
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
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selected.load * 100}%`,
                      background: STATUS_COLOR[selected.status],
                    }}
                  />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{Math.round(selected.load * 100)}%</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
              Select a node in the scene to view details.
            </div>
          )}

          <div className="mt-auto border-t border-border pt-4">
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

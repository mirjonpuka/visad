"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildProfileParts, PROFILE_CENTER } from "./profileGeometry";
import { profileStore, ramp } from "./profileStore";

/*
 * Scroll-driven aluminium profile (3D spec). Loaded with next/dynamic only on
 * capable devices when the section nears the viewport. Reads the scroll
 * progress from profileStore in useFrame and damps every value towards its
 * target (lambda 6); renders on demand and stops when off screen.
 */

const DEG = Math.PI / 180;
const FINISH_COLOR = { silver: "#B9BDC2", anthracite: "#3A3D42" } as const;

type Targets = {
  explode: number;
  lift: number;
  glassDrop: number;
  paneSep: number;
  rotY: number;
  edge: number;
  glow: number;
};

/** Scene state for a progress value (3D spec §Scroll timeline). */
function targetsFor(p: number): Targets {
  const reassemble = 1 - ramp(p, 0.82, 0.96);
  return {
    // Step 2: shells move apart ±40mm; back together in step 5
    explode: ramp(p, 0.2, 0.36) * reassemble,
    // Step 3: gaskets lift 30mm
    lift: ramp(p, 0.42, 0.56) * reassemble,
    // Step 4: glass slides down from +200mm, panes part to show the spacer, then close
    glassDrop: 1 - ramp(p, 0.6, 0.72),
    paneSep: Math.sin(Math.PI * ramp(p, 0.68, 0.8)),
    // Step 1: -25° → 15°; step 3: 3/4 view 35°; step 5: back to a front 3/4 (20°)
    rotY: (-25 + 40 * ramp(p, 0, 0.2) + 20 * ramp(p, 0.4, 0.6) - 15 * ramp(p, 0.8, 1)) * DEG,
    // Red cut-face lines during step 1 only
    edge: 0.6 * (1 - ramp(p, 0.16, 0.24)),
    // Thermal-break highlight pulse during step 2
    glow: 0.15 * Math.sin(Math.PI * ramp(p, 0.2, 0.4)),
  };
}

type ProfileProps = {
  fixedProgress?: number;
  onLowFps?: () => void;
};

function Profile({ fixedProgress, onLowFps }: ProfileProps) {
  const invalidate = useThree((s) => s.invalidate);
  const parts = useMemo(() => buildProfileParts(), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(parts.outerShell, 30), [parts]);
  const [cheapGlass, setCheapGlass] = useState(false);

  const materials = useMemo(
    () => ({
      aluminium: new THREE.MeshPhysicalMaterial({
        color: FINISH_COLOR[profileStore.finish],
        metalness: 1,
        roughness: 0.32,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
      }),
      polyamide: new THREE.MeshStandardMaterial({
        color: "#2A2C2F",
        roughness: 0.85,
        metalness: 0,
        emissive: "#ffffff",
        emissiveIntensity: 0,
      }),
      epdm: new THREE.MeshStandardMaterial({ color: "#111214", roughness: 0.95 }),
      spacer: new THREE.MeshStandardMaterial({ color: "#3A3D42", metalness: 0.8, roughness: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#DDE8E6",
        transmission: 1,
        thickness: 6,
        roughness: 0.05,
        ior: 1.5,
        transparent: true,
        opacity: 1,
      }),
      glassCheap: new THREE.MeshStandardMaterial({
        color: "#DDE8E6",
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
      }),
      edge: new THREE.LineBasicMaterial({ color: "#F2000D", transparent: true, opacity: 0.6 }),
    }),
    [],
  );

  // Free GPU memory when the scene unmounts
  useEffect(
    () => () => {
      Object.values(parts).forEach((g) => g.dispose());
      edges.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [parts, edges, materials],
  );

  // Progress / finish changes → render a frame; finish recolours the metal
  useEffect(
    () =>
      profileStore.subscribe(() => {
        materials.aluminium.color.set(FINISH_COLOR[profileStore.finish]);
        invalidate();
      }),
    [materials, invalidate],
  );

  const root = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const gasketOuter = useRef<THREE.Mesh>(null);
  const gasketInner = useRef<THREE.Mesh>(null);
  const glass = useRef<THREE.Group>(null);
  const paneOuter = useRef<THREE.Mesh>(null);
  const paneInner = useRef<THREE.Mesh>(null);
  const current = useRef<Targets>(targetsFor(fixedProgress ?? profileStore.progress));
  const fps = useRef({ time: 0, frames: 0 });
  const warmup = useRef(0);
  const edgeLines = useRef<THREE.LineSegments>(null);
  const breakA = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const target = targetsFor(fixedProgress ?? profileStore.progress);
    const c = current.current;
    let moving = false;
    for (const key of Object.keys(target) as (keyof Targets)[]) {
      c[key] = fixedProgress === undefined ? THREE.MathUtils.damp(c[key], target[key], 6, delta) : target[key];
      if (Math.abs(c[key] - target[key]) > 1e-4) moving = true;
    }

    root.current!.rotation.y = c.rotY;
    outer.current!.position.x = -40 * c.explode;
    inner.current!.position.x = 40 * c.explode;
    gasketOuter.current!.position.set(-40 * c.explode, 30 * c.lift, 0);
    gasketOuter.current!.rotation.z = 0.12 * c.lift;
    gasketInner.current!.position.set(40 * c.explode, 30 * c.lift, 0);
    gasketInner.current!.rotation.z = -0.12 * c.lift;
    glass.current!.position.y = 200 * c.glassDrop;
    glass.current!.visible = c.glassDrop < 0.995;
    paneOuter.current!.position.x = -8 * c.paneSep;
    paneInner.current!.position.x = 8 * c.paneSep;
    (edgeLines.current!.material as THREE.LineBasicMaterial).opacity = c.edge;
    (breakA.current!.material as THREE.MeshStandardMaterial).emissiveIntensity = c.glow;

    // A few warm-up frames so the environment map and contact shadow are in
    warmup.current += 1;
    if (moving || warmup.current < 6) invalidate();

    // Frame-rate guard while animating (3D spec §Fallbacks): below 40fps for
    // 2s → cheaper glass first, then hand over to the static image.
    if (!onLowFps || fixedProgress !== undefined) return;
    if (delta > 0.25) return; // idle gap between on-demand frames
    fps.current.time += delta;
    fps.current.frames += 1;
    if (fps.current.time >= 2) {
      const rate = fps.current.frames / fps.current.time;
      fps.current = { time: 0, frames: 0 };
      if (rate < 40) {
        if (!cheapGlass) setCheapGlass(true);
        else onLowFps();
      }
    }
  });

  const glassMaterial = cheapGlass ? materials.glassCheap : materials.glass;

  return (
    <group ref={root}>
      <group scale={0.01} position={PROFILE_CENTER.clone().multiplyScalar(-0.01)}>
        <group ref={outer}>
          <mesh geometry={parts.outerShell} material={materials.aluminium} />
          <lineSegments ref={edgeLines} geometry={edges} material={materials.edge} />
        </group>
        <mesh ref={breakA} geometry={parts.breakA} material={materials.polyamide} />
        <mesh geometry={parts.breakB} material={materials.polyamide} />
        <group ref={inner}>
          <mesh geometry={parts.innerShell} material={materials.aluminium} />
          <mesh geometry={parts.bead} material={materials.aluminium} />
        </group>
        <mesh ref={gasketOuter} geometry={parts.gasketOuter} material={materials.epdm} />
        <mesh ref={gasketInner} geometry={parts.gasketInner} material={materials.epdm} />
        <group ref={glass}>
          <mesh ref={paneOuter} geometry={parts.paneOuter} material={glassMaterial} />
          <mesh ref={paneInner} geometry={parts.paneInner} material={glassMaterial} />
          <mesh geometry={parts.spacer} material={materials.spacer} />
        </group>
      </group>
    </group>
  );
}

/**
 * Studio reflections without an HDR file: three's procedural RoomEnvironment
 * (softbox-lit room) pre-filtered once with PMREM.
 */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return env;
  }, [gl]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <primitive object={texture} attach="environment" />;
}

export type ProfileSceneProps = ProfileProps & {
  /** false → frameloop "never" (off screen) */
  active?: boolean;
  /** Called once the first frame is on screen */
  onReady?: () => void;
  /** Dev export: keep the buffer for toDataURL */
  preserveDrawingBuffer?: boolean;
  dpr?: number | [number, number];
};

export default function ProfileScene({
  active = true,
  onReady,
  preserveDrawingBuffer = false,
  dpr = [1, 1.75],
  ...profile
}: ProfileSceneProps) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "demand" : "never"}
      camera={{ fov: 30, position: [3.2, 1.6, 4.2], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0, 0);
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <directionalLight position={[-3, 4, 2]} intensity={1.2} />
      {/* Studio softboxes instead of an HDR file */}
      <StudioEnvironment />
      <Profile {...profile} />
      <ContactShadows position={[0, -0.66, 0]} opacity={0.35} blur={2.5} far={4} frames={1} />
    </Canvas>
  );
}

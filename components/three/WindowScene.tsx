"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { profileStore, ramp } from "./profileStore";
import { buildWindow, outsideTexture, SIDES, WINDOW } from "./windowGeometry";

/*
 * Scroll-driven window (owner request, replaces the single profile): the
 * frame bars fly in, the thermal break glows, the sash and gaskets arrive,
 * the double glazing slides in, then the window turns, opens inwards and the
 * camera flies out through it into the daylight. Progress comes from
 * profileStore (pinned ScrollTrigger); every value is damped (lambda 6) and
 * rendered on demand.
 *
 * Stability: no transmission/refraction, no shadow pass, dpr ≤ 1.5 (→ 1 when
 * frames are slow), WebGL context loss is reported so the parent remounts.
 */

const FINISH = { silver: "#A7ADB4", anthracite: "#3A3D42" } as const;
const BG = "#0E0F11"; // ink-900, the section background

type Targets = {
  frame: number[];
  sash: number[];
  glow: number;
  yaw: number;
  pitch: number;
  glass: number;
  handle: number;
  open: number;
  fly: number;
};

/** Scene state for a progress value; the five text steps are 0.2 wide. */
function targetsFor(p: number): Targets {
  return {
    // Step 1: the four frame bars fly in one after another
    frame: [0.02, 0.06, 0.1, 0.14].map((s) => ramp(p, s, s + 0.08)),
    // Step 2: thermal break strips glow red
    glow: Math.sin(Math.PI * ramp(p, 0.2, 0.4)),
    // Step 3: sash bars (with their gaskets)
    sash: [0.42, 0.45, 0.48, 0.51].map((s) => ramp(p, s, s + 0.08)),
    // Step 4: glass slides down into the sash, handle appears
    glass: ramp(p, 0.6, 0.68),
    handle: ramp(p, 0.66, 0.7),
    // Turn to show depth, back to the front for the opening
    yaw: -0.45 + 0.95 * ramp(p, 0.04, 0.36) - 0.8 * ramp(p, 0.4, 0.6) + 0.3 * ramp(p, 0.64, 0.76),
    pitch: 0.1 * (1 - ramp(p, 0.64, 0.76)),
    // Step 5: open inwards, then fly out through the opening
    open: ramp(p, 0.76, 0.86),
    fly: ramp(p, 0.82, 0.96),
  };
}

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

type WindowProps = { fixedProgress?: number; active: boolean; still?: boolean };

function Window({ fixedProgress, active, still }: WindowProps) {
  const invalidate = useThree((s) => s.invalidate);
  const setDpr = useThree((s) => s.setDpr);
  const geo = useMemo(() => buildWindow(), []);
  const outside = useMemo(() => outsideTexture(), []);

  const mats = useMemo(
    () => ({
      aluminium: new THREE.MeshStandardMaterial({
        color: FINISH[profileStore.finish],
        metalness: 0.85,
        roughness: 0.38,
        envMapIntensity: 0.75,
      }),
      polyamide: new THREE.MeshStandardMaterial({
        color: "#2A2C2F",
        roughness: 0.85,
        emissive: "#F2000D",
        emissiveIntensity: 0,
      }),
      epdm: new THREE.MeshStandardMaterial({ color: "#111214", roughness: 0.95 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#CFE3E6",
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
      spacer: new THREE.MeshStandardMaterial({ color: "#3A3D42", metalness: 0.8, roughness: 0.4 }),
      handle: new THREE.MeshStandardMaterial({ color: "#E8EAEC", metalness: 0.7, roughness: 0.25 }),
      wall: new THREE.MeshBasicMaterial({ color: BG, toneMapped: false }),
      outside: new THREE.MeshBasicMaterial({ map: outside, toneMapped: false }),
    }),
    [outside],
  );

  useEffect(
    () => () => {
      [...geo.frame, ...geo.sash].forEach((m) =>
        [m.aluminium, m.aluminiumInner, m.polyamide, m.epdm].forEach((g) => g.dispose()),
      );
      [
        geo.glass.pane,
        geo.glass.spacer,
        geo.handle.base,
        geo.handle.lever,
        geo.hinge,
        geo.slot,
        geo.wall,
      ].forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      outside.dispose();
    },
    [geo, mats, outside],
  );

  // Progress / finish change → render; finish recolours the aluminium
  useEffect(
    () =>
      profileStore.subscribe(() => {
        mats.aluminium.color.set(FINISH[profileStore.finish]);
        invalidate();
      }),
    [mats, invalidate],
  );
  // Back on screen → draw again (frameloop switches from "never" to "demand")
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  const root = useRef<THREE.Group>(null);
  const frameSides = useRef<(THREE.Group | null)[]>([]);
  const sashSides = useRef<(THREE.Group | null)[]>([]);
  const hinge = useRef<THREE.Group>(null);
  const hinges = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Group>(null);
  const glassPane = useRef<THREE.Mesh>(null);
  const handle = useRef<THREE.Group>(null);
  const strip = useRef<THREE.Mesh>(null);
  const current = useRef<Targets>(targetsFor(fixedProgress ?? profileStore.progress));
  const fps = useRef({ time: 0, frames: 0, lowered: false });
  const warmup = useRef(0);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  const outward = { top: [0, 1], right: [1, 0], bottom: [0, -1], left: [-1, 0] } as const;

  useFrame((state, delta) => {
    const target = targetsFor(fixedProgress ?? profileStore.progress);
    const c = current.current;
    let moving = false;
    const damp = (a: number, b: number) => {
      const next = fixedProgress === undefined ? THREE.MathUtils.damp(a, b, 6, delta) : b;
      if (Math.abs(next - b) > 1e-4) moving = true;
      return next;
    };
    c.frame = c.frame.map((v, i) => damp(v, target.frame[i]));
    c.sash = c.sash.map((v, i) => damp(v, target.sash[i]));
    for (const key of ["glow", "yaw", "pitch", "glass", "handle", "open", "fly"] as const)
      c[key] = damp(c[key], target[key]);

    // Frame bars: from 900mm outside + towards the camera, spinning slightly
    SIDES.forEach((side, i) => {
      const g = frameSides.current[i];
      if (!g) return;
      const e = c.frame[i];
      const [ox, oy] = outward[side];
      g.position.set(ox * 900 * (1 - e), oy * 900 * (1 - e), 600 * (1 - e));
      g.rotation.z = 0.5 * (1 - e) * (i % 2 ? 1 : -1);
      g.visible = e > 0.001;
      // Step 2: shells move apart (±70mm) so the glowing thermal break shows between them
      const part = 70 * c.glow;
      g.children[0].position.z = -part;
      g.children[1].position.z = part;
      g.children[3].position.z = part;
    });
    SIDES.forEach((side, i) => {
      const g = sashSides.current[i];
      if (!g) return;
      const e = c.sash[i];
      const [ox, oy] = outward[side];
      g.position.set(ox * 500 * (1 - e), oy * 500 * (1 - e), 900 * (1 - e));
      g.visible = e > 0.001;
    });
    (strip.current?.material as THREE.MeshStandardMaterial | undefined)?.setValues({
      emissiveIntensity: 0.55 * c.glow,
    });

    // Step 4 (owner brief C3): the glass comes from far behind the profile along Z and fades in
    glass.current!.position.z = -1600 * (1 - c.glass);
    glass.current!.visible = c.glass > 0.001;
    (glassPane.current?.material as THREE.MeshStandardMaterial | undefined)?.setValues({
      opacity: 0.22 * c.glass,
    });
    handle.current!.scale.setScalar(Math.max(0.001, c.handle));
    handle.current!.visible = c.handle > 0.001;
    // The hinges arrive with the sash bar they sit on (left)
    hinges.current!.visible = c.sash[SIDES.indexOf("left")] > 0.98;
    hinge.current!.rotation.y = -1.4 * c.open; // opens towards the room (camera)
    // Daylight stays dim until the window opens
    mats.outside.color.setScalar(0.28 + 0.72 * Math.max(c.open, c.fly));

    // The poster still is posed at a 3/4 angle to show the depth of the profiles
    if (still) root.current!.rotation.set(0.1, 0.5, 0);
    else root.current!.rotation.set(c.pitch, c.yaw, 0);

    // Camera: from the room, out through the open window into the light. On portrait
    // canvases (phone backdrop) it starts further back so the whole window fits the width.
    const fly = c.fly * c.fly; // ease in
    const fitWidth = 0.95 / (Math.tan(THREE.MathUtils.degToRad(15)) * (state.size.width / state.size.height));
    const startZ = Math.max(4.2, fitWidth);
    state.camera.position.set(0.14 * ramp(c.fly, 0, 0.4), 0, startZ - (startZ + 1.7) * fly);
    lookAt.set(0, 0, -3);
    state.camera.lookAt(lookAt);

    warmup.current += 1;
    if (moving || warmup.current < 4) invalidate();

    // Slow device while animating: lower the resolution once (never switch off)
    if (fixedProgress !== undefined || fps.current.lowered || delta > 0.25) return;
    fps.current.time += delta;
    fps.current.frames += 1;
    if (fps.current.time >= 3) {
      if (fps.current.frames / fps.current.time < 30) {
        fps.current.lowered = true;
        setDpr(1);
      }
      fps.current.time = 0;
      fps.current.frames = 0;
    }
  });

  const { sashSize } = geo;
  return (
    <group ref={root}>
      <group scale={0.001}>
        {/* The still export (transparent poster) leaves out wall and daylight */}
        <mesh geometry={geo.wall} material={mats.wall} visible={!still} />
        <mesh position={[0, 0, -2600]} material={mats.outside} visible={!still}>
          <planeGeometry args={[9000, 7000]} />
        </mesh>

        {geo.frame.map((m, i) => (
          <group key={m.side} ref={(el) => void (frameSides.current[i] = el)}>
            <mesh geometry={m.aluminium} material={mats.aluminium} />
            <mesh geometry={m.aluminiumInner} material={mats.aluminium} />
            <mesh ref={i === 0 ? strip : undefined} geometry={m.polyamide} material={mats.polyamide} />
            <mesh geometry={m.epdm} material={mats.epdm} />
            {/* Drainage slots on the outside face of the bottom bar */}
            {m.side === "bottom" &&
              [-360, 0, 360].map((x) => (
                <mesh
                  key={x}
                  geometry={geo.slot}
                  material={mats.epdm}
                  position={[x, -WINDOW.height / 2 + 22, -WINDOW.frameDepth / 2 - 1]}
                />
              ))}
          </group>
        ))}

        {/* Sash hangs on its left edge; set 12mm behind the frame's room face */}
        <group ref={hinge} position={[-sashSize.w / 2, 0, -12]}>
          {/* Two hinges on the hinge edge, room side */}
          <group ref={hinges}>
            {[1, -1].map((s) => (
              <mesh
                key={s}
                geometry={geo.hinge}
                material={mats.handle}
                position={[6, s * (sashSize.h / 2 - 230), WINDOW.sashDepth / 2 + 6]}
              />
            ))}
          </group>
          <group position={[sashSize.w / 2, 0, 0]}>
            {geo.sash.map((m, i) => (
              <group key={m.side} ref={(el) => void (sashSides.current[i] = el)}>
                <mesh geometry={m.aluminium} material={mats.aluminium} />
                <mesh geometry={m.aluminiumInner} material={mats.aluminium} />
                <mesh geometry={m.polyamide} material={mats.polyamide} />
                <mesh geometry={m.epdm} material={mats.epdm} />
              </group>
            ))}
            <group ref={glass}>
              <mesh ref={glassPane} geometry={geo.glass.pane} material={mats.glass} position={[0, 0, -9]} />
              <mesh geometry={geo.glass.pane} material={mats.glass} position={[0, 0, 9]} />
            </group>
            <group ref={handle} position={[sashSize.w / 2 - 36, 0, WINDOW.sashDepth / 2 + 8]}>
              <mesh geometry={geo.handle.base} material={mats.handle} />
              <mesh geometry={geo.handle.lever} material={mats.handle} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export type WindowSceneProps = {
  fixedProgress?: number;
  /** Export mode for the poster image: no wall, no daylight, transparent */
  still?: boolean;
  /** false → frameloop "never" (off screen) */
  active?: boolean;
  onReady?: () => void;
  /** The browser dropped the WebGL context (GPU reset) — parent remounts */
  onContextLost?: () => void;
  preserveDrawingBuffer?: boolean;
  dpr?: number | [number, number];
};

export default function WindowScene({
  fixedProgress,
  still,
  active = true,
  onReady,
  onContextLost,
  preserveDrawingBuffer = false,
  dpr = [1, 1.5],
}: WindowSceneProps) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "demand" : "never"}
      camera={{ fov: 30, position: [0, 0, 4.2], near: 0.05, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        // ?debug3d: expose the renderer for performance checks (triangles, calls)
        if (location.search.includes("debug3d")) (window as unknown as { __visad3d: unknown }).__visad3d = gl;
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost?.();
        });
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <StudioEnvironment />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-2, 3, 4]} intensity={1.3} />
      <directionalLight position={[3, -1, 2]} intensity={0.4} />
      <Window fixedProgress={fixedProgress} active={active} still={still} />
    </Canvas>
  );
}

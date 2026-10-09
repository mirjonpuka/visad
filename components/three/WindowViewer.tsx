"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildWindow, WINDOW } from "./windowGeometry";

/*
 * Phone viewer (owner brief E1): the same window as the desktop scene, loaded
 * only after "Shiko në 3D". Drag left/right turns it within a limited range
 * (no zoom, no pan), the toggle opens the sash in ~600ms. Kept light: dpr 1,
 * no transmission, no shadows, no wall/daylight, frameloop "demand".
 */

const SILVER = "#A7ADB4";
/** Same pose as the poster still, so the swap is seamless */
const START = { yaw: 0.5, pitch: 0.1 };
const YAW_LIMIT = 0.8;
const OPEN_MS = 600;
/** Closer than the desktop scene so the window fills the stage like the poster */
const CAMERA_Z = 3.5;

export type ViewerControls = {
  /** Horizontal drag in px since the last call */
  drag: (dx: number) => void;
  setOpen: (open: boolean) => void;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

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

function Model({
  controlsRef,
  onReady,
}: {
  controlsRef: React.RefObject<ViewerControls | null>;
  onReady: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const geo = useMemo(() => buildWindow(), []);
  const mats = useMemo(
    () => ({
      aluminium: new THREE.MeshStandardMaterial({
        color: SILVER,
        metalness: 0.85,
        roughness: 0.38,
        envMapIntensity: 0.75,
      }),
      polyamide: new THREE.MeshStandardMaterial({ color: "#2A2C2F", roughness: 0.85 }),
      epdm: new THREE.MeshStandardMaterial({ color: "#111214", roughness: 0.95 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#CFE3E6",
        metalness: 0.2,
        roughness: 0.05,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
      handle: new THREE.MeshStandardMaterial({ color: "#E8EAEC", metalness: 0.7, roughness: 0.25 }),
    }),
    [],
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
    },
    [geo, mats],
  );

  const root = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Group>(null);
  const state = useRef({ yaw: START.yaw, targetYaw: START.yaw, open: 0, from: 0, to: 0, start: 0 });
  const frames = useRef(0);

  useEffect(() => {
    controlsRef.current = {
      drag(dx) {
        const s = state.current;
        s.targetYaw = THREE.MathUtils.clamp(s.targetYaw + dx * 0.008, -YAW_LIMIT, YAW_LIMIT);
        invalidate();
      },
      setOpen(open) {
        const s = state.current;
        s.from = s.open;
        s.to = open ? 1 : 0;
        s.start = performance.now();
        invalidate();
      },
    };
    return () => void (controlsRef.current = null);
  }, [controlsRef, invalidate]);

  useFrame(({ camera }, delta) => {
    const s = state.current;
    let moving = false;
    s.yaw = THREE.MathUtils.damp(s.yaw, s.targetYaw, 10, delta);
    if (Math.abs(s.yaw - s.targetYaw) > 1e-4) moving = true;
    if (s.open !== s.to) {
      const t = Math.min(1, (performance.now() - s.start) / OPEN_MS);
      s.open = s.from + (s.to - s.from) * ease(t);
      if (t >= 1) s.open = s.to;
      moving = true;
    }
    root.current!.rotation.set(START.pitch, s.yaw, 0);
    // The open sash swings towards the camera: step back (and a little right) so it stays in view
    root.current!.position.x = 0.15 * s.open;
    camera.position.z = CAMERA_Z + 1.6 * s.open;
    hinge.current!.rotation.y = -1.3 * s.open;
    if (moving) invalidate();
    // First frames drawn → the poster underneath can go
    frames.current += 1;
    if (frames.current === 2) onReady();
    else if (frames.current < 2) invalidate();
  });

  const { sashSize } = geo;
  return (
    <group ref={root}>
      <group scale={0.001}>
        {geo.frame.map((m) => (
          <group key={m.side}>
            <mesh geometry={m.aluminium} material={mats.aluminium} />
            <mesh geometry={m.aluminiumInner} material={mats.aluminium} />
            <mesh geometry={m.polyamide} material={mats.polyamide} />
            <mesh geometry={m.epdm} material={mats.epdm} />
          </group>
        ))}
        <group ref={hinge} position={[-sashSize.w / 2, 0, -12]}>
          {[1, -1].map((s) => (
            <mesh
              key={s}
              geometry={geo.hinge}
              material={mats.handle}
              position={[6, s * (sashSize.h / 2 - 230), WINDOW.sashDepth / 2 + 6]}
            />
          ))}
          <group position={[sashSize.w / 2, 0, 0]}>
            {geo.sash.map((m) => (
              <group key={m.side}>
                <mesh geometry={m.aluminium} material={mats.aluminium} />
                <mesh geometry={m.aluminiumInner} material={mats.aluminium} />
                <mesh geometry={m.polyamide} material={mats.polyamide} />
                <mesh geometry={m.epdm} material={mats.epdm} />
              </group>
            ))}
            <mesh geometry={geo.glass.pane} material={mats.glass} position={[0, 0, -9]} />
            <mesh geometry={geo.glass.pane} material={mats.glass} position={[0, 0, 9]} />
            <group position={[sashSize.w / 2 - 36, 0, WINDOW.sashDepth / 2 + 8]}>
              <mesh geometry={geo.handle.base} material={mats.handle} />
              <mesh geometry={geo.handle.lever} material={mats.handle} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function WindowViewer({
  controlsRef,
  onReady,
}: {
  controlsRef: React.RefObject<ViewerControls | null>;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={1}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      // Lights as in the desktop scene; closer camera so the window fills the
      // stage like the poster, with room left for the open sash
      camera={{ fov: 30, position: [0, 0, CAMERA_Z], near: 0.05, far: 40 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <StudioEnvironment />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-2, 3, 4]} intensity={1.3} />
      <directionalLight position={[3, -1, 2]} intensity={0.4} />
      <Model controlsRef={controlsRef} onReady={onReady} />
    </Canvas>
  );
}

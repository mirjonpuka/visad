"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ButtonPrimary } from "@/components/ui/Button";

const ProfileScene = dynamic(() => import("@/components/three/ProfileScene"), { ssr: false });

/** 1200×800 CSS px at dpr 2 = 2400×1600 render, transparent over ink-900. */
export function ProfileRender() {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  function download() {
    const canvas = box.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "profile-exploded.png";
    link.click();
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-6">
      <div
        ref={box}
        data-ready={ready ? "" : undefined}
        className="bg-ink-900"
        style={{ width: 1200, height: 800 }}
      >
        <ProfileScene fixedProgress={0.5} preserveDrawingBuffer dpr={2} onReady={() => setReady(true)} />
      </div>
      <ButtonPrimary onClick={download} disabled={!ready}>
        Download PNG
      </ButtonPrimary>
    </div>
  );
}

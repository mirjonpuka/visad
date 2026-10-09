"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ButtonPrimary } from "@/components/ui/Button";

const WindowScene = dynamic(() => import("@/components/three/WindowScene"), { ssr: false });

/** 800×1000 CSS px at dpr 2 = 1600×2000 still of the assembled window, transparent. */
export function ProfileRender() {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  function download() {
    const canvas = box.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "window.png";
    link.click();
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-6">
      <div ref={box} data-ready={ready ? "" : undefined} style={{ width: 800, height: 1000 }}>
        <WindowScene fixedProgress={0.72} still preserveDrawingBuffer dpr={2} onReady={() => setReady(true)} />
      </div>
      <ButtonPrimary onClick={download} disabled={!ready}>
        Download PNG
      </ButtonPrimary>
    </div>
  );
}

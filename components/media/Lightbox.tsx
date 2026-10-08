"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SiteImage } from "@/lib/images";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { CMSImage } from "./CMSImage";

type Labels = { close: string; prev: string; next: string; counter: string /* "{n} / {total}" style label */ };

/**
 * Full-screen gallery (UI §7.4): ink-950 background, arrows, swipe, Esc to
 * close, Mono counter "3 / 12", caption = alt text. Focus is trapped and
 * returns to the thumbnail that opened it.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
  labels,
}: {
  images: SiteImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
  labels: Labels;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const total = images.length;
  const [touchX, setTouchX] = useState<number | null>(null);

  useFocusTrap(open, [ref]);
  useScrollLock(open);
  useEscape(open, onClose);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndex((index + delta + total) % total);
    },
    [index, onIndex, total],
  );

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
    // Re-bind only when opening/closing; `go` changes with the index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;
  const image = images[index];
  const caption = typeof image.alt === "string" ? image.alt : "";

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={labels.counter.replace("{n}", String(index + 1)).replace("{total}", String(total))}
      className="surface-dark fixed inset-0 z-[90] flex flex-col bg-ink-950"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5 md:px-8">
        <span className="font-mono text-label text-text-on-dark-2 tabular" aria-live="polite">
          {index + 1} / {total}
        </span>
        <button type="button" data-close="" onClick={onClose} aria-label={labels.close} className="icon-btn icon-btn-40">
          <X size={18} strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <CMSImage
          key={index}
          image={image}
          fill
          sizes="100vw"
          className="rounded-none bg-transparent"
          imgClassName="object-contain"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.prev}
              className="icon-btn icon-btn-40 absolute top-1/2 left-4 -translate-y-1/2 bg-ink-900/60 md:left-8"
            >
              <ChevronLeft size={20} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="icon-btn icon-btn-40 absolute top-1/2 right-4 -translate-y-1/2 bg-ink-900/60 md:right-8"
            >
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
            </button>
          </>
        )}
      </div>

      <p className="min-h-16 shrink-0 px-5 py-5 text-center text-body-s text-text-on-dark-2 md:px-8">{caption}</p>
    </div>,
    document.body,
  );
}

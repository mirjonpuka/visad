import { ALBANIA, NEIGHBOURS, VIEWBOX } from "./balkansMap";

/*
 * Line icons for the stats band (owner brief C2): one style for all —
 * 1.5px stroke, round joins, current text colour, red accent. Decorative.
 */

type Kind = "building" | "notebook" | "map";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

export function StatIcon({ kind, size = 40 }: { kind: Kind; size?: number }) {
  if (kind === "map") {
    // Western Balkans from Natural Earth (scripts/make-balkans-map.mjs), Albania in red
    return (
      <svg width={size} height={size} viewBox={VIEWBOX} aria-hidden className="shrink-0 text-text-on-dark-3">
        <path d={NEIGHBOURS} {...stroke} strokeWidth={1} />
        <path d={ALBANIA} {...stroke} fill="rgba(242,0,13,0.18)" stroke="var(--color-red-500)" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0 text-text-on-dark">
      {kind === "building" && (
        <g {...stroke}>
          {/* The same isometric block as before, as an outline */}
          <path d="M20 4 L34 11 L20 18 L6 11 Z" />
          <path d="M6 11 V29 L20 36 V18" />
          <path d="M34 11 V29 L20 36" />
          {/* Window grid on the right face */}
          <path d="M24 21.5 L30 18.5 M24 26 L30 23 M24 30.5 L30 27.5" />
          <path d="M27 20 V29" />
          {/* Red frame accent */}
          <path d="M9 18 L16 21.5" stroke="var(--color-red-500)" />
        </g>
      )}
      {kind === "notebook" && (
        <g {...stroke}>
          {/* Spiral planning notebook with a short checklist */}
          <rect x="9" y="6" width="23" height="29" rx="2" />
          {[10, 15, 20, 25, 30].map((y) => (
            <path key={y} d={`M6 ${y} H11`} />
          ))}
          <path d="M15 13 l1.6 1.6 l3 -3.2" stroke="var(--color-red-500)" />
          <path d="M22 13 H28" />
          <path d="M15 20 l1.6 1.6 l3 -3.2" stroke="var(--color-red-500)" />
          <path d="M22 20 H28" />
          <path d="M15 27 H19 M22 27 H28" />
        </g>
      )}
    </svg>
  );
}

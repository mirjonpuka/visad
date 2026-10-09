/*
 * Small isometric "3D" icons for the stats band (owner request): aluminium
 * faces with light/shadow gradients, a red accent and a soft ground shadow.
 * Pure SVG, decorative (aria-hidden).
 */

type Kind = "building" | "calendar" | "globe";

export function StatIcon({ kind, size = 72 }: { kind: Kind; size?: number }) {
  // Gradient ids per kind (server component: no useId)
  const id = `stat-${kind}`;
  const g = (name: string) => `${name}-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={g("top")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F5F6" />
          <stop offset="1" stopColor="#C5CAD0" />
        </linearGradient>
        <linearGradient id={g("left")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#AEB4BB" />
          <stop offset="1" stopColor="#7D848C" />
        </linearGradient>
        <linearGradient id={g("right")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8E959D" />
          <stop offset="1" stopColor="#5C636B" />
        </linearGradient>
        <linearGradient id={g("red")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF3B44" />
          <stop offset="1" stopColor="#B0000A" />
        </linearGradient>
        <radialGradient id={g("sphere")} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#F4F5F6" />
          <stop offset="0.55" stopColor="#A9AFB6" />
          <stop offset="1" stopColor="#4F565E" />
        </radialGradient>
        <radialGradient id={g("shadow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="40" cy="72" rx="28" ry="6" fill={`url(#${g("shadow")})`} />

      {kind === "building" && (
        <g>
          {/* Isometric block: top, left and right faces */}
          <path d="M40 8 L66 21 L40 34 L14 21 Z" fill={`url(#${g("top")})`} />
          <path d="M14 21 L40 34 L40 68 L14 55 Z" fill={`url(#${g("left")})`} />
          <path d="M66 21 L40 34 L40 68 L66 55 Z" fill={`url(#${g("right")})`} />
          {/* Window grid on the right face (glass) */}
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => {
              const x = 45 + col * 10;
              const y = 36 + row * 10 - col * 5;
              return (
                <path
                  key={`${row}-${col}`}
                  d={`M${x} ${y} L${x + 7} ${y - 3.5} L${x + 7} ${y + 3.5} L${x} ${y + 7} Z`}
                  fill="#1C2A33"
                  stroke="#DDE8E6"
                  strokeOpacity="0.5"
                  strokeWidth="0.6"
                />
              );
            }),
          )}
          {/* Red frame accent on the left face */}
          <path d="M19 30 L35 38 L35 41 L19 33 Z" fill={`url(#${g("red")})`} />
        </g>
      )}

      {kind === "calendar" && (
        <g>
          {/* Slab with a red top band, like a desk calendar seen from above */}
          <path d="M40 18 L68 32 L40 46 L12 32 Z" fill={`url(#${g("top")})`} />
          <path d="M12 32 L40 46 L40 62 L12 48 Z" fill={`url(#${g("left")})`} />
          <path d="M68 32 L40 46 L40 62 L68 48 Z" fill={`url(#${g("right")})`} />
          <path d="M40 18 L68 32 L60 36 L32 22 Z" fill={`url(#${g("red")})`} />
          {/* Rings */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={36 + i * 8} y={18 + i * 4} width="3" height="8" rx="1.5" fill="#3A3D42" transform={`rotate(-27 ${37 + i * 8} ${22 + i * 4})`} />
          ))}
          {/* Day grid */}
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}${c}`} cx={30 + c * 7 - r * 7 + 7} cy={34 + c * 3.5 + r * 3.5 - 3} r="1.6" fill="#5C636B" />
            )),
          )}
        </g>
      )}

      {kind === "globe" && (
        <g>
          <circle cx="40" cy="38" r="26" fill={`url(#${g("sphere")})`} />
          <g fill="none" stroke="#2A2C2F" strokeOpacity="0.45" strokeWidth="1">
            <ellipse cx="40" cy="38" rx="26" ry="9" />
            <ellipse cx="40" cy="38" rx="11" ry="26" />
            <path d="M14 38 H66" />
          </g>
          {/* Red location pin */}
          <path d="M50 14 C55 14 58 17.5 58 22 C58 28 50 35 50 35 C50 35 42 28 42 22 C42 17.5 45 14 50 14 Z" fill={`url(#${g("red")})`} />
          <circle cx="50" cy="22" r="3" fill="#F4F5F6" />
        </g>
      )}
    </svg>
  );
}

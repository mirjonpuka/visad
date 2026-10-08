import * as THREE from "three";

/*
 * Procedural cross-section of a generic thermally broken window profile
 * (3D spec §Geometry). Units: mm. Not a copy of any ALUMIL drawing.
 * Each part is a 2D shape (outer contour + chamber holes) extruded 220mm on Z.
 */

type Pt = [number, number];

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 220,
  bevelEnabled: true,
  bevelSize: 0.4,
  bevelThickness: 0.4,
  bevelSegments: 2,
  curveSegments: 6,
};

function poly(points: Pt[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return shape;
}

function rectPts(x0: number, x1: number, y0: number, y1: number): Pt[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

function hole(x0: number, x1: number, y0: number, y1: number) {
  const path = new THREE.Path();
  rectPts(x0, x1, y0, y1).forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  path.closePath();
  return path;
}

function roundedRect(x0: number, x1: number, y0: number, y1: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - r);
  s.quadraticCurveTo(x1, y1, x1 - r, y1);
  s.lineTo(x0 + r, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

/** Strip x 26→44 with 2mm dovetail ends that key into both shells. */
function dovetailStrip(y0: number, y1: number) {
  return poly([
    [24, y0 - 2],
    [26, y0],
    [44, y0],
    [46, y0 - 2],
    [46, y1 + 2],
    [44, y1],
    [26, y1],
    [24, y1 + 2],
  ]);
}

function extrude(shape: THREE.Shape) {
  const geometry = new THREE.ExtrudeGeometry(shape, EXTRUDE);
  geometry.translate(0, 0, -EXTRUDE.depth! / 2);
  return geometry;
}

export type PartName =
  | "outerShell"
  | "breakA"
  | "breakB"
  | "innerShell"
  | "bead"
  | "gasketOuter"
  | "gasketInner"
  | "paneOuter"
  | "paneInner"
  | "spacer";

export function buildProfileParts(): Record<PartName, THREE.ExtrudeGeometry> {
  const outer = poly([
    [0, 0],
    [26, 0],
    [26, 70],
    [32, 70],
    [32, 80],
    [0, 80],
  ]);
  outer.holes.push(hole(2, 24, 2, 36), hole(2, 24, 40, 66));

  const inner = poly([
    [44, 0],
    [70, 0],
    [70, 80],
    [50, 80],
    [50, 88],
    [44, 88],
  ]);
  inner.holes.push(hole(46, 68, 2, 36), hole(46, 68, 40, 66));

  const bead = poly(rectPts(50, 56, 80, 100));
  bead.holes.push(hole(51, 55, 81, 99));

  return {
    outerShell: extrude(outer),
    breakA: extrude(dovetailStrip(18, 24)),
    breakB: extrude(dovetailStrip(56, 62)),
    innerShell: extrude(inner),
    bead: extrude(bead),
    gasketOuter: extrude(roundedRect(20, 26, 80, 86, 2)),
    gasketInner: extrude(roundedRect(44, 50, 88, 94, 2)),
    paneOuter: extrude(poly(rectPts(26, 32, 86, 190))),
    paneInner: extrude(poly(rectPts(38, 44, 86, 190))),
    spacer: extrude(poly(rectPts(32, 38, 86, 96))),
  };
}

/**
 * Framing centre: the frame without the glass (x 0→70, y 0→100) sits slightly
 * below the middle; the glass (up to y 190) still fits when it slides in.
 */
export const PROFILE_CENTER = new THREE.Vector3(35, 62, 0);

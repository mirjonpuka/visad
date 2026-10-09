import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * Procedural aluminium window (owner request, replaces the single profile):
 * a thermally broken frame and sash built from real cross-sections (3D spec
 * §Geometry, generic — not an ALUMIL drawing), double glazing and a handle,
 * set in a wall. Units: mm (the scene scales by 0.001 → metres).
 */

type Pt = [number, number];

export const WINDOW = {
  width: 1200,
  height: 1500,
  /** Frame face width and depth (the 3D spec's 80 × 70 section) */
  frameFace: 80,
  frameDepth: 70,
  /** Sash section */
  sashFace: 70,
  sashDepth: 60,
};

function poly(points: Pt[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return shape;
}
const rect = (x0: number, x1: number, y0: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
function hole(x0: number, x1: number, y0: number, y1: number) {
  const path = new THREE.Path();
  rect(x0, x1, y0, y1).forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  path.closePath();
  return path;
}

/** Cross-sections: x = depth (0 → outside), y = face (0 = outer edge → inward) */
function frameSections() {
  const outer = poly(rect(0, 26, 0, 80));
  outer.holes.push(hole(2, 24, 2, 36), hole(2, 24, 40, 66));
  const inner = poly([
    [44, 0],
    [70, 0],
    [70, 80],
    [50, 80],
    [50, 86],
    [44, 86],
  ]);
  inner.holes.push(hole(46, 68, 2, 36), hole(46, 68, 40, 66));
  return {
    aluminium: [outer],
    aluminiumInner: [inner],
    polyamide: [poly(rect(25, 45, 18.5, 23.5)), poly(rect(25, 45, 56.5, 61.5))],
    epdm: [poly(rect(44, 50, 86, 91))],
  };
}

function sashSections() {
  const outer = poly(rect(0, 24, 0, 70));
  outer.holes.push(hole(2, 22, 2, 32), hole(2, 22, 36, 58));
  const inner = poly(rect(36, 60, 0, 70));
  inner.holes.push(hole(38, 58, 2, 32), hole(38, 58, 36, 58));
  return {
    aluminium: [outer],
    aluminiumInner: [inner, poly(rect(50, 56, 70, 84))], // + glazing bead
    polyamide: [poly(rect(23, 37, 14.5, 19.5)), poly(rect(23, 37, 46.5, 51.5))],
    epdm: [poly(rect(18, 24, 70, 75)), poly(rect(44, 50, 84, 89))],
  };
}

type Side = "top" | "right" | "bottom" | "left";
export const SIDES: Side[] = ["top", "right", "bottom", "left"];

/**
 * Basis that maps the section (x depth, y inward, z length) onto a side of a
 * rectangle centred at the origin. The camera is inside the room (+Z): the
 * section's outside (x = 0) faces −Z, the room side +Z.
 */
function sideMatrix(side: Side, w: number, h: number, depth: number) {
  const m = new THREE.Matrix4();
  const e1 = new THREE.Vector3(0, 0, 1);
  const inward = {
    top: new THREE.Vector3(0, -1, 0),
    bottom: new THREE.Vector3(0, 1, 0),
    left: new THREE.Vector3(1, 0, 0),
    right: new THREE.Vector3(-1, 0, 0),
  }[side];
  const e3 = new THREE.Vector3().crossVectors(e1, inward);
  m.makeBasis(e1, inward, e3);
  const offset = {
    top: new THREE.Vector3(0, h / 2, 0),
    bottom: new THREE.Vector3(0, -h / 2, 0),
    left: new THREE.Vector3(-w / 2, 0, 0),
    right: new THREE.Vector3(w / 2, 0, 0),
  }[side];
  m.setPosition(offset.x, offset.y, -depth / 2);
  return m;
}

function extrudeAlong(shapes: THREE.Shape[], length: number, matrix: THREE.Matrix4) {
  const geos = shapes.map((shape) => {
    // Slightly chamfered edges (owner brief C3): a 0.6mm single-segment bevel
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: length,
      bevelEnabled: true,
      bevelSize: 0.6,
      bevelThickness: 0.6,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -length / 2);
    g.applyMatrix4(matrix);
    return g;
  });
  const merged = mergeGeometries(geos)!;
  geos.forEach((g) => g.dispose());
  return merged;
}

export type Member = {
  side: Side;
  /** Outer (weather side) and inner (room side) aluminium shells, split so step 2 can part them */
  aluminium: THREE.BufferGeometry;
  aluminiumInner: THREE.BufferGeometry;
  polyamide: THREE.BufferGeometry;
  epdm: THREE.BufferGeometry;
};

/** Four members of a rectangle: top/bottom run full width, the sides fit between them (no overlapping faces). */
function members(sections: ReturnType<typeof frameSections>, w: number, h: number, depth: number, face: number): Member[] {
  return SIDES.map((side) => {
    const length = side === "top" || side === "bottom" ? w : h - 2 * face;
    const matrix = sideMatrix(side, w, h, depth);
    return {
      side,
      aluminium: extrudeAlong(sections.aluminium, length, matrix),
      aluminiumInner: extrudeAlong(sections.aluminiumInner, length, matrix),
      polyamide: extrudeAlong(sections.polyamide, length, matrix),
      epdm: extrudeAlong(sections.epdm, length, matrix),
    };
  });
}

export function buildWindow() {
  const { width: W, height: H, frameFace, frameDepth, sashFace, sashDepth } = WINDOW;
  const frame = members(frameSections(), W, H, frameDepth, frameFace);

  // Sash overlaps the frame opening by 12mm on every side (rebate)
  const sw = W - 2 * frameFace + 2 * 12;
  const sh = H - 2 * frameFace + 2 * 12;
  const sash = members(sashSections(), sw, sh, sashDepth, sashFace);

  // Double glazing: two 6mm panes + spacer, inside the sash
  const gw = sw - 2 * sashFace + 20;
  const gh = sh - 2 * sashFace + 20;
  const pane = new THREE.BoxGeometry(gw, gh, 6);
  const spacer = new THREE.BoxGeometry(gw - 4, gh - 4, 12);

  // Handle on the side opposite the hinge: rounded rosette + lever pointing down (closed)
  const handleBase = new THREE.CapsuleGeometry(13, 46, 4, 12);
  handleBase.scale(1, 1, 0.55);
  const handleLever = new THREE.CapsuleGeometry(9, 130, 4, 12);
  handleLever.translate(0, -62, 16);

  // Two hinges on the hinge side (room face of the sash)
  const hinge = new THREE.CylinderGeometry(9, 9, 90, 16);

  // Drainage slots on the outside face of the bottom frame bar
  const slot = new THREE.BoxGeometry(32, 6, 3);

  // Wall around the frame (same colour as the page section); its room-side
  // face sits 20mm behind the frame's room-side face
  const wallShape = poly(rect(-4000, 4000, -3500, 3500));
  wallShape.holes.push(hole(-W / 2, W / 2, -H / 2, H / 2));
  const wall = new THREE.ExtrudeGeometry(wallShape, { depth: 260, bevelEnabled: false });
  wall.translate(0, 0, -260 + frameDepth / 2 - 20);

  return {
    frame,
    sash,
    sashSize: { w: sw, h: sh },
    glass: { pane, spacer, w: gw, h: gh },
    handle: { base: handleBase, lever: handleLever },
    hinge,
    slot,
    wall,
  };
}

/** Soft warm light seen through the opening; fades into the page colour at the edges. */
export function outsideTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size * 0.45, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "#fbf3e2");
  g.addColorStop(0.25, "#e9d9bd");
  g.addColorStop(0.55, "#6f7883");
  g.addColorStop(1, "#0e0f11");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

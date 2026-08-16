/**
 * Shared geometry for the VEYRO "V" symbol system. A single pair of
 * quadrilateral bars, defined once in a 0–64 viewBox, drives every
 * rendering of the mark (VMark, VMask, favicon-style reductions) so the
 * shape stays identical everywhere it appears.
 */

export type Point = [number, number];

export const V_VIEWBOX = 64;

export const V_LEFT_BAR: Point[] = [
  [8, 6],
  [24, 6],
  [38, 58],
  [22, 58],
];

export const V_RIGHT_BAR: Point[] = [
  [56, 6],
  [40, 6],
  [26, 58],
  [42, 58],
];

export function pointsToPath(points: Point[], scale = 1): string {
  const [first, ...rest] = points;
  if (!first) return "";
  const fmt = (n: number) => Number((n * scale).toFixed(4));
  const start = `M${fmt(first[0])},${fmt(first[1])}`;
  const lines = rest.map((p) => `L${fmt(p[0])},${fmt(p[1])}`).join(" ");
  return `${start} ${lines} Z`;
}

export const V_LEFT_PATH = pointsToPath(V_LEFT_BAR);
export const V_RIGHT_PATH = pointsToPath(V_RIGHT_BAR);

/** Both bars combined, normalized to 0–1 for use with clipPathUnits="objectBoundingBox". */
export const V_MASK_PATH_NORMALIZED = `${pointsToPath(V_LEFT_BAR, 1 / V_VIEWBOX)} ${pointsToPath(
  V_RIGHT_BAR,
  1 / V_VIEWBOX
)}`;

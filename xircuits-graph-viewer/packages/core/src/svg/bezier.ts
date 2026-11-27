/**
 * Generate a cubic bezier path between two points.
 * Matches react-diagrams' DefaultLinkModel.getSVGPath() behavior:
 * control points offset horizontally by `curvyness` (default 50).
 */
export function bezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curvyness: number = 50,
): string {
  return `M${x1},${y1} C${x1 + curvyness},${y1} ${x2 - curvyness},${y2} ${x2},${y2}`;
}

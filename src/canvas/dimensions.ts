import { label, line, type Point } from "./primitives";

type DimensionStyle = { text: string; offset: number };

export function dimension(
  context: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  style: DimensionStyle,
): void {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) return;
  const normal = { x: -(to.y - from.y) / length, y: (to.x - from.x) / length };
  const start = move(from, normal, style.offset);
  const end = move(to, normal, style.offset);
  const color = "#64748b";
  line(context, from, start, { color });
  line(context, to, end, { color });
  line(context, start, end, { color });
  tick(context, start, normal, color);
  tick(context, end, normal, color);
  label(context, style.text, midpoint(start, end, normal), {
    align: "center", color: "#94a3b8",
  });
}

function move(point: Point, vector: Point, amount: number): Point {
  return { x: point.x + vector.x * amount, y: point.y + vector.y * amount };
}

function midpoint(from: Point, to: Point, normal: Point): Point {
  return {
    x: (from.x + to.x) / 2 + normal.x * 10,
    y: (from.y + to.y) / 2 + normal.y * 10,
  };
}

function tick(
  context: CanvasRenderingContext2D,
  point: Point,
  normal: Point,
  color: string,
): void {
  line(context, move(point, normal, -4), move(point, normal, 4), { color });
}

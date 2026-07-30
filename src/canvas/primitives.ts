export type Point = { x: number; y: number };
export type Stroke = { color: string; width?: number };
export type CircleStyle = { fill: string; stroke?: string };
export type LabelStyle = { color?: string; align?: CanvasTextAlign };

export function line(
  context: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  stroke: Stroke,
): void {
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.strokeStyle = stroke.color;
  context.lineWidth = stroke.width ?? 1;
  context.stroke();
}

export function circle(
  context: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  style: CircleStyle,
): void {
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, Math.PI * 2);
  context.fillStyle = style.fill;
  context.fill();
  if (style.stroke === undefined) return;
  context.strokeStyle = style.stroke;
  context.stroke();
}

export function label(
  context: CanvasRenderingContext2D,
  text: string,
  point: Point,
  style: LabelStyle = {},
): void {
  context.fillStyle = style.color ?? "#cbd5e1";
  context.font = "12px system-ui, sans-serif";
  context.textAlign = style.align ?? "left";
  context.fillText(text, point.x, point.y);
}

export function polygon(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  fill: string,
  stroke: string,
): void {
  const first = points[0];
  if (first === undefined) return;
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (const point of points.slice(1)) context.lineTo(point.x, point.y);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.stroke();
}

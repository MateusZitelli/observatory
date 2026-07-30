import type { Point } from "./types";

type CanvasFrame = {
  ctx: CanvasRenderingContext2D;
  cx: number;
  cy: number;
  scale: number;
};
type SegmentArgs = CanvasFrame & { p1: Point; p2: Point; color: string; width: number };
type CircleArgs = CanvasFrame & { p: Point; color: string; r: number };
type DimensionArgs = CanvasFrame & {
  p1: Point;
  p2: Point;
  text: string;
  color: string;
  offsetPxls?: number;
};

export function drawSeg({ ctx, cx, cy, scale, p1, p2, color, width }: SegmentArgs): void {
  ctx.beginPath();
  ctx.moveTo(cx + p1.x * scale, cy - p1.y * scale);
  ctx.lineTo(cx + p2.x * scale, cy - p2.y * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function drawCirc({ ctx, cx, cy, scale, p, color, r }: CircleArgs): void {
  ctx.beginPath();
  ctx.arc(cx + p.x * scale, cy - p.y * scale, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawDim({ ctx, cx, cy, scale, p1, p2, text, color, offsetPxls = 30 }: DimensionArgs): void {
  const mx = cx + ((p1.x + p2.x) / 2) * scale;
  const my = cy - ((p1.y + p2.y) / 2) * scale;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const l = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / l;
  const ny = -dx / l;
  ctx.fillStyle = color;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, mx + nx * offsetPxls, my + ny * offsetPxls + 4);
  ctx.beginPath();
  ctx.moveTo(
    cx + p1.x * scale + nx * (offsetPxls - 10),
    cy - p1.y * scale + ny * (offsetPxls - 10),
  );
  ctx.lineTo(
    cx + p2.x * scale + nx * (offsetPxls - 10),
    cy - p2.y * scale + ny * (offsetPxls - 10),
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

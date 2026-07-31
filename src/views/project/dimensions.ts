import type { ProjectFrame } from "./types";

type Dimension = {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly label: string;
  readonly offset: number;
};

function drawDimensionGeometry(ctx: CanvasRenderingContext2D, d: Dimension, len: number): void {
  const dx = d.x2 - d.x1, dy = d.y2 - d.y1;
  const nx = -dy / len * d.offset, ny = dx / len * d.offset;
  ctx.beginPath();
  ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x1 + nx, d.y1 + ny);
  ctx.moveTo(d.x2, d.y2); ctx.lineTo(d.x2 + nx, d.y2 + ny); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(d.x1 + nx, d.y1 + ny); ctx.lineTo(d.x2 + nx, d.y2 + ny); ctx.stroke();
  const tx = dx / len * 4, ty = dy / len * 4;
  ctx.beginPath();
  ctx.moveTo(d.x1 + nx - tx, d.y1 + ny - ty); ctx.lineTo(d.x1 + nx + tx, d.y1 + ny + ty);
  ctx.moveTo(d.x2 + nx - tx, d.y2 + ny - ty); ctx.lineTo(d.x2 + nx + tx, d.y2 + ny + ty); ctx.stroke();
}

function drawDimensionLabel(ctx: CanvasRenderingContext2D, d: Dimension, len: number): void {
  const dx = d.x2 - d.x1, dy = d.y2 - d.y1;
  const nx = -dy / len * d.offset, ny = dx / len * d.offset;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.label, (d.x1 + d.x2) / 2 + nx * 1.5, (d.y1 + d.y2) / 2 + ny * 1.5);
}

export function drawDimLine(frame: ProjectFrame, d: Dimension): void {
  const len = Math.sqrt((d.x2 - d.x1) * (d.x2 - d.x1) + (d.y2 - d.y1) * (d.y2 - d.y1));
  if (len < 1) return;
  frame.ctx.strokeStyle = "#94a3b8";
  frame.ctx.lineWidth = 1;
  frame.ctx.setLineDash([]);
  drawDimensionGeometry(frame.ctx, d, len);
  drawDimensionLabel(frame.ctx, d, len);
}

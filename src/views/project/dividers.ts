import type { ProjectFrame } from "./types";

export function drawProjectDividers(frame: ProjectFrame): void {
  const { ctx, uiWidth, availW, w, h } = frame;
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(uiWidth + availW / 2, 0);
  ctx.lineTo(uiWidth + availW / 2, h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(uiWidth + availW / 2, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}

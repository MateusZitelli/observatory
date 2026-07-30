import { calculatePlanGeometry } from "./geometry";
import { drawPlanDimensions, drawPlanStructure } from "./layers";
import { drawPlanGrid } from "./grid";

export function drawPlan2D(): void {
  const ctx = globalThis.canvas2D.getContext("2d");
  if (ctx === null) throw new Error("2D canvas context unavailable");
  const w = globalThis.canvas2D.width;
  const h = globalThis.canvas2D.height;
  ctx.clearRect(0, 0, w, h);
  drawPlanGrid(ctx, w, h);
  const uiWidth = 400;
  const cx = (w + uiWidth) / 2;
  const cy = h - 100;
  const scale = 250;
  const g = calculatePlanGeometry();
  drawPlanStructure({ ctx, cx, cy, scale, g });
  drawPlanDimensions({ ctx, cx, cy, scale, g });
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Vista de Perfil 2D - GEM (Apontada ao Polo)", cx, cy - 20);
}

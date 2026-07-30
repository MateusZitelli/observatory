import { drawCirc, drawDim, drawSeg } from "./canvas";
import type { PlanGeometry } from "./types";

type DrawContext = {
  ctx: CanvasRenderingContext2D;
  cx: number;
  cy: number;
  scale: number;
  g: PlanGeometry;
};

export function drawPlanStructure({ ctx, cx, cy, scale, g }: DrawContext): void {
  const frame = { ctx, cx, cy, scale };
  drawSeg({ ...frame, p1: { x: -3, y: 0 }, p2: { x: 3, y: 0 }, color: "#334155", width: 4 });
  drawSeg({ ...frame, p1: { x: 0, y: 0 }, p2: g.pBase, color: "#d1d5db", width: 30 });
  drawSeg({ ...frame, p1: { x: -0.15, y: g.H_con }, p2: { x: 0.15, y: g.H_con }, color: "#64748b", width: 6 });
  drawSeg({ ...frame, p1: g.pPivotBase, p2: g.pExtTop, color: "#4b5563", width: 14 });
  if (g.Y_MOUNT > 0.001) drawSeg({ ...frame, p1: g.pExtTop, p2: g.pPivot, color: "#1f2937", width: 12 });
  if (g.Y_BASE > 0.01) drawSeg({ ...frame, p1: g.pPivot, p2: g.pRaStart, color: "#94a3b8", width: 12 });
  drawSeg({ ...frame, p1: g.pRaStart, p2: g.pCross, color: "#3b82f6", width: 8 });
  drawSeg({ ...frame, p1: g.pCW, p2: g.pTube, color: "#eab308", width: 8 });
  drawCirc({ ...frame, p: g.pPivot, color: "#ef4444", r: 8 });
  drawCirc({ ...frame, p: g.pCross, color: "#3b82f6", r: 6 });
  drawCirc({ ...frame, p: g.pTube, color: "#eab308", r: 6 });
  drawCirc({ ...frame, p: g.pCW, color: "#111827", r: 16 });
  const tubePixelWidth = g.TUBE_D * scale;
  drawSeg({ ...frame, p1: g.pBack, p2: g.pFront, color: "#1f2937", width: tubePixelWidth });
  if (g.EYE_LEN > 0.001) drawSeg({ ...frame, p1: g.pEye, p2: g.pBack, color: "#9ca3af", width: 10 });
  const dovetailOffset = g.TUBE_D / 2 + 0.01;
  const dtFront = {
    x: g.pFront.x - g.vDec.x * dovetailOffset,
    y: g.pFront.y - g.vDec.y * dovetailOffset,
  };
  const dtBack = {
    x: g.pBack.x - g.vDec.x * dovetailOffset,
    y: g.pBack.y - g.vDec.y * dovetailOffset,
  };
  drawSeg({ ...frame, p1: dtBack, p2: dtFront, color: "#f97316", width: 4 });
}

export function drawPlanDimensions({ ctx, cx, cy, scale, g }: DrawContext): void {
  const frame = { ctx, cx, cy, scale };
  const tubePixelWidth = g.TUBE_D * scale;
  if (g.Y_MOUNT > 0.01) drawDim({ ...frame, p1: g.pExtTop, p2: g.pPivot, text: "Y_MOUNT", color: "#f87171", offsetPxls: -30 });
  if (g.Y_BASE > 0.01) drawDim({ ...frame, p1: g.pPivot, p2: g.pRaStart, text: "Y_BASE", color: "#f87171", offsetPxls: 40 });
  drawDim({ ...frame, p1: g.pRaStart, p2: g.pCross, text: "Z_RA", color: "#60a5fa" });
  drawDim({ ...frame, p1: g.pCross, p2: g.pTube, text: "Y_DEC", color: "#facc15", offsetPxls: -(tubePixelWidth / 2 + 20) });
  drawDim({ ...frame, p1: g.pCW, p2: g.pCross, text: "Y_CW", color: "#cbd5e1", offsetPxls: -40 });
  drawDim({ ...frame, p1: g.pBack, p2: g.pFront, text: "TUBE_LEN", color: "#d1d5db", offsetPxls: tubePixelWidth / 2 + 35 });
  if (g.EYE_LEN > 0.01) drawDim({ ...frame, p1: g.pEye, p2: g.pBack, text: "EYE_LEN", color: "#fdba74", offsetPxls: tubePixelWidth / 2 + 35 });
  if (Math.abs(g.TUBE_OFF) > 0.001) drawDim({ ...frame, p1: g.pCenter, p2: g.pTube, text: "OFFSET", color: "#fca5a5", offsetPxls: -(tubePixelWidth / 2 + 45) });
  if (Math.abs(g.X_PIVOT) > 0.01) drawDim({ ...frame, p1: g.pBase, p2: g.pPivotBase, text: "X_PIVOT", color: "#f87171", offsetPxls: 20 });
}

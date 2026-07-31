import type { SkyFrame, SkySnapshot, TraceRay } from "./sky-types";

export type OcclusionResult = { readonly eyeLow: number; readonly eyeHigh: number };
export function ensureRoofTotal(rD: number): void {
  if (globalThis.derived.roofTotalZ !== 0) return;
  const beiral = 0.15;
  const overlap = 0.05;
  const tileLength = 3.0;
  const ridgeLength = rD + 2 * beiral;
  const ridgeCount = Math.ceil(ridgeLength / (tileLength - overlap));
  globalThis.derived.roofTotalZ = ridgeCount * tileLength - (ridgeCount - 1) * overlap;
}
type Cell = { readonly frame: SkyFrame; readonly ctx: CanvasRenderingContext2D; readonly ai: number; readonly ei: number; readonly hit: string | null };
function drawCell(cell: Cell): void {
  if (cell.hit === null) return;
  const r1 = cell.frame.elevToR((cell.ei / 45) * 90), r2 = cell.frame.elevToR(((cell.ei + 1) / 45) * 90);
  const a1 = ((cell.ai / 360) * 360 - 90) * (Math.PI / 180), a2 = (((cell.ai + 1) / 360) * 360 - 90) * (Math.PI / 180);
  cell.ctx.beginPath(); cell.ctx.arc(cell.frame.cx, cell.frame.cy, r1, a1, a2);
  cell.ctx.arc(cell.frame.cx, cell.frame.cy, r2, a2, a1, true); cell.ctx.closePath();
  cell.ctx.fillStyle = cell.hit === "roof" ? "rgba(234, 179, 8, 0.35)" : "rgba(239, 68, 68, 0.30)";
  cell.ctx.fill();
}
type OcclusionLayers = { readonly frame: SkyFrame; readonly traceRay: TraceRay; readonly ctxLow: CanvasRenderingContext2D; readonly ctxHigh: CanvasRenderingContext2D; readonly eyeLow: number; readonly eyeHigh: number };
function drawOcclusionCells(layers: OcclusionLayers): void {
  for (let ai = 0; ai < 360; ai++) {
    const azMid = ((ai + 0.5) / 360) * 2 * Math.PI;
    for (let ei = 0; ei < 45; ei++) {
      const el1 = (ei / 45) * 90;
      const el2 = ((ei + 1) / 45) * 90;
      const elMid = ((el1 + el2) / 2) * (Math.PI / 180);
      drawCell({ frame: layers.frame, ctx: layers.ctxLow, ai, ei, hit: layers.traceRay(azMid, elMid, layers.eyeLow) });
      drawCell({ frame: layers.frame, ctx: layers.ctxHigh, ai, ei, hit: layers.traceRay(azMid, elMid, layers.eyeHigh) });
    }
  }
}
function createLayerCanvas(frame: SkyFrame): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = frame.w; canvas.height = frame.h;
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("2D canvas context unavailable");
  return ctx;
}
export function drawOcclusion(frame: SkyFrame, traceRay: TraceRay, snapshot: SkySnapshot): OcclusionResult {
  ensureRoofTotal(snapshot.rD);
  const eyeLow = Math.max(globalThis.derived.currentEyeMinZ, 0.5);
  const eyeHigh = Math.max(globalThis.derived.currentMaxVolZ, frame.HTotal);
  const ctxLow = createLayerCanvas(frame);
  const ctxHigh = createLayerCanvas(frame);
  drawOcclusionCells({ frame, traceRay, ctxLow, ctxHigh, eyeLow, eyeHigh });
  frame.ctx.globalAlpha = 0.5; frame.ctx.drawImage(ctxLow.canvas, 0, 0); frame.ctx.drawImage(ctxHigh.canvas, 0, 0); frame.ctx.globalAlpha = 1.0;
  return { eyeLow, eyeHigh };
}

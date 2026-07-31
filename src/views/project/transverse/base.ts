import type { SectionView } from "../types";

function drawGround(view: SectionView): void {
  const { ctx, toS, rW, BEIRAL } = view;
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath();
  const totalSecW = rW + BEIRAL * 2 + 0.6;
  const gl = toS(-totalSecW / 2, 0), gr = toS(totalSecW / 2, 0);
  ctx.moveTo(gl.x, gl.y); ctx.lineTo(gr.x, gr.y); ctx.stroke(); ctx.setLineDash([]);
}

type TransverseWalls = {
  wallTL: ReturnType<SectionView["toS"]>;
  wallTR: ReturnType<SectionView["toS"]>;
};

function drawWalls(view: SectionView): TransverseWalls {
  const { ctx, toS, rW, rH } = view;
  ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 3;
  const wallBL = toS(-rW / 2, 0), wallTL = toS(-rW / 2, rH);
  const wallBR = toS(rW / 2, 0), wallTR = toS(rW / 2, rH);
  ctx.beginPath();
  ctx.moveTo(wallBL.x, wallBL.y); ctx.lineTo(wallTL.x, wallTL.y);
  ctx.moveTo(wallBR.x, wallBR.y); ctx.lineTo(wallTR.x, wallTR.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallBL.x, wallBL.y); ctx.lineTo(wallBR.x, wallBR.y); ctx.stroke();
  return { wallTL, wallTR };
}

function drawRoof(view: SectionView, walls: TransverseWalls): void {
  const { ctx, toS, halfSpan, rH, roofPeakH } = view;
  const { wallTL, wallTR } = walls;
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 2;
  const roofL = toS(-halfSpan, rH);
  const roofR = toS(halfSpan, rH);
  const ridge = toS(0, roofPeakH);
  ctx.beginPath(); ctx.moveTo(roofL.x, roofL.y); ctx.lineTo(ridge.x, ridge.y); ctx.lineTo(roofR.x, roofR.y); ctx.stroke();
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(roofL.x, roofL.y); ctx.lineTo(wallTL.x, wallTL.y);
  ctx.moveTo(roofR.x, roofR.y); ctx.lineTo(wallTR.x, wallTR.y); ctx.stroke();
}

function drawTileSide(view: SectionView, side: number): void {
  const { ctx, toS, halfSpan, roofPeakH, pitchDeg } = view;
  const TILE_OV3 = 0.05, TILE_W3 = 1.0;
  const pitch3 = pitchDeg * Math.PI / 180;
  const slopeLen3 = halfSpan / Math.cos(pitch3);
  const nSlope3 = Math.ceil(slopeLen3 / (TILE_W3 - TILE_OV3));
  for (let s = 0; s < nSlope3; s++) {
    const slopeDist = s * (TILE_W3 - TILE_OV3), slopeEnd = slopeDist + TILE_W3;
    const x1 = slopeDist * Math.cos(pitch3), y1 = -slopeDist * Math.sin(pitch3);
    const x2 = slopeEnd * Math.cos(pitch3), y2 = -slopeEnd * Math.sin(pitch3);
    const p1 = toS(side * x1, roofPeakH + y1);
    const p2 = toS(side * x2, roofPeakH + y2);
    void p1;
    ctx.beginPath(); ctx.moveTo(p2.x, p2.y);
    const nx = -Math.sin(pitch3) * 3 * side, ny = -Math.cos(pitch3) * 3;
    ctx.lineTo(p2.x + nx, p2.y + ny); ctx.stroke();
  }
}

function drawTiles(view: SectionView): void {
  const { ctx } = view;
  const TILE_H3 = 0.04;
  void TILE_H3;
  ctx.strokeStyle = "rgba(120, 113, 108, 0.6)"; ctx.lineWidth = 1;
  drawTileSide(view, -1);
  drawTileSide(view, 1);
}

export function drawTransverseBase(view: SectionView): void {
  drawGround(view);
  const walls = drawWalls(view);
  drawRoof(view, walls);
  drawTiles(view);
}

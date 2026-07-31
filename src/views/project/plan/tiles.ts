import type { PlanView } from "../types";

type TileGrid = {
  nRidge: number;
  nSlope: number;
  tileLength: number;
  tileOverlap: number;
  tileHorizWidth: number;
  pitchDeg: number;
};

type TilePosition = {
  side: number;
  row: number;
  slope: number;
};

function drawTile(view: PlanView, position: TilePosition, grid: TileGrid, previousCount: number): number {
  const { ctx, toS } = view;
  let tileCount = previousCount;
  tileCount++;
  const isAlt = (position.row + position.slope) % 2 === 0;
  const zCenter = (position.row - (grid.nRidge - 1) / 2) * (grid.tileLength - grid.tileOverlap);
  const xStart = position.slope * (grid.tileHorizWidth - grid.tileOverlap * Math.cos(grid.pitchDeg * Math.PI / 180));
  const xEnd = xStart + grid.tileHorizWidth;
  const tl = toS(position.side * xStart, zCenter - grid.tileLength / 2);
  const br = toS(position.side * xEnd, zCenter + grid.tileLength / 2);
  ctx.fillStyle = isAlt ? "rgba(120, 113, 108, 0.12)" : "rgba(107, 101, 96, 0.12)";
  const rx = Math.min(tl.x, br.x), ry = Math.min(tl.y, br.y);
  const rw = Math.abs(br.x - tl.x);
  const rh = Math.abs(br.y - tl.y);
  ctx.fillRect(rx, ry, rw, rh); ctx.strokeRect(rx, ry, rw, rh);
  ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
  ctx.font = "8px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(tileCount.toString(), rx + rw / 2, ry + rh / 2 + 3);
  return tileCount;
}

function drawTileRows(view: PlanView, side: number, grid: TileGrid, previousCount: number): number {
  let tileCount = previousCount;
  for (let r = 0; r < grid.nRidge; r++) {
    for (let s = 0; s < grid.nSlope; s++) {
      tileCount = drawTile(view, { side, row: r, slope: s }, grid, tileCount);
    }
  }
  return tileCount;
}

function drawTileGrid(view: PlanView): void {
  const { ctx, state, rW, rD, pitchDeg, BEIRAL } = view;
  const TILE_L = 2.5, TILE_OV = 0.05, TILE_W2 = 1.0;
  const projDir = state.roofDir;
  const ridgeX2 = projDir === "N" || projDir === "S";
  const ridgeLen2 = (ridgeX2 ? rW : rD) + 2 * BEIRAL;
  const halfSpan2 = (ridgeX2 ? rD : rW) / 2 + BEIRAL;
  const slopeLen2 = halfSpan2 / Math.cos(pitchDeg * Math.PI / 180);
  const nRidge2 = Math.ceil(ridgeLen2 / (TILE_L - TILE_OV));
  const nSlope2 = Math.ceil(slopeLen2 / (TILE_W2 - TILE_OV));
  const totalTiles = nRidge2 * nSlope2 * 2;
  const tileHorizW = TILE_W2 * Math.cos(pitchDeg * Math.PI / 180);
  const grid = { nRidge: nRidge2, nSlope: nSlope2, tileLength: TILE_L, tileOverlap: TILE_OV, tileHorizWidth: tileHorizW, pitchDeg };
  ctx.strokeStyle = "rgba(120, 113, 108, 0.5)";
  ctx.lineWidth = 1;
  let tileCount = 0;
  tileCount = drawTileRows(view, 1, grid, tileCount);
  tileCount = drawTileRows(view, -1, grid, tileCount);
  drawTileRidge(view, totalTiles);
}

function drawTileRidge(view: PlanView, totalTiles: number): void {
  const { ctx, toS, rW, rD, BEIRAL } = view;
  ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
  ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
  const cTop = toS(0, -rD / 2 - BEIRAL);
  const cBot = toS(0, rD / 2 + BEIRAL);
  ctx.beginPath(); ctx.moveTo(cTop.x, cTop.y); ctx.lineTo(cBot.x, cBot.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#eab308"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left";
  const tlLabel = toS(-rW / 2 - 0.3, rD / 2 + 0.2);
  ctx.fillText(totalTiles + " telhas 3×1m", tlLabel.x, tlLabel.y);
}

export function drawPlanTiles(view: PlanView): void {
  drawTileGrid(view);
}

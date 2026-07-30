import type { PlanView } from "../types";

export function drawPlanTiles(view: PlanView): void {
  const { ctx, toS, state, rW, rD, pitchDeg, BEIRAL } = view;
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
  ctx.strokeStyle = "rgba(120, 113, 108, 0.5)";
  ctx.lineWidth = 1;
  let tileCount = 0;
  for (const side of [1, -1]) {
    for (let r = 0; r < nRidge2; r++) {
      for (let s = 0; s < nSlope2; s++) {
        tileCount++;
        const isAlt = (r + s) % 2 === 0;
        const zCenter = (r - (nRidge2 - 1) / 2) * (TILE_L - TILE_OV);
        const xStart = s * (tileHorizW - TILE_OV * Math.cos(pitchDeg * Math.PI / 180));
        const xEnd = xStart + tileHorizW;
        const tl = toS(side * xStart, zCenter - TILE_L / 2);
        const br = toS(side * xEnd, zCenter + TILE_L / 2);
        ctx.fillStyle = isAlt ? "rgba(120, 113, 108, 0.12)" : "rgba(107, 101, 96, 0.12)";
        const rx = Math.min(tl.x, br.x), ry = Math.min(tl.y, br.y);
        const rw = Math.abs(br.x - tl.x), rh = Math.abs(br.y - tl.y);
        ctx.fillRect(rx, ry, rw, rh); ctx.strokeRect(rx, ry, rw, rh);
        ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
        ctx.font = "8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(tileCount.toString(), rx + rw / 2, ry + rh / 2 + 3);
      }
    }
  }
  ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
  ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
  const cTop = toS(0, -rD / 2 - BEIRAL), cBot = toS(0, rD / 2 + BEIRAL);
  ctx.beginPath(); ctx.moveTo(cTop.x, cTop.y); ctx.lineTo(cBot.x, cBot.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#eab308"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left";
  const tlLabel = toS(-rW / 2 - 0.3, rD / 2 + 0.2);
  ctx.fillText(totalTiles + " telhas 3×1m", tlLabel.x, tlLabel.y);
}

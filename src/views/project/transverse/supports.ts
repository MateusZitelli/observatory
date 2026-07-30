import type { SectionView } from "../types";

export function drawTransverseSupports(view: SectionView): void {
  const { ctx, toS, rW, rH } = view;
  ctx.fillStyle = "#4b5563"; ctx.strokeStyle = "#4b5563";
  const postW = 0.12;
  for (const sx of [-1, 1]) {
    const postBL = toS(sx * (rW / 2 + 0.04) - postW / 2, 0);
    const postTR = toS(sx * (rW / 2 + 0.04) + postW / 2, rH);
    ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo((postBL.x + postTR.x) / 2, postBL.y);
    ctx.lineTo((postBL.x + postTR.x) / 2, postTR.y); ctx.stroke();
    const railPt = toS(sx * (rW / 2 + 0.04), rH);
    ctx.fillRect(railPt.x - 4, railPt.y - 2, 8, 4);
  }
}

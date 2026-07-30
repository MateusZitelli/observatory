import type { SectionView } from "../types";

export function drawLongitudinalBase(view: SectionView): void {
  const { ctx, toS, rD, rH, roofPeakH, BEIRAL, slideLen } = view;
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  const glNS = toS(-rD / 2 - slideLen - 0.3, 0), grNS = toS(rD / 2 + 0.5, 0);
  ctx.beginPath(); ctx.moveTo(glNS.x, glNS.y); ctx.lineTo(grNS.x, grNS.y); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 3;
  const wallN_B = toS(-rD / 2, 0), wallN_T = toS(-rD / 2, rH);
  const wallS_B = toS(rD / 2, 0), wallS_T = toS(rD / 2, rH);
  ctx.beginPath();
  ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallN_T.x, wallN_T.y);
  ctx.moveTo(wallS_B.x, wallS_B.y); ctx.lineTo(wallS_T.x, wallS_T.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallS_B.x, wallS_B.y); ctx.stroke();
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 2;
  const ridgeN = toS(-rD / 2, roofPeakH), ridgeS = toS(rD / 2, roofPeakH);
  ctx.beginPath(); ctx.moveTo(ridgeN.x, ridgeN.y); ctx.lineTo(ridgeS.x, ridgeS.y); ctx.stroke();
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(wallN_T.x, wallN_T.y); ctx.lineTo(ridgeN.x, ridgeN.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallS_T.x, wallS_T.y); ctx.lineTo(ridgeS.x, ridgeS.y); ctx.stroke();
  const eaveN = toS(-rD / 2 - BEIRAL, rH), eaveS = toS(rD / 2 + BEIRAL, rH);
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(eaveN.x, eaveN.y); ctx.lineTo(wallN_T.x, wallN_T.y);
  ctx.moveTo(eaveS.x, eaveS.y); ctx.lineTo(wallS_T.x, wallS_T.y); ctx.stroke();
}

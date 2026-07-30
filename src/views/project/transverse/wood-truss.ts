import type { SectionView } from "../types";

export function drawTransverseTruss(view: SectionView): void {
  const { ctx, toS, halfSpan, rH, roofPeakH, ridgeRise, scale } = view;
  const woodCol = "#c4a35a";
  const beamW = Math.max(2, 0.06 * scale);
  void beamW;
  ctx.strokeStyle = woodCol; ctx.lineWidth = Math.max(2, 0.12 * scale);
  for (const sx of [-1, 1]) {
    const cBot = toS(sx * halfSpan, rH), cTop = toS(0, roofPeakH);
    ctx.beginPath(); ctx.moveTo(cBot.x, cBot.y); ctx.lineTo(cTop.x, cTop.y); ctx.stroke();
  }
  ctx.lineWidth = Math.max(2, 0.12 * scale);
  const tL = toS(-halfSpan, rH), tR = toS(halfSpan, rH);
  ctx.beginPath(); ctx.moveTo(tL.x, tL.y); ctx.lineTo(tR.x, tR.y); ctx.stroke();
  ctx.lineWidth = Math.max(1, 0.06 * scale);
  const pBot = toS(0, rH), pTop = toS(0, roofPeakH);
  ctx.beginPath(); ctx.moveTo(pBot.x, pBot.y); ctx.lineTo(pTop.x, pTop.y); ctx.stroke();
  for (const sx of [-1, 1]) {
    const sBot = toS(0, rH + ridgeRise * 0.4);
    const sTop = toS(sx * halfSpan * 0.5, rH + ridgeRise * 0.5);
    ctx.beginPath(); ctx.moveTo(sBot.x, sBot.y); ctx.lineTo(sTop.x, sTop.y); ctx.stroke();
  }
  ctx.fillStyle = woodCol; ctx.strokeStyle = "#8b7332"; ctx.lineWidth = 1;
  const cBL = toS(-0.03, roofPeakH - 0.16), cTR = toS(0.03, roofPeakH);
  ctx.fillRect(cBL.x, cTR.y, cTR.x - cBL.x, cBL.y - cTR.y); ctx.strokeRect(cBL.x, cTR.y, cTR.x - cBL.x, cBL.y - cTR.y);
  for (const sx of [-1, 1]) {
    const fBL = toS(sx * halfSpan - 0.03, rH - 0.15), fTR = toS(sx * halfSpan + 0.03, rH);
    ctx.fillRect(fBL.x, fTR.y, fTR.x - fBL.x, fBL.y - fTR.y); ctx.strokeRect(fBL.x, fTR.y, fTR.x - fBL.x, fBL.y - fTR.y);
  }
  for (const frac of [0.33, 0.66]) {
    for (const sx of [-1, 1]) {
      const tx = sx * halfSpan * (1 - frac), ty = rH + ridgeRise * frac;
      const tBL = toS(tx - 0.025, ty - 0.035), tTR = toS(tx + 0.025, ty + 0.035);
      ctx.fillRect(tBL.x, tTR.y, tTR.x - tBL.x, tBL.y - tTR.y); ctx.strokeRect(tBL.x, tTR.y, tTR.x - tBL.x, tBL.y - tTR.y);
    }
  }
  ctx.fillStyle = woodCol; ctx.font = "8px sans-serif"; ctx.textAlign = "left";
  const lCum = toS(0.05, roofPeakH - 0.05); ctx.fillText("cumeeira 6×16", lCum.x, lCum.y);
  const lFre = toS(halfSpan + 0.05, rH - 0.08); ctx.fillText("frechal 6×15", lFre.x, lFre.y);
  const lCaib = toS(halfSpan * 0.55, rH + ridgeRise * 0.45); ctx.fillText("caibro 6×12", lCaib.x + 5, lCaib.y - 8);
  const lPend = toS(0.05, rH + ridgeRise * 0.2); ctx.fillText("pendural 6×6", lPend.x, lPend.y);
  const lEsc = toS(halfSpan * 0.2, rH + ridgeRise * 0.35); ctx.fillText("escora 6×6", lEsc.x + 3, lEsc.y + 12);
  const lTerca = toS(halfSpan * 0.35, rH + ridgeRise * 0.65); ctx.fillText("terça 5×7", lTerca.x + 5, lTerca.y - 3);
}

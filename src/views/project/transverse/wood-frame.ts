import type { SectionView } from "../types";

export function drawTransverseFrame(view: SectionView): void {
  const { ctx, toS, state, rW, rH, scale } = view;
  const D = 0.09, S = 0.045, wfCol = "rgba(196, 163, 90, 0.6)";
  for (const sx of [-1, 1]) {
    const wx = sx * rW / 2;
    const sBot = toS(wx - sx * D / 2, 0), sTop = toS(wx + sx * D / 2, S);
    ctx.fillStyle = wfCol;
    ctx.fillRect(Math.min(sBot.x, sTop.x), sTop.y, Math.abs(sTop.x - sBot.x), sBot.y - sTop.y);
    for (let i = 0; i < 2; i++) {
      const y1 = rH - S * (i + 1), y2 = rH - S * i;
      const p1 = toS(wx - sx * D / 2, y1), p2 = toS(wx + sx * D / 2, y2);
      ctx.fillRect(Math.min(p1.x, p2.x), p2.y, Math.abs(p2.x - p1.x), p1.y - p2.y);
    }
    ctx.strokeStyle = wfCol; ctx.lineWidth = Math.max(1, S * scale);
    const mBot = toS(wx, S), mTop = toS(wx, rH - S * 2);
    ctx.beginPath(); ctx.moveTo(mBot.x, mBot.y); ctx.lineTo(mTop.x, mTop.y); ctx.stroke();
  }
  ctx.fillStyle = "rgba(184, 148, 62, 0.4)";
  const BARR_H = 0.15, BARR_SP = 0.40, BARR_W = 0.05;
  const nB = Math.ceil(rW / BARR_SP) + 1, bsp = rW / (nB - 1);
  const pClr = state.pierD / 2 + 0.07;
  for (let bi = 0; bi < nB; bi++) {
    const bx = -rW / 2 + bi * bsp;
    if (Math.abs(bx) < pClr) continue;
    const p = toS(bx, 0), pw = Math.max(1, BARR_W * scale), ph = BARR_H * scale;
    ctx.fillRect(p.x - pw / 2, p.y, pw, ph);
  }
  ctx.fillStyle = "rgba(184, 148, 62, 0.5)";
  const vBot = toS(0, -0.20), vTop = toS(0, 0), vH = vTop.y - vBot.y;
  ctx.fillRect(toS(-rW / 2, 0).x, vBot.y, toS(rW / 2, 0).x - toS(-rW / 2, 0).x, -vH);
}

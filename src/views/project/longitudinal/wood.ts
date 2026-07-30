import type { SectionView } from "../types";

export function drawLongitudinalWood(view: SectionView): void {
  const { ctx, toS, rD, rH, scale } = view;
  const D2 = 0.09, S2 = 0.045, wfCol = "rgba(196, 163, 90, 0.6)";
  for (const sz of [-1, 1]) {
    const wz = sz * rD / 2;
    ctx.strokeStyle = wfCol; ctx.lineWidth = Math.max(1, S2 * scale);
    const mb = toS(wz, S2), mt = toS(wz, rH - S2 * 2);
    ctx.beginPath(); ctx.moveTo(mb.x, mb.y); ctx.lineTo(mt.x, mt.y); ctx.stroke();
    ctx.fillStyle = wfCol;
    const sb = toS(wz - sz * D2 / 2, 0), st = toS(wz + sz * D2 / 2, S2);
    ctx.fillRect(Math.min(sb.x, st.x), st.y, Math.abs(st.x - sb.x), sb.y - st.y);
    for (let i = 0; i < 2; i++) {
      const p1 = toS(wz - sz * D2 / 2, rH - S2 * (i + 1));
      const p2 = toS(wz + sz * D2 / 2, rH - S2 * i);
      ctx.fillRect(Math.min(p1.x, p2.x), p2.y, Math.abs(p2.x - p1.x), p1.y - p2.y);
    }
  }
}

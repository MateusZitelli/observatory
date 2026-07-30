import type { SectionView } from "../types";

export function drawTransverseObjects(view: SectionView): void {
  const { ctx, toS, state, pierD, H_con, H_ext, X_PIVOT, H_total, scale } = view;
  ctx.fillStyle = "#9ca3af"; ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 1;
  const pierBL = toS(-pierD / 2, 0), pierTR = toS(pierD / 2, H_con);
  ctx.fillRect(pierBL.x, pierTR.y, pierTR.x - pierBL.x, pierBL.y - pierTR.y);
  ctx.strokeRect(pierBL.x, pierTR.y, pierTR.x - pierBL.x, pierBL.y - pierTR.y);
  ctx.fillStyle = "#6b7280";
  const extW = 0.15, extBL = toS(-extW / 2, H_con), extTR = toS(extW / 2, H_con + H_ext);
  ctx.fillRect(extBL.x, extTR.y, extTR.x - extBL.x, extBL.y - extTR.y);
  const TUBE_LEN = state.TUBE_LEN, TUBE_D = state.TUBE_D;
  const pivotPt = toS(-X_PIVOT, H_total);
  const envR = Math.max(TUBE_LEN / 2, TUBE_D) * scale;
  ctx.strokeStyle = "rgba(59,130,246,0.3)"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.arc(pivotPt.x, pivotPt.y, envR, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
}

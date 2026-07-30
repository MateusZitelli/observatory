import type { SectionView } from "../types";

export function drawTransverseLabels(view: SectionView): void {
  const { ctx, cx, vpH, toS, rH, rW } = view;
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("CORTE TRANSVERSAL (L-O)", cx, vpH - 8);
  const wallBL = toS(-rW / 2, 0), wallTL = toS(-rW / 2, rH);
  const wallBR = toS(rW / 2, 0), wallTR = toS(rW / 2, rH);
  ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif";
  ctx.fillText("O", wallBL.x - 20, wallBL.y - (wallBL.y - wallTL.y) / 2);
  ctx.fillText("L", wallBR.x + 20, wallBR.y - (wallBR.y - wallTR.y) / 2);
}

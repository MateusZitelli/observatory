import type { SectionView } from "../types";

export function drawLongitudinalLabels(view: SectionView): void {
  const { ctx, cx, vpY, vpH, toS, rD, rH } = view;
  ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("CORTE LONGITUDINAL (N-S)", cx, vpY + vpH - 8);
  const wallN_B = toS(-rD / 2, 0), wallN_T = toS(-rD / 2, rH);
  const wallS_B = toS(rD / 2, 0), wallS_T = toS(rD / 2, rH);
  ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif";
  ctx.fillText("N", wallN_B.x - 20, wallN_B.y - (wallN_B.y - wallN_T.y) / 2);
  ctx.fillText("S", wallS_B.x + 20, wallS_B.y - (wallS_B.y - wallS_T.y) / 2);
}

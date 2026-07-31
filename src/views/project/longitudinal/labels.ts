import type { SectionView } from "../types";
import type { LongitudinalWalls } from "./base";

export function drawLongitudinalLabels(view: SectionView, walls: LongitudinalWalls): void {
  const { ctx, cx, vpY, vpH } = view;
  ctx.fillText("CORTE LONGITUDINAL (N-S)", cx, vpY + vpH - 8);
  const { wallN_B, wallN_T, wallS_B, wallS_T } = walls;
  ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("N", wallN_B.x - 20, wallN_B.y - (wallN_B.y - wallN_T.y) / 2);
  ctx.fillText("S", wallS_B.x + 20, wallS_B.y - (wallS_B.y - wallS_T.y) / 2);
}

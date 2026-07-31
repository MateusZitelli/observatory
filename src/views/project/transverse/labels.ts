import type { SectionView } from "../types";
import type { TransverseWalls } from "./base";

export function drawTransverseLabels(view: SectionView, walls: TransverseWalls): void {
  const { ctx, cx, vpH } = view;
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("CORTE TRANSVERSAL (L-O)", cx, vpH - 8);
  const { wallBL, wallTL, wallBR, wallTR } = walls;
  ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("O", wallBL.x - 20, wallBL.y - (wallBL.y - wallTL.y) / 2);
  ctx.fillText("L", wallBR.x + 20, wallBR.y - (wallBR.y - wallTR.y) / 2);
}

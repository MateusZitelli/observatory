import type { PlanView } from "../types";

export function drawPlanLabels(view: PlanView): void {
  const { ctx, toS, cx, vpH, scale, rW, rD } = view;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  const escNum = Math.round(1 / (scale / 96 * 0.0254));
  ctx.fillText("PLANTA BAIXA", cx, vpH - 20);
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("esc. aprox. 1:" + escNum, cx, vpH - 6);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  const sLabel = toS(0, rD / 2);
  ctx.fillText("S", sLabel.x, sLabel.y + 42);
  const eLabel = toS(rW / 2, 0);
  ctx.textAlign = "left"; ctx.fillText("L", eLabel.x + 32, eLabel.y + 4);
  const wLabel = toS(-rW / 2, 0);
  ctx.textAlign = "right"; ctx.fillText("O", wLabel.x - 32, wLabel.y + 4);
}

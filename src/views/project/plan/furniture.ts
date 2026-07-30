import type { PlanView } from "../types";

export function drawPlanFurniture(view: PlanView): void {
  const { ctx, toS, rW, rD, scale, DESK_D, DESK_W, SOFA_W, SOFA_D, MATT_W, MATT_D } = view;
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  const deskTL = toS(-rW / 2 + 0.05, -rD / 2 + 0.05);
  ctx.strokeRect(deskTL.x, deskTL.y, DESK_D * scale, DESK_W * scale);
  ctx.fillStyle = "#64748b";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("mesa", deskTL.x + DESK_D * scale / 2, deskTL.y + DESK_W * scale / 2 + 3);
  const sofaTL = toS(rW / 2 - SOFA_W - 0.05, rD / 2 - SOFA_D - 0.05);
  ctx.strokeStyle = "#64748b";
  ctx.strokeRect(sofaTL.x, sofaTL.y, SOFA_W * scale, SOFA_D * scale);
  ctx.fillStyle = "#64748b";
  ctx.fillText("sofá", sofaTL.x + SOFA_W * scale / 2, sofaTL.y + SOFA_D * scale / 2 + 3);
  const mattTL = toS(-rW / 2 + 0.05, rD / 2 - MATT_D - 0.05);
  ctx.strokeStyle = "#64748b";
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(mattTL.x, mattTL.y, MATT_W * scale, MATT_D * scale);
  ctx.setLineDash([]);
  ctx.fillStyle = "#64748b";
  ctx.fillText("colchão", mattTL.x + MATT_W * scale / 2, mattTL.y + MATT_D * scale / 2 + 3);
}

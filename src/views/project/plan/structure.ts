import type { PlanView } from "../types";

export function drawPlanStructure(view: PlanView): void {
  const { ctx, toS, state, rW, rD, planScale } = view;
  const D = 0.09, S = 0.045, SP = 0.60;
  ctx.strokeStyle = "rgba(196, 163, 90, 0.5)";
  ctx.lineWidth = Math.max(1, S * planScale);
  function drawStuds(sx: number, sz: number, len: number, dirX: number, dirZ: number): void {
    const n = Math.ceil(len / SP) + 1;
    const sp = len / (n - 1);
    for (let i = 0; i < n; i++) {
      const t = i * sp, p = toS(sx + dirX * t, sz + dirZ * t);
      ctx.beginPath();
      const px = -dirZ * D * planScale / 2, py = -dirX * D * planScale / 2;
      ctx.moveTo(p.x - px, p.y - py); ctx.lineTo(p.x + px, p.y + py); ctx.stroke();
    }
  }
  drawStuds(-rW / 2, -rD / 2, rW, 1, 0);
  drawStuds(-rW / 2, rD / 2, rW, 1, 0);
  drawStuds(rW / 2, -rD / 2, rD, 0, 1);
  drawStuds(-rW / 2, -rD / 2, rD, 0, 1);
  ctx.strokeStyle = "rgba(184, 148, 62, 0.3)";
  ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  const BARR_SP = 0.40, nBarr = Math.ceil(rW / BARR_SP) + 1;
  const bsp = rW / (nBarr - 1), pierClr = state.pierD / 2 + 0.07;
  for (let bi = 0; bi < nBarr; bi++) {
    const bx = -rW / 2 + bi * bsp;
    if (Math.abs(bx) < pierClr) continue;
    const p1 = toS(bx, -rD / 2), p2 = toS(bx, rD / 2);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  ctx.setLineDash([]);
}

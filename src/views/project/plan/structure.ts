import type { PlanView } from "../types";

type StudLine = {
  startX: number;
  startZ: number;
  length: number;
  dirX: number;
  dirZ: number;
};

function drawStuds(view: PlanView, line: StudLine): void {
  const { ctx, toS, planScale } = view;
  const D = 0.09, SP = 0.60;
  const n = Math.ceil(line.length / SP) + 1;
  const sp = line.length / (n - 1);
  for (let i = 0; i < n; i++) {
    const t = i * sp;
    const p = toS(line.startX + line.dirX * t, line.startZ + line.dirZ * t);
    ctx.beginPath();
    const px = -line.dirZ * D * planScale / 2, py = -line.dirX * D * planScale / 2;
    ctx.moveTo(p.x - px, p.y - py); ctx.lineTo(p.x + px, p.y + py); ctx.stroke();
  }
}

function drawBarriers(view: PlanView): void {
  const { ctx, toS, state, rW, rD } = view;
  const BARR_SP = 0.40, nBarr = Math.ceil(rW / BARR_SP) + 1;
  const bsp = rW / (nBarr - 1), pierClr = state.pierD / 2 + 0.07;
  ctx.strokeStyle = "rgba(184, 148, 62, 0.3)";
  ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  for (let bi = 0; bi < nBarr; bi++) {
    const bx = -rW / 2 + bi * bsp;
    if (Math.abs(bx) < pierClr) continue;
    const p1 = toS(bx, -rD / 2), p2 = toS(bx, rD / 2);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  ctx.setLineDash([]);
}

export function drawPlanStructure(view: PlanView): void {
  const { ctx, rW, rD, planScale } = view;
  const S = 0.045;
  ctx.strokeStyle = "rgba(196, 163, 90, 0.5)";
  ctx.lineWidth = Math.max(1, S * planScale);
  drawStuds(view, { startX: -rW / 2, startZ: -rD / 2, length: rW, dirX: 1, dirZ: 0 });
  drawStuds(view, { startX: -rW / 2, startZ: rD / 2, length: rW, dirX: 1, dirZ: 0 });
  drawStuds(view, { startX: rW / 2, startZ: -rD / 2, length: rD, dirX: 0, dirZ: 1 });
  drawStuds(view, { startX: -rW / 2, startZ: -rD / 2, length: rD, dirX: 0, dirZ: 1 });
  drawBarriers(view);
}

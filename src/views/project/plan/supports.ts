import type { PlanView } from "../types";

function drawSupportPosts(view: PlanView): void {
  const { ctx, toS, rW, rD, slideLen, scale } = view;
  ctx.strokeStyle = "#4b5563";
  ctx.fillStyle = "#4b5563";
  ctx.lineWidth = 1.5;
  const postSize = 0.12;
  const railW2 = rW / 2 + 0.04;
  const postPositions: [number, number][] = [
    [-railW2, -rD / 2], [railW2, -rD / 2],
    [-railW2, -rD / 2 - slideLen], [railW2, -rD / 2 - slideLen],
    [-railW2, -rD / 2 - slideLen / 2], [railW2, -rD / 2 - slideLen / 2],
  ];
  for (const [px, py] of postPositions) {
    const pt = toS(px, py);
    ctx.fillRect(
      pt.x - postSize * scale / 2, pt.y - postSize * scale / 2,
      postSize * scale, postSize * scale,
    );
  }
}

function drawSupportCrossbars(view: PlanView): void {
  const { ctx, toS, rW, rD, slideLen } = view;
  const railW2 = rW / 2 + 0.04;
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  for (const zz of [-rD / 2 - slideLen, -rD / 2 - slideLen / 2]) {
    const vL = toS(-railW2, zz), vR = toS(railW2, zz);
    ctx.beginPath(); ctx.moveTo(vL.x, vL.y); ctx.lineTo(vR.x, vR.y); ctx.stroke();
  }
}

export function drawPlanSupports(view: PlanView): void {
  drawSupportPosts(view);
  drawSupportCrossbars(view);
}

export function drawPlanRails(view: PlanView): void {
  const { ctx, toS, rW, rD, slideLen } = view;
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  const railW = rW / 2 + 0.04;
  for (const sx of [-1, 1]) {
    const rStart = toS(sx * railW, -rD / 2);
    const rEnd = toS(sx * railW, -rD / 2 - slideLen);
    ctx.beginPath(); ctx.moveTo(rStart.x, rStart.y); ctx.lineTo(rEnd.x, rEnd.y); ctx.stroke();
  }
  ctx.setLineDash([]);
}

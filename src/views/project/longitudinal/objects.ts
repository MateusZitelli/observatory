import type { Point, SectionView } from "../types";

function drawFoundation(view: SectionView): void {
  const { ctx, toS, pierD, H_con, H_ext } = view;
  ctx.fillStyle = "#9ca3af"; ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 1;
  const pBL = toS(-pierD / 2, 0), pTR = toS(pierD / 2, H_con);
  ctx.fillRect(pBL.x, pTR.y, pTR.x - pBL.x, pBL.y - pTR.y); ctx.strokeRect(pBL.x, pTR.y, pTR.x - pBL.x, pBL.y - pTR.y);
  ctx.fillStyle = "#6b7280";
  const extW2 = 0.15;
  const eBL = toS(-extW2 / 2, H_con), eTR = toS(extW2 / 2, H_con + H_ext);
  ctx.fillRect(eBL.x, eTR.y, eTR.x - eBL.x, eBL.y - eTR.y);
}

function drawPosts(view: SectionView): void {
  const { ctx, toS, rD, rH, slideLen } = view;
  ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 2;
  const postPositionsNS = [-rD / 2, -rD / 2 - slideLen / 2, -rD / 2 - slideLen];
  for (const zp of postPositionsNS) {
    const postBot = toS(zp, 0), postTop = toS(zp, rH);
    ctx.beginPath(); ctx.moveTo(postBot.x, postBot.y); ctx.lineTo(postTop.x, postTop.y); ctx.stroke();
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(postBot.x - 3, postBot.y - 2, 6, 4); ctx.fillRect(postTop.x - 4, postTop.y - 2, 8, 4);
  }
}

function drawWindow(view: SectionView): void {
  const { ctx, toS, rD, WIN_SILL, WIN_TOP } = view;
  ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2;
  const winBot = toS(rD / 2, WIN_SILL), winTop = toS(rD / 2, WIN_TOP);
  ctx.beginPath();
  ctx.moveTo(winBot.x - 3, winBot.y); ctx.lineTo(winBot.x + 3, winBot.y);
  ctx.moveTo(winTop.x - 3, winTop.y); ctx.lineTo(winTop.x + 3, winTop.y);
  ctx.moveTo(winBot.x, winBot.y); ctx.lineTo(winTop.x, winTop.y); ctx.stroke();
}

function drawRail(view: SectionView): { railStart: Point; railEnd: Point } {
  const { ctx, toS, rD, rH, slideLen } = view;
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
  const railStart = toS(-rD / 2, rH);
  const railEnd = toS(-rD / 2 - slideLen, rH);
  ctx.beginPath(); ctx.moveTo(railStart.x, railStart.y); ctx.lineTo(railEnd.x, railEnd.y); ctx.stroke(); ctx.setLineDash([]);
  return { railStart, railEnd };
}

export function drawLongitudinalObjects(view: SectionView): { railStart: Point; railEnd: Point } {
  drawFoundation(view);
  drawPosts(view);
  drawWindow(view);
  return drawRail(view);
}

import type { SectionView } from "../types";

function drawGround(view: SectionView): void {
  const { ctx, toS, rD, slideLen } = view;
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  const glNS = toS(-rD / 2 - slideLen - 0.3, 0), grNS = toS(rD / 2 + 0.5, 0);
  ctx.beginPath(); ctx.moveTo(glNS.x, glNS.y); ctx.lineTo(grNS.x, grNS.y); ctx.stroke(); ctx.setLineDash([]);
}

type LongitudinalWalls = {
  wallN_T: ReturnType<SectionView["toS"]>;
  wallS_T: ReturnType<SectionView["toS"]>;
};

function drawWalls(view: SectionView): LongitudinalWalls {
  const { ctx, toS, rD, rH } = view;
  ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 3;
  const wallN_B = toS(-rD / 2, 0), wallN_T = toS(-rD / 2, rH);
  const wallS_B = toS(rD / 2, 0), wallS_T = toS(rD / 2, rH);
  ctx.beginPath();
  ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallN_T.x, wallN_T.y);
  ctx.moveTo(wallS_B.x, wallS_B.y); ctx.lineTo(wallS_T.x, wallS_T.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallS_B.x, wallS_B.y); ctx.stroke();
  return { wallN_T, wallS_T };
}

function drawRoof(view: SectionView, walls: LongitudinalWalls): void {
  const { ctx, toS, rD, roofPeakH } = view;
  const { wallN_T, wallS_T } = walls;
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 2;
  const ridgeN = toS(-rD / 2, roofPeakH), ridgeS = toS(rD / 2, roofPeakH);
  ctx.beginPath(); ctx.moveTo(ridgeN.x, ridgeN.y); ctx.lineTo(ridgeS.x, ridgeS.y); ctx.stroke();
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(wallN_T.x, wallN_T.y); ctx.lineTo(ridgeN.x, ridgeN.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(wallS_T.x, wallS_T.y); ctx.lineTo(ridgeS.x, ridgeS.y); ctx.stroke();
}

function drawEaves(view: SectionView, walls: LongitudinalWalls): void {
  const { ctx, toS, rD, rH, BEIRAL } = view;
  const { wallN_T, wallS_T } = walls;
  const eaveN = toS(-rD / 2 - BEIRAL, rH), eaveS = toS(rD / 2 + BEIRAL, rH);
  ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(eaveN.x, eaveN.y); ctx.lineTo(wallN_T.x, wallN_T.y);
  ctx.moveTo(eaveS.x, eaveS.y); ctx.lineTo(wallS_T.x, wallS_T.y); ctx.stroke();
}

export function drawLongitudinalBase(view: SectionView): void {
  drawGround(view);
  const walls = drawWalls(view);
  drawRoof(view, walls);
  drawEaves(view, walls);
}

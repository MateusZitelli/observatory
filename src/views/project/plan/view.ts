import { drawDimLine } from "../dimensions";
import { drawPlanFurniture } from "./furniture";
import { drawPlanLabels } from "./labels";
import { drawPlanRoom } from "./room";
import { drawPlanStructure } from "./structure";
import { drawPlanRails, drawPlanSupports } from "./supports";
import { drawPlanTiles } from "./tiles";
import type { PlanView, ProjectFrame } from "../types";

function createPlanView(frame: ProjectFrame): PlanView {
  const { availW, availH, PAD, rW, rD, slideLen, uiWidth } = frame;
  const vpW = availW / 2;
  const vpH = availH;
  const totalPlanW = rW + 1.0;
  const totalPlanH = rD + slideLen + 0.5;
  const scaleX = (vpW - PAD * 2) / totalPlanW;
  const scaleY = (vpH - PAD * 3) / totalPlanH;
  const scale = Math.min(scaleX, scaleY);
  const cx = uiWidth + vpW / 2;
  const cy = vpH / 2 + PAD / 2;
  const toS = (rx: number, ry: number) => ({ x: cx + rx * scale, y: cy + ry * scale });
  const nw = toS(-rW / 2, -rD / 2);
  const ne = toS(rW / 2, -rD / 2);
  const se = toS(rW / 2, rD / 2), sw = toS(-rW / 2, rD / 2);
  const winL = toS(-frame.WIN_W / 2, rD / 2);
  const winR = toS(frame.WIN_W / 2, rD / 2);
  const doorS = toS(rW / 2, -rD / 2 + frame.DOOR_OFFSET + frame.DOOR_W);
  const doorN = toS(rW / 2, -rD / 2 + frame.DOOR_OFFSET);
  const pierCenter = toS(0, 0);
  return {
    ...frame, vpW, vpH, scale, cx, cy, planScale: scale, toS,
    nw, ne, se, sw, winL, winR, doorS, doorN, pierCenter,
    pierR: frame.pierD / 2 * scale,
  };
}

function drawPlanDimensions(view: PlanView): void {
  const { rW, rD, WIN_W, DOOR_W } = view;
  drawDimLine(view, { x1: view.sw.x, y1: view.sw.y, x2: view.se.x, y2: view.se.y, label: rW.toFixed(2) + " m", offset: 25 });
  drawDimLine(view, { x1: view.ne.x, y1: view.ne.y, x2: view.se.x, y2: view.se.y, label: rD.toFixed(2) + " m", offset: 25 });
  drawDimLine(view, { x1: view.winL.x, y1: view.winL.y, x2: view.winR.x, y2: view.winR.y, label: WIN_W.toFixed(1) + " m", offset: 15 });
  drawDimLine(view, { x1: view.doorN.x, y1: view.doorN.y, x2: view.doorS.x, y2: view.doorS.y, label: DOOR_W.toFixed(1) + " m", offset: 18 });
  const pierLeft = view.toS(-rW / 2, 0);
  drawDimLine(view, { x1: pierLeft.x, y1: pierLeft.y, x2: view.pierCenter.x, y2: view.pierCenter.y, label: (rW / 2).toFixed(2) + " m", offset: -18 });
}

function drawNorthArrow(view: PlanView): void {
  const { ctx, rD, slideLen } = view;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  const arrowTop = view.toS(0, -rD / 2 - slideLen - 0.3);
  ctx.fillText("N", arrowTop.x, arrowTop.y - 10);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(arrowTop.x, arrowTop.y); ctx.lineTo(arrowTop.x, arrowTop.y + 20); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowTop.x, arrowTop.y); ctx.lineTo(arrowTop.x - 5, arrowTop.y + 8);
  ctx.moveTo(arrowTop.x, arrowTop.y); ctx.lineTo(arrowTop.x + 5, arrowTop.y + 8); ctx.stroke();
}

export function drawProjectPlan(frame: ProjectFrame): void {
  const view = createPlanView(frame);
  view.ctx.save();
  drawPlanRoom(view);
  drawPlanSupports(view);
  drawPlanFurniture(view);
  drawPlanRails(view);
  drawPlanTiles(view);
  drawPlanDimensions(view);
  drawNorthArrow(view);
  drawPlanStructure(view);
  drawPlanLabels(view);
  view.ctx.restore();
}

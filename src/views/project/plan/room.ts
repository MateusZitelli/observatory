import type { PlanView } from "../types";

function drawRoomCorners(view: PlanView): void {
  const { ctx, nw, ne, sw } = view;
  ctx.beginPath();
  ctx.moveTo(nw.x, nw.y); ctx.lineTo(ne.x, ne.y);
  ctx.moveTo(nw.x, nw.y); ctx.lineTo(sw.x, sw.y);
}

type RoomPoints = {
  winL: ReturnType<PlanView["toS"]>;
  winR: ReturnType<PlanView["toS"]>;
  doorS: ReturnType<PlanView["toS"]>;
  doorN: ReturnType<PlanView["toS"]>;
};

function drawRoomWalls(view: PlanView): RoomPoints {
  const { ctx, toS, ne, se, sw, rW, rD, WIN_W, DOOR_W, DOOR_OFFSET } = view;
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  drawRoomCorners(view);
  const winL = toS(-WIN_W / 2, rD / 2), winR = toS(WIN_W / 2, rD / 2);
  ctx.moveTo(sw.x, sw.y); ctx.lineTo(winL.x, winL.y);
  ctx.moveTo(winR.x, winR.y); ctx.lineTo(se.x, se.y);
  const doorS = toS(rW / 2, -rD / 2 + DOOR_OFFSET + DOOR_W);
  const doorN = toS(rW / 2, -rD / 2 + DOOR_OFFSET);
  ctx.moveTo(se.x, se.y); ctx.lineTo(doorS.x, doorS.y);
  ctx.moveTo(doorN.x, doorN.y); ctx.lineTo(ne.x, ne.y);
  ctx.stroke();
  return { winL, winR, doorS, doorN };
}

function drawWindow(view: PlanView, room: RoomPoints): void {
  const { ctx } = view;
  const { winL, winR } = room;
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(winL.x, winL.y - 3); ctx.lineTo(winR.x, winR.y - 3);
  ctx.moveTo(winL.x, winL.y + 3); ctx.lineTo(winR.x, winR.y + 3);
  ctx.stroke();
}

function drawDoor(view: PlanView, room: RoomPoints): void {
  const { ctx, toS, rW, rD, DOOR_W, DOOR_OFFSET } = view;
  const { doorN, doorS } = room;
  ctx.lineWidth = 1.5;
  const doorPivot = doorN;
  const doorEnd = doorS;
  void doorEnd;
  const doorRadius = DOOR_W * view.scale;
  ctx.beginPath();
  const doorAngleStart = Math.PI / 2;
  const doorAngleEnd = Math.PI;
  ctx.arc(doorPivot.x, doorPivot.y, doorRadius, doorAngleStart, doorAngleEnd);
  ctx.stroke();
  const leafEnd = toS(rW / 2 - DOOR_W, -rD / 2 + DOOR_OFFSET);
  ctx.beginPath();
  ctx.moveTo(doorPivot.x, doorPivot.y); ctx.lineTo(leafEnd.x, leafEnd.y); ctx.stroke();
}

function drawPier(view: PlanView): void {
  const { ctx, pierCenter, pierR, pierD } = view;
  ctx.fillStyle = "#9ca3af";
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pierCenter.x, pierCenter.y, Math.max(pierR, 4), 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#d1d5db";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⌀" + (pierD * 100).toFixed(0) + "cm", pierCenter.x, pierCenter.y + pierR + 14);
}

export function drawPlanRoom(view: PlanView): void {
  const room = drawRoomWalls(view);
  drawWindow(view, room);
  drawDoor(view, room);
  drawPier(view);
}

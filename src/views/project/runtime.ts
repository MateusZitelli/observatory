import { createProjectFrame } from "./frame";
import { drawProjectDividers } from "./dividers";
import { drawProjectLongitudinal } from "./longitudinal/view";
import { drawProjectPlan } from "./plan/view";
import { drawProjectTransverse } from "./transverse/view";

declare global {
  var canvas2D: HTMLCanvasElement;
  var state: import("../../runtime-state").ObservatoryState;
}

function drawProject(): void {
  const ctx = canvas2D.getContext("2d");
  if (ctx === null) throw new Error("2D canvas context unavailable");
  const w = canvas2D.width;
  const h = canvas2D.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);
  const frame = createProjectFrame(ctx, w, h, state);
  drawProjectPlan(frame);
  drawProjectTransverse(frame);
  drawProjectLongitudinal(frame);
  drawProjectDividers(frame);
}

export function installProjectViewGlobal(): void {
  Object.assign(globalThis, { drawProject });
}

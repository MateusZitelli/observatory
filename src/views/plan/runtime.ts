import { drawPlan2D } from "./draw";

export function installPlan2DGlobal(): void {
  globalThis.draw2D = drawPlan2D;
}

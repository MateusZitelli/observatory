import { createCanvasController } from "./controller";
import { paintPlan } from "./plan-painter";
import type { CanvasController } from "./types";

export function createPlanCanvas(canvas: HTMLCanvasElement): CanvasController {
  return createCanvasController(canvas, paintPlan);
}

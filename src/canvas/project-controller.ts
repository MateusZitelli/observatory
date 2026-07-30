import { createCanvasController } from "./controller";
import { paintProject } from "./project-painter";
import type { CanvasController } from "./types";

export function createProjectCanvas(canvas: HTMLCanvasElement): CanvasController {
  return createCanvasController(canvas, paintProject);
}
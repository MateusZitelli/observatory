import { canvasContext, resizeSurface } from "./surface";
import type { AppSnapshot } from "../domain/types";
import type { CanvasController, CanvasPainter } from "./types";

export function createCanvasController(
  canvas: HTMLCanvasElement,
  painter: CanvasPainter,
): CanvasController {
  const context = canvasContext(canvas);
  let snapshot: AppSnapshot | undefined;
  let active = true;
  const paint = (): void => {
    if (!active || snapshot === undefined) return;
    const viewport = resizeSurface(canvas, context);
    context.save();
    painter({ context, snapshot, viewport });
    context.restore();
  };
  const observer = new ResizeObserver(paint);
  observer.observe(canvas);
  return {
    render: (nextSnapshot) => {
      snapshot = nextSnapshot;
      paint();
    },
    resize: paint,
    destroy: () => {
      active = false;
      observer.disconnect();
    },
  };
}

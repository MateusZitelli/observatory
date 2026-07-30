import { createCanvasController } from "../canvas/controller";
import { createPanoramaStore } from "../canvas/panorama";
import type { PanoramaSource, SkyCanvasController } from "../canvas/types";
import type { AppSnapshot } from "../domain/types";
import { paintSky } from "./sky-painter";

export function createSkyCanvas(canvas: HTMLCanvasElement): SkyCanvasController {
  const panorama = createPanoramaStore();
  let latestSnapshot: AppSnapshot | undefined;
  const controller = createCanvasController(canvas, ({ context, snapshot, viewport }) => {
    paintSky(context, snapshot, viewport, panorama.get());
  });
  return {
    render: (snapshot) => {
      latestSnapshot = snapshot;
      controller.render(snapshot);
    },
    resize: () => {
      controller.resize();
    },
    setPanorama: async (source: PanoramaSource) => {
      await panorama.load(source);
      if (latestSnapshot !== undefined) controller.render(latestSnapshot);
    },
    clearPanorama: () => {
      panorama.clear();
      if (latestSnapshot !== undefined) controller.render(latestSnapshot);
    },
    destroy: () => {
      panorama.clear();
      controller.destroy();
    },
  };
}
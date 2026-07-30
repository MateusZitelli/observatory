import { createPlanCanvas } from "../canvas/plan-controller";
import { createProjectCanvas } from "../canvas/project-controller";
import type { PanoramaSource, SkyCanvasController } from "../canvas/types";
import type { AppSnapshot } from "../domain/types";
import { createSkyCanvas } from "./sky-canvas";

export type ViewportRuntime = {
  render: (snapshot: AppSnapshot) => void;
  setPanorama: (source: PanoramaSource) => void;
  destroy: () => void;
};

export function createViewportRuntime(
  sceneHost: HTMLElement,
  canvas: HTMLCanvasElement,
): ViewportRuntime {
  let activeView: AppSnapshot["view"] | undefined;
  let plan: ReturnType<typeof createPlanCanvas> | undefined;
  let project: ReturnType<typeof createProjectCanvas> | undefined;
  let sky: SkyCanvasController | undefined;
  let panoramaSource: PanoramaSource = `${import.meta.env.BASE_URL}pano360.jpg`;

  const render = (snapshot: AppSnapshot): void => {
    const canvasView = snapshot.view === "plan" || snapshot.view === "project"
      || snapshot.view === "sky";
    sceneHost.hidden = canvasView;
    canvas.hidden = !canvasView;
    if (activeView !== snapshot.view) switchView(snapshot.view);
    if (snapshot.view === "plan") plan?.render(snapshot);
    if (snapshot.view === "project") project?.render(snapshot);
    if (snapshot.view === "sky") sky?.render(snapshot);
  };

  const setPanorama = (source: PanoramaSource): void => {
    panoramaSource = source;
    if (sky !== undefined) void loadPanorama(sky, source);
  };

  const destroy = (): void => {
    plan?.destroy();
    project?.destroy();
    sky?.destroy();
    plan = undefined;
    project = undefined;
    sky = undefined;
  };

  return { render, setPanorama, destroy };

  function switchView(view: AppSnapshot["view"]): void {
    plan?.destroy();
    project?.destroy();
    sky?.destroy();
    plan = undefined;
    project = undefined;
    sky = undefined;
    activeView = view;
    if (view === "plan") plan = createPlanCanvas(canvas);
    if (view === "project") project = createProjectCanvas(canvas);
    if (view === "sky") {
      sky = createSkyCanvas(canvas);
      void loadPanorama(sky, panoramaSource);
    }
  }
}

async function loadPanorama(
  controller: SkyCanvasController,
  source: PanoramaSource,
): Promise<void> {
  try {
    await controller.setPanorama(source);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
  }
}
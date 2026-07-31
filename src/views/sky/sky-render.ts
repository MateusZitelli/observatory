import { createBackground } from "./sky-background";
import { drawCatalog } from "./sky-catalog-render";
import { drawOverlays } from "./sky-overlays";
import { drawVisibility } from "./sky-visibility";

export function renderSky(): void {
  const frame = createBackground();
  const visibility = drawVisibility(frame);
  const catalog = drawCatalog(frame, visibility.traceRay);
  drawOverlays(frame, catalog.eqToHoriz, visibility.eyeLow, visibility.eyeHigh);
}

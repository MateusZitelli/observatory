import { equatorialToHorizontal, celestialEquator } from "../astronomy/coordinates";
import { PIEDADE_SITE } from "../astronomy/piedade";
import { circle, label, line } from "../canvas/primitives";
import { drawPanorama } from "../canvas/panorama";
import { drawSkyGrid } from "../canvas/sky-grid";
import { skyProjection, type SkyProjection } from "../canvas/sky-projection";
import { clearSurface } from "../canvas/surface";
import { createSkyModel } from "../astronomy/sky-model";
import type { AppSnapshot } from "../domain/types";
import type { CanvasViewport } from "../canvas/types";


export function paintSky(
  context: CanvasRenderingContext2D,
  snapshot: AppSnapshot,
  viewport: CanvasViewport,
  panorama: HTMLImageElement | undefined,
): void {
  clearSurface(context, viewport, "#020617");
  const projection = skyProjection(viewport.width, viewport.height);
  if (panorama !== undefined && panorama.naturalWidth > 0) {
    drawPanorama(context, projection, panorama, snapshot.state.panoramaRotation);
  }
  drawSkyGrid(context, projection);
  drawEquator(context, projection, snapshot);
  drawStars(context, projection, snapshot);
  drawTarget(context, projection, snapshot);
  label(context, "MAPA CELESTE · PIEDADE, SP", { x: 24, y: 32 }, { color: "#e2e8f0" });
}

function drawEquator(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  snapshot: AppSnapshot,
): void {
  if (!snapshot.state.showMeridianOverlay) return;
  const points = celestialEquator(
    snapshot.state.latitude,
    createSkyModel(snapshot.state, PIEDADE_SITE).siderealDegrees,
  );
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    if (from === undefined || to === undefined || from.altitude < 0 || to.altitude < 0) continue;
    line(context, projection.point(from.azimuth, from.altitude), projection.point(to.azimuth, to.altitude), {
      color: "#38bdf8", width: 1.5,
    });
  }
}

function drawStars(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  snapshot: AppSnapshot,
): void {
  const model = createSkyModel(snapshot.state, PIEDADE_SITE);
  model.stars.forEach((star) => {
    const point = projection.point(star.azimuth, star.altitude);
    const radius = Math.max(2, 5 - star.magnitude);
    circle(context, point, radius, { fill: "#f8fafc" });
    if (star.magnitude <= 0.3) label(context, star.name, { x: point.x + 7, y: point.y + 4 }, {
      color: "#f8fafc",
    });
  });
}

function drawTarget(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  snapshot: AppSnapshot,
): void {
  const { state } = snapshot;
  const target = equatorialToHorizontal({
    rightAscension: state.rightAscension,
    declination: state.declination,
  }, state.latitude, createSkyModel(state, PIEDADE_SITE).siderealDegrees);
  if (target.altitude < 0) return;
  const point = projection.point(target.azimuth, target.altitude);
  if (state.showGemOverlay) {
    circle(context, point, 9, { fill: "transparent", stroke: "#f59e0b" });
    label(context, "GEM", { x: point.x + 12, y: point.y + 4 }, { color: "#f59e0b" });
  }
  if (state.showBlockOverlay) drawBlock(context, projection, point);
}

function drawBlock(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  point: { x: number; y: number },
): void {
  const distance = Math.hypot(point.x - projection.center.x, point.y - projection.center.y);
  if (distance < projection.radius * 0.95) return;
  circle(context, projection.center, projection.radius * 0.96, {
    fill: "transparent", stroke: "#ef4444",
  });
}
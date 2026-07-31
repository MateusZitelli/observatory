import { createSkyCatalog } from "./sky-catalog";
import { drawDeepSky } from "./sky-deep-draw";
import { createHorizontalProjection } from "./sky-horizontal";
import { drawStars } from "./sky-stars";
import { calculateSkyTime } from "./sky-time";
import type { EquatorialToHorizontal, SkyFrame, TraceRay } from "./sky-types";

export type CatalogRender = { readonly eqToHoriz: EquatorialToHorizontal };
export function drawCatalog(frame: SkyFrame, traceRay: TraceRay): CatalogRender {
  const time = calculateSkyTime(frame.lat);
  const eqToHoriz = createHorizontalProjection(time.sinLatR, time.cosLatR, time.LST_deg);
  const catalog = createSkyCatalog(time.dayOfYear, time.skyDayVal, time.now);
  drawStars(frame, traceRay, catalog.stars, eqToHoriz);
  drawDeepSky({ frame, traceRay, deepSky: catalog.deepSky, eqToHoriz, moonDm: catalog.moonDm });
  return { eqToHoriz };
}

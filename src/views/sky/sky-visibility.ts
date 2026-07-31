import { drawCelestialReference } from "./sky-equator";
import { drawOcclusion, type OcclusionResult } from "./sky-occlusion";
import { createSkyTracer } from "./sky-trace";
import type { SkyFrame, SkySnapshot } from "./sky-types";

export type VisibilityResult = OcclusionResult & { readonly traceRay: ReturnType<typeof createSkyTracer> };
export function drawVisibility(frame: SkyFrame, snapshot: SkySnapshot): VisibilityResult {
  const traceRay = createSkyTracer(snapshot);
  const occlusion = drawOcclusion(frame, traceRay, snapshot);
  drawCelestialReference(frame, traceRay);
  return { ...occlusion, traceRay };
}

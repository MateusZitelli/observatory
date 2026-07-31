import { drawCelestialReference } from "./sky-equator";
import { drawOcclusion, type OcclusionResult } from "./sky-occlusion";
import { createSkyTracer } from "./sky-trace";
import type { SkyFrame } from "./sky-types";

export type VisibilityResult = OcclusionResult & { readonly traceRay: ReturnType<typeof createSkyTracer> };
export function drawVisibility(frame: SkyFrame): VisibilityResult {
  const traceRay = createSkyTracer();
  const occlusion = drawOcclusion(frame, traceRay);
  drawCelestialReference(frame, traceRay);
  return { ...occlusion, traceRay };
}

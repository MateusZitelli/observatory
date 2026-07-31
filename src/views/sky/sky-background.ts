import { drawCardinals } from "./sky-cardinals";
import { createSkyFrame } from "./sky-frame";
import { drawPanorama, drawSkyGrid } from "./sky-grid";
import type { SkyFrame, SkySnapshot } from "./sky-types";

export function createBackground(snapshot: SkySnapshot): SkyFrame {
  const frame = createSkyFrame(snapshot);
  frame.ctx.clearRect(0, 0, frame.w, frame.h);
  drawPanorama(frame);
  drawSkyGrid(frame);
  drawCardinals(frame);
  return frame;
}

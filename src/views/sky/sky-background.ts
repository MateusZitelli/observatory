import { drawCardinals } from "./sky-cardinals";
import { createSkyFrame } from "./sky-frame";
import { drawPanorama, drawSkyGrid } from "./sky-grid";
import type { SkyFrame } from "./sky-types";

export function createBackground(): SkyFrame {
  const frame = createSkyFrame();
  frame.ctx.clearRect(0, 0, frame.w, frame.h);
  drawPanorama(frame);
  drawSkyGrid(frame);
  drawCardinals(frame);
  return frame;
}

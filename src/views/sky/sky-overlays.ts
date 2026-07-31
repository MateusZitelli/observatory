import { drawSkyFinish, drawMinimumElevation } from "./sky-finish";
import { drawMilkyWay } from "./sky-milkyway";
import type { SkyFrame, EquatorialToHorizontal } from "./sky-types";

export function drawOverlays(frame: SkyFrame, eqToHoriz: EquatorialToHorizontal, eyeLow: number, eyeHigh: number): void {
  drawMilkyWay(frame, eqToHoriz);
  drawMinimumElevation(frame);
  drawSkyFinish(frame, eyeLow, eyeHigh);
}

import { drawDimLine } from "../dimensions";
import type { Point, SectionView } from "../types";
import type { LongitudinalWalls } from "./base";

export function drawLongitudinalDimensions(
  view: SectionView,
  walls: LongitudinalWalls,
  rails: { railStart: Point; railEnd: Point },
): void {
  const { rD, rH, roofPeakH, WIN_SILL, WIN_TOP, slideLen } = view;
  const { wallN_B, wallS_B, wallS_T } = walls;
  const { railStart, railEnd } = rails;
  drawDimLine(view, { x1: wallN_B.x, y1: wallN_B.y, x2: wallS_B.x, y2: wallS_B.y, label: rD.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, { x1: wallS_B.x, y1: wallS_B.y, x2: wallS_T.x, y2: wallS_T.y, label: rH.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, {
    x1: view.toS(rD / 2 + 0.15, 0).x,
    y1: view.toS(rD / 2 + 0.15, 0).y,
    x2: view.toS(rD / 2 + 0.15, roofPeakH).x,
    y2: view.toS(rD / 2 + 0.15, roofPeakH).y,
    label: roofPeakH.toFixed(2) + " m",
    offset: 35,
  });
  drawDimLine(view, {
    x1: view.toS(rD / 2 - 0.1, WIN_SILL).x,
    y1: view.toS(rD / 2 - 0.1, WIN_SILL).y,
    x2: view.toS(rD / 2 - 0.1, WIN_TOP).x,
    y2: view.toS(rD / 2 - 0.1, WIN_TOP).y,
    label: (WIN_TOP - WIN_SILL).toFixed(1) + " m",
    offset: -15,
  });
  drawDimLine(view, { x1: railStart.x, y1: railStart.y + 15, x2: railEnd.x, y2: railEnd.y + 15, label: slideLen.toFixed(1) + " m", offset: 0 });
}

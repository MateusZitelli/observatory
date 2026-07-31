import { drawDimLine } from "../dimensions";
import type { SectionView } from "../types";

export function drawLongitudinalDimensions(view: SectionView): void {
  const { toS, rD, rH, roofPeakH, WIN_SILL, WIN_TOP, slideLen } = view;
  const wallN_B = toS(-rD / 2, 0), wallS_B = toS(rD / 2, 0), wallS_T = toS(rD / 2, rH);
  const railStart = toS(-rD / 2, rH);
  const railEnd = toS(-rD / 2 - slideLen, rH);
  drawDimLine(view, { x1: wallN_B.x, y1: wallN_B.y, x2: wallS_B.x, y2: wallS_B.y, label: rD.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, { x1: wallS_B.x, y1: wallS_B.y, x2: wallS_T.x, y2: wallS_T.y, label: rH.toFixed(2) + " m", offset: 22 });
  const ridgeDimBase = toS(rD / 2 + 0.15, 0), ridgeDimTop = toS(rD / 2 + 0.15, roofPeakH);
  drawDimLine(view, { x1: ridgeDimBase.x, y1: ridgeDimBase.y, x2: ridgeDimTop.x, y2: ridgeDimTop.y, label: roofPeakH.toFixed(2) + " m", offset: 35 });
  const winBase = toS(rD / 2 - 0.1, WIN_SILL), winHeight = toS(rD / 2 - 0.1, WIN_TOP);
  drawDimLine(view, { x1: winBase.x, y1: winBase.y, x2: winHeight.x, y2: winHeight.y, label: (WIN_TOP - WIN_SILL).toFixed(1) + " m", offset: -15 });
  drawDimLine(view, { x1: railStart.x, y1: railStart.y + 15, x2: railEnd.x, y2: railEnd.y + 15, label: slideLen.toFixed(1) + " m", offset: 0 });
}

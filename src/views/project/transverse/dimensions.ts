import { drawDimLine } from "../dimensions";
import type { SectionView } from "../types";

export function drawTransverseDimensions(view: SectionView): void {
  const { toS, rW, rH, roofPeakH, pierD, H_con } = view;
  const wallBL = toS(-rW / 2, 0), wallTL = toS(-rW / 2, rH);
  const wallBR = toS(rW / 2, 0);
  const pierBL = toS(-pierD / 2, 0);
  drawDimLine(view, { x1: wallBL.x, y1: wallBL.y, x2: wallBR.x, y2: wallBR.y, label: rW.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, { x1: wallBL.x, y1: wallBL.y, x2: wallTL.x, y2: wallTL.y, label: rH.toFixed(2) + " m", offset: -22 });
  const ridgeAtEast = toS(rW / 2, roofPeakH);
  drawDimLine(view, { x1: wallBR.x, y1: wallBR.y, x2: ridgeAtEast.x, y2: ridgeAtEast.y, label: roofPeakH.toFixed(2) + " m", offset: 22 });
  const pierDimX = toS(pierD / 2 + 0.1, 0);
  const pierDimTop = toS(pierD / 2 + 0.1, H_con);
  drawDimLine(view, { x1: pierDimX.x, y1: pierDimX.y, x2: pierDimTop.x, y2: pierDimTop.y, label: H_con.toFixed(2) + " m", offset: 15 });
  const pierRight = toS(pierD / 2, 0);
  drawDimLine(view, { x1: pierBL.x, y1: pierBL.y, x2: pierRight.x, y2: pierRight.y, label: "⌀" + (pierD * 100).toFixed(0) + "cm", offset: 12 });
}

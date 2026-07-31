import { drawDimLine } from "../dimensions";
import type { Point, SectionView } from "../types";
import type { TransverseWalls } from "./base";

export function drawTransverseDimensions(view: SectionView, walls: TransverseWalls, pierBL: Point): void {
  const { rW, rH, roofPeakH, pierD, H_con } = view;
  const { wallBL, wallTL, wallBR } = walls;
  drawDimLine(view, { x1: wallBL.x, y1: wallBL.y, x2: wallBR.x, y2: wallBR.y, label: rW.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, { x1: wallBL.x, y1: wallBL.y, x2: wallTL.x, y2: wallTL.y, label: rH.toFixed(2) + " m", offset: -22 });
  drawDimLine(view, { x1: wallBR.x, y1: wallBR.y, x2: view.toS(rW / 2, roofPeakH).x, y2: view.toS(rW / 2, roofPeakH).y, label: roofPeakH.toFixed(2) + " m", offset: 22 });
  drawDimLine(view, { x1: view.toS(pierD / 2 + 0.1, 0).x, y1: view.toS(pierD / 2 + 0.1, 0).y, x2: view.toS(pierD / 2 + 0.1, H_con).x, y2: view.toS(pierD / 2 + 0.1, H_con).y, label: H_con.toFixed(2) + " m", offset: 15 });
  drawDimLine(view, { x1: pierBL.x, y1: pierBL.y, x2: view.toS(pierD / 2, 0).x, y2: view.toS(pierD / 2, 0).y, label: "⌀" + (pierD * 100).toFixed(0) + "cm", offset: 12 });
}

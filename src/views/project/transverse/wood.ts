import { drawTransverseFrame } from "./wood-frame";
import { drawTransverseTruss } from "./wood-truss";
import type { SectionView } from "../types";

export function drawTransverseWood(view: SectionView): void {
  drawTransverseFrame(view);
  drawTransverseTruss(view);
}

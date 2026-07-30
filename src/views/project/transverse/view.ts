import { drawTransverseBase } from "./base";
import { drawTransverseDimensions } from "./dimensions";
import { drawTransverseLabels } from "./labels";
import { drawTransverseObjects } from "./objects";
import { drawTransverseSupports } from "./supports";
import { drawTransverseWood } from "./wood";
import type { ProjectFrame, SectionView } from "../types";

function createTransverseView(frame: ProjectFrame): SectionView {
  const { uiWidth, availW, availH, PAD, rW, BEIRAL, roofPeakH } = frame;
  const vpX = uiWidth + availW / 2, vpW = availW / 2, vpH = availH / 2;
  const totalSecW = rW + BEIRAL * 2 + 0.6, totalSecH = roofPeakH + 0.8;
  const scaleX = (vpW - PAD * 2) / totalSecW;
  const scaleY = (vpH - PAD * 2.5) / totalSecH;
  const scale = Math.min(scaleX, scaleY);
  const cx = vpX + vpW / 2, groundY = vpH - PAD * 1.5;
  const toS = (rx: number, ry: number) => ({ x: cx + rx * scale, y: groundY - ry * scale });
  return { ...frame, vpX, vpY: 0, vpW, vpH, scale, cx, groundY, toS };
}

export function drawProjectTransverse(frame: ProjectFrame): void {
  const view = createTransverseView(frame);
  view.ctx.save();
  drawTransverseBase(view);
  drawTransverseObjects(view);
  drawTransverseSupports(view);
  drawTransverseDimensions(view);
  drawTransverseWood(view);
  drawTransverseLabels(view);
  view.ctx.restore();
}

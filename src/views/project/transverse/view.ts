import { drawTransverseBase } from "./base";
import { drawTransverseDimensions } from "./dimensions";
import { drawTransverseLabels } from "./labels";
import { drawTransverseObjects } from "./objects";
import { drawTransverseSupports } from "./supports";
import { drawTransverseWood } from "./wood";
import type { ProjectFrame, SectionView } from "../types";

function createTransverseView(frame: ProjectFrame): SectionView {
  const { uiWidth, availW, availH, PAD, rW, BEIRAL, roofPeakH } = frame;
  const vpX = uiWidth + availW / 2;
  const vpW = availW / 2;
  const vpH = availH / 2;
  const totalSecW = rW + BEIRAL * 2 + 0.6;
  const totalSecH = roofPeakH + 0.8;
  const scaleX = (vpW - PAD * 2) / totalSecW;
  const scaleY = (vpH - PAD * 2.5) / totalSecH;
  const scale = Math.min(scaleX, scaleY);
  const cx = vpX + vpW / 2;
  const groundY = vpH - PAD * 1.5;
  const toS = (rx: number, ry: number) => ({ x: cx + rx * scale, y: groundY - ry * scale });
  return { ...frame, vpX, vpY: 0, vpW, vpH, scale, cx, groundY, toS };
}

export function drawProjectTransverse(frame: ProjectFrame): void {
  const view = createTransverseView(frame);
  view.ctx.save();
  const walls = drawTransverseBase(view);
  const pierBL = drawTransverseObjects(view);
  drawTransverseSupports(view);
  drawTransverseDimensions(view, walls, pierBL);
  drawTransverseWood(view);
  drawTransverseLabels(view, walls);
  view.ctx.restore();
}

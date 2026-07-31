import { drawLongitudinalBase } from "./base";
import { drawLongitudinalDimensions } from "./dimensions";
import { drawLongitudinalLabels } from "./labels";
import { drawLongitudinalObjects } from "./objects";
import { drawLongitudinalWood } from "./wood";
import type { ProjectFrame, SectionView } from "../types";

function createLongitudinalView(frame: ProjectFrame): SectionView {
  const { uiWidth, availW, availH, PAD, rD, slideLen, roofPeakH } = frame;
  const vpX = uiWidth + availW / 2;
  const vpW = availW / 2;
  const vpY = availH / 2;
  const vpH = availH / 2;
  const totalSecW = rD + slideLen + 1.0;
  const totalSecH = roofPeakH + 0.8;
  const scaleX = (vpW - PAD * 2) / totalSecW, scaleY = (vpH - PAD * 2.5) / totalSecH;
  const scale = Math.min(scaleX, scaleY);
  const cx = vpX + vpW / 2;
  const groundY = vpY + vpH - PAD * 1.5;
  const toS = (rx: number, ry: number) => ({ x: cx + rx * scale, y: groundY - ry * scale });
  return { ...frame, vpX, vpY, vpW, vpH, scale, cx, groundY, toS };
}

export function drawProjectLongitudinal(frame: ProjectFrame): void {
  const view = createLongitudinalView(frame);
  view.ctx.save();
  drawLongitudinalBase(view);
  drawLongitudinalObjects(view);
  drawLongitudinalDimensions(view);
  drawLongitudinalWood(view);
  drawLongitudinalLabels(view);
  view.ctx.restore();
}

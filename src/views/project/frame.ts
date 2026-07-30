import type { ObservatoryState } from "../../runtime-state";
import type { ProjectFrame } from "./types";

export function createProjectFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: ObservatoryState,
): ProjectFrame {
  const H_con = state.H_con;
  const H_ext = state.H_ext;
  const Y_MOUNT = state.Y_MOUNT;
  const X_PIVOT = state.X_PIVOT;
  const pierD = state.pierD;
  const rW = state.rW;
  const rD = state.rD;
  const rH = state.rH;
  const H_total = H_con + H_ext + Y_MOUNT;
  const pitchDeg = state.roofPitch;
  const BEIRAL = 0.15;
  const PITCH_TAN = Math.tan(pitchDeg * Math.PI / 180);
  const halfSpan = rW / 2 + BEIRAL;
  const ridgeRise = halfSpan * PITCH_TAN;
  const roofPeakH = rH + ridgeRise;
  return {
    ctx, w, h, state, H_con, H_ext, Y_MOUNT, X_PIVOT, pierD, rW, rD, rH,
    H_total, pitchDeg, BEIRAL, PITCH_TAN, halfSpan, ridgeRise, roofPeakH,
    DOOR_W: 0.9, DOOR_H: 2.1, DOOR_OFFSET: 0.15,
    WIN_W: 1.5, WIN_SILL: 1.1, WIN_TOP: 2.1,
    DESK_W: 1.2, DESK_D: 0.6, SOFA_W: 1.8, SOFA_D: 0.95,
    MATT_W: 1.58, MATT_D: 1.98, slideLen: rD + 1.5,
    uiWidth: 400, availW: w - 400, availH: h, PAD: 60,
  };
}

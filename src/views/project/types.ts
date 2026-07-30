import type { ObservatoryState } from "../../runtime-state";

export type Point = { readonly x: number; readonly y: number };
export type ToScreen = (x: number, y: number) => Point;

export type ProjectFrame = {
  readonly ctx: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;
  readonly state: ObservatoryState;
  readonly H_con: number;
  readonly H_ext: number;
  readonly Y_MOUNT: number;
  readonly X_PIVOT: number;
  readonly pierD: number;
  readonly rW: number;
  readonly rD: number;
  readonly rH: number;
  readonly H_total: number;
  readonly pitchDeg: number;
  readonly BEIRAL: number;
  readonly PITCH_TAN: number;
  readonly halfSpan: number;
  readonly ridgeRise: number;
  readonly roofPeakH: number;
  readonly DOOR_W: number;
  readonly DOOR_H: number;
  readonly DOOR_OFFSET: number;
  readonly WIN_W: number;
  readonly WIN_SILL: number;
  readonly WIN_TOP: number;
  readonly DESK_W: number;
  readonly DESK_D: number;
  readonly SOFA_W: number;
  readonly SOFA_D: number;
  readonly MATT_W: number;
  readonly MATT_D: number;
  readonly slideLen: number;
  readonly uiWidth: number;
  readonly availW: number;
  readonly availH: number;
  readonly PAD: number;
};

export type PlanView = ProjectFrame & {
  readonly vpW: number;
  readonly vpH: number;
  readonly scale: number;
  readonly cx: number;
  readonly cy: number;
  readonly planScale: number;
  readonly toS: ToScreen;
  readonly nw: Point;
  readonly ne: Point;
  readonly se: Point;
  readonly sw: Point;
  readonly winL: Point;
  readonly winR: Point;
  readonly doorS: Point;
  readonly doorN: Point;
  readonly pierCenter: Point;
  readonly pierR: number;
};

export type SectionView = ProjectFrame & {
  readonly vpX: number;
  readonly vpY: number;
  readonly vpW: number;
  readonly vpH: number;
  readonly scale: number;
  readonly cx: number;
  readonly groundY: number;
  readonly toS: ToScreen;
};

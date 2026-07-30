export type ObservatoryState = {
  H_con: number;
  pierD: number;
  H_ext: number;
  X_PIVOT: number;
  Y_MOUNT: number;
  lat: number;
  Y_BASE: number;
  Z_RA: number;
  Y_DEC: number;
  Y_CW: number;
  TUBE_LEN: number;
  TUBE_OFF: number;
  EYE_LEN: number;
  TUBE_D: number;
  rW: number;
  rD: number;
  rH: number;
  roofOpen: number;
  roofPitch: number;
  roofDir: string;
  RA: number;
  Dec: number;
  showFurniture: boolean;
  sofaBedOpen: boolean;
  showVolumes: boolean;
  showObserver: boolean;
  observerPosture: string;
  obsX: number;
  obsY: number;
  skyHour: number;
  skyDay: number;
  panoRot: number;
};

export const state: ObservatoryState = {
  H_con: 0.95, pierD: 0.30, H_ext: 0.12, X_PIVOT: -0.05, Y_MOUNT: 0.12,
  lat: -23.7, Y_BASE: 0.095, Z_RA: 0.22, Y_DEC: 0.35, Y_CW: 0.48,
  TUBE_LEN: 0.52, TUBE_OFF: 0.050, EYE_LEN: 0.04, TUBE_D: 0.27,
  rW: 4.0, rD: 4.0, rH: 2.20,
  roofOpen: 0, roofPitch: 15, roofDir: "S",
  RA: 0, Dec: -90,
  showFurniture: true, sofaBedOpen: false, showVolumes: true,
  showObserver: true, observerPosture: "sitting", obsX: 1.0, obsY: 0.0,
  skyHour: -1, skyDay: -1, panoRot: 0,
};

export type DerivedValues = {
  H_total: number;
  TUBE_R: number;
  Z_FRONT: number;
  Z_BACK: number;
  Z_BACK_TOTAL: number;
  PITCH_TAN: number;
  halfSpan: number;
  ridgeRise: number;
  ridgeH: number;
  WALL_T: number;
  hWT: number;
  FLOOR_ELEV: number;
  currentMaxVolZ: number;
  currentMaxVolR: number;
  currentEyeMinZ: number;
  roofTotalZ: number;
};

export const derived: DerivedValues = {
  H_total: 0, TUBE_R: 0, Z_FRONT: 0, Z_BACK: 0, Z_BACK_TOTAL: 0,
  PITCH_TAN: 0, halfSpan: 0, ridgeRise: 0, ridgeH: 0,
  WALL_T: 0.175, hWT: 0.0875, FLOOR_ELEV: 0.20,
  currentMaxVolZ: 0, currentMaxVolR: 0, currentEyeMinZ: 0,
  roofTotalZ: 0,
};

export const LS_KEY_V2 = "observatorio_state_v2";

export type StateKey = keyof ObservatoryState;
export type StateValue = ObservatoryState[StateKey];

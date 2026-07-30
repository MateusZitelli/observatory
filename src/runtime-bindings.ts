import type { StateKey, StateValue } from "./runtime-state";

export type BindingType = "range" | "checkbox" | "select";
export type Formatter = (value: StateValue) => string;
export type Binding = {
  readonly id: string;
  readonly key: StateKey;
  readonly type: BindingType;
  readonly valId?: string;
  readonly fmt?: Formatter;
};

const parseFloatValue = Number.parseFloat;
const parseIntValue = Number.parseInt;
const numberValue = (value: StateValue): number => parseFloatValue(String(value));
const decimal = (digits: number, suffix: string): Formatter =>
  (value) => `${numberValue(value).toFixed(digits)}${suffix}`;
const rounded = (suffix: string): Formatter =>
  (value) => `${Math.round(numberValue(value))}${suffix}`;

function formatTime(value: StateValue): string {
  const time = numberValue(value);
  if (time < 0) return "agora";
  const hour = Math.floor(time);
  const minute = Math.round((time - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDate(value: StateValue): string {
  const day = parseIntValue(String(value));
  if (day < 0) return "hoje";
  const date = new Date(new Date().getFullYear(), 0, day);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const metre2 = decimal(2, " m");
const metre3 = decimal(3, " m");
const degree = rounded("°");
const percent = rounded("%");

export const bindings: readonly Binding[] = [
  { id: "paramH", key: "H_con", type: "range", valId: "valH", fmt: metre2 },
  { id: "paramPierD", key: "pierD", type: "range", valId: "valPierD", fmt: metre2 },
  { id: "paramExtH", key: "H_ext", type: "range", valId: "valExtH", fmt: metre2 },
  { id: "paramPivotX", key: "X_PIVOT", type: "range", valId: "valPivotX", fmt: metre2 },
  { id: "paramMountY", key: "Y_MOUNT", type: "range", valId: "valMountY", fmt: metre2 },
  { id: "paramLat", key: "lat", type: "range", valId: "valLat", fmt: decimal(1, "°") },
  { id: "paramBaseY", key: "Y_BASE", type: "range", valId: "valBaseY", fmt: metre3 },
  { id: "paramRaZ", key: "Z_RA", type: "range", valId: "valRaZ", fmt: metre2 },
  { id: "paramDecY", key: "Y_DEC", type: "range", valId: "valDecY", fmt: metre2 },
  { id: "paramCwY", key: "Y_CW", type: "range", valId: "valCwY", fmt: metre2 },
  { id: "paramTubeLen", key: "TUBE_LEN", type: "range", valId: "valTubeLen", fmt: metre2 },
  { id: "paramTubeOff", key: "TUBE_OFF", type: "range", valId: "valTubeOff", fmt: metre3 },
  { id: "paramEyeLen", key: "EYE_LEN", type: "range", valId: "valEyeLen", fmt: metre2 },
  { id: "paramTubeD", key: "TUBE_D", type: "range", valId: "valTubeD", fmt: metre2 },
  { id: "paramRoomW", key: "rW", type: "range", valId: "valRoomW", fmt: metre2 },
  { id: "paramRoomD", key: "rD", type: "range", valId: "valRoomD", fmt: metre2 },
  { id: "paramRoomH", key: "rH", type: "range", valId: "valRoomH", fmt: metre2 },
  { id: "paramRoofOpen", key: "roofOpen", type: "range", valId: "valRoofOpen", fmt: percent },
  { id: "paramRoofPitch", key: "roofPitch", type: "range", valId: "valRoofPitch", fmt: degree },
  { id: "paramRA", key: "RA", type: "range", valId: "valRA", fmt: degree },
  { id: "paramDec", key: "Dec", type: "range", valId: "valDec", fmt: degree },
  { id: "paramObsX", key: "obsX", type: "range" },
  { id: "paramObsY", key: "obsY", type: "range" },
  { id: "showFurniture", key: "showFurniture", type: "checkbox" },
  { id: "sofaBedOpen", key: "sofaBedOpen", type: "checkbox" },
  { id: "showVolumes", key: "showVolumes", type: "checkbox" },
  { id: "showObserver", key: "showObserver", type: "checkbox" },
  { id: "paramRoofDir", key: "roofDir", type: "select", valId: "valRoofDir", fmt: String },
  { id: "observerPosture", key: "observerPosture", type: "select" },
  { id: "paramHSky", key: "H_con", type: "range", valId: "valHSky", fmt: metre2 },
  { id: "paramRoomHSky", key: "rH", type: "range", valId: "valRoomHSky", fmt: metre2 },
  { id: "paramRoomWSky", key: "rW", type: "range", valId: "valRoomWSky", fmt: metre2 },
  { id: "paramRoomDSky", key: "rD", type: "range", valId: "valRoomDSky", fmt: metre2 },
  { id: "paramRoofPitchSky", key: "roofPitch", type: "range", valId: "valRoofPitchSky", fmt: degree },
  { id: "paramRoofOpenSky", key: "roofOpen", type: "range", valId: "valRoofOpenSky", fmt: percent },
  { id: "paramSkyHour", key: "skyHour", type: "range", valId: "valSkyHour", fmt: formatTime },
  { id: "paramSkyDay", key: "skyDay", type: "range", valId: "valSkyDay", fmt: formatDate },
  { id: "paramPanoRot", key: "panoRot", type: "range", valId: "valPanoRot", fmt: degree },
];

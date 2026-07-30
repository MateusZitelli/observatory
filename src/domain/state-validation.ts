import { defaultState } from "./default-state";
import type { ObservatoryState, ObserverPosture, RoofDirection } from "./types";

type NumericKey = {
  [Key in keyof ObservatoryState]: ObservatoryState[Key] extends number ? Key : never;
}[keyof ObservatoryState];
type BooleanKey = {
  [Key in keyof ObservatoryState]: ObservatoryState[Key] extends boolean ? Key : never;
}[keyof ObservatoryState];

export function parsePersistedState(source: unknown): ObservatoryState {
  const value = record(source);
  return {
    concreteHeight: numeric(value, "concreteHeight", 0.5, 2),
    pierDiameter: numeric(value, "pierDiameter", 0.15, 0.8),
    extensionHeight: numeric(value, "extensionHeight", 0, 0.6),
    pivotOffset: numeric(value, "pivotOffset", -0.5, 0.5),
    mountHeight: numeric(value, "mountHeight", 0, 0.5),
    latitude: numeric(value, "latitude", -90, 90),
    baseOffset: numeric(value, "baseOffset", 0, 0.3),
    rightAscensionOffset: numeric(value, "rightAscensionOffset", 0.1, 0.6),
    declinationOffset: numeric(value, "declinationOffset", 0.1, 0.8),
    counterweightOffset: numeric(value, "counterweightOffset", 0.2, 1),
    tubeLength: numeric(value, "tubeLength", 0.3, 1.2),
    tubeOffset: numeric(value, "tubeOffset", -0.2, 0.2),
    eyepieceLength: numeric(value, "eyepieceLength", 0, 0.25),
    tubeDiameter: numeric(value, "tubeDiameter", 0.1, 0.5),
    roomWidth: numeric(value, "roomWidth", 1.5, 6),
    roomDepth: numeric(value, "roomDepth", 1.5, 6),
    roomHeight: numeric(value, "roomHeight", 1.5, 4),
    roofOpen: numeric(value, "roofOpen", 0, 100),
    roofPitch: numeric(value, "roofPitch", 5, 35),
    roofDirection: direction(value?.["roofDirection"]),
    rightAscension: numeric(value, "rightAscension", 0, 360),
    declination: numeric(value, "declination", -90, 90),
    showFurniture: boolean(value, "showFurniture"),
    sofaBedOpen: boolean(value, "sofaBedOpen"),
    showVolume: boolean(value, "showVolume"),
    showObserver: boolean(value, "showObserver"),
    observerPosture: posture(value?.["observerPosture"]),
    observerX: numeric(value, "observerX", -2, 2),
    observerZ: numeric(value, "observerZ", -2, 2),
    skyHour: numeric(value, "skyHour", -1, 23.75),
    skyDay: numeric(value, "skyDay", -1, 365),
    panoramaRotation: numeric(value, "panoramaRotation", 0, 360),
    showGemOverlay: boolean(value, "showGemOverlay"),
    showBlockOverlay: boolean(value, "showBlockOverlay"),
    showMeridianOverlay: boolean(value, "showMeridianOverlay"),
  };
}

function numeric(
  source: Record<string, unknown> | undefined,
  key: NumericKey,
  minimum: number,
  maximum: number,
): number {
  const value = source?.[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return defaultState[key];
  return value >= minimum && value <= maximum ? value : defaultState[key];
}

function boolean(source: Record<string, unknown> | undefined, key: BooleanKey): boolean {
  const value = source?.[key];
  return typeof value === "boolean" ? value : defaultState[key];
}

function direction(value: unknown): RoofDirection {
  return value === "N" || value === "S" || value === "L" || value === "O"
    ? value : defaultState.roofDirection;
}

function posture(value: unknown): ObserverPosture {
  return value === "standing" || value === "sitting" ? value : defaultState.observerPosture;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
import type { NumericStateKey, RangeSpec } from "./control-types";
import type { ObservatoryState } from "../domain/types";

const units: Partial<Record<NumericStateKey, string>> = {
  concreteHeight: " m",
  pierDiameter: " m",
  extensionHeight: " m",
  pivotOffset: " m",
  mountHeight: " m",
  latitude: "°",
  roomWidth: " m",
  roomDepth: " m",
  roomHeight: " m",
  roofOpen: "%",
  roofPitch: "°",
  rightAscension: "°",
  declination: "°",
  observerX: " m",
  observerZ: " m",
  panoramaRotation: "°",
};

export function formatStateValue(
  key: NumericStateKey,
  value: number,
): string {
  if (key === "skyHour") return formatHour(value);
  if (key === "skyDay") return formatDay(value);
  const unit = units[key] ?? " m";
  return `${value.toFixed(precision(key, value))}${unit}`;
}

function formatHour(value: number): string {
  if (value < 0) return "agora";
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDay(value: number): string {
  if (value < 0) return "hoje";
  const date = new Date(new Date().getFullYear(), 0, value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function precision(key: NumericStateKey, value: number): number {
  const millimetric = new Set<keyof ObservatoryState>([
    "baseOffset", "tubeLength", "tubeOffset", "tubeDiameter",
  ]);
  if (millimetric.has(key)) return 3;
  return Number.isInteger(value) ? 0 : 2;
}

export type { RangeSpec };

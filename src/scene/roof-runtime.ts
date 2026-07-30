import { buildRoof } from "./roof/build";

export type RoofBuilder = (rW: number, rD: number, rH: number) => void;

declare global {
  var buildRoof: RoofBuilder;
}

export function installRoofGlobal(): void {
  globalThis.buildRoof = buildRoof;
}

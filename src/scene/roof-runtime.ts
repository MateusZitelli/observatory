import { buildRoof } from "./roof/build";
import { getRoofMaterials } from "./roof/materials";

export type RoofBuilder = (rW: number, rD: number, rH: number) => void;

declare global {
  var buildRoof: RoofBuilder;
}

export function installRoofGlobal(): void {
  getRoofMaterials();
  globalThis.buildRoof = buildRoof;
}

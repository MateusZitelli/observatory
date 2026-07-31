import type * as Three from "three";
import { buildRoofFrame, createWoodMaterials } from "./frame";
import { getRoofMaterials } from "./materials";
import { buildRoofRails } from "./rails";
import { buildRoofTiles } from "./tiles";
import type { RoofMaterials } from "./types";

let prevRoofKey = "";

type RoofRailObject = Three.Object3D & { readonly userData: { readonly roofRail?: unknown } };
type LegacyRoofObject = Three.Object3D & { readonly geometry?: unknown; readonly material?: unknown };
function isTruthy(value: unknown): boolean {
  return value !== false && value !== 0 && value !== 0n && value !== "" && value !== null && value !== undefined &&
    !(typeof value === "number" && Number.isNaN(value));
}
function hasRoofRail(object: Three.Object3D): object is RoofRailObject {
  return "roofRail" in object.userData && isTruthy(object.userData["roofRail"]);
}
function hasLegacyFields(object: Three.Object3D): object is LegacyRoofObject {
  return "geometry" in object || "material" in object;
}
type Disposable = { dispose(): void };
function isDisposable(value: object): value is Disposable {
  return "dispose" in value && typeof value.dispose === "function";
}
function disposeLegacy(value: unknown): void {
  if (value === null || (typeof value !== "object" && typeof value !== "function") || !isDisposable(value)) {
    throw new TypeError("Value is not disposable");
  }
  value.dispose();
}
function disposeRoofGeometry(object: Three.Object3D): void {
  if (hasLegacyFields(object) && isTruthy(object.geometry)) disposeLegacy(object.geometry);
}
function disposeRoofObject(object: Three.Object3D, materials: RoofMaterials): void {
  if (!hasLegacyFields(object)) return;
  if (isTruthy(object.geometry)) disposeLegacy(object.geometry);
  if (
    isTruthy(object.material) &&
    object.material !== materials.roofMatA &&
    object.material !== materials.roofMatB
  ) disposeLegacy(object.material);
}
function clearRoof(materials: RoofMaterials): void {
  for (let i = globalThis.scene.children.length - 1; i >= 0; i--) {
    const object = globalThis.scene.children[i];
    if (object === undefined || !hasRoofRail(object)) continue;
    disposeRoofGeometry(object);
    globalThis.scene.remove(object);
  }
  while (globalThis.roofGroup.children.length > 0) {
    const object = globalThis.roofGroup.children[0];
    if (object === undefined) break;
    object.traverse((child) => { disposeRoofObject(child, materials); });
    globalThis.roofGroup.remove(object);
  }
}

function calculateRoofGeometry(rW: number, rD: number, rH: number, roofPitch: number) {
  const beiral = 0.15;
  const overlap = 0.05;
  const pitch = (roofPitch * Math.PI) / 180;
  const tileH = 0.04;
  const tileL = 2.5;
  const tileW = 1.0;
  const wheelH = 0.10;
  const rHB = rH + wheelH;
  const ridgeX = chooseRidgeAxis();
  const ridgeLen = (ridgeX ? rW : rD) + 2 * beiral;
  const halfSpan = (ridgeX ? rD : rW) / 2 + beiral;
  const slopeLen = halfSpan / Math.cos(pitch);
  const ridgeRise = halfSpan * Math.tan(pitch);
  const nRidge = Math.round(ridgeLen / tileW) + 1;
  const nSlope = Math.ceil(slopeLen / (tileL - overlap));
  const totalRidge = nRidge * tileW;
  return { halfSpan, nRidge, nSlope, pitch, rD, rHB, ridgeRise, ridgeX, tileH, tileL, tileW, totalRidge };
}
function chooseRidgeAxis(): boolean {
  return false;
}

export function buildRoof(rW: number, rD: number, rH: number): void {
  const key = rW + "," + rD + "," + rH + "," +
    globalThis.derived.currentMaxVolZ.toFixed(2) + "," +
    globalThis.derived.currentMaxVolR.toFixed(2) + "," +
    globalThis.state.roofPitch + "," + globalThis.state.roofDir;
  if (key === prevRoofKey) return;
  prevRoofKey = key;
  const roofMaterials = getRoofMaterials();
  clearRoof(roofMaterials);
  const geometry = calculateRoofGeometry(rW, rD, rH, globalThis.state.roofPitch);
  globalThis.derived.roofTotalZ = geometry.totalRidge;
  buildRoofFrame(geometry, createWoodMaterials());
  buildRoofTiles({ ...geometry, overlap: 0.05, rH, PITCH: geometry.pitch }, roofMaterials);
  buildRoofRails({ rW, rD, rH, totalRidge: geometry.totalRidge, slideDir: globalThis.state.roofDir });
}

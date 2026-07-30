import type * as Three from "three";
import { buildRoofFrame, createWoodMaterials } from "./frame";
import { getRoofMaterials } from "./materials";
import { buildRoofRails } from "./rails";
import { buildRoofTiles } from "./tiles";
import type { RoofMaterials } from "./types";

let prevRoofKey = "";

type GeometricObject = Three.Mesh | Three.LineSegments;
function isGeometricObject(object: Three.Object3D): object is GeometricObject {
  return object instanceof globalThis.THREE.Mesh || object instanceof globalThis.THREE.LineSegments;
}
function disposeRoofObject(object: Three.Object3D, materials: RoofMaterials): void {
  if (!isGeometricObject(object)) return;
  object.geometry.dispose();
  const objectMaterial = object.material;
  if (Array.isArray(objectMaterial)) {
    for (const material of objectMaterial) {
      if (material !== materials.roofMatA && material !== materials.roofMatB) material.dispose();
    }
  } else if (objectMaterial !== materials.roofMatA && objectMaterial !== materials.roofMatB) {
    objectMaterial.dispose();
  }
}
function clearRoof(materials: RoofMaterials): void {
  for (let i = globalThis.scene.children.length - 1; i >= 0; i--) {
    const object = globalThis.scene.children[i];
    if (object === undefined || !Object.prototype.hasOwnProperty.call(object.userData, "roofRail")) continue;
    if (isGeometricObject(object)) object.geometry.dispose();
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
  const { currentMaxVolR, currentMaxVolZ } = globalThis.derived;
  const { roofDir, roofPitch } = globalThis.state;
  const key = rW + "," + rD + "," + rH + "," + currentMaxVolZ.toFixed(2) + "," + currentMaxVolR.toFixed(2) + "," + roofPitch + "," + roofDir;
  if (key === prevRoofKey) return;
  prevRoofKey = key;
  const roofMaterials = getRoofMaterials();
  clearRoof(roofMaterials);
  const geometry = calculateRoofGeometry(rW, rD, rH, roofPitch);
  globalThis.derived.roofTotalZ = geometry.totalRidge;
  buildRoofFrame(geometry, createWoodMaterials());
  buildRoofTiles({ ...geometry, overlap: 0.05, rH, PITCH: geometry.pitch }, roofMaterials);
  buildRoofRails({ rW, rD, rH, totalRidge: geometry.totalRidge, slideDir: roofDir });
}

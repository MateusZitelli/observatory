import type * as Three from "three";
import type { RoofFrameInput, RoofWoodMaterials } from "./types";

type BeamInput = {
  readonly start: Three.Vector3;
  readonly end: Three.Vector3;
  readonly width: number;
  readonly height: number;
};

function addBeam(input: BeamInput, materials: RoofWoodMaterials): void {
  const { start, end, width, height } = input;
  const dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 0.01) return;
  const geo = new globalThis.THREE.BoxGeometry(width, height, len);
  const beam = new globalThis.THREE.Mesh(geo, materials.woodMat);
  beam.add(new globalThis.THREE.LineSegments(
    new globalThis.THREE.EdgesGeometry(geo), materials.woodEdge,
  ));
  beam.position.set(
    (start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2,
  );
  beam.lookAt(end.x, end.y, end.z);
  globalThis.roofGroup.add(beam);
}

export function createWoodMaterials(): RoofWoodMaterials {
  return {
    woodMat: new globalThis.THREE.MeshStandardMaterial({
      color: 0xc4a35a, roughness: 0.8, metalness: 0.0,
    }),
    woodEdge: new globalThis.THREE.LineBasicMaterial({
      color: 0x8b7332, transparent: true, opacity: 0.4,
    }),
  };
}

function buildTrusses(input: RoofFrameInput, materials: RoofWoodMaterials): void {
  const { rD, rHB, halfSpan, ridgeRise } = input;
  const nTruss = Math.max(3, Math.ceil(rD / 1.5) + 1);
  const trussSpacing = rD / (nTruss - 1);
  const trussPositions: number[] = [];
  for (let ti = 0; ti < nTruss; ti++) trussPositions.push(-rD / 2 + ti * trussSpacing);
  for (const zz of trussPositions) {
    for (const sx of [-1, 1]) {
      addBeam({ start: new globalThis.THREE.Vector3(sx * halfSpan, rHB, zz), end: new globalThis.THREE.Vector3(0, rHB + ridgeRise, zz), width: 0.06, height: 0.12 }, materials);
    }
    addBeam({ start: new globalThis.THREE.Vector3(-halfSpan, rHB, zz), end: new globalThis.THREE.Vector3(halfSpan, rHB, zz), width: 0.06, height: 0.12 }, materials);
    addBeam({ start: new globalThis.THREE.Vector3(0, rHB, zz), end: new globalThis.THREE.Vector3(0, rHB + ridgeRise, zz), width: 0.06, height: 0.06 }, materials);
    for (const sx of [-1, 1]) {
      addBeam({ start: new globalThis.THREE.Vector3(0, rHB + ridgeRise * 0.4, zz), end: new globalThis.THREE.Vector3(sx * halfSpan * 0.5, rHB + ridgeRise * 0.5, zz), width: 0.06, height: 0.06 }, materials);
    }
  }
}

function buildLongBeams(input: RoofFrameInput, materials: RoofWoodMaterials): void {
  const { rHB, halfSpan, ridgeRise, totalRidge } = input;
  addBeam({ start: new globalThis.THREE.Vector3(0, rHB + ridgeRise, -totalRidge / 2), end: new globalThis.THREE.Vector3(0, rHB + ridgeRise, totalRidge / 2), width: 0.06, height: 0.16 }, materials);
  for (const sx of [-1, 1]) {
    addBeam({ start: new globalThis.THREE.Vector3(sx * halfSpan, rHB - 0.075, -totalRidge / 2), end: new globalThis.THREE.Vector3(sx * halfSpan, rHB - 0.075, totalRidge / 2), width: 0.06, height: 0.15 }, materials);
  }
  for (const frac of [0.33, 0.66]) {
    for (const sx of [-1, 1]) {
      const tx = sx * halfSpan * (1 - frac), ty = rHB + ridgeRise * frac;
      addBeam({ start: new globalThis.THREE.Vector3(tx, ty, -totalRidge / 2), end: new globalThis.THREE.Vector3(tx, ty, totalRidge / 2), width: 0.05, height: 0.07 }, materials);
    }
  }
}

function buildBracing(input: RoofFrameInput, materials: RoofWoodMaterials): void {
  const { rD, rHB, halfSpan, ridgeRise } = input;
  const nTruss = Math.max(3, Math.ceil(rD / 1.5) + 1);
  const trussSpacing = rD / (nTruss - 1);
  for (let ti = 0; ti < nTruss - 1; ti++) {
    const z1 = -rD / 2 + ti * trussSpacing;
    const z2 = -rD / 2 + (ti + 1) * trussSpacing;
    addBeam({ start: new globalThis.THREE.Vector3(halfSpan * 0.5, rHB + ridgeRise * 0.5, z1), end: new globalThis.THREE.Vector3(halfSpan, rHB, z2), width: 0.05, height: 0.05 }, materials);
    addBeam({ start: new globalThis.THREE.Vector3(halfSpan, rHB, z1), end: new globalThis.THREE.Vector3(halfSpan * 0.5, rHB + ridgeRise * 0.5, z2), width: 0.05, height: 0.05 }, materials);
  }
}

export function buildRoofFrame(input: RoofFrameInput, materials: RoofWoodMaterials): void {
  buildTrusses(input, materials);
  buildLongBeams(input, materials);
  buildBracing(input, materials);
}

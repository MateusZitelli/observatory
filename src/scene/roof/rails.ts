import type * as Three from "three";
import type { RoofRailInput } from "./types";
type RailMaterials = {
  readonly railMat: Three.MeshStandardMaterial;
  readonly postMat: Three.MeshStandardMaterial;
  readonly postEdgeMat: Three.LineBasicMaterial;
};
type RailPieceInput = { readonly position: Three.Vector3; readonly size: Three.Vector3; readonly material?: Three.MeshStandardMaterial };
type RailLayout = {
  readonly alongZ: boolean;
  readonly roomDim: number;
  readonly perpDim: number;
  readonly perpOff: number;
  readonly sign: number;
  readonly slideLen: number;
};
function createRailMaterials(): RailMaterials {
  return {
    railMat: new globalThis.THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.6, metalness: 0.4 }),
    postMat: new globalThis.THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.8, metalness: 0.0 }),
    postEdgeMat: new globalThis.THREE.LineBasicMaterial({ color: 0x8b7332, transparent: true, opacity: 0.3 }),
  };
}
function addRailPiece(input: RailPieceInput, materials: RailMaterials): void {
  const { material, position, size } = input;
  const g = new globalThis.THREE.BoxGeometry(size.x, size.y, size.z);
  const m = new globalThis.THREE.Mesh(g, material ?? materials.postMat);
  m.add(new globalThis.THREE.LineSegments(new globalThis.THREE.EdgesGeometry(g), materials.postEdgeMat));
  m.position.copy(position);
  m.userData["roofRail"] = true;
  globalThis.scene.add(m);
}
function addRoomRails(input: RoofRailInput, materials: RailMaterials, layout: RailLayout): void {
  for (const side of [-1, 1]) {
    const position = layout.alongZ
      ? new globalThis.THREE.Vector3(side * layout.perpOff, input.rH - 0.08 / 2, 0)
      : new globalThis.THREE.Vector3(0, input.rH - 0.08 / 2, side * layout.perpOff);
    const size = layout.alongZ
      ? new globalThis.THREE.Vector3(0.15, 0.08, layout.roomDim)
      : new globalThis.THREE.Vector3(layout.roomDim, 0.08, 0.15);
    addRailPiece({ position, size, material: materials.railMat }, materials);
  }
}
function addExtensionRails(input: RoofRailInput, materials: RailMaterials, layout: RailLayout): void {
  const start = layout.sign * layout.roomDim / 2;
  const end = layout.sign * (layout.slideLen - layout.roomDim / 2);
  const length = Math.abs(end - start);
  const middle = (start + end) / 2;
  for (const side of [-1, 1]) {
    const position = layout.alongZ
      ? new globalThis.THREE.Vector3(side * layout.perpOff, input.rH - 0.08 / 2, middle)
      : new globalThis.THREE.Vector3(middle, input.rH - 0.08 / 2, side * layout.perpOff);
    const size = layout.alongZ
      ? new globalThis.THREE.Vector3(0.15, 0.08, length)
      : new globalThis.THREE.Vector3(length, 0.08, 0.15);
    addRailPiece({ position, size, material: materials.railMat }, materials);
  }
}
function addPostsAndCrossbars(input: RoofRailInput, materials: RailMaterials, layout: RailLayout): void {
  const railEnd = layout.sign * (layout.slideLen - layout.roomDim / 2);
  const railStart = -layout.sign * layout.roomDim / 2;
  const count = Math.max(3, Math.ceil(Math.abs(railEnd - railStart) / 1.5) + 1);
  const positions: number[] = [];
  for (let i = 0; i < count; i++) positions.push(railStart + (railEnd - railStart) * i / (count - 1));
  for (const side of [-1, 1]) {
    for (const position of positions) {
      if (position > -layout.roomDim / 2 - 0.1 && position < layout.roomDim / 2 + 0.1) continue;
      const point = layout.alongZ
        ? new globalThis.THREE.Vector3(side * layout.perpOff, input.rH / 2, position)
        : new globalThis.THREE.Vector3(position, input.rH / 2, side * layout.perpOff);
      addRailPiece({ position: point, size: new globalThis.THREE.Vector3(0.15, input.rH, 0.15) }, materials);
    }
  }
  for (const position of positions) {
    if (position > -layout.roomDim / 2 - 0.1 && position < layout.roomDim / 2 + 0.1) continue;
    const point = layout.alongZ
      ? new globalThis.THREE.Vector3(0, input.rH - 0.15 / 2, position)
      : new globalThis.THREE.Vector3(position, input.rH - 0.15 / 2, 0);
    const size = layout.alongZ
      ? new globalThis.THREE.Vector3(layout.perpDim + 0.30, 0.15, 0.15)
      : new globalThis.THREE.Vector3(0.15, 0.15, layout.perpDim + 0.30);
    addRailPiece({ position: point, size }, materials);
  }
}
export function buildRoofRails(input: RoofRailInput): void {
  const layout: RailLayout = {
    alongZ: input.slideDir === "N" || input.slideDir === "S",
    roomDim: input.slideDir === "N" || input.slideDir === "S" ? input.rD : input.rW,
    perpDim: input.slideDir === "N" || input.slideDir === "S" ? input.rW : input.rD,
    perpOff: (input.slideDir === "N" || input.slideDir === "S" ? input.rW : input.rD) / 2 + 0.04,
    sign: input.slideDir === "N" || input.slideDir === "O" ? -1 : 1,
    slideLen: input.totalRidge + (input.slideDir === "N" || input.slideDir === "S" ? input.rD : input.rW) + 0.5,
  };
  const materials = createRailMaterials();
  addRoomRails(input, materials, layout);
  addExtensionRails(input, materials, layout);
  addPostsAndCrossbars(input, materials, layout);
}

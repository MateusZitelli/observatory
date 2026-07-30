import type { RoofMaterials } from "./types";

let materials: RoofMaterials | undefined;

export function getRoofMaterials(): RoofMaterials {
  if (materials !== undefined) return materials;
  const next: RoofMaterials = {
    roofMatA: new globalThis.THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.4,
      metalness: 0.7,
      side: globalThis.THREE.DoubleSide,
    }),
    roofMatB: new globalThis.THREE.MeshStandardMaterial({
      color: 0x6b6560,
      roughness: 0.4,
      metalness: 0.7,
      side: globalThis.THREE.DoubleSide,
    }),
    roofEdgeMat: new globalThis.THREE.LineBasicMaterial({
      color: 0xa8a29e,
      opacity: 0.6,
      transparent: true,
    }),
  };
  materials = next;
  return next;
}

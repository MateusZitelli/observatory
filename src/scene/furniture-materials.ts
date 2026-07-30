import type * as Three from "three";

export type FurnitureMaterials = {
  readonly woodMat: Three.MeshStandardMaterial;
  readonly metalMat: Three.MeshStandardMaterial;
  readonly fabricSofaMat: Three.MeshStandardMaterial;
  readonly fabricChairMat: Three.MeshStandardMaterial;
  readonly glassMat: Three.MeshStandardMaterial;
  readonly frameMat: Three.MeshStandardMaterial;
};

export function createFurnitureMaterials(): FurnitureMaterials {
  const { MeshStandardMaterial } = globalThis.THREE;
  return {
    woodMat: new MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 }),
    metalMat: new MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.4,
      metalness: 0.6,
    }),
    fabricSofaMat: new MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.9,
    }),
    fabricChairMat: new MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
    }),
    glassMat: new MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
    }),
    frameMat: new MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.5 }),
  };
}

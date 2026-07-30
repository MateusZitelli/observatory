import { MeshStandardMaterial } from "three";

export type GemMaterials = {
  black: MeshStandardMaterial;
  orange: MeshStandardMaterial;
  silver: MeshStandardMaterial;
  dark: MeshStandardMaterial;
};

export function createGemMaterials(): GemMaterials {
  return {
    black: new MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.2,
      roughness: 0.8,
    }),
    orange: new MeshStandardMaterial({
      color: 0xea580c,
      metalness: 0.6,
      roughness: 0.4,
    }),
    silver: new MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.8,
      roughness: 0.3,
    }),
    dark: new MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.7,
    }),
  };
}

import type * as Three from "three";

export type MountMaterials = {
  readonly black: Three.MeshStandardMaterial;
  readonly orange: Three.MeshStandardMaterial;
  readonly silver: Three.MeshStandardMaterial;
  readonly darkGrey: Three.MeshStandardMaterial;
};

export function createMountMaterials(): MountMaterials {
  const { MeshStandardMaterial } = globalThis.THREE;
  return {
    black: new MeshStandardMaterial({ color: 0x18181b, roughness: 0.8, metalness: 0.2 }),
    orange: new MeshStandardMaterial({ color: 0xea580c, roughness: 0.4, metalness: 0.6 }),
    silver: new MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.8 }),
    darkGrey: new MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 }),
  };
}

import type { WallFrameMaterials } from "./types";

export function createWallFrameMaterials(): WallFrameMaterials {
  const { LineBasicMaterial, MeshStandardMaterial } = globalThis.THREE;
  return {
    wall: new MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.85 }),
    edge: new LineBasicMaterial({ color: 0x8b7332, transparent: true, opacity: 0.3 }),
    floor: new MeshStandardMaterial({ color: 0xb8943e, roughness: 0.9 }),
    frontal: new MeshStandardMaterial({
      color: 0xd4b86a,
      roughness: 0.95,
      side: globalThis.THREE.DoubleSide,
    }),
    eps: new MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 1.0,
      transparent: true,
      opacity: 0.6,
    }),
  };
}

import type * as Three from "three";

export type VolumeParts = {
  readonly front: Three.Mesh;
  readonly eye: Three.Mesh;
};

function createVolume(
  color: number,
  opacity: number,
  wireColor: number,
  wireOpacity: number,
): Three.Mesh {
  const { BufferGeometry, DoubleSide, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial } = globalThis.THREE;
  const mesh = new Mesh(new BufferGeometry(), new MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    side: DoubleSide,
  }));
  mesh.add(new LineSegments(
    new BufferGeometry(),
    new LineBasicMaterial({ color: wireColor, transparent: true, opacity: wireOpacity }),
  ));
  return mesh;
}

export function createVolumes(): VolumeParts {
  return {
    front: createVolume(0x3b82f6, 0.15, 0x60a5fa, 0.2),
    eye: createVolume(0xf97316, 0.2, 0xfb923c, 0.3),
  };
}

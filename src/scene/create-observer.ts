import type * as Three from "three";

export function createObserver(): Three.Group {
  const { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } = globalThis.THREE;
  const material = new MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
  const body = new Mesh(new CylinderGeometry(0.2, 0.2, 1.3, 16), material);
  body.geometry.translate(0, 0.65, 0);
  const head = new Mesh(new SphereGeometry(0.15, 16, 16), material);
  head.geometry.translate(0, 1.45, 0);
  const group = new Group();
  group.add(body, head);
  return group;
}

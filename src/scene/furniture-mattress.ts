import type * as Three from "three";

export function createMattress(
  pillowMat: Three.MeshStandardMaterial,
): Three.Group {
  const { BoxGeometry, Group, Mesh, MeshStandardMaterial } = globalThis.THREE;
  const mattressGroup = new Group();
  const mattBase = new Mesh(
    new BoxGeometry(1.58, 0.15, 1.98),
    new MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 }),
  );
  mattBase.position.set(0, 0.075, 0);
  mattressGroup.add(mattBase);
  const mPillow1 = new Mesh(new BoxGeometry(0.55, 0.08, 0.35), pillowMat);
  mPillow1.position.set(-0.35, 0.19, -0.75);
  mattressGroup.add(mPillow1);
  const mPillow2 = new Mesh(new BoxGeometry(0.55, 0.08, 0.35), pillowMat);
  mPillow2.position.set(0.35, 0.19, -0.75);
  mattressGroup.add(mPillow2);
  return mattressGroup;
}

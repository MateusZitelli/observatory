import type * as Three from "three";
import type { FurnitureMaterials } from "./furniture-materials";

export function createChair(materials: FurnitureMaterials): Three.Group {
  const { BoxGeometry, CylinderGeometry, Group, Mesh } = globalThis.THREE;
  const chairGroup = new Group();
  const seat = new Mesh(new BoxGeometry(0.5, 0.05, 0.5), materials.fabricChairMat);
  seat.position.set(0, 0.45, 0);
  chairGroup.add(seat);
  const back = new Mesh(new BoxGeometry(0.45, 0.5, 0.05), materials.fabricChairMat);
  back.position.set(0, 0.725, -0.225);
  chairGroup.add(back);
  const pole = new Mesh(
    new CylinderGeometry(0.02, 0.02, 0.4),
    materials.metalMat,
  );
  pole.position.set(0, 0.2, 0);
  chairGroup.add(pole);
  const base1 = new Mesh(new BoxGeometry(0.6, 0.05, 0.05), materials.metalMat);
  base1.position.set(0, 0.025, 0);
  chairGroup.add(base1);
  const base2 = new Mesh(new BoxGeometry(0.05, 0.05, 0.6), materials.metalMat);
  base2.position.set(0, 0.025, 0);
  chairGroup.add(base2);
  return chairGroup;
}

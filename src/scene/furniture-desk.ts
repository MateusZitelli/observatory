import type * as Three from "three";
import type { FurnitureMaterials } from "./furniture-materials";

export function createDesk(materials: FurnitureMaterials): Three.Group {
  const { BoxGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, Group } = globalThis.THREE;
  const deskGroup = new Group();
  const deskTop = new Mesh(new BoxGeometry(1.6, 0.05, 0.7), materials.woodMat);
  deskTop.position.set(0, 0.75, 0);
  deskGroup.add(deskTop);

  const legGeo = new BoxGeometry(0.05, 0.725, 0.05);
  const legsPos = [[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.3], [0.75, 0.3]] as const;
  legsPos.forEach((pos) => {
    const leg = new Mesh(legGeo, materials.metalMat);
    leg.position.set(pos[0], 0.3625, pos[1]);
    deskGroup.add(leg);
  });

  const monitorBase = new Mesh(
    new BoxGeometry(0.2, 0.02, 0.15),
    new MeshStandardMaterial({ color: 0x111827 }),
  );
  monitorBase.position.set(0, 0.785, -0.15);
  deskGroup.add(monitorBase);
  const monitorStem = new Mesh(
    new CylinderGeometry(0.02, 0.02, 0.15),
    materials.metalMat,
  );
  monitorStem.position.set(0, 0.86, -0.15);
  deskGroup.add(monitorStem);
  const monitorScreen = new Mesh(
    new BoxGeometry(0.6, 0.35, 0.04),
    new MeshStandardMaterial({ color: 0x111827, roughness: 0.2 }),
  );
  monitorScreen.position.set(0, 0.95, -0.13);
  deskGroup.add(monitorScreen);
  return deskGroup;
}

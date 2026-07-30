import type * as Three from "three";
import type { FurnitureMaterials } from "./furniture-materials";

export type SofaParts = {
  readonly sofaGroup: Three.Group;
  readonly sofaBedMat: Three.Group;
  readonly pillowMat: Three.MeshStandardMaterial;
};

export function createSofa(materials: FurnitureMaterials): SofaParts {
  const { BoxGeometry, Group, Mesh } = globalThis.THREE;
  const sofaGroup = new Group();
  addSofaBase(sofaGroup, materials, BoxGeometry, Mesh);
  const { sofaBedMat, pillowMat } = createSofaBed();
  sofaGroup.add(sofaBedMat);
  return { sofaGroup, sofaBedMat, pillowMat };
}

function addSofaBase(
  sofaGroup: Three.Group,
  materials: FurnitureMaterials,
  BoxGeometry: typeof Three.BoxGeometry,
  Mesh: typeof Three.Mesh,
): void {
  const sSeat = new Mesh(
    new BoxGeometry(1.80, 0.42, 0.95), materials.fabricSofaMat,
  );
  sSeat.position.set(0, 0.21, 0);
  sofaGroup.add(sSeat);
  const sBack = new Mesh(
    new BoxGeometry(1.80, 0.48, 0.18), materials.fabricSofaMat,
  );
  sBack.position.set(0, 0.66, -0.385);
  sofaGroup.add(sBack);
  const armL = new Mesh(
    new BoxGeometry(0.18, 0.55, 0.95), materials.fabricSofaMat,
  );
  armL.position.set(-0.81, 0.275, 0);
  sofaGroup.add(armL);
  const armR = new Mesh(
    new BoxGeometry(0.18, 0.55, 0.95), materials.fabricSofaMat,
  );
  armR.position.set(0.81, 0.275, 0);
  sofaGroup.add(armR);
}

function createSofaBed(): Omit<SofaParts, "sofaGroup"> {
  const { BoxGeometry, Group, Mesh, MeshStandardMaterial } = globalThis.THREE;
  const sofaBedMat = new Group();
  const bedSurface = new Mesh(
    new BoxGeometry(1.80, 0.15, 1.05),
    new MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.9 }),
  );
  bedSurface.position.set(0, 0.075, 0.50 + 1.05 / 2);
  sofaBedMat.add(bedSurface);
  const pillowMat = new MeshStandardMaterial({
    color: 0xe0dcd0, roughness: 0.95,
  });
  const p1 = new Mesh(new BoxGeometry(0.55, 0.08, 0.35), pillowMat);
  p1.position.set(-0.40, 0.23, -0.30);
  sofaBedMat.add(p1);
  const p2 = new Mesh(new BoxGeometry(0.55, 0.08, 0.35), pillowMat);
  p2.position.set(0.40, 0.23, -0.30);
  sofaBedMat.add(p2);
  sofaBedMat.visible = false;
  return { sofaBedMat, pillowMat };
}

import type * as Three from "three";
import type { FurnitureMaterials } from "./furniture-materials";

export type ArchitectureParts = {
  readonly wallFrameGroup: Three.Group;
  readonly archGroup: Three.Group;
  readonly doorMesh: Three.Group;
  readonly windowMesh: Three.Group;
  readonly roofGroup: Three.Group;
};

export function createArchitecture(
  materials: FurnitureMaterials,
): ArchitectureParts {
  const { Group } = globalThis.THREE;
  const wallFrameGroup = new Group();
  const archGroup = new Group();
  const doorMesh = createDoor(materials, archGroup);
  const windowMesh = createWindow(materials, archGroup);
  const roofGroup = new Group();
  return { wallFrameGroup, archGroup, doorMesh, windowMesh, roofGroup };
}

function createDoor(
  materials: FurnitureMaterials,
  archGroup: Three.Group,
): Three.Group {
  const { BoxGeometry, Group, Mesh, SphereGeometry } = globalThis.THREE;
  const doorMesh = new Group();
  const doorFrame = new Mesh(
    new BoxGeometry(0.05, 2.1, 0.9), materials.woodMat,
  );
  doorFrame.position.set(0, 1.05, 0);
  const doorHandle = new Mesh(
    new SphereGeometry(0.03, 16, 16), materials.metalMat,
  );
  doorHandle.position.set(-0.03, 1.0, 0.35);
  doorMesh.add(doorFrame, doorHandle);
  archGroup.add(doorMesh);
  return doorMesh;
}

function createWindow(
  materials: FurnitureMaterials,
  archGroup: Three.Group,
): Three.Group {
  const { BoxGeometry, Group, Mesh } = globalThis.THREE;
  const windowMesh = new Group();
  const wFrameTop = new Mesh(
    new BoxGeometry(1.5, 0.05, 0.05), materials.frameMat,
  );
  wFrameTop.position.set(0, 0.45, 0);
  const wFrameBot = new Mesh(
    new BoxGeometry(1.5, 0.05, 0.05), materials.frameMat,
  );
  wFrameBot.position.set(0, -0.45, 0);
  const wFrameL = new Mesh(
    new BoxGeometry(0.05, 0.9, 0.05), materials.frameMat,
  );
  wFrameL.position.set(-0.725, 0, 0);
  const wFrameR = new Mesh(
    new BoxGeometry(0.05, 0.9, 0.05), materials.frameMat,
  );
  wFrameR.position.set(0.725, 0, 0);
  const wGlass = new Mesh(
    new BoxGeometry(1.45, 0.85, 0.02), materials.glassMat,
  );
  windowMesh.add(wFrameTop, wFrameBot, wFrameL, wFrameR, wGlass);
  archGroup.add(windowMesh);
  return windowMesh;
}

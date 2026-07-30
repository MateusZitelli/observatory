import type * as Three from "three";
import type { MountMaterials } from "./mount-materials";

export type MountAxisParts = {
  readonly rig: Three.Group;
  readonly tilt: Three.Group;
  readonly baseBlock: Three.Mesh;
  readonly baseDial: Three.Mesh;
  readonly baseRod: Three.Mesh;
  readonly raHousing: Three.Mesh;
  readonly controlPanel: Three.Mesh;
  readonly raNode: Three.Group;
  readonly decHousingGroup: Three.Group;
  readonly decNode: Three.Group;
};

export function createMountAxis(materials: MountMaterials): MountAxisParts {
  const base = createBaseParts(materials);
  const nodes = createAxisNodes(base.tilt);
  return { ...base, ...nodes };
}

type BaseParts = Pick<MountAxisParts, "rig" | "tilt" | "baseBlock" | "baseDial" | "baseRod" | "raHousing" | "controlPanel">;

function createBaseParts(materials: MountMaterials): BaseParts {
  const { BoxGeometry, CylinderGeometry, Group, Mesh } = globalThis.THREE;
  const rig = new Group();
  rig.rotation.x = -Math.PI / 2;
  const tilt = new Group();
  rig.add(tilt);
  const baseBlock = new Mesh(new BoxGeometry(0.18, 0.22, 0.18), materials.black);
  tilt.add(baseBlock);
  const baseDial = new Mesh(new CylinderGeometry(0.06, 0.06, 0.19, 32), materials.orange);
  baseDial.rotation.z = Math.PI / 2;
  tilt.add(baseDial);
  const baseRod = new Mesh(new CylinderGeometry(0.08, 0.09, 1, 32), materials.black);
  tilt.add(baseRod);
  const raHousing = new Mesh(new CylinderGeometry(0.1, 0.11, 1, 32), materials.black);
  raHousing.rotation.x = Math.PI / 2;
  tilt.add(raHousing);
  const controlPanel = new Mesh(new BoxGeometry(0.14, 0.16, 0.04), materials.darkGrey);
  controlPanel.rotation.y = Math.PI / 6;
  tilt.add(controlPanel);
  return { rig, tilt, baseBlock, baseDial, baseRod, raHousing, controlPanel };
}

function createAxisNodes(tilt: Three.Group): Pick<MountAxisParts, "raNode" | "decHousingGroup" | "decNode"> {
  const { Group } = globalThis.THREE;
  const raNode = new Group();
  tilt.add(raNode);
  const decHousingGroup = new Group();
  raNode.add(decHousingGroup);
  const decNode = new Group();
  return { raNode, decHousingGroup, decNode };
}

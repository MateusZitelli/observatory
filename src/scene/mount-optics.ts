import type * as Three from "three";
import type { MountAxisParts } from "./mount-axis";
import type { MountMaterials } from "./mount-materials";

export type MountOpticsParts = {
  readonly decHousing: Three.Mesh;
  readonly decRing: Three.Mesh;
  readonly saddle: Three.Group;
  readonly dovetailBar: Three.Mesh;
  readonly mainTube: Three.Mesh;
  readonly rearCell: Three.Mesh;
  readonly visualBack: Three.Mesh;
  readonly dewShield: Three.Mesh;
  readonly cwShaft: Three.Mesh;
  readonly cwWeightsGroup: Three.Group;
};

export function createMountOptics(
  axis: MountAxisParts,
  materials: MountMaterials,
): MountOpticsParts {
  const housing = createDecHousing(axis, materials);
  const tube = createTubeAssembly(axis.decNode, materials);
  const counterweights = createCounterweights(axis.decNode, materials);
  return { ...housing, ...tube, ...counterweights };
}

type HousingParts = Pick<MountOpticsParts, "decHousing" | "decRing">;

function createDecHousing(axis: MountAxisParts, materials: MountMaterials): HousingParts {
  const { CylinderGeometry, Mesh } = globalThis.THREE;
  const decHousing = new Mesh(new CylinderGeometry(1, 1, 1, 32), materials.black);
  decHousing.rotation.z = Math.PI / 2;
  axis.decHousingGroup.add(decHousing);
  const decRing = new Mesh(new CylinderGeometry(1, 1, 1, 32), materials.orange);
  decRing.rotation.z = Math.PI / 2;
  axis.decHousingGroup.add(decRing);
  axis.decHousingGroup.add(axis.decNode);
  return { decHousing, decRing };
}

type TubeParts = Pick<MountOpticsParts, "saddle" | "dovetailBar" | "mainTube" | "rearCell" | "visualBack" | "dewShield">;

function createTubeAssembly(decNode: Three.Group, materials: MountMaterials): TubeParts {
  const { BoxGeometry, CylinderGeometry, Group, Mesh } = globalThis.THREE;
  const saddle = new Group();
  saddle.add(new Mesh(new BoxGeometry(1, 1, 0.12), materials.black));
  decNode.add(saddle);
  const dovetailBar = new Mesh(new BoxGeometry(1, 1, 0.06), materials.orange);
  decNode.add(dovetailBar);
  const mainTube = new Mesh(new CylinderGeometry(1, 1, 1, 32), materials.black);
  decNode.add(mainTube);
  const rearCell = new Mesh(new CylinderGeometry(1, 0.8, 1, 32), materials.black);
  decNode.add(rearCell);
  const visualBack = new Mesh(new CylinderGeometry(1, 1, 1, 16), materials.silver);
  decNode.add(visualBack);
  const dewShield = new Mesh(new CylinderGeometry(1, 1, 1, 32), materials.darkGrey);
  decNode.add(dewShield);
  return { saddle, dovetailBar, mainTube, rearCell, visualBack, dewShield };
}

function createCounterweights(decNode: Three.Group, materials: MountMaterials): Pick<MountOpticsParts, "cwShaft" | "cwWeightsGroup"> {
  const { CylinderGeometry, Group, Mesh } = globalThis.THREE;
  const cwShaft = new Mesh(new CylinderGeometry(0.015, 0.015, 1, 16), materials.silver);
  cwShaft.rotation.z = Math.PI / 2;
  decNode.add(cwShaft);
  const cwWeightsGroup = new Group();
  decNode.add(cwWeightsGroup);
  addWeight(cwWeightsGroup, materials.black);
  const secondWeight = addWeight(cwWeightsGroup, materials.black);
  secondWeight.position.set(-0.065, 0, 0);
  return { cwShaft, cwWeightsGroup };
}

function addWeight(group: Three.Group, material: Three.MeshStandardMaterial): Three.Mesh {
  const { CylinderGeometry, Mesh } = globalThis.THREE;
  const weight = new Mesh(new CylinderGeometry(0.08, 0.08, 0.06, 32), material);
  weight.rotation.z = Math.PI / 2;
  group.add(weight);
  return weight;
}

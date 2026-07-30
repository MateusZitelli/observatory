import { createMountAxis } from "./mount-axis";
import { createMountMaterials } from "./mount-materials";
import { createMountOptics } from "./mount-optics";
import { createObserver } from "./create-observer";
import { createRoom } from "./create-room";
import { createVolumes } from "./create-volumes";

function createMeshes(): void {
  const room = createRoom();
  globalThis.roomGroup = room;
  globalThis.scene.add(room);

  addTranslatedCylinder("pierMesh", 0xd1d5db, 0.9);
  addTranslatedCylinder("pierExtMesh", 0x1f2937, 0.6, 0.5);
  addTranslatedCylinder("mountBaseMesh", 0x18181b, 0.8, 0.2);

  const volumes = createVolumes();
  globalThis.volumeMesh = volumes.front;
  globalThis.eyeVolumeMesh = volumes.eye;
  globalThis.scene.add(volumes.front, volumes.eye);

  globalThis.observerGroup = createObserver();
  globalThis.scene.add(globalThis.observerGroup);

  const materials = createMountMaterials();
  const axis = createMountAxis(materials);
  const optics = createMountOptics(axis, materials);
  assignMountParts(axis, optics);
  globalThis.rigGroup = axis.rig;
  globalThis.scene.add(axis.rig);
}

function addTranslatedCylinder(
  name: "pierMesh" | "pierExtMesh" | "mountBaseMesh",
  color: number,
  roughness: number,
  metalness?: number,
): void {
  const { CylinderGeometry, Mesh, MeshStandardMaterial } = globalThis.THREE;
  const geometry = new CylinderGeometry(1, 1, 1, 32);
  const material = new MeshStandardMaterial({ color, roughness, ...(metalness === undefined ? {} : { metalness }) });
  geometry.translate(0, 0.5, 0);
  const mesh = new Mesh(geometry, material);
  globalThis[name] = mesh;
  globalThis.scene.add(mesh);
}

function assignMountParts(
  axis: ReturnType<typeof createMountAxis>,
  optics: ReturnType<typeof createMountOptics>,
): void {
  globalThis.tiltGroup = axis.tilt;
  globalThis.baseBlock = axis.baseBlock;
  globalThis.baseDial = axis.baseDial;
  globalThis.baseRod = axis.baseRod;
  globalThis.raHousing = axis.raHousing;
  globalThis.controlPanel = axis.controlPanel;
  globalThis.raNode = axis.raNode;
  globalThis.decHousingGroup = axis.decHousingGroup;
  globalThis.decNode = axis.decNode;
  globalThis.decHousing = optics.decHousing;
  globalThis.decRing = optics.decRing;
  globalThis.saddle = optics.saddle;
  globalThis.dovetailBar = optics.dovetailBar;
  globalThis.mainTube = optics.mainTube;
  globalThis.rearCell = optics.rearCell;
  globalThis.visualBack = optics.visualBack;
  globalThis.dewShield = optics.dewShield;
  globalThis.cwShaft = optics.cwShaft;
  globalThis.cwWeightsGroup = optics.cwWeightsGroup;
}

export function installSceneGlobal(): void {
  globalThis.createMeshes = createMeshes;
}

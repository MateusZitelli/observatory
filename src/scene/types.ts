import type {
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { AppSnapshot } from "../domain/types";

export type TelescopeParts = {
  root: Group;
  tilt: Group;
  rightAscension: Group;
  declination: Group;
  baseRod: Mesh;
  rightAscensionHousing: Mesh;
  declinationHousing: Mesh;
  declinationRing: Mesh;
  saddle: Mesh;
  dovetail: Mesh;
  tube: Mesh;
  dewShield: Mesh;
  rearCell: Mesh;
  eyepiece: Mesh;
  counterweightShaft: Mesh;
  counterweights: Group;
};

export type PierParts = {
  root: Group;
  concrete: Mesh;
  extension: Mesh;
  mountBase: Mesh;
};

export type VolumeParts = {
  root: Group;
  front: Mesh;
  frontWire: Mesh;
  eye: Mesh;
  eyeWire: Mesh;
};

export type RoomParts = {
  root: Group;
  floor: Mesh;
  walls: readonly [Mesh, Mesh, Mesh, Mesh];
};

export type RoofParts = {
  root: Group;
  moving: Group;
  panels: readonly [Mesh, Mesh];
  ridge: Mesh;
  rails: readonly [Mesh, Mesh];
};

export type FurnitureParts = {
  root: Group;
  desk: Group;
  chair: Group;
  sofa: Group;
  bed: Group;
  mattress: Group;
};

export type ObserverParts = {
  root: Group;
  body: Mesh;
  head: Mesh;
};

export type SceneModel = {
  root: Group;
  pier: PierParts;
  telescope: TelescopeParts;
  volumes: VolumeParts;
  room: RoomParts;
  roof: RoofParts;
  furniture: FurnitureParts;
  observer: ObserverParts;
};

export type ObservatoryScene = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  update: (snapshot: AppSnapshot) => void;
  resize: () => void;
  render: () => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

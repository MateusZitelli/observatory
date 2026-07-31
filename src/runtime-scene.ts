import type * as Three from "three";

type MeshRef = Three.Mesh;
type GroupRef = Three.Group;
type LegacyControls = {
  enableDamping: boolean;
  dampingFactor: number;
  target: Three.Vector3;
  update(): void;
};
declare module "three" {
  export const OrbitControls: new (
    camera: Three.PerspectiveCamera,
    domElement: HTMLElement,
  ) => LegacyControls;
}
export type ThreeRuntime = typeof Three;

declare global {
  var scene: Three.Scene;
  var camera: Three.PerspectiveCamera;
  var renderer: Three.WebGLRenderer;
  var controls: LegacyControls;
  var volumeMesh: MeshRef;
  var eyeVolumeMesh: MeshRef;
  var pierMesh: MeshRef;
  var pierExtMesh: MeshRef;
  var mountBaseMesh: MeshRef;
  var observerGroup: GroupRef;
  var roomGroup: GroupRef | undefined;
  var furnitureGroup: GroupRef;
  var deskGroup: GroupRef;
  var chairGroup: GroupRef;
  var sofaGroup: GroupRef;
  var sofaBedMat: GroupRef;
  var mattressGroup: GroupRef;
  var archGroup: GroupRef;
  var doorMesh: GroupRef;
  var windowMesh: GroupRef;
  var wallFrameGroup: GroupRef;
  var roofGroup: GroupRef;
  var rigGroup: GroupRef;
  var tiltGroup: GroupRef;
  var raNode: GroupRef;
  var decHousingGroup: GroupRef;
  var decNode: GroupRef;
  var baseBlock: MeshRef;
  var baseDial: MeshRef;
  var baseRod: MeshRef;
  var raHousing: MeshRef;
  var controlPanel: MeshRef;
  var decHousing: MeshRef;
  var decRing: MeshRef;
  var saddle: GroupRef;
  var cwShaft: MeshRef;
  var cwWeightsGroup: GroupRef;
  var mainTube: MeshRef;
  var dewShield: MeshRef;
  var rearCell: MeshRef;
  var visualBack: MeshRef;
  var dovetailBar: MeshRef;

  var switchTab: (tabStr: string) => void;
  var init: () => void;
  var createMeshes: () => void;
  var createFurniture: () => void;
  var resize2D: () => void;
  var onWindowResize: () => void;
  var updateAll: () => void;
  var animate: () => void;
  var draw2D: () => void;
  var drawSky: () => void;
  var drawProject: () => void;
}

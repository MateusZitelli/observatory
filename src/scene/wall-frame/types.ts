import type * as Three from "three";

export type WallFrameMaterials = {
  readonly wall: Three.MeshStandardMaterial;
  readonly edge: Three.LineBasicMaterial;
  readonly floor: Three.MeshStandardMaterial;
  readonly frontal: Three.MeshStandardMaterial;
  readonly eps: Three.MeshStandardMaterial;
};

export type BoxSpec = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly material?: Three.MeshStandardMaterial;
};

export type AddBox = (box: BoxSpec) => void;

export type WallFrameGeometry = {
  readonly rW: number;
  readonly rD: number;
  readonly rH: number;
  readonly pierClearance: number;
  readonly hWT: number;
  readonly materials: WallFrameMaterials;
  readonly addBox: AddBox;
};

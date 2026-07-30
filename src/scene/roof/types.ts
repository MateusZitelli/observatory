import type * as Three from "three";

export type RoofMaterials = {
  readonly roofMatA: Three.MeshStandardMaterial;
  readonly roofMatB: Three.MeshStandardMaterial;
  readonly roofEdgeMat: Three.LineBasicMaterial;
};

export type RoofWoodMaterials = {
  readonly woodMat: Three.MeshStandardMaterial;
  readonly woodEdge: Three.LineBasicMaterial;
};

export type RoofFrameInput = {
  readonly rD: number;
  readonly rHB: number;
  readonly halfSpan: number;
  readonly ridgeRise: number;
  readonly totalRidge: number;
};

export type RoofTileInput = {
  readonly tileH: number;
  readonly tileL: number;
  readonly tileW: number;
  readonly overlap: number;
  readonly rH: number;
  readonly rHB: number;
  readonly ridgeRise: number;
  readonly nRidge: number;
  readonly nSlope: number;
  readonly totalRidge: number;
  readonly PITCH: number;
  readonly halfSpan: number;
  readonly ridgeX: boolean;
};

export type RoofRailInput = {
  readonly rW: number;
  readonly rD: number;
  readonly rH: number;
  readonly totalRidge: number;
  readonly slideDir: string;
};

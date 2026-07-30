import { clearWallFrame, createAddBox } from "./geometry";
import { buildCladding } from "./cladding";
import { buildFloor } from "./floor";
import { createWallFrameMaterials } from "./materials";
import { buildWalls } from "./walls";
import type { WallFrameGeometry } from "./types";

export type BuildWallFrame = (rW: number, rD: number, rH: number) => void;

export function createWallFrameBuilder(): BuildWallFrame {
  let prevWFKey = "";
  const materials = createWallFrameMaterials();
  return (rW: number, rD: number, rH: number): void => {
    const key = rW + "," + rD + "," + rH + "," + globalThis.state.pierD;
    if (key === prevWFKey) return;
    prevWFKey = key;
    const group = globalThis.wallFrameGroup;
    clearWallFrame(group);
    const S = 0.045;
    const FRONTAL = 0.02;
    const EPS = 0.045;
    const WALL_T = FRONTAL + S + EPS + S + FRONTAL;
    const hWT = WALL_T / 2;
    const pierD2 = globalThis.state.pierD;
    const pierClearance = pierD2 / 2 + 0.05;
    const geometry: WallFrameGeometry = {
      rW, rD, rH, pierClearance, hWT, materials,
      addBox: createAddBox(group, materials),
    };
    buildFloor(geometry);
    buildWalls(geometry);
    buildCladding(geometry);
  };
}

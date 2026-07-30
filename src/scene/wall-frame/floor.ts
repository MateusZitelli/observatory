import type { WallFrameGeometry } from "./types";

export function buildFloor({ rW, rD, pierClearance, addBox, materials }: WallFrameGeometry): void {
  const FLOOR_ELEV = 0.20;
  const FLOOR_T = 0.02;
  const VIGA_W = 0.06;
  const VIGA_H = 0.18;
  const BARR_W = 0.05;
  const BARR_H = 0.15;
  const BARR_SP = 0.40;
  const floorMat = materials.floor;
  const frontalMat = materials.frontal;

  for (const vz of [-rD / 2 + VIGA_W / 2, 0, rD / 2 - VIGA_W / 2]) {
    addBox({
      x: 0, y: FLOOR_ELEV - VIGA_H / 2 - FLOOR_T, z: vz,
      width: rW, height: VIGA_H, depth: VIGA_W, material: floorMat,
    });
  }
  const nBarr = Math.ceil(rW / BARR_SP) + 1;
  const barrSP = rW / (nBarr - 1);
  for (let bi = 0; bi < nBarr; bi++) {
    const bx = -rW / 2 + bi * barrSP;
    if (Math.abs(bx) < pierClearance) continue;
    addBox({
      x: bx, y: FLOOR_ELEV - BARR_H / 2 - FLOOR_T, z: 0,
      width: BARR_W, height: BARR_H, depth: rD, material: floorMat,
    });
  }
  buildFloorSurface({ rW, rD, pierClearance, addBox, floorMat: frontalMat });
  buildTrimmers({ rD, pierClearance, addBox });
}

type FloorSurface = Pick<WallFrameGeometry, "rW" | "rD" | "pierClearance" | "addBox"> & {
  readonly floorMat: WallFrameGeometry["materials"]["frontal"];
};

function buildFloorSurface({ rW, rD, pierClearance, addBox, floorMat }: FloorSurface): void {
  const FLOOR_ELEV = 0.20;
  const FLOOR_T = 0.02;
  const holeR = pierClearance + 0.02;
  const floorY = FLOOR_ELEV - FLOOR_T / 2;
  const wW = rW / 2 - holeR;
  if (wW > 0.01) {
    addBox({ x: -rW / 2 + wW / 2, y: floorY, z: 0, width: wW, height: FLOOR_T, depth: rD, material: floorMat });
    addBox({ x: rW / 2 - wW / 2, y: floorY, z: 0, width: wW, height: FLOOR_T, depth: rD, material: floorMat });
  }
  const cH2 = rD / 2 - holeR;
  if (cH2 > 0.01) {
    addBox({ x: 0, y: floorY, z: -rD / 2 + cH2 / 2, width: holeR * 2, height: FLOOR_T, depth: cH2, material: floorMat });
    addBox({ x: 0, y: floorY, z: rD / 2 - cH2 / 2, width: holeR * 2, height: FLOOR_T, depth: cH2, material: floorMat });
  }
}

function buildTrimmers({ rD, pierClearance, addBox }: Pick<WallFrameGeometry, "rD" | "pierClearance" | "addBox">): void {
  const FLOOR_ELEV = 0.20;
  const FLOOR_T = 0.02;
  const BARR_W = 0.05;
  const BARR_H = 0.15;
  const holeR = pierClearance + 0.02;
  const barY = FLOOR_ELEV - BARR_H / 2 - FLOOR_T;
  for (const sz of [-1, 1]) {
    addBox({ x: 0, y: barY, z: sz * holeR, width: holeR * 2 + BARR_W * 2, height: BARR_H, depth: BARR_W });
  }
  for (const sx of [-1, 1]) {
    const segLen = rD / 2 - holeR;
    if (segLen > 0.1) {
      addBox({ x: sx * holeR, y: barY, z: -rD / 2 + segLen / 2, width: BARR_W, height: BARR_H, depth: segLen });
      addBox({ x: sx * holeR, y: barY, z: rD / 2 - segLen / 2, width: BARR_W, height: BARR_H, depth: segLen });
    }
  }
}

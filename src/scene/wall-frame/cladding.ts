import type { WallFrameGeometry } from "./types";

type PlateLayer = {
  readonly offset: number;
  readonly thickness: number;
  readonly material: WallFrameGeometry["materials"]["frontal"];
};

export function buildCladding(geometry: WallFrameGeometry): void {
  const { rW, rD, rH, hWT, addBox, materials } = geometry;
  const FLOOR_ELEV = 0.20;
  const FRONTAL = 0.02;
  const EPS = 0.045;
  const wH = rH - FLOOR_ELEV;
  const wMY = FLOOR_ELEV + wH / 2;
  const layers = (offsets: readonly number[]): PlateLayer[] => offsets.map((offset) => ({
    offset,
    thickness: Math.abs(offset) > 0.01 ? FRONTAL : EPS,
    material: Math.abs(offset) > 0.01 ? materials.frontal : materials.eps,
  }));
  buildNorth({ rW, rD, wH, wMY, hWT, addBox, layers: layers([-hWT, 0, hWT]) });
  buildWest({ rW, rD, wH, wMY, hWT, addBox, layers: layers([-hWT, 0, hWT]) });
  buildSouth({ rW, rD, rH, wH, wMY, addBox, layers: layers([hWT, 0, -hWT]) });
  buildEast({ rW, rD, rH, wH, wMY, hWT, addBox, layers: layers([hWT, 0, -hWT]) });
  addBox({ x: rW / 2 + hWT, y: FLOOR_ELEV / 2, z: -rD / 2 + hWT + 0.6, width: 0.30, height: FLOOR_ELEV, depth: 0.90, material: materials.floor });
}

type PlateInput = {
  readonly rW: number;
  readonly rD: number;
  readonly wH: number;
  readonly wMY: number;
  readonly hWT: number;
  readonly addBox: WallFrameGeometry["addBox"];
  readonly layers: readonly PlateLayer[];
};

function buildNorth({ rW, rD, wH, wMY, addBox, layers }: PlateInput): void {
  for (const layer of layers) addBox({ x: 0, y: wMY, z: -rD / 2 - layer.offset, width: rW, height: wH, depth: layer.thickness, material: layer.material });
}

function buildWest({ rW, rD, wH, wMY, addBox, layers }: PlateInput): void {
  for (const layer of layers) addBox({ x: -rW / 2 - layer.offset, y: wMY, z: 0, width: layer.thickness, height: wH, depth: rD, material: layer.material });
}

type SouthInput = Omit<PlateInput, "hWT"> & { readonly rH: number };

function buildSouth({ rW, rD, rH, wH, wMY, addBox, layers }: SouthInput): void {
  const wL = -0.75;
  const wR = 0.75;
  const wB = 1.1;
  const wT = 2.0;
  for (const layer of layers) {
    const z = rD / 2 + layer.offset;
    const lLen = wL + rW / 2;
    if (lLen > 0.01) addBox({ x: -rW / 2 + lLen / 2, y: wMY, z, width: lLen, height: wH, depth: layer.thickness, material: layer.material });
    const rLen = rW / 2 - wR;
    if (rLen > 0.01) addBox({ x: rW / 2 - rLen / 2, y: wMY, z, width: rLen, height: wH, depth: layer.thickness, material: layer.material });
    const aH = rH - wT;
    if (aH > 0.01) addBox({ x: 0, y: wT + aH / 2, z, width: wR - wL, height: aH, depth: layer.thickness, material: layer.material });
    const bH = wB - 0.20;
    if (bH > 0.01) addBox({ x: 0, y: 0.20 + bH / 2, z, width: wR - wL, height: bH, depth: layer.thickness, material: layer.material });
  }
}

type EastInput = PlateInput & { readonly rH: number };

function buildEast({ rW, rD, rH, wH, wMY, hWT, addBox, layers }: EastInput): void {
  const doorCenterZ = -rD / 2 + hWT + 0.6;
  const dN = doorCenterZ - 0.45;
  const dS = doorCenterZ + 0.45;
  const dT = 0.20 + 2.1;
  for (const layer of layers) {
    const x = rW / 2 + layer.offset;
    const nLen = dN + rD / 2;
    if (nLen > 0.01) addBox({ x, y: wMY, z: -rD / 2 + nLen / 2, width: layer.thickness, height: wH, depth: nLen, material: layer.material });
    const sLen = rD / 2 - dS;
    if (sLen > 0.01) addBox({ x, y: wMY, z: rD / 2 - sLen / 2, width: layer.thickness, height: wH, depth: sLen, material: layer.material });
    const aH = rH - dT;
    if (aH > 0.01) addBox({ x, y: dT + aH / 2, z: (dN + dS) / 2, width: layer.thickness, height: aH, depth: dS - dN, material: layer.material });
  }
}

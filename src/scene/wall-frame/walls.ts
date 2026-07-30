import type { AddBox, WallFrameGeometry } from "./types";
type WallOpening = { readonly hasOpening: boolean; readonly start: number; readonly end: number; readonly bottom: number; readonly top: number };
type WallSpec = WallOpening & { readonly startX: number; readonly startZ: number; readonly length: number; readonly dirX: number; readonly dirZ: number };
type BuildWallInput = WallSpec & { readonly addBox: AddBox; readonly rH: number; readonly S: number };
type OpeningStudInput = { readonly mx: number; readonly mz: number; readonly bw: number; readonly bd: number; readonly bottom: number; readonly top: number; readonly rH: number; readonly S: number; readonly addBox: AddBox };
type JambInput = Pick<BuildWallInput, "startX" | "startZ" | "dirX" | "dirZ" | "start" | "end" | "bottom" | "top" | "addBox" | "S">;
export function buildWalls(geometry: WallFrameGeometry): void {
  const { rW, rD, rH, hWT, addBox } = geometry;
  const S = 0.045;
  buildWall({ startX: -rW / 2, startZ: -rD / 2, length: rW, dirX: 1, dirZ: 0, hasOpening: false, start: 0, end: 0, bottom: 0, top: 0, addBox, rH, S });
  const winS = rW / 2 - 0.75;
  const winE = rW / 2 + 0.75;
  buildWall({ startX: -rW / 2, startZ: rD / 2, length: rW, dirX: 1, dirZ: 0, hasOpening: true, start: winS, end: winE, bottom: 1.1, top: 2.0, addBox, rH, S });
  buildWall({ startX: rW / 2, startZ: -rD / 2, length: rD, dirX: 0, dirZ: 1, hasOpening: true, start: hWT + 0.15, end: hWT + 1.05, bottom: 0, top: 2.1, addBox, rH, S });
  buildWall({ startX: -rW / 2, startZ: -rD / 2, length: rD, dirX: 0, dirZ: 1, hasOpening: false, start: 0, end: 0, bottom: 0, top: 0, addBox, rH, S });
}
function buildWall(input: BuildWallInput): void {
  const { startX, startZ, length, dirX, dirZ, hasOpening, start, end, bottom, top, addBox, rH, S } = input;
  const nSt = Math.ceil(length / 0.60) + 1;
  const sp = length / (nSt - 1);
  const studH = rH - S * 3;
  for (let si = 0; si < nSt; si++) {
    const t = si * sp;
    const mx = startX + dirX * t;
    const mz = startZ + dirZ * t;
    const inOpening = hasOpening && t >= start && t <= end;
    const bw = Math.abs(dirZ) * S + Math.abs(dirX) * 0.09;
    const bd = Math.abs(dirX) * S + Math.abs(dirZ) * 0.09;
    if (!inOpening) addBox({ x: mx, y: S + studH / 2, z: mz, width: bw, height: studH, depth: bd });
    if (inOpening) addOpeningStud({ mx, mz, bw, bd, bottom, top, rH, S, addBox });
  }
  addWallPlates(input);
  addWallOpening(input);
}
function addOpeningStud({ mx, mz, bw, bd, bottom, top, rH, S, addBox }: OpeningStudInput): void {
  if (bottom > S) addBox({ x: mx, y: S + (bottom - S) / 2, z: mz, width: bw, height: bottom - S, depth: bd });
  if (top < rH - S * 2) {
    const height = rH - S * 2 - top;
    addBox({ x: mx, y: top + height / 2, z: mz, width: bw, height, depth: bd });
  }
}
function addWallPlates(input: BuildWallInput): void {
  const { startX, startZ, length, dirX, dirZ, hasOpening, rH, S, addBox } = input;
  const width = Math.abs(dirX) * length + Math.abs(dirZ) * 0.09;
  const depth = Math.abs(dirZ) * length + Math.abs(dirX) * 0.09;
  const x = startX + dirX * length / 2;
  const z = startZ + dirZ * length / 2;
  addBox({ x, y: S / 2, z, width, height: S, depth });
  for (let i = 0; i < 2; i++) addBox({ x, y: rH - S / 2 - i * S, z, width, height: S, depth });
  if (!hasOpening) addBox({ x, y: rH / 2, z, width, height: S, depth });
}
function addWallOpening(input: BuildWallInput): void {
  const { startX, startZ, dirX, dirZ, hasOpening, start, end, bottom, top, addBox, S } = input;
  if (!hasOpening) return;
  const vLength = end - start + 0.20;
  const vMid = (start + end) / 2;
  const vWidth = Math.abs(dirX) * vLength + Math.abs(dirZ) * 0.14;
  const vDepth = Math.abs(dirZ) * vLength + Math.abs(dirX) * 0.14;
  const x = startX + dirX * vMid;
  const z = startZ + dirZ * vMid;
  addBox({ x, y: top + S / 2, z, width: vWidth, height: S, depth: vDepth });
  if (bottom > S * 2) addBox({ x, y: bottom - S / 2, z, width: vWidth, height: S, depth: vDepth });
  addJambs({ startX, startZ, dirX, dirZ, start, end, bottom, top, addBox, S });
}
function addJambs(input: JambInput): void {
  const { startX, startZ, dirX, dirZ, start, end, bottom, top, addBox, S } = input;
  for (const edge of [start, end]) {
    const jx = startX + dirX * edge;
    const jz = startZ + dirZ * edge;
    const jBot = bottom > S * 2 ? bottom : S;
    const jH = top - jBot;
    if (jH > 0.05) addBox({ x: jx + dirZ * S * 0.6, y: jBot + jH / 2, z: jz + dirX * S * 0.6, width: Math.abs(dirZ) * S + Math.abs(dirX) * 0.09, height: jH, depth: Math.abs(dirX) * S + Math.abs(dirZ) * 0.09 });
  }
}

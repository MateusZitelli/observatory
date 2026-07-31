import type { HitType, TraceRay } from "./sky-types";
import { collectRoofHits } from "./sky-trace-roof";

type RayHit = { readonly t: number; readonly type: HitType | "window" };
type Direction = { readonly dx: number; readonly dy: number; readonly dz: number };
type WallPlane = { readonly axis: "x" | "z"; readonly val: number; readonly dir: number };
type RoofPosition = { readonly roofPosX: number; readonly roofPosZ: number; readonly roofRotY: number };
type TraceSetup = {
  readonly rW: number; readonly rD: number; readonly rH: number; readonly pivotZ: number;
  readonly winSill: number; readonly winTop: number; readonly winHalfW: number;
  readonly hSpan: number; readonly ridgeH: number; readonly pitchTan: number;
  readonly cosR: number; readonly sinR: number; readonly ridgeHalf: number;
  readonly roofPosX: number; readonly roofPosZ: number;
};
function calculateRoofPosition(direction: string, roofOpen: number, slideMx: number): RoofPosition {
  let roofPosX = 0;
  let roofPosZ = 0;
  let roofRotY = 0;
  if (direction === "N") { roofRotY = Math.PI; roofPosZ = -roofOpen * slideMx; }
  else if (direction === "S") { roofPosZ = roofOpen * slideMx; }
  else if (direction === "L") { roofRotY = -Math.PI / 2; roofPosX = roofOpen * slideMx; }
  else if (direction === "O") { roofRotY = Math.PI / 2; roofPosX = -roofOpen * slideMx; }
  return { roofPosX, roofPosZ, roofRotY };
}
function createTraceSetup(): TraceSetup {
  const rD = globalThis.state.rD;
  const rH = globalThis.state.rH;
  const rW = globalThis.state.rW;
  const roofOpen = globalThis.state.roofOpen / 100;
  const pitchTan = Math.tan((globalThis.state.roofPitch * Math.PI) / 180);
  const hSpan = rW / 2 + 0.15;
  const ridgeH = rH + hSpan * pitchTan;
  const slideMx = globalThis.derived.roofTotalZ + Math.max(rW, rD);
  const direction = globalThis.state.roofDir;
  const roof = calculateRoofPosition(direction, roofOpen, slideMx);
  return {
    rW, rD, rH, pivotZ: -globalThis.state.X_PIVOT,
    winSill: 1.125, winTop: 2.075, winHalfW: 0.725,
    hSpan, ridgeH, pitchTan, cosR: Math.cos(-roof.roofRotY), sinR: Math.sin(-roof.roofRotY),
    ridgeHalf: globalThis.derived.roofTotalZ / 2, roofPosX: roof.roofPosX, roofPosZ: roof.roofPosZ,
  };
}
function wallDistance(plane: WallPlane, setup: TraceSetup): number | null {
  const pointsAway = (plane.val > 0 && plane.dir <= 0) || (plane.val < 0 && plane.dir >= 0);
  if (pointsAway) return null;
  const origin = plane.axis === "x" ? 0 : setup.pivotZ;
  const t = (plane.val - origin) / plane.dir;
  return t > 0 ? t : null;
}
function wallIsInside(input: { readonly direction: Direction; readonly plane: WallPlane; readonly t: number; readonly originY: number; readonly setup: TraceSetup }): boolean {
  const { direction, plane, t, originY, setup } = input;
  const hy = originY + t * direction.dy;
  const otherAxis = plane.axis === "x" ? setup.pivotZ + t * direction.dz : t * direction.dx;
  const otherLimit = plane.axis === "x" ? setup.rD / 2 : setup.rW / 2;
  return hy >= 0 && hy <= setup.rH && Math.abs(otherAxis) <= otherLimit;
}
function wallHit(direction: Direction, plane: WallPlane, originY: number, setup: TraceSetup): RayHit | null {
  const t = wallDistance(plane, setup);
  if (t === null || !wallIsInside({ direction, plane, t, originY, setup })) return null;
  const hy = originY + t * direction.dy;
  const isWindow = plane.axis === "z" && plane.val === setup.rD / 2 && Math.abs(t * direction.dx) <= setup.winHalfW && hy >= setup.winSill && hy <= setup.winTop;
  return { t, type: isWindow ? "window" : "wall" };
}
function collectWallHits(direction: Direction, originY: number, setup: TraceSetup, hits: RayHit[]): void {
  const planes: WallPlane[] = [
    { axis: "x", val: setup.rW / 2, dir: direction.dx }, { axis: "x", val: -setup.rW / 2, dir: direction.dx },
    { axis: "z", val: setup.rD / 2, dir: direction.dz }, { axis: "z", val: -setup.rD / 2, dir: direction.dz },
  ];
  for (const plane of planes) {
    const hit = wallHit(direction, plane, originY, setup);
    if (hit) hits.push(hit);
  }
}
function traceSingleRay(azRad: number, elevRad: number, originY: number, setup: TraceSetup): HitType | null {
  const ce = Math.cos(elevRad), se = Math.sin(elevRad);
  const direction = { dx: Math.sin(azRad) * ce, dy: se, dz: -Math.cos(azRad) * ce };
  if (direction.dy <= 0) return "wall";
  const hits: RayHit[] = [];
  collectWallHits(direction, originY, setup, hits);
  const wx = -setup.roofPosX, wz = setup.pivotZ - setup.roofPosZ;
  collectRoofHits({
    lox: wx * setup.cosR - wz * setup.sinR, loz: wx * setup.sinR + wz * setup.cosR, loy: originY,
    ldx: direction.dx * setup.cosR - direction.dz * setup.sinR,
    ldz: direction.dx * setup.sinR + direction.dz * setup.cosR, ldy: direction.dy,
    hSpan: setup.hSpan, ridgeH: setup.ridgeH, ridgeHalf: setup.ridgeHalf, pitchTan: setup.pitchTan,
  }, hits);
  if (hits.length === 0) return null;
  hits.sort((a, b) => a.t - b.t);
  const firstHit = hits[0];
  if (!firstHit || firstHit.type === "window") return null;
  return firstHit.type;
}
export function createSkyTracer(): TraceRay {
  const setup = createTraceSetup();
  return (azRad, elevRad, originY) => traceSingleRay(azRad, elevRad, originY, setup);
}

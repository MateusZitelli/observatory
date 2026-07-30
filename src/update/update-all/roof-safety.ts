import { optionalGlobal, type UpdateContext } from "./context";

type RoofBounds = { readonly rH: number; readonly zMin: number; readonly zMax: number; readonly halfSpan: number; readonly ridgeH: number; readonly pitch: number };
function output(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element === null) throw new Error(`Missing output: ${id}`);
  return element;
}
function hasRoofCollision(mesh: typeof globalThis.volumeMesh, bounds: RoofBounds): boolean {
  const { rH, zMin, zMax, halfSpan, ridgeH, pitch } = bounds;
  const attr = mesh.geometry.getAttribute("position");
  for (let vi = 0; vi < attr.count; vi += 3) {
    const py = attr.getY(vi);
    if (py <= rH) continue;
    const pz = attr.getZ(vi);
    if (pz < zMin || pz > zMax) continue;
    const dR = Math.abs(attr.getX(vi));
    if (dR > halfSpan) continue;
    if (py > ridgeH - dR * pitch) return true;
  }
  return false;
}
function minimumSafe(bounds: Omit<RoofBounds, "zMin" | "zMax">, slideMax: number): number {
  for (let test = 0; test <= 100; test++) {
    const sOff = -(test / 100) * slideMax;
    const zMin = sOff - globalThis.derived.roofTotalZ / 2;
    const zMax = sOff + globalThis.derived.roofTotalZ / 2;
    const current = { ...bounds, zMin, zMax };
    if (hasRoofCollision(globalThis.volumeMesh, current)) continue;
    if (hasRoofCollision(globalThis.eyeVolumeMesh, current)) continue;
    return test;
  }
  return 0;
}
export function updateRoofSafety(context: UpdateContext): void {
  const { rW, rD, rH } = context;
  const roofGroup = optionalGlobal("roofGroup", globalThis.roofGroup);
  if (!roofGroup || globalThis.currentTab !== "ROOM") return;
  const BEIRAL_M = 0.15;
  const PITCH_TAN_M = Math.tan((globalThis.state.roofPitch * Math.PI) / 180);
  const halfSpanM = rW / 2 + BEIRAL_M;
  const ridgeRiseM = halfSpanM * PITCH_TAN_M;
  const ridgeHM = rH + ridgeRiseM;
  const slideMx = globalThis.derived.roofTotalZ + rD;
  const minSafe = minimumSafe({ rH, halfSpan: halfSpanM, ridgeH: ridgeHM, pitch: PITCH_TAN_M }, slideMx);
  const roofOpen = output("valRoofOpen");
  const curLabel = roofOpen.innerText;
  if (minSafe > 0) roofOpen.innerText = curLabel + " (mín: " + minSafe + "%)";
}

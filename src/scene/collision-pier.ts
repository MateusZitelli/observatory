import type * as Three from "three";

type PierCollisionContext = {
  readonly H_con: number;
  readonly H_ext: number;
  readonly Y_MOUNT: number;
  readonly X_PIVOT: number;
  readonly extR: number;
  readonly pierR: number;
  readonly rW: number;
  readonly rD: number;
  readonly TUBE_R: number;
  readonly Z_FRONT: number;
  readonly Z_BACK: number;
  readonly EYE_LEN: number;
  readonly Y_DEC: number;
  readonly Y_CW: number;
};

type PointChecker = (localPoint: Three.Vector3, radius: number) => boolean;
type PierShape = { readonly centerZ: number; readonly radius: number };

function createContext(): PierCollisionContext {
  const state = globalThis.state;
  const TUBE_LEN = state.TUBE_LEN;
  const TUBE_OFF = state.TUBE_OFF;
  const Z_FRONT = TUBE_LEN / 2 + TUBE_OFF;
  const Z_BACK = TUBE_LEN / 2 - TUBE_OFF;
  return {
    H_con: state.H_con, H_ext: state.H_ext, Y_MOUNT: state.Y_MOUNT,
    X_PIVOT: state.X_PIVOT, extR: 0.15 / 2, pierR: state.pierD / 2,
    rW: state.rW, rD: state.rD, TUBE_R: state.TUBE_D / 2,
    Z_FRONT, Z_BACK, EYE_LEN: state.EYE_LEN, Y_DEC: state.Y_DEC, Y_CW: state.Y_CW,
  };
}

function pierShape(worldY: number, context: PierCollisionContext): PierShape {
  let centerZ = 0;
  let radius = context.pierR;
  if (worldY > context.H_con) {
    centerZ = -context.X_PIVOT;
    radius = worldY > context.H_con + context.H_ext ? 0.085 : context.extR;
  }
  return { centerZ, radius };
}

function collidesPier(worldPt: Three.Vector3, radius: number, context: PierCollisionContext): boolean {
  const shape = pierShape(worldPt.y, context);
  const dx = worldPt.x - 0;
  const dz = worldPt.z - shape.centerZ;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (worldPt.y <= context.H_con + context.H_ext + context.Y_MOUNT + radius && dist < shape.radius + radius) return true;
  return false;
}

function collidesFurniture(worldPt: Three.Vector3, radius: number, context: PierCollisionContext): boolean {
  if (globalThis.currentTab !== "ROOM" || !globalThis.state.showFurniture) return false;
  if (worldPt.y < 0.9 + radius && worldPt.x > context.rW / 2 - 1.9 - radius && worldPt.z > context.rD / 2 - 1.0 - radius) return true;
  if (worldPt.y < 1.1 + radius && worldPt.x < -context.rW / 2 + 1.3 + radius && worldPt.z < -context.rD / 2 + 1.6 + radius) return true;
  return false;
}

function createPointChecker(context: PierCollisionContext): PointChecker {
  return (localPoint, radius) => {
    const worldPt = globalThis.decNode.localToWorld(localPoint.clone());
    if (worldPt.y < 0) return false;
    if (collidesPier(worldPt, radius, context)) return true;
    return collidesFurniture(worldPt, radius, context);
  };
}

function sampleDec(context: PierCollisionContext, checkPoint: PointChecker): boolean {
  for (let t = -context.Z_FRONT; t <= context.Z_BACK + context.EYE_LEN; t += 0.05) {
    let radius = context.TUBE_R;
    if (t > context.Z_BACK) radius = 0.03;
    if (checkPoint(new globalThis.THREE.Vector3(context.Y_DEC, t, 0), radius)) return true;
  }
  return false;
}

function sampleCw(context: PierCollisionContext, checkPoint: PointChecker): boolean {
  for (let t = 0; t <= context.Y_CW; t += 0.05) {
    let radius = 0.015;
    if (t > context.Y_CW - 0.15) radius = 0.08;
    if (checkPoint(new globalThis.THREE.Vector3(-t, 0, 0), radius)) return true;
  }
  return false;
}

export function checkPierCrash(): boolean {
  globalThis.rigGroup.updateMatrixWorld(true);
  const context = createContext();
  const checkPoint = createPointChecker(context);
  if (sampleDec(context, checkPoint)) return true;
  return sampleCw(context, checkPoint);
}

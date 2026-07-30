import type { PlanGeometry } from "./types";

type PlanParameters = {
  H_con: number;
  H_ext: number;
  X_PIVOT: number;
  Y_MOUNT: number;
  Y_BASE: number;
  Z_RA: number;
  Y_DEC: number;
  Y_CW: number;
  TUBE_LEN: number;
  TUBE_OFF: number;
  EYE_LEN: number;
  TUBE_D: number;
  rad: number;
  Z_FRONT: number;
  Z_BACK: number;
};

function readPlanParameters(): PlanParameters {
  const H_con = globalThis.state.H_con;
  const H_ext = globalThis.state.H_ext;
  const X_PIVOT = globalThis.state.X_PIVOT;
  const Y_MOUNT = globalThis.state.Y_MOUNT;
  const lat = Math.abs(globalThis.state.lat);
  const rad = (lat * Math.PI) / 180;
  const Y_BASE = globalThis.state.Y_BASE;
  const Z_RA = globalThis.state.Z_RA;
  const Y_DEC = globalThis.state.Y_DEC;
  const Y_CW = globalThis.state.Y_CW;
  const TUBE_LEN = globalThis.state.TUBE_LEN;
  const TUBE_OFF = globalThis.state.TUBE_OFF;
  const EYE_LEN = globalThis.state.EYE_LEN;
  const TUBE_D = globalThis.state.TUBE_D;
  const Z_FRONT = TUBE_LEN / 2 + TUBE_OFF;
  const Z_BACK = TUBE_LEN / 2 - TUBE_OFF;
  return {
    H_con, H_ext, X_PIVOT, Y_MOUNT, Y_BASE, Z_RA, Y_DEC, Y_CW,
    TUBE_LEN, TUBE_OFF, EYE_LEN, TUBE_D, rad, Z_FRONT, Z_BACK,
  };
}

export function calculatePlanGeometry(): PlanGeometry {
  const p = readPlanParameters();
  const pBase = { x: 0, y: p.H_con };
  const pPivotBase = { x: -p.X_PIVOT, y: p.H_con };
  const pExtTop = { x: -p.X_PIVOT, y: p.H_con + p.H_ext };
  const pPivot = { x: -p.X_PIVOT, y: p.H_con + p.H_ext + p.Y_MOUNT };
  const vUp = { x: -Math.sin(p.rad), y: Math.cos(p.rad) };
  const pRaStart = {
    x: pPivot.x + vUp.x * p.Y_BASE,
    y: pPivot.y + vUp.y * p.Y_BASE,
  };
  const vRA = { x: Math.cos(p.rad), y: Math.sin(p.rad) };
  const pCross = {
    x: pRaStart.x + vRA.x * p.Z_RA,
    y: pRaStart.y + vRA.y * p.Z_RA,
  };
  const vDec = { x: -Math.sin(p.rad), y: Math.cos(p.rad) };
  const pTube = {
    x: pCross.x + vDec.x * p.Y_DEC,
    y: pCross.y + vDec.y * p.Y_DEC,
  };
  const pCW = {
    x: pCross.x - vDec.x * p.Y_CW,
    y: pCross.y - vDec.y * p.Y_CW,
  };
  const pFront = {
    x: pTube.x + vRA.x * p.Z_FRONT,
    y: pTube.y + vRA.y * p.Z_FRONT,
  };
  const pBack = {
    x: pTube.x - vRA.x * p.Z_BACK,
    y: pTube.y - vRA.y * p.Z_BACK,
  };
  const pEye = {
    x: pBack.x - vRA.x * p.EYE_LEN,
    y: pBack.y - vRA.y * p.EYE_LEN,
  };
  const pCenter = {
    x: pTube.x + vRA.x * p.TUBE_OFF,
    y: pTube.y + vRA.y * p.TUBE_OFF,
  };
  return {
    ...p, pBase, pPivotBase, pExtTop, pPivot, pRaStart, pCross,
    pTube, pCW, pFront, pBack, pEye, pCenter, vDec, vRA,
  };
}

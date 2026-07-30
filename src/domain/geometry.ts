import type { Geometry, ObservatoryState } from "./types";

const radians = (degrees: number): number => degrees * Math.PI / 180;

export function deriveGeometry(state: ObservatoryState): Geometry {
  const mountPivotHeight = state.concreteHeight
    + state.extensionHeight
    + state.mountHeight;
  const tubeRadius = state.tubeDiameter / 2;
  const tubeFront = state.tubeLength / 2 + state.tubeOffset;
  const tubeBack = state.tubeLength / 2 - state.tubeOffset + state.eyepieceLength;
  const axisReach = state.declinationOffset + Math.max(tubeFront, tubeBack);
  const sweptRadius = Math.hypot(state.rightAscensionOffset, axisReach) + tubeRadius;
  const sweptTop = mountPivotHeight + state.baseOffset + sweptRadius;
  const eyeLowest = Math.max(0, mountPivotHeight - axisReach);
  const eyeHighest = mountPivotHeight + axisReach;
  const halfSpan = roofHalfSpan(state);
  const roofRise = halfSpan * Math.tan(radians(state.roofPitch));
  const ridgeHeight = state.roomHeight + roofRise;
  const wallClearance = Math.min(state.roomWidth, state.roomDepth) / 2 - sweptRadius;
  const minimumElevation = clearanceAngle(state, mountPivotHeight, wallClearance);
  return {
    mountPivotHeight,
    tubeRadius,
    tubeFront,
    tubeBack,
    sweptRadius,
    sweptTop,
    eyeLowest,
    eyeHighest,
    roofRise,
    ridgeHeight,
    minimumElevation,
  };
}

function roofHalfSpan(state: ObservatoryState): number {
  const ridgeRunsEastWest = state.roofDirection === "L" || state.roofDirection === "O";
  return (ridgeRunsEastWest ? state.roomDepth : state.roomWidth) / 2 + 0.15;
}

function clearanceAngle(
  state: ObservatoryState,
  pivotHeight: number,
  wallClearance: number,
): number {
  if (wallClearance <= 0) return 90;
  const rise = Math.max(0, state.roomHeight - pivotHeight);
  return Math.max(0, Math.atan2(rise, wallClearance) * 180 / Math.PI);
}

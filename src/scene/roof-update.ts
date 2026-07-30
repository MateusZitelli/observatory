import type { ObservatoryState, RoofDirection } from "../domain/types";
import type { RoofParts } from "./types";

const overhang = 0.15;

export function updateRoof(parts: RoofParts, state: ObservatoryState): void {
  const northSouth = state.roofDirection === "N"
    || state.roofDirection === "S";
  const span = (northSouth ? state.roomDepth : state.roomWidth) / 2 + overhang;
  const length = (northSouth ? state.roomWidth : state.roomDepth) + overhang * 2;
  const pitch = state.roofPitch * Math.PI / 180;
  const rise = span * Math.tan(pitch);
  const slope = Math.hypot(span, rise);
  if (northSouth) updateNorthSouth(parts, state, slope, length);
  else updateEastWest(parts, state, slope, length);
  parts.ridge.position.y = state.roomHeight + rise;
  updateOpening(parts, state, northSouth);
  updateRails(parts, state, northSouth);
}

function updateNorthSouth(
  parts: RoofParts,
  state: ObservatoryState,
  slope: number,
  length: number,
): void {
  const pitch = state.roofPitch * Math.PI / 180;
  const rise = slope * Math.sin(pitch);
  parts.panels[0].scale.set(length, 0.06, slope);
  parts.panels[1].scale.set(length, 0.06, slope);
  parts.panels[0].position.set(0, state.roomHeight + rise / 2, -slope * Math.cos(pitch) / 2);
  parts.panels[1].position.set(0, state.roomHeight + rise / 2, slope * Math.cos(pitch) / 2);
  parts.panels[0].rotation.x = -pitch;
  parts.panels[1].rotation.x = pitch;
  parts.ridge.scale.set(length, 0.08, 0.08);
}

function updateEastWest(
  parts: RoofParts,
  state: ObservatoryState,
  slope: number,
  length: number,
): void {
  const pitch = state.roofPitch * Math.PI / 180;
  const rise = slope * Math.sin(pitch);
  parts.panels[0].scale.set(slope, 0.06, length);
  parts.panels[1].scale.set(slope, 0.06, length);
  parts.panels[0].position.set(-slope * Math.cos(pitch) / 2, state.roomHeight + rise / 2, 0);
  parts.panels[1].position.set(slope * Math.cos(pitch) / 2, state.roomHeight + rise / 2, 0);
  parts.panels[0].rotation.z = pitch;
  parts.panels[1].rotation.z = -pitch;
  parts.ridge.scale.set(0.08, 0.08, length);
}

function updateOpening(
  parts: RoofParts,
  state: ObservatoryState,
  northSouth: boolean,
): void {
  const travel = (northSouth ? state.roomDepth : state.roomWidth)
    + Math.max(state.roomWidth, state.roomDepth);
  const offset = travel * state.roofOpen / 100;
  const direction = directionVector(state.roofDirection);
  parts.moving.position.set(direction[0] * offset, 0, direction[1] * offset);
}

function directionVector(direction: RoofDirection): readonly [number, number] {
  if (direction === "N") return [0, -1];
  if (direction === "S") return [0, 1];
  if (direction === "L") return [1, 0];
  return [-1, 0];
}

function updateRails(
  parts: RoofParts,
  state: ObservatoryState,
  northSouth: boolean,
): void {
  const length = (northSouth ? state.roomDepth : state.roomWidth) * 3;
  const separation = (northSouth ? state.roomWidth : state.roomDepth) / 2;
  parts.rails.forEach((rail, index) => {
    rail.scale.set(northSouth ? 0.06 : length, 0.05, northSouth ? length : 0.06);
    const side = index === 0 ? -separation : separation;
    rail.position.set(northSouth ? side : 0, state.roomHeight, northSouth ? 0 : side);
  });
}

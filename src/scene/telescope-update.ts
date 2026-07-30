import { MathUtils } from "three";
import type { ObservatoryState } from "../domain/types";
import type { TelescopeParts } from "./types";

export function updateTelescope(
  parts: TelescopeParts,
  state: ObservatoryState,
): void {
  const pivotHeight = state.concreteHeight
    + state.extensionHeight
    + state.mountHeight;
  parts.root.position.set(0, pivotHeight, -state.pivotOffset);
  parts.tilt.rotation.x = MathUtils.degToRad(90 - Math.abs(state.latitude));
  parts.rightAscension.rotation.z = MathUtils.degToRad(
    state.rightAscension + 90,
  );
  parts.declination.rotation.x = MathUtils.degToRad(-state.declination);
  updateMount(parts, state);
  updateOptics(parts, state);
  updateCounterweights(parts, state.counterweightOffset);
}

function updateMount(parts: TelescopeParts, state: ObservatoryState): void {
  const rodLength = Math.max(0.001, state.baseOffset);
  parts.baseRod.scale.set(1, rodLength, 1);
  parts.baseRod.position.set(0, state.baseOffset / 2, 0);
  parts.rightAscensionHousing.rotation.x = Math.PI / 2;
  parts.rightAscensionHousing.scale.set(0.1, state.rightAscensionOffset + 0.05, 0.1);
  parts.rightAscensionHousing.position.set(
    0, state.baseOffset, state.rightAscensionOffset / 2,
  );
  parts.rightAscension.position.set(0, state.baseOffset, 0);
  const tubeRadius = state.tubeDiameter / 2;
  const housingLength = Math.max(0.05, state.declinationOffset - tubeRadius);
  parts.declinationHousing.rotation.z = Math.PI / 2;
  parts.declinationHousing.scale.set(0.08, housingLength, 0.08);
  parts.declinationHousing.position.set(housingLength / 2, 0, state.rightAscensionOffset);
  parts.declinationRing.rotation.z = Math.PI / 2;
  parts.declinationRing.scale.set(0.082, 0.015, 0.082);
  parts.declinationRing.position.set(housingLength, 0, state.rightAscensionOffset);
  parts.declination.position.set(0, 0, state.rightAscensionOffset);
}

function updateOptics(parts: TelescopeParts, state: ObservatoryState): void {
  const radius = state.tubeDiameter / 2;
  const dewLength = Math.min(0.35, state.tubeLength * 0.3);
  const rearLength = Math.min(0.08, state.tubeLength * 0.2);
  const mainLength = Math.max(0.1, state.tubeLength - dewLength - rearLength);
  const front = state.tubeLength / 2 + state.tubeOffset;
  let cursor = -front;
  cursor = positionTube(parts.dewShield, {
    cursor, length: dewLength, radius: radius * 1.05, state,
  });
  cursor = positionTube(parts.tube, {
    cursor, length: mainLength, radius, state,
  });
  cursor = positionTube(parts.rearCell, {
    cursor, length: rearLength, radius, state,
  });
  positionTube(parts.eyepiece, {
    cursor, length: state.eyepieceLength, radius: 0.03, state,
  });
  parts.eyepiece.visible = state.eyepieceLength > 0.001;
  parts.saddle.scale.set(0.04, 0.22, 1);
  parts.saddle.position.x = state.declinationOffset - radius - 0.04;
  parts.dovetail.scale.set(0.02, mainLength + 0.05, 1);
  parts.dovetail.position.set(state.declinationOffset - radius - 0.01, 0, 0);
}

type TubePosition = {
  radius: number;
  length: number;
  cursor: number;
  state: ObservatoryState;
};

function positionTube(
  mesh: TelescopeParts["tube"],
  position: TubePosition,
): number {
  mesh.scale.set(
    position.radius,
    Math.max(0.001, position.length),
    position.radius,
  );
  mesh.position.set(
    position.state.declinationOffset,
    position.cursor + position.length / 2,
    0,
  );
  return position.cursor + position.length;
}

function updateCounterweights(parts: TelescopeParts, length: number): void {
  parts.counterweightShaft.rotation.z = Math.PI / 2;
  parts.counterweightShaft.scale.set(1, length, 1);
  parts.counterweightShaft.position.set(-length / 2, 0, 0);
  parts.counterweights.position.set(-length + 0.15, 0, 0);
}

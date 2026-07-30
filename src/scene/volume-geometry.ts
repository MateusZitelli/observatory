import {
  BufferGeometry,
  Float32BufferAttribute,
} from "three";
import type { ObservatoryState } from "../domain/types";

export type EnvelopeSpec = {
  state: ObservatoryState;
  length: number;
  direction: 1 | -1;
};

const rightAscensionSegments = 32;
const declinationSegments = 24;

export function createEnvelopeGeometry(spec: EnvelopeSpec): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(createPositions(spec), 3),
  );
  geometry.setIndex(createIndices());
  geometry.computeVertexNormals();
  inflate(geometry, spec.state.tubeDiameter / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createPositions(spec: EnvelopeSpec): number[] {
  const output: number[] = [];
  for (let raIndex = 0; raIndex <= rightAscensionSegments; raIndex += 1) {
    const ra = raIndex / rightAscensionSegments * Math.PI * 2;
    appendDeclinations(output, spec, ra);
  }
  return output;
}

function appendDeclinations(
  output: number[],
  spec: EnvelopeSpec,
  rightAscension: number,
): void {
  for (let index = 0; index <= declinationSegments; index += 1) {
    const declination = index / declinationSegments * Math.PI - Math.PI / 2;
    output.push(...transformPoint(spec, rightAscension, declination));
  }
}

function transformPoint(
  spec: EnvelopeSpec,
  rightAscension: number,
  declination: number,
): readonly [number, number, number] {
  const state = spec.state;
  const axial = spec.direction * spec.length;
  const declinationY = axial * Math.cos(declination);
  const declinationZ = axial * Math.sin(declination) + state.rightAscensionOffset;
  const x = state.declinationOffset * Math.cos(rightAscension)
    - declinationY * Math.sin(rightAscension);
  const y = state.declinationOffset * Math.sin(rightAscension)
    + declinationY * Math.cos(rightAscension) + state.baseOffset;
  const tilt = (90 - Math.abs(state.latitude)) * Math.PI / 180;
  const tiltedY = y * Math.cos(tilt) - declinationZ * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + declinationZ * Math.cos(tilt);
  const height = state.concreteHeight + state.extensionHeight + state.mountHeight;
  return [x, tiltedZ + height, -tiltedY - state.pivotOffset];
}

function createIndices(): number[] {
  const output: number[] = [];
  const row = declinationSegments + 1;
  for (let ra = 0; ra < rightAscensionSegments; ra += 1) {
    for (let dec = 0; dec < declinationSegments; dec += 1) {
      const first = ra * row + dec;
      const next = first + row;
      output.push(first, first + 1, next + 1, first, next + 1, next);
    }
  }
  return output;
}

function inflate(geometry: BufferGeometry, radius: number): void {
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  for (let index = 0; index < positions.count; index += 1) {
    positions.setXYZ(
      index,
      positions.getX(index) + normals.getX(index) * radius,
      positions.getY(index) + normals.getY(index) * radius,
      positions.getZ(index) + normals.getZ(index) * radius,
    );
  }
  positions.needsUpdate = true;
}

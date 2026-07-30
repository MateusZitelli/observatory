import {
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import type { ObservatoryState } from "../domain/types";
import type { VolumeParts } from "./types";
import { createEnvelopeGeometry } from "./volume-geometry";

export function createVolumes(): VolumeParts {
  const root = new Group();
  root.name = "swept-volumes";
  const frontMaterial = transparentMaterial(0x3b82f6);
  const eyeMaterial = transparentMaterial(0xf97316);
  const front = new Mesh(undefined, frontMaterial);
  const eye = new Mesh(undefined, eyeMaterial);
  const frontWire = wireMesh(0x60a5fa);
  const eyeWire = wireMesh(0xfb923c);
  root.add(front, frontWire, eye, eyeWire);
  return { eye, eyeWire, front, frontWire, root };
}

export function updateVolumes(
  parts: VolumeParts,
  state: ObservatoryState,
): void {
  const frontLength = state.tubeLength / 2 + state.tubeOffset;
  const eyeLength = state.tubeLength / 2
    - state.tubeOffset
    + state.eyepieceLength;
  replacePair({
    direction: -1,
    length: frontLength,
    state,
    surface: parts.front,
    wire: parts.frontWire,
  });
  replacePair({
    direction: 1,
    length: eyeLength,
    state,
    surface: parts.eye,
    wire: parts.eyeWire,
  });
  parts.root.visible = state.showVolume;
}

type GeometryPair = {
  surface: Mesh;
  wire: Mesh;
  state: ObservatoryState;
  length: number;
  direction: 1 | -1;
};

function replacePair(pair: GeometryPair): void {
  const geometry = createEnvelopeGeometry({
    direction: pair.direction,
    length: pair.length,
    state: pair.state,
  });
  pair.surface.geometry.dispose();
  pair.wire.geometry.dispose();
  pair.surface.geometry = geometry;
  pair.wire.geometry = geometry.clone();
}

function transparentMaterial(color: number): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color,
    depthWrite: false,
    opacity: 0.15,
    side: DoubleSide,
    transparent: true,
  });
}

function wireMesh(color: number): Mesh {
  return new Mesh(
    undefined,
    new MeshBasicMaterial({
      color,
      opacity: 0.25,
      transparent: true,
      wireframe: true,
    }),
  );
}

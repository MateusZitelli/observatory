import { Group } from "three";
import type { ObservatoryState } from "../domain/types";
import { cylinder, standard } from "./mesh-utils";
import type { PierParts } from "./types";

export function createPier(): PierParts {
  const root = new Group();
  root.name = "pier";
  const concrete = cylinder(standard(0xd1d5db, 0.9));
  const extension = cylinder(standard(0x1f2937, 0.6, 0.5));
  const mountBase = cylinder(standard(0x18181b, 0.8, 0.2));
  root.add(concrete, extension, mountBase);
  return { concrete, extension, mountBase, root };
}

export function updatePier(parts: PierParts, state: ObservatoryState): void {
  const radius = state.pierDiameter / 2;
  positionCylinder(parts.concrete, {
    base: 0,
    height: state.concreteHeight,
    radius,
    z: 0,
  });
  positionCylinder(parts.extension, {
    base: state.concreteHeight,
    height: state.extensionHeight,
    radius: 0.075,
    z: -state.pivotOffset,
  });
  positionCylinder(parts.mountBase, {
    base: state.concreteHeight + state.extensionHeight,
    height: Math.max(0.001, state.mountHeight),
    radius: 0.085,
    z: -state.pivotOffset,
  });
}

type CylinderPosition = {
  radius: number;
  height: number;
  base: number;
  z: number;
};

function positionCylinder(
  mesh: PierParts["concrete"],
  position: CylinderPosition,
): void {
  mesh.scale.set(
    position.radius,
    Math.max(0.001, position.height),
    position.radius,
  );
  mesh.position.set(0, position.base + position.height / 2, position.z);
}

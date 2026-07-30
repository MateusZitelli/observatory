import { Group, MeshStandardMaterial, SphereGeometry, Mesh } from "three";
import type { Geometry, ObservatoryState } from "../domain/types";
import { cylinder } from "./mesh-utils";
import type { ObserverParts } from "./types";

export function createObserver(): ObserverParts {
  const root = new Group();
  const material = new MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.7,
  });
  const body = cylinder(material, 0.2, 1.3, 16);
  const head = new Mesh(new SphereGeometry(0.15, 16, 16), material);
  body.position.y = 0.65;
  head.position.y = 1.45;
  root.add(body, head);
  root.name = "observer";
  return { body, head, root };
}

export function updateObserver(
  parts: ObserverParts,
  state: ObservatoryState,
  geometry: Geometry,
): void {
  parts.root.visible = state.showObserver;
  const heightScale = state.observerPosture === "sitting" ? 0.65 : 1;
  parts.root.scale.set(1, heightScale, 1);
  parts.root.position.set(state.observerX, 0, state.observerZ);
  const distance = Math.hypot(state.observerX, state.observerZ);
  const color = distance < geometry.sweptRadius + 0.1 ? 0xef4444 : 0x22c55e;
  const material = parts.body.material;
  if (material instanceof MeshStandardMaterial) material.color.setHex(color);
}

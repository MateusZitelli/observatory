import { DoubleSide, Group, MeshStandardMaterial } from "three";
import { box, standard } from "./mesh-utils";
import type { RoofParts } from "./types";

export function createRoof(): RoofParts {
  const root = new Group();
  const moving = new Group();
  const roofMaterial = new MeshStandardMaterial({
    color: 0x78716c,
    metalness: 0.7,
    roughness: 0.4,
    side: DoubleSide,
  });
  const panels = [box(roofMaterial), box(roofMaterial)] as const;
  const ridge = box(standard(0xa8a29e, 0.45, 0.6));
  const railMaterial = standard(0x71717a, 0.35, 0.8);
  const rails = [box(railMaterial), box(railMaterial)] as const;
  moving.add(...panels, ridge);
  root.add(moving, ...rails);
  root.name = "roll-off-roof";
  return { moving, panels, rails, ridge, root };
}

import { Group } from "three";
import type { ObservatoryState } from "../domain/types";
import {
  buildBed,
  buildChair,
  buildDesk,
  buildSofa,
} from "./furniture-builders";
import { standard } from "./mesh-utils";
import type { FurnitureParts } from "./types";

export function createFurniture(): FurnitureParts {
  const root = new Group();
  const materials = {
    bedding: standard(0xf5f5f0, 0.9),
    metal: standard(0x374151, 0.35, 0.7),
    sofa: standard(0x475569, 0.9),
    wood: standard(0x8b5e3c, 0.75),
  };
  const desk = buildDesk(materials);
  const chair = buildChair(materials);
  const sofa = buildSofa(materials);
  const bed = buildBed(materials);
  const mattress = buildBed(materials);
  root.add(desk, chair, sofa, bed, mattress);
  root.name = "furniture";
  return { bed, chair, desk, mattress, root, sofa };
}

export function updateFurniture(
  parts: FurnitureParts,
  state: ObservatoryState,
): void {
  const wall = 0.175 / 2;
  const east = state.roomWidth / 2 - wall;
  const west = -state.roomWidth / 2 + wall;
  const south = state.roomDepth / 2 - wall;
  const north = -state.roomDepth / 2 + wall;
  parts.root.visible = state.showFurniture;
  parts.desk.position.set(west + 0.35, 0.2, north + 0.8);
  parts.desk.rotation.y = -Math.PI / 2;
  parts.chair.position.set(west + 1, 0.2, north + 0.8);
  parts.chair.rotation.y = -Math.PI / 2;
  parts.sofa.position.set(east - 0.9, 0.2, south - 0.475);
  parts.sofa.rotation.y = Math.PI;
  parts.bed.position.set(east - 0.9, 0.62, south - 1);
  parts.bed.visible = state.sofaBedOpen;
  parts.mattress.position.set(west + 0.79, 0.2, south - 0.99);
  parts.mattress.scale.set(0.88, 1, 1.88);
}

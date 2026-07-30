import {
  DoubleSide,
  Group,
  MeshStandardMaterial,
} from "three";
import type { ObservatoryState } from "../domain/types";
import { box, standard } from "./mesh-utils";
import type { RoomParts } from "./types";

export function createRoom(): RoomParts {
  const root = new Group();
  root.name = "observatory-room";
  const floor = box(standard(0xb8943e, 0.9));
  const wallMaterial = new MeshStandardMaterial({
    color: 0xd4b86a,
    opacity: 0.62,
    roughness: 0.95,
    side: DoubleSide,
    transparent: true,
  });
  const walls = [
    box(wallMaterial),
    box(wallMaterial),
    box(wallMaterial),
    box(wallMaterial),
  ] as const;
  root.add(floor, ...walls);
  return { floor, root, walls };
}

export function updateRoom(parts: RoomParts, state: ObservatoryState): void {
  const { roomDepth: depth, roomHeight: height, roomWidth: width } = state;
  const thickness = 0.14;
  parts.floor.scale.set(width, 0.08, depth);
  parts.floor.position.set(0, 0.04, 0);
  const [north, south, east, west] = parts.walls;
  north.scale.set(width, height, thickness);
  south.scale.set(width, height, thickness);
  east.scale.set(thickness, height, depth);
  west.scale.set(thickness, height, depth);
  north.position.set(0, height / 2, -depth / 2);
  south.position.set(0, height / 2, depth / 2);
  east.position.set(width / 2, height / 2, 0);
  west.position.set(-width / 2, height / 2, 0);
}

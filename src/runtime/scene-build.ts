import { Group } from "three";
import { createFurniture } from "../scene/furniture";
import { createObserver } from "../scene/observer";
import { createPier } from "../scene/pier";
import { createRoof } from "../scene/roof-create";
import { createRoom } from "../scene/room";
import { createTelescope } from "../scene/telescope-create";
import { createVolumes } from "../scene/volumes";
import type { SceneModel } from "../scene/types";

export function createSceneModel(): SceneModel {
  const pier = createPier();
  const telescope = createTelescope();
  const volumes = createVolumes();
  const room = createRoom();
  const roof = createRoof();
  const furniture = createFurniture();
  const observer = createObserver();
  const root = new Group();
  root.add(room.root, pier.root, telescope.root, volumes.root, roof.root);
  root.add(furniture.root, observer.root);
  return { root, pier, telescope, volumes, room, roof, furniture, observer };
}
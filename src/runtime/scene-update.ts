import type { AppSnapshot } from "../domain/types";
import { updateFurniture } from "../scene/furniture";
import { updateObserver } from "../scene/observer";
import { updatePier } from "../scene/pier";
import { updateRoof } from "../scene/roof-update";
import { updateRoom } from "../scene/room";
import { updateTelescope } from "../scene/telescope-update";
import { updateVolumes } from "../scene/volumes";
import type { SceneModel } from "../scene/types";

export function updateSceneModel(model: SceneModel, snapshot: AppSnapshot): void {
  const { state, geometry } = snapshot;
  updatePier(model.pier, state);
  updateTelescope(model.telescope, state);
  updateVolumes(model.volumes, state);
  updateRoom(model.room, state);
  updateRoof(model.roof, state);
  updateFurniture(model.furniture, state);
  updateObserver(model.observer, state, geometry);
  updateViewVisibility(model, snapshot);
}

function updateViewVisibility(model: SceneModel, snapshot: AppSnapshot): void {
  const roomVisible = snapshot.view === "room";
  const sceneVisible = roomVisible || snapshot.view === "telescope";
  model.room.root.visible = roomVisible;
  model.roof.root.visible = roomVisible;
  model.furniture.root.visible = roomVisible && snapshot.state.showFurniture;
  model.observer.root.visible = sceneVisible && snapshot.state.showObserver;
}
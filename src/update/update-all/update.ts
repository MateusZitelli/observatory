import { optionalGlobal, readUpdateContext } from "./context";
import { updateArchitecture } from "./architecture";
import { updateElevation } from "./elevation";
import { updateMechanics } from "./mechanics";
import { updateMount } from "./mount";
import { updateOptics } from "./optics";
import { updateRoofSafety } from "./roof-safety";
import { updateRoom } from "./room";
import { updateVolumes } from "./volumes";
import { updateFinish } from "./finish";

export function updateAll(): void {
  const context = readUpdateContext();
  updateRoom(context);
  updateArchitecture(context);
  updateMechanics(context);
  updateVolumes(context);
  updateElevation(context);
  updateMount(context);
  updateOptics(context);
  if (optionalGlobal("observerGroup", globalThis.observerGroup)) globalThis.updateObserver();
  updateRoofSafety(context);
  updateFinish();
}

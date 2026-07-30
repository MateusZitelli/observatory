import { updateAll } from "./update-all/update";

declare global {
  var buildWallFrame: (rW: number, rD: number, rH: number) => void;
  var buildRoof: (rW: number, rD: number, rH: number) => void;
  var updateObserver: () => void;
  var checkRoomCrash: () => string | null;
}

export function installUpdateAllGlobal(): void {
  globalThis.updateAll = updateAll;
}

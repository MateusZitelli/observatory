import { resize2D } from "./observer-resize/resize-2d";
import { updateObserver } from "./observer-resize/update-observer";

declare global {
  var updateObserver: () => void;
}

export function installObserverResizeGlobals(): void {
  globalThis.updateObserver = updateObserver;
  globalThis.resize2D = resize2D;
}

import { drawSkyView } from "./sky-view";

export function installSkyViewGlobal(): void {
  globalThis.drawSky = drawSkyView;
}

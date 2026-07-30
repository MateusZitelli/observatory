import { createWallFrameBuilder, type BuildWallFrame } from "./wall-frame/index";

declare global {
  var buildWallFrame: BuildWallFrame;
}

export function installWallFrameGlobal(): void {
  globalThis.buildWallFrame = createWallFrameBuilder();
}

import { drawCardinals } from "./sky-cardinals";
import { createSkySetup, type SkySetup } from "./sky-frame";
import { drawPanorama, drawSkyGrid } from "./sky-grid";

export function createBackground(): SkySetup {
  const setup = createSkySetup();
  drawPanorama(setup.frame);
  drawSkyGrid(setup.frame);
  drawCardinals(setup.frame);
  return setup;
}

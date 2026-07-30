import { toRadians } from "../astronomy/angles";
import type { PanoramaSource } from "./types";
import type { SkyProjection } from "./sky-projection";

export type PanoramaStore = {
  clear: () => void;
  get: () => HTMLImageElement | undefined;
  load: (source: PanoramaSource) => Promise<void>;
};

export function createPanoramaStore(): PanoramaStore {
  let panorama: HTMLImageElement | undefined;
  return {
    clear: () => {
      panorama = undefined;
    },
    get: () => panorama,
    load: async (source) => {
      panorama = await resolveImage(source);
    },
  };
}

export function drawPanorama(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  image: HTMLImageElement,
  rotation: number,
): void {
  const steps = 360;
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight / 2;
  const stripWidth = Math.PI * 2 * projection.radius / steps + 1;
  context.save();
  clipHorizon(context, projection);
  context.globalAlpha = 0.58;
  context.translate(projection.center.x, projection.center.y);
  for (let index = 0; index < steps; index += 1) {
    const sourceX = sourceWidth * ((index / steps + rotation / 360) % 1);
    context.save();
    context.rotate(toRadians(index));
    context.drawImage(
      image,
      sourceX,
      0,
      sourceWidth / steps + 1,
      sourceHeight,
      -stripWidth / 2,
      0,
      stripWidth,
      -projection.radius,
    );
    context.restore();
  }
  context.restore();
}

function clipHorizon(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
): void {
  context.beginPath();
  context.arc(projection.center.x, projection.center.y, projection.radius, 0, Math.PI * 2);
  context.clip();
}

async function resolveImage(source: PanoramaSource): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    if (!source.complete) await source.decode();
    return source;
  }
  if (typeof source === "string") return loadImage(source);
  const objectUrl = URL.createObjectURL(source);
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => { resolve(image); }, { once: true });
    image.addEventListener("error", () => {
      reject(new Error("Panorama could not be loaded."));
    }, {
      once: true,
    });
    image.src = source;
  });
}

import type { AppSnapshot } from "../domain/types";

export type CanvasViewport = {
  width: number;
  height: number;
  pixelRatio: number;
};

export type CanvasFrame = {
  context: CanvasRenderingContext2D;
  snapshot: AppSnapshot;
  viewport: CanvasViewport;
};

export type CanvasPainter = (frame: CanvasFrame) => void;

export type CanvasController = {
  render: (snapshot: AppSnapshot) => void;
  resize: () => void;
  destroy: () => void;
};

export type PanoramaSource = string | Blob | HTMLImageElement;

export type SkyCanvasController = CanvasController & {
  setPanorama: (source: PanoramaSource) => Promise<void>;
  clearPanorama: () => void;
};

import type { CanvasViewport } from "./types";

const maximumPixelRatio = 2;

export function canvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Canvas 2D is not supported.");
  return context;
}

export function resizeSurface(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): CanvasViewport {
  const ratio = Math.min(window.devicePixelRatio || 1, maximumPixelRatio);
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, bounds.width || canvas.clientWidth || canvas.width / ratio || 800);
  const height = Math.max(1, bounds.height || canvas.clientHeight || canvas.height / ratio || 600);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height, pixelRatio: ratio };
}

export function clearSurface(
  context: CanvasRenderingContext2D,
  viewport: CanvasViewport,
  color: string,
): void {
  context.clearRect(0, 0, viewport.width, viewport.height);
  context.fillStyle = color;
  context.fillRect(0, 0, viewport.width, viewport.height);
}

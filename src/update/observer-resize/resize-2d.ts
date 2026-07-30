export function resize2D(): void {
  globalThis.canvas2D.width = window.innerWidth;
  globalThis.canvas2D.height = window.innerHeight;
}

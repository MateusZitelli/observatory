declare global {
  var panoImg: HTMLImageElement | null;
  var panoCanvas: HTMLCanvasElement | null;
  var panoData: ImageData | null;
  var loadPanoImage: (src: string) => void;
}
declare const PANO_BASE64: string;

function drawingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (context === null) throw new TypeError("Canvas 2D context unavailable");
  return context;
}

function imageSource(result: string | ArrayBuffer | null): string {
  if (typeof result === "string") return result;
  if (result === null) return "null";
  return Object.prototype.toString.call(result);
}

function loadPanoImage(src: string): void {
  const img = new Image();
  Object.assign(img, { onload: function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    globalThis.panoImg = img;
    globalThis.panoCanvas = canvas;
    const context = drawingContext(canvas);
    context.drawImage(img, 0, 0);
    globalThis.panoData = context.getImageData(0, 0, img.width, img.height);
    if (globalThis.currentTab === "SKY") globalThis.drawSky();
  } });
  img.src = src;
}

function registerPanoFileInput(): void {
  const input = document.querySelector<HTMLInputElement>("#panoFileInput");
  if (input === null) throw new TypeError("Missing element: panoFileInput");
  input.addEventListener("change", function (inputEvent) {
    const target = inputEvent.target;
    if (!(target instanceof HTMLInputElement) || target.files === null) {
      throw new TypeError("Invalid panorama file input");
    }
    const file = target.files[0];
    if (!file) return;
    const reader = new FileReader();
    Object.assign(reader, { onload: function (readerEvent: ProgressEvent<FileReader>) {
      const readerTarget = readerEvent.target;
      if (readerTarget === null) throw new TypeError("Invalid file reader");
      const img = new Image();
      Object.assign(img, { onload: function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        globalThis.panoImg = img;
        globalThis.panoCanvas = canvas;
        const context = drawingContext(canvas);
        context.drawImage(img, 0, 0);
        globalThis.panoData = context.getImageData(0, 0, img.width, img.height);
        if (globalThis.currentTab === "SKY") globalThis.drawSky();
      } });
      img.src = imageSource(readerTarget.result);
    } });
    reader.readAsDataURL(file);
  });
}

export function installPanoramaRuntime(): void {
  globalThis.panoImg = null;
  globalThis.panoCanvas = null;
  globalThis.panoData = null;
  globalThis.loadPanoImage = loadPanoImage;

  const probe = new Image();
  Object.assign(probe, {
    onload: function () { globalThis.loadPanoImage("pano360.jpg"); },
    onerror: function () { globalThis.loadPanoImage(PANO_BASE64); },
  });
  probe.src = "pano360.jpg";
  registerPanoFileInput();
}

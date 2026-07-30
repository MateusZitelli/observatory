declare global {
  var panoImg: HTMLImageElement | null;
  var panoCanvas: HTMLCanvasElement | null;
  var panoData: ImageData | null;
  var loadPanoImage: (src: string) => void;
  var PANO_BASE64: string;
}

function loadPanoImage(src: string): void {
  const img = new Image();
  img.addEventListener("load", function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    globalThis.panoImg = img;
    globalThis.panoCanvas = canvas;
    globalThis.panoData = null;

    const context = canvas.getContext("2d");
    if (context === null) return;
    context.drawImage(img, 0, 0);
    globalThis.panoData = context.getImageData(0, 0, img.width, img.height);
    if (globalThis.currentTab === "SKY") globalThis.drawSky();
  });
  img.src = src;
}

function registerPanoFileInput(): void {
  const input = document.querySelector<HTMLInputElement>("#panoFileInput");
  if (input === null) return;
  input.addEventListener("change", function (event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      const result = reader.result;
      if (typeof result !== "string") return;
      const img = new Image();
      img.addEventListener("load", function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        globalThis.panoImg = img;
        globalThis.panoCanvas = canvas;
        globalThis.panoData = null;
        const context = canvas.getContext("2d");
        if (context === null) return;
        context.drawImage(img, 0, 0);
        globalThis.panoData = context.getImageData(0, 0, img.width, img.height);
        if (globalThis.currentTab === "SKY") globalThis.drawSky();
      });
      img.src = result;
    });
    reader.readAsDataURL(file);
  });
}

export function installPanoramaRuntime(): void {
  globalThis.panoImg = null;
  globalThis.panoCanvas = null;
  globalThis.panoData = null;
  globalThis.loadPanoImage = loadPanoImage;

  const probe = new Image();
  probe.addEventListener("load", function () { loadPanoImage("pano360.jpg"); });
  probe.addEventListener("error", function () { loadPanoImage(globalThis.PANO_BASE64); });
  probe.src = "pano360.jpg";

  registerPanoFileInput();
}

export type RuntimeDomGlobals = {
  currentTab: string;
  is2DMode: boolean;
  btnTab3D: HTMLElement;
  btnTabRoom: HTMLElement;
  btnTab2D: HTMLElement;
  btnTabSky: HTMLElement;
  btnTabProj: HTMLElement;
  content3D: HTMLElement;
  contentROOM: HTMLElement;
  content2D: HTMLElement;
  contentSKY: HTMLElement;
  contentPROJ: HTMLElement;
  motorsBlock: HTMLElement;
  canvasContainer: HTMLElement;
  canvas2D: HTMLCanvasElement;
};

declare global {
  var currentTab: string;
  var is2DMode: boolean;
  var btnTab3D: HTMLElement;
  var btnTabRoom: HTMLElement;
  var btnTab2D: HTMLElement;
  var btnTabSky: HTMLElement;
  var btnTabProj: HTMLElement;
  var content3D: HTMLElement;
  var contentROOM: HTMLElement;
  var content2D: HTMLElement;
  var contentSKY: HTMLElement;
  var contentPROJ: HTMLElement;
  var motorsBlock: HTMLElement;
  var canvasContainer: HTMLElement;
  var canvas2D: HTMLCanvasElement;
}

function requiredElement(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element === null) throw new Error(`Missing element: ${id}`);
  return element;
}

function requiredCanvas(id: string): HTMLCanvasElement {
  const element = requiredElement(id);
  if (!(element instanceof HTMLCanvasElement)) throw new Error(`Expected canvas: ${id}`);
  return element;
}

export function createRuntimeDomGlobals(): RuntimeDomGlobals {
  return {
    currentTab: "3D",
    is2DMode: false,
    btnTab3D: requiredElement("btnTab3D"),
    btnTabRoom: requiredElement("btnTabRoom"),
    btnTab2D: requiredElement("btnTab2D"),
    btnTabSky: requiredElement("btnTabSky"),
    btnTabProj: requiredElement("btnTabProj"),
    content3D: requiredElement("content-3D"),
    contentROOM: requiredElement("content-ROOM"),
    content2D: requiredElement("content-2D"),
    contentSKY: requiredElement("content-SKY"),
    contentPROJ: requiredElement("content-PROJ"),
    motorsBlock: requiredElement("motors-block"),
    canvasContainer: requiredElement("canvas-container"),
    canvas2D: requiredCanvas("canvas-2d"),
  };
}
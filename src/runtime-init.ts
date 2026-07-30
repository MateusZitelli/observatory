import { bindings } from "./runtime-bindings";
function createScene(): void {
  globalThis.scene = new globalThis.THREE.Scene();
  globalThis.scene.background = new globalThis.THREE.Color(0x0f172a);
  globalThis.scene.fog = new globalThis.THREE.Fog(0x0f172a, 5, 20);
}
function createCamera(): void {
  globalThis.camera = new globalThis.THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  globalThis.camera.position.set(4, 3, 5);
}

function createRenderer(): void {
  globalThis.renderer = new globalThis.THREE.WebGLRenderer({ antialias: true });
  globalThis.renderer.setSize(window.innerWidth, window.innerHeight);
  globalThis.renderer.setPixelRatio(window.devicePixelRatio);
  globalThis.canvasContainer.append(globalThis.renderer.domElement);
}

function createControls(): void {
  globalThis.controls = new globalThis.THREE.OrbitControls(globalThis.camera, globalThis.renderer.domElement);
  globalThis.controls.enableDamping = true;
  globalThis.controls.dampingFactor = 0.05;
  globalThis.controls.target.set(0, 1, 0);
}

function createLightsAndGrid(): void {
  const ambientLight = new globalThis.THREE.AmbientLight(0xffffff, 0.6);
  globalThis.scene.add(ambientLight);
  const dirLight = new globalThis.THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  globalThis.scene.add(dirLight);

  const gridHelper = new globalThis.THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
  globalThis.scene.add(gridHelper);
}

function loadInitialState(): void {
  // Load state from v2 localStorage (falls back to defaults)
  if (globalThis.loadStateFromLS()) globalThis.syncAllToDOM();
  globalThis.computeDerived();
}

function registerInputBindings(): void {
  // Unified event listeners via bindings
  for (const b of bindings) {
    const el = document.querySelector<HTMLElement>(`#${b.id}`);
    if (!el) continue;
    const evType = (b.type === "checkbox" || b.type === "select") ? "change" : "input";
    el.addEventListener(evType, () => {
      globalThis.syncFromDOM(b);
      globalThis.syncAllToDOM();
      globalThis.computeDerived();
      globalThis.updateAll();
      globalThis.saveStateToLS();
    });
  }
}

function registerIdealPier(button: HTMLElement): void {
  button.addEventListener("click", () => {
    const targetEyeMinZ = globalThis.state.observerPosture === "sitting" ? 0.65 : 1.25;
    const diff = targetEyeMinZ - globalThis.derived.currentEyeMinZ;
    let newH = globalThis.state.H_con + diff;
    if (newH < 0.1) newH = 0.1;
    globalThis.state.H_con = newH;
    globalThis.syncAllToDOM();
    globalThis.computeDerived();
    globalThis.updateAll();
    globalThis.saveStateToLS();
  });
}

function init(button: HTMLElement): void {
  createScene();
  createCamera();
  createRenderer();
  createControls();
  createLightsAndGrid();
  globalThis.resize2D();
  globalThis.createMeshes();
  globalThis.createFurniture();
  loadInitialState();
  globalThis.updateAll();
  globalThis.switchTab("3D");
  window.addEventListener("resize", globalThis.onWindowResize, false);
  registerInputBindings();
  registerIdealPier(button);
  globalThis.animate();
}

export function installInitializer(): void {
  const button = document.querySelector<HTMLElement>("#btnIdealPier");
  if (!button) throw new Error("Missing element: btnIdealPier");
  globalThis.init = () => { init(button); };
}

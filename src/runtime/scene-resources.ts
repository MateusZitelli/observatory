import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createSceneModel } from "./scene-model";

export function createSceneResources(host: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.append(renderer.domElement);
  const scene = createScene();
  const camera = createCamera();
  const controls = createControls(camera, renderer.domElement);
  const model = createSceneModel();
  scene.add(model.root);
  const resizeObserver = new ResizeObserver(() => {
    resizeRenderer(host, renderer, camera);
  });
  resizeObserver.observe(host);
  const resize = (): void => {
    resizeRenderer(host, renderer, camera);
  };
  resize();
  return { renderer, scene, camera, controls, model, resizeObserver, resize };
}

function createScene(): Scene {
  const scene = new Scene();
  scene.background = new Color(0x07111f);
  scene.add(new HemisphereLight(0xb9d8ff, 0x1e293b, 1.8));
  scene.add(new AmbientLight(0xffffff, 0.45));
  const sun = new DirectionalLight(0xffe6bd, 2.2);
  sun.position.set(4, 7, 3);
  scene.add(sun);
  return scene;
}

function createCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(42, 1, 0.01, 100);
  camera.position.set(4.2, 3.1, 4.8);
  return camera;
}

function createControls(
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.maxDistance = 18;
  controls.minDistance = 1.2;
  return controls;
}

function resizeRenderer(
  host: HTMLElement,
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
): void {
  const bounds = host.getBoundingClientRect();
  const width = Math.max(1, bounds.width || host.clientWidth || 800);
  const height = Math.max(1, bounds.height || host.clientHeight || 600);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
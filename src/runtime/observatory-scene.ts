import type {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { ObservatoryScene, SceneModel } from "../scene/types";
import { disposeRuntime } from "../scene/dispose";
import { updateSceneModel } from "./scene-model";
import { createSceneResources } from "./scene-resources";

export function createObservatoryScene(host: HTMLElement): ObservatoryScene {
  const resources = createSceneResources(host);
  const {
    renderer, scene, camera, controls, model, resizeObserver, resize,
  } = resources;
  let running = false;
  let frame = 0;

  const render = (): void => {
    renderer.render(scene, camera);
  };
  const tick = (): void => {
    if (!running) return;
    controls.update();
    render();
    frame = requestAnimationFrame(tick);
  };
  return createSceneController({
    scene,
    camera,
    renderer,
    controls,
    resizeObserver,
    model,
    resize,
    render,
    tick,
    running: () => running,
    setRunning: (value) => {
      running = value;
    },
    frame: () => frame,
    setFrame: (value) => {
      frame = value;
    },
  });
}

type SceneControllerOptions = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  resizeObserver: ResizeObserver;
  model: SceneModel;
  resize: () => void;
  render: () => void;
  tick: () => void;
  running: () => boolean;
  setRunning: (value: boolean) => void;
  frame: () => number;
  setFrame: (value: number) => void;
};

function createSceneController(options: SceneControllerOptions): ObservatoryScene {
  const { scene, camera, renderer, controls, resizeObserver, model } = options;
  return {
    scene,
    camera,
    renderer,
    controls,
    update: (snapshot) => {
      updateSceneModel(model, snapshot);
      options.render();
    },
    resize: options.resize,
    render: options.render,
    start: () => {
      if (options.running()) return;
      options.setRunning(true);
      options.setFrame(requestAnimationFrame(options.tick));
    },
    stop: () => {
      options.setRunning(false);
      cancelAnimationFrame(options.frame());
    },
    dispose: () => {
      options.setRunning(false);
      cancelAnimationFrame(options.frame());
      resizeObserver.disconnect();
      disposeRuntime(renderer, controls, model.root);
    },
  };
}
import { createStore, type Store } from "../domain/store";
import { bindActionEvents } from "../ui/action-events";
import { bindStateEvents } from "../ui/state-events";
import { renderShell } from "../ui/shell";
import { updateControls } from "../ui/update-controls";
import { createObservatoryScene } from "./observatory-scene";
import type { ObservatoryScene } from "../scene/types";
import { createViewportRuntime } from "./viewport";

export type AppRuntime = {
  store: Store;
  destroy: () => void;
};

export function mountApp(root: HTMLElement): AppRuntime {
  const store = createStore();
  renderShell(root, store.getSnapshot());
  const sceneHost = requireElement(root, "#scene-host", HTMLElement);
  const canvas = requireElement(root, "#drawing-canvas", HTMLCanvasElement);
  const viewport = createViewportRuntime(sceneHost, canvas);
  const scene = createSceneOrFallback(sceneHost);
  const unbindState = bindStateEvents(root, store);
  const unbindActions = bindActionEvents(root, store, {
    onPanorama: (source) => {
      viewport.setPanorama(source);
    },
  });
  const unsubscribe = store.subscribe((snapshot) => {
    updateControls(root, snapshot);
    scene?.update(snapshot);
    viewport.render(snapshot);
  });
  scene?.start();
  return {
    store,
    destroy: () => {
      unsubscribe();
      unbindState();
      unbindActions();
      viewport.destroy();
      scene?.dispose();
    },
  };
}

function createSceneOrFallback(host: HTMLElement): ObservatoryScene | undefined {
  try {
    return createObservatoryScene(host);
  } catch {
    host.innerHTML = `<div style="align-items:center;color:#cbd5e1;display:flex;
      height:100%;justify-content:center;padding:2rem;text-align:center">
      Renderização 3D indisponível neste navegador. Use as vistas 2D ou o mapa do céu.
    </div>`;
    return undefined;
  }
}

function requireElement<ElementType extends Element>(
  root: ParentNode,
  selector: string,
  constructor: abstract new (...arguments_: never[]) => ElementType,
): ElementType {
  const element = root.querySelector(selector);
  if (element instanceof constructor) return element;
  throw new Error(`Required element not found: ${selector}`);
}
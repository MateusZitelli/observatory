import type { Store } from "../domain/store";
import { isViewId } from "./state-keys";

export type ActionOptions = {
  onPanorama: (source: Blob) => void;
};

export function bindActionEvents(
  root: HTMLElement,
  store: Store,
  options: ActionOptions,
): () => void {
  const controller = new AbortController();
  root.addEventListener("click", (event) => {
    handleClick(event, root, store);
  }, {
    signal: controller.signal,
  });
  root.addEventListener("change", (event) => {
    handleFile(event, options);
  }, {
    signal: controller.signal,
  });
  return () => {
    controller.abort();
  };
}

function handleClick(event: MouseEvent, root: HTMLElement, store: Store): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const viewButton = target.closest<HTMLElement>("[data-view]");
  const view = viewButton?.dataset["view"];
  if (view !== undefined && isViewId(view)) store.setView(view);
  const action = target.closest<HTMLElement>("[data-action]")?.dataset["action"];
  if (action === "collapse") toggleSidebar(root);
  if (action === "ideal-pier") setIdealPier(store);
}

function toggleSidebar(root: HTMLElement): void {
  const sidebar = root.querySelector<HTMLElement>("[data-sidebar]");
  if (sidebar === null) return;
  const collapsed = sidebar.classList.toggle("sidebar--collapsed");
  localStorage.setItem("observatorio_menu_collapsed", collapsed ? "1" : "0");
}

function setIdealPier(store: Store): void {
  const { state } = store.getSnapshot();
  const eyeHeight = state.observerPosture === "standing" ? 1.58 : 1.05;
  const hardware = state.extensionHeight + state.mountHeight + state.baseOffset;
  store.setValue("concreteHeight", Math.min(2, Math.max(0.5, eyeHeight - hardware)));
}

function handleFile(event: Event, options: ActionOptions): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.dataset["action"] !== "panorama") return;
  const file = target.files?.item(0);
  if (file !== null && file !== undefined) options.onPanorama(file);
}

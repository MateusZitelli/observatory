import type { Store } from "../domain/store";
import type { ObserverPosture, RoofDirection } from "../domain/types";
import { isBooleanKey, isNumericKey, isStringKey } from "./state-keys";

export function bindStateEvents(root: HTMLElement, store: Store): () => void {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  root.addEventListener("input", (event) => {
    updateFromControl(event, store);
  }, options);
  root.addEventListener("change", (event) => {
    updateFromControl(event, store);
  }, options);
  return () => {
    controller.abort();
  };
}

function updateFromControl(event: Event, store: Store): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  const key = target.dataset["stateKey"];
  if (key === undefined) return;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    if (isBooleanKey(key)) store.setValue(key, target.checked);
    return;
  }
  if (isNumericKey(key)) {
    const value = Number(target.value);
    if (Number.isFinite(value)) store.setValue(key, value);
    return;
  }
  if (isStringKey(key)) setStringValue(store, key, target.value);
}

function setStringValue(
  store: Store,
  key: "observerPosture" | "roofDirection",
  value: string,
): void {
  if (key === "roofDirection" && isRoofDirection(value)) store.setValue(key, value);
  if (key === "observerPosture" && isPosture(value)) store.setValue(key, value);
}

function isRoofDirection(value: string): value is RoofDirection {
  return ["N", "S", "L", "O"].includes(value);
}

function isPosture(value: string): value is ObserverPosture {
  return value === "standing" || value === "sitting";
}

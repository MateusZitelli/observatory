import { bindings, type Binding } from "./runtime-bindings";
import { derived, LS_KEY_V2, state, type StateKey, type StateValue } from "./runtime-state";

const parseFloatValue = Number.parseFloat;

function setStateValue(key: StateKey, value: StateValue): void {
  Object.assign(state, { [key]: value });
}

function controlFor(id: string): HTMLInputElement | HTMLSelectElement | null {
  const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) return element;
  return null;
}

export function syncFromDOM(binding: Binding): void {
  const element = controlFor(binding.id);
  if (!element) return;
  if (binding.type === "checkbox" && element instanceof HTMLInputElement) {
    setStateValue(binding.key, element.checked);
    return;
  }
  if (binding.type === "select" && element instanceof HTMLSelectElement) {
    setStateValue(binding.key, element.value);
    return;
  }
  if (element instanceof HTMLInputElement) setStateValue(binding.key, parseFloatValue(element.value));
}

export function syncAllToDOM(): void {
  for (const binding of bindings) {
    const element = controlFor(binding.id);
    if (!element) continue;
    if (binding.type === "checkbox" && element instanceof HTMLInputElement) {
      element.checked = Boolean(state[binding.key]);
    } else {
      element.value = String(state[binding.key]);
    }
    if (binding.valId !== undefined && binding.fmt !== undefined) {
      const valueElement = document.querySelector<HTMLElement>(`#${binding.valId}`);
      if (valueElement) valueElement.innerText = binding.fmt(state[binding.key]);
    }
  }
}

export function computeDerived(): void {
  const current = state;
  derived.H_total = current.H_con + current.H_ext + current.Y_MOUNT;
  derived.TUBE_R = current.TUBE_D / 2;
  derived.Z_FRONT = current.TUBE_LEN / 2 + current.TUBE_OFF;
  derived.Z_BACK = current.TUBE_LEN / 2 - current.TUBE_OFF;
  derived.Z_BACK_TOTAL = derived.Z_BACK + current.EYE_LEN;
  derived.PITCH_TAN = Math.tan(current.roofPitch * Math.PI / 180);
  const ridgeAlongDepth = current.roofDir === "N" || current.roofDir === "S";
  derived.halfSpan = (ridgeAlongDepth ? current.rD : current.rW) / 2 + 0.15;
  derived.ridgeRise = derived.halfSpan * derived.PITCH_TAN;
  derived.ridgeH = current.rH + derived.ridgeRise;
}

export function saveStateToLS(): void {
  localStorage.setItem(LS_KEY_V2, JSON.stringify(state));
}

function storedValue(data: unknown, key: string): unknown {
  if (data === null) throw new TypeError("Stored state is null");
  if (typeof data !== "object" && typeof data !== "function") return undefined;
  return Object.hasOwn(data, key) ? Reflect.get(data, key) : undefined;
}

export function loadStateFromLS(): boolean {
  const raw = localStorage.getItem(LS_KEY_V2);
  if (raw === null || raw === "") return false;
  try {
    const data: unknown = JSON.parse(raw);
    for (const key of Object.keys(state)) {
      const value = storedValue(data, key);
      if (value !== undefined) Object.assign(state, { [key]: value });
    }
    return true;
  } catch {
    return false;
  }
}

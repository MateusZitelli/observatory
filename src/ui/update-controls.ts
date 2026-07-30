import type { AppSnapshot, ObservatoryState } from "../domain/types";
import { collisionStatus } from "./panels/results-panel";
import { isNumericKey, isStateKey } from "./state-keys";
import { updateTabs } from "./tabs";
import { formatStateValue } from "./value-format";

export function updateControls(root: HTMLElement, snapshot: AppSnapshot): void {
  updateInputs(root, snapshot.state);
  updateOutputs(root, snapshot.state);
  updateResults(root, snapshot);
  updateTabs(root, snapshot.view);
  const sidebar = root.querySelector<HTMLElement>("[data-sidebar]");
  if (localStorage.getItem("observatorio_menu_collapsed") === "1") {
    sidebar?.classList.add("sidebar--collapsed");
  }
}

function updateInputs(root: HTMLElement, state: ObservatoryState): void {
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-state-key]")
    .forEach((element) => {
      const key = element.dataset["stateKey"];
      if (key === undefined || !isStateKey(key)) return;
      const value = state[key];
      if (element instanceof HTMLInputElement && element.type === "checkbox") {
        element.checked = value === true;
      } else {
        element.value = String(value);
      }
    });
}

function updateOutputs(root: HTMLElement, state: ObservatoryState): void {
  root.querySelectorAll<HTMLOutputElement>("[data-value-for]").forEach((output) => {
    const key = output.dataset["valueFor"];
    if (key === undefined || !isNumericKey(key)) return;
    output.value = formatStateValue(key, state[key]);
  });
}

function updateResults(root: HTMLElement, snapshot: AppSnapshot): void {
  const { geometry, state } = snapshot;
  setResult(root, "teto-mínimo", `${geometry.sweptTop.toFixed(2)} m`);
  setResult(root, "raio-limite", `${geometry.sweptRadius.toFixed(2)} m`);
  setResult(root, "ocular-baixa", `${geometry.eyeLowest.toFixed(2)} m`);
  setResult(root, "ocular-alta", `${geometry.eyeHighest.toFixed(2)} m`);
  setResult(root, "elevation", `${geometry.minimumElevation.toFixed(1)}°`);
  const clearance = root.querySelector<HTMLElement>("[data-result='clearance']");
  if (clearance === null) return;
  const status = collisionStatus(state, geometry);
  clearance.textContent = status.label;
  clearance.className = `clearance clearance--${status.tone}`;
}

function setResult(root: HTMLElement, key: string, value: string): void {
  const element = root.querySelector<HTMLElement>(`[data-result="${key}"]`);
  if (element !== null) element.textContent = value;
}

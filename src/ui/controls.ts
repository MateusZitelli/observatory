import type { BooleanStateKey, Option, RangeSpec } from "./control-types";
import type { ObservatoryState } from "../domain/types";

export function rangeControl(spec: RangeSpec, state: ObservatoryState): string {
  const value = state[spec.key];
  const precision = spec.precision ?? decimals(spec.step);
  const tone = spec.tone ?? "blue";
  return `
    <label class="control control--${tone}">
      <span class="control__label">${spec.label}</span>
      <output data-value-for="${spec.key}">${value.toFixed(precision)}${spec.unit}</output>
      <input data-state-key="${spec.key}" type="range" min="${spec.min}"
        max="${spec.max}" step="${spec.step}" value="${value}" />
    </label>`;
}

export function toggleControl(
  key: BooleanStateKey,
  label: string,
  state: ObservatoryState,
): string {
  const checked = state[key] ? "checked" : "";
  return `
    <label class="toggle">
      <input data-state-key="${key}" type="checkbox" ${checked} />
      <span>${label}</span>
    </label>`;
}

export function selectControl(
  key: keyof ObservatoryState,
  label: string,
  options: readonly Option[],
  state: ObservatoryState,
): string {
  const selected = String(state[key]);
  const items = options.map((option) => {
    const marker = option.value === selected ? "selected" : "";
    return `<option value="${option.value}" ${marker}>${option.label}</option>`;
  }).join("");
  return `
    <label class="select-control">
      <span>${label}</span>
      <select data-state-key="${key}">${items}</select>
    </label>`;
}

function decimals(step: number): number {
  const text = String(step);
  const decimal = text.indexOf(".");
  return decimal < 0 ? 0 : text.length - decimal - 1;
}

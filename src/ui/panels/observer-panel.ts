import type { ObservatoryState } from "../../domain/types";
import { rangeControl, selectControl, toggleControl } from "../controls";
import type { RangeSpec } from "../control-types";

const observerX: RangeSpec = {
  key: "observerX", label: "Pessoa no eixo L–O", min: -2, max: 2, step: 0.1, unit: " m", tone: "green",
};
const observerZ: RangeSpec = {
  key: "observerZ", label: "Pessoa no eixo N–S", min: -2, max: 2, step: 0.1, unit: " m", tone: "green",
};
const postures = [
  { value: "standing", label: "Em pé (~1,70 m)" },
  { value: "sitting", label: "Sentado (~1,15 m)" },
] as const;

export function observerPanel(state: ObservatoryState): string {
  return `
    <section class="panel-section" data-panel="telescope">
      <h2>Observador humano</h2>
      ${toggleControl("showObserver", "Mostrar pessoa no local", state)}
      ${selectControl("observerPosture", "Postura", postures, state)}
      <button class="action-button" data-action="ideal-pier">Autoajustar pilar ergonômico</button>
      ${rangeControl(observerX, state)}
      ${rangeControl(observerZ, state)}
    </section>`;
}

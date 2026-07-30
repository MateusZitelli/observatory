import type { ObservatoryState } from "../../domain/types";
import { rangeControl } from "../controls";
import type { RangeSpec } from "../control-types";

const controls: readonly RangeSpec[] = [
  { key: "concreteHeight", label: "Altura do pilar", min: 0.5, max: 2, step: 0.01, unit: " m" },
  { key: "pierDiameter", label: "Diâmetro do concreto", min: 0.15, max: 0.8, step: 0.01, unit: " m" },
  { key: "extensionHeight", label: "Extensão metálica", min: 0, max: 0.6, step: 0.01, unit: " m" },
  { key: "pivotOffset", label: "Deslocamento do pivô", min: -0.5, max: 0.5, step: 0.01, unit: " m", tone: "orange" },
  { key: "mountHeight", label: "Altura da montagem", min: 0, max: 0.5, step: 0.01, unit: " m", tone: "orange" },
  { key: "latitude", label: "Latitude polar", min: -90, max: 90, step: 0.1, unit: "°", tone: "orange" },
];

export function pierPanel(state: ObservatoryState): string {
  return `
    <section class="panel-section" data-panel="plan">
      <h2>Estrutura do pilar</h2>
      ${controls.map((control) => rangeControl(control, state)).join("")}
    </section>`;
}

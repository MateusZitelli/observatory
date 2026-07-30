import type { ObservatoryState } from "../../domain/types";
import { rangeControl, selectControl, toggleControl } from "../controls";
import type { RangeSpec } from "../control-types";

const roomControls: readonly RangeSpec[] = [
  { key: "roomWidth", label: "Largura L–O", min: 1.5, max: 6, step: 0.05, unit: " m", tone: "cyan" },
  { key: "roomDepth", label: "Profundidade N–S", min: 1.5, max: 6, step: 0.05, unit: " m", tone: "cyan" },
  { key: "roomHeight", label: "Altura das paredes", min: 1.5, max: 4, step: 0.05, unit: " m", tone: "cyan" },
  { key: "roofOpen", label: "Abertura do telhado", min: 0, max: 100, step: 1, unit: "%", tone: "yellow" },
  { key: "roofPitch", label: "Inclinação das águas", min: 5, max: 35, step: 1, unit: "°", tone: "yellow" },
];

const directions = [
  { value: "N", label: "Norte" },
  { value: "S", label: "Sul" },
  { value: "L", label: "Leste" },
  { value: "O", label: "Oeste" },
] as const;

export function roomPanel(state: ObservatoryState): string {
  return `
    <section class="panel-section" data-panel="room">
      <h2>Paredes e teto</h2>
      ${roomControls.map((control) => rangeControl(control, state)).join("")}
      ${selectControl("roofDirection", "Direção de abertura", directions, state)}
      ${toggleControl("showFurniture", "Mostrar mobiliário", state)}
      ${toggleControl("sofaBedOpen", "Sofá-cama aberto", state)}
    </section>`;
}

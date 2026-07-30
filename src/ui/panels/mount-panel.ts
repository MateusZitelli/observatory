import type { ObservatoryState } from "../../domain/types";
import { rangeControl, toggleControl } from "../controls";
import type { RangeSpec } from "../control-types";

const dimensions: readonly RangeSpec[] = [
  { key: "baseOffset", label: "Offset da base", min: 0, max: 0.3, step: 0.005, unit: " m" },
  { key: "rightAscensionOffset", label: "Eixo RA", min: 0.1, max: 0.6, step: 0.01, unit: " m" },
  { key: "declinationOffset", label: "Eixo Dec", min: 0.1, max: 0.8, step: 0.01, unit: " m", tone: "yellow" },
  { key: "counterweightOffset", label: "Contrapeso", min: 0.2, max: 1, step: 0.01, unit: " m" },
  { key: "tubeLength", label: "Comprimento do tubo", min: 0.3, max: 1.2, step: 0.001, unit: " m", precision: 3 },
  { key: "tubeOffset", label: "Offset do tubo", min: -0.2, max: 0.2, step: 0.001, unit: " m", precision: 3 },
  { key: "eyepieceLength", label: "Extensão da ocular", min: 0, max: 0.25, step: 0.01, unit: " m" },
  { key: "tubeDiameter", label: "Diâmetro do tubo", min: 0.1, max: 0.5, step: 0.001, unit: " m", precision: 3 },
];

export function mountPanel(state: ObservatoryState): string {
  return `
    <section class="panel-section" data-panel="plan">
      <h2>Geometria da montagem</h2>
      ${dimensions.map((control) => rangeControl(control, state)).join("")}
    </section>
    <section class="panel-section" data-panel="motion">
      <h2>Movimento dos motores</h2>
      ${rangeControl(raControl, state)}
      ${rangeControl(decControl, state)}
      ${toggleControl("showVolume", "Mostrar volume varrido", state)}
    </section>`;
}

const raControl: RangeSpec = {
  key: "rightAscension", label: "Eixo RA", min: 0, max: 360, step: 1, unit: "°",
};
const decControl: RangeSpec = {
  key: "declination", label: "Eixo Dec", min: -90, max: 90, step: 1, unit: "°", tone: "yellow",
};

import type { ObservatoryState } from "../../domain/types";
import { rangeControl, toggleControl } from "../controls";
import type { RangeSpec } from "../control-types";

const skyHour: RangeSpec = {
  key: "skyHour", label: "Hora local", min: -1, max: 23.75, step: 0.25, unit: " h", tone: "blue",
};
const skyDay: RangeSpec = {
  key: "skyDay", label: "Dia do ano", min: -1, max: 365, step: 1, unit: "", tone: "blue",
};
const rotation: RangeSpec = {
  key: "panoramaRotation", label: "Rotação do panorama", min: 0, max: 360, step: 1, unit: "°",
};

export function skyPanel(state: ObservatoryState): string {
  return `
    <section class="panel-section" data-panel="sky">
      <h2>Mapa do céu</h2>
      ${rangeControl(skyHour, state)}
      ${rangeControl(skyDay, state)}
      ${toggleControl("showGemOverlay", "Configurações GEM", state)}
      ${toggleControl("showBlockOverlay", "Bloqueios do observatório", state)}
      ${toggleControl("showMeridianOverlay", "Meridiano e limites", state)}
      <label class="file-control">Panorama 360°
        <input data-action="panorama" type="file" accept="image/*" />
      </label>
      ${rangeControl(rotation, state)}
    </section>`;
}

import type { Geometry, ObservatoryState } from "../../domain/types";

export function resultsPanel(state: ObservatoryState, geometry: Geometry): string {
  const status = collisionStatus(state, geometry);
  return `
    <section class="results">
      <h2>Limites do telescópio</h2>
      <div class="results__grid">
        ${metric("Teto mínimo", geometry.sweptTop, "m")}
        ${metric("Raio limite", geometry.sweptRadius, "m")}
        ${metric("Ocular baixa", geometry.eyeLowest, "m")}
        ${metric("Ocular alta", geometry.eyeHighest, "m")}
      </div>
      <div class="elevation">
        <span>Elevação mínima observável</span>
        <strong data-result="elevation">${geometry.minimumElevation.toFixed(1)}°</strong>
      </div>
      <p class="clearance clearance--${status.tone}" data-result="clearance">
        ${status.label}
      </p>
    </section>`;
}

function metric(label: string, value: number, unit: string): string {
  const key = label.toLowerCase().replaceAll(" ", "-");
  return `
    <div class="metric">
      <span>${label}</span>
      <strong data-result="${key}">${value.toFixed(2)} ${unit}</strong>
    </div>`;
}

export function collisionStatus(
  state: ObservatoryState,
  geometry: Geometry,
): { label: string; tone: "danger" | "safe" | "warning" } {
  const halfWidth = state.roomWidth / 2;
  const halfDepth = state.roomDepth / 2;
  if (geometry.sweptRadius > Math.min(halfWidth, halfDepth)) {
    return { label: "Volume varrido intercepta uma parede", tone: "danger" };
  }
  if (geometry.sweptTop > geometry.ridgeHeight) {
    return { label: "Volume varrido intercepta a cumeeira", tone: "danger" };
  }
  if (geometry.sweptTop > state.roomHeight) {
    return { label: "Atenção à água baixa do telhado", tone: "warning" };
  }
  return { label: "Folgas geométricas livres", tone: "safe" };
}

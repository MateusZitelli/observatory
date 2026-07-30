import type { ViewId } from "../domain/types";

type Tab = {
  id: ViewId;
  label: string;
};

const tabs: readonly Tab[] = [
  { id: "telescope", label: "Telescópio 3D" },
  { id: "room", label: "Cômodo 3D" },
  { id: "plan", label: "Planta 2D" },
  { id: "sky", label: "Mapa do céu" },
  { id: "project", label: "Projeto" },
];

export function tabMarkup(): string {
  return tabs.map((tab, index) => `
    <button class="tab" data-view="${tab.id}" aria-selected="${index === 0}">
      ${tab.label}
    </button>`).join("");
}

export function updateTabs(root: HTMLElement, view: ViewId): void {
  root.querySelectorAll<HTMLElement>("[data-view]").forEach((element) => {
    element.setAttribute("aria-selected", String(element.dataset["view"] === view));
  });
  root.querySelectorAll<HTMLElement>("[data-panel]").forEach((element) => {
    element.hidden = !panelSupportsView(element.dataset["panel"], view);
  });
}

function panelSupportsView(panel: string | undefined, view: ViewId): boolean {
  if (panel === "motion") return view === "telescope" || view === "room";
  return panel === view;
}

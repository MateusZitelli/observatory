import { projectAreas } from "./project-layout";
import { drawFloorPlan } from "./project-plan";
import { drawSection } from "./project-section";
import { label } from "./primitives";
import { clearSurface } from "./surface";
import type { CanvasFrame } from "./types";

export function paintProject(frame: CanvasFrame): void {
  const { context, snapshot, viewport } = frame;
  clearSurface(context, viewport, "#07111f");
  label(context, "PROJETO ARQUITETÔNICO", { x: 18, y: 25 }, { color: "#f8fafc" });
  label(context, "Planta cotada e cortes técnicos", { x: 18, y: 43 }, {
    color: "#94a3b8",
  });
  const areas = projectAreas(viewport);
  drawFloorPlan(context, areas.floorPlan, snapshot.state, snapshot.geometry);
  drawSection(context, areas.northSouth, snapshot, "northSouth");
  drawSection(context, areas.eastWest, snapshot, "eastWest");
}
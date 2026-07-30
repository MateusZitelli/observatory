import type { Geometry, ObservatoryState } from "../domain/types";
import { drawFurniture, drawPlanDimensions, drawRoofDirection } from "./project-plan-details";
import {
  drawProjectFrame, projectProjection, type DrawingArea, type ProjectProjection,
} from "./project-layout";
import { circle, label, polygon } from "./primitives";

export function drawFloorPlan(
  context: CanvasRenderingContext2D,
  area: DrawingArea,
  state: ObservatoryState,
  geometry: Geometry,
): void {
  drawProjectFrame(context, area, "PLANTA BAIXA");
  const projection = projectProjection(area, state.roomWidth + 0.8, state.roomDepth + 0.8);
  drawRoom(context, projection, state);
  drawPier(context, projection, state, geometry);
  drawFurniture(context, projection, state);
  drawPlanDimensions(context, projection, state);
  drawRoofDirection(context, projection, state);
}

function drawRoom(
  context: CanvasRenderingContext2D,
  projection: ProjectProjection,
  state: ObservatoryState,
): void {
  const halfWidth = state.roomWidth / 2;
  const points = [
    projection.point({ x: -halfWidth, y: 0 }),
    projection.point({ x: halfWidth, y: 0 }),
    projection.point({ x: halfWidth, y: state.roomDepth }),
    projection.point({ x: -halfWidth, y: state.roomDepth }),
  ];
  context.save();
  context.lineWidth = 5;
  polygon(context, points, "rgba(30, 41, 59, 0.35)", "#94a3b8");
  context.restore();
}

function drawPier(
  context: CanvasRenderingContext2D,
  projection: ProjectProjection,
  state: ObservatoryState,
  geometry: Geometry,
): void {
  const center = projection.point({ x: 0, y: state.roomDepth / 2 });
  context.save();
  context.setLineDash([5, 4]);
  circle(context, center, geometry.sweptRadius * projection.scale, {
    fill: "rgba(59, 130, 246, 0.08)", stroke: "#3b82f6",
  });
  context.restore();
  circle(context, center, state.pierDiameter / 2 * projection.scale, {
    fill: "#64748b", stroke: "#e2e8f0",
  });
  label(context, "PILAR", { x: center.x, y: center.y + 4 }, { align: "center" });
}
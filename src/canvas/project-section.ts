import type { AppSnapshot, ObservatoryState } from "../domain/types";
import {
  drawEquipment, drawSectionDimensions, drawSectionObserver, type SectionModel,
} from "./project-section-details";
import {
  drawProjectFrame, projectProjection, type DrawingArea,
} from "./project-layout";
import { line, polygon } from "./primitives";

export type SectionAxis = "northSouth" | "eastWest";

export function drawSection(
  context: CanvasRenderingContext2D,
  area: DrawingArea,
  snapshot: AppSnapshot,
  axis: SectionAxis,
): void {
  const span = axis === "northSouth" ? snapshot.state.roomDepth : snapshot.state.roomWidth;
  const title = axis === "northSouth" ? "CORTE N–S" : "CORTE L–O";
  drawProjectFrame(context, area, title);
  const projection = projectProjection(area, span + 0.8, snapshot.geometry.ridgeHeight + 0.6);
  const model = { geometry: snapshot.geometry, projection, span, state: snapshot.state };
  drawEnvelope(context, model, hasGable(snapshot.state, axis));
  drawEquipment(context, model);
  drawSectionObserver(context, model, axis);
  drawSectionDimensions(context, model);
}

function drawEnvelope(
  context: CanvasRenderingContext2D,
  model: SectionModel,
  gable: boolean,
): void {
  const { projection, span, state, geometry } = model;
  const half = span / 2;
  const room = [projection.point({ x: -half, y: 0 }),
    projection.point({ x: half, y: 0 }), projection.point({ x: half, y: state.roomHeight }),
    projection.point({ x: -half, y: state.roomHeight })];
  polygon(context, room, "rgba(30, 41, 59, 0.25)", "#94a3b8");
  const left = projection.point({ x: -half - 0.15, y: state.roomHeight });
  const right = projection.point({ x: half + 0.15, y: state.roomHeight });
  if (!gable) {
    line(context, left, right, { color: "#f59e0b", width: 5 });
    return;
  }
  const ridge = projection.point({ x: 0, y: geometry.ridgeHeight });
  line(context, left, ridge, { color: "#f59e0b", width: 5 });
  line(context, ridge, right, { color: "#f59e0b", width: 5 });
}

function hasGable(state: ObservatoryState, axis: SectionAxis): boolean {
  const ridgeRunsEastWest = state.roofDirection === "L" || state.roofDirection === "O";
  return axis === "northSouth" ? ridgeRunsEastWest : !ridgeRunsEastWest;
}
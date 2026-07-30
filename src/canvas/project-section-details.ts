import type { Geometry, ObservatoryState } from "../domain/types";
import { dimension } from "./dimensions";
import type { ProjectProjection } from "./project-layout";
import { circle, label, line } from "./primitives";
import type { SectionAxis } from "./project-section";

export type SectionModel = {
  geometry: Geometry;
  projection: ProjectProjection;
  span: number;
  state: ObservatoryState;
};

export function drawEquipment(
  context: CanvasRenderingContext2D,
  model: SectionModel,
): void {
  const { projection, state, geometry } = model;
  const ground = projection.point({ x: 0, y: 0 });
  const pillar = projection.point({ x: 0, y: state.concreteHeight });
  const pivot = projection.point({ x: state.pivotOffset, y: geometry.mountPivotHeight });
  line(context, ground, pillar, {
    color: "#cbd5e1", width: Math.max(8, state.pierDiameter * projection.scale),
  });
  line(context, pillar, pivot, { color: "#64748b", width: 8 });
  context.save();
  context.setLineDash([5, 4]);
  circle(context, pivot, geometry.sweptRadius * projection.scale, {
    fill: "rgba(59, 130, 246, 0.08)", stroke: "#3b82f6",
  });
  context.restore();
  circle(context, pivot, 5, { fill: "#ef4444" });
}

export function drawSectionObserver(
  context: CanvasRenderingContext2D,
  model: SectionModel,
  axis: SectionAxis,
): void {
  if (!model.state.showObserver) return;
  const position = axis === "northSouth" ? model.state.observerZ : model.state.observerX;
  const height = model.state.observerPosture === "standing" ? 1.7 : 1.15;
  const feet = model.projection.point({ x: position, y: 0 });
  const head = model.projection.point({ x: position, y: height });
  line(context, feet, head, { color: "#22c55e", width: 3 });
  circle(context, head, 5, { fill: "#86efac" });
}

export function drawSectionDimensions(
  context: CanvasRenderingContext2D,
  model: SectionModel,
): void {
  const { projection, span, state, geometry } = model;
  const half = span / 2;
  dimension(context, projection.point({ x: -half, y: -0.1 }),
    projection.point({ x: half, y: -0.1 }), { text: `${span.toFixed(2)} m`, offset: 0 });
  dimension(context, projection.point({ x: half + 0.12, y: 0 }),
    projection.point({ x: half + 0.12, y: state.roomHeight }), {
      text: `${state.roomHeight.toFixed(2)} m`, offset: 0,
    });
  label(context, `Cumeeira ${geometry.ridgeHeight.toFixed(2)} m`,
    projection.point({ x: 0, y: geometry.ridgeHeight + 0.12 }), {
      align: "center", color: "#fbbf24",
    });
}
import type { ObservatoryState, RoofDirection } from "../domain/types";
import { dimension } from "./dimensions";
import type { ProjectProjection } from "./project-layout";
import { label, line, polygon, type Point } from "./primitives";

export function drawFurniture(
  context: CanvasRenderingContext2D,
  projection: ProjectProjection,
  state: ObservatoryState,
): void {
  if (!state.showFurniture) return;
  const halfWidth = state.roomWidth / 2;
  const sofaWidth = Math.min(1.8, state.roomWidth - 0.5);
  const sofaDepth = state.sofaBedOpen ? 1.35 : 0.75;
  const origin = { x: -halfWidth + 0.2, y: 0.2 };
  polygon(context, rectangle(projection, origin, sofaWidth, sofaDepth),
    "rgba(20, 184, 166, 0.18)", "#14b8a6");
  label(context, "SOFÁ", projection.point({
    x: origin.x + sofaWidth / 2, y: origin.y + sofaDepth / 2,
  }), { align: "center", color: "#5eead4" });
}

export function drawPlanDimensions(
  context: CanvasRenderingContext2D,
  projection: ProjectProjection,
  state: ObservatoryState,
): void {
  const halfWidth = state.roomWidth / 2;
  dimension(context, projection.point({ x: -halfWidth, y: -0.12 }),
    projection.point({ x: halfWidth, y: -0.12 }), {
      text: `${state.roomWidth.toFixed(2)} m`, offset: 0,
    });
  dimension(context, projection.point({ x: halfWidth + 0.12, y: 0 }),
    projection.point({ x: halfWidth + 0.12, y: state.roomDepth }), {
      text: `${state.roomDepth.toFixed(2)} m`, offset: 0,
    });
}

export function drawRoofDirection(
  context: CanvasRenderingContext2D,
  projection: ProjectProjection,
  state: ObservatoryState,
): void {
  const center = { x: 0, y: state.roomDepth / 2 };
  const vector = roofVector(state.roofDirection);
  const length = Math.min(state.roomWidth, state.roomDepth) * 0.28;
  const from = projection.point(center);
  const to = projection.point({ x: center.x + vector.x * length, y: center.y + vector.y * length });
  line(context, from, to, { color: "#f59e0b", width: 3 });
  label(context, `TELHADO ${state.roofOpen.toFixed(0)}%`, to, {
    align: "center", color: "#fbbf24",
  });
}

function rectangle(
  projection: ProjectProjection,
  origin: Point,
  width: number,
  height: number,
): Point[] {
  const points = [origin, { x: origin.x + width, y: origin.y },
    { x: origin.x + width, y: origin.y + height },
    { x: origin.x, y: origin.y + height }];
  return points.map((point) => projection.point(point));
}

function roofVector(direction: RoofDirection): Point {
  if (direction === "N") return { x: 0, y: 1 };
  if (direction === "S") return { x: 0, y: -1 };
  if (direction === "L") return { x: 1, y: 0 };
  return { x: -1, y: 0 };
}
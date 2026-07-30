import { clearSurface } from "./surface";
import { dimension } from "./dimensions";
import { metricProjection, type MetricProjection } from "./metric-projection";
import { circle, label, line, polygon } from "./primitives";
import { planGeometry, type PlanGeometry } from "./plan-geometry";
import type { CanvasFrame } from "./types";

export function paintPlan(frame: CanvasFrame): void {
  clearSurface(frame.context, frame.viewport, "#07111f");
  const { context, snapshot, viewport } = frame;
  const state = snapshot.state;
  const projection = metricProjection(
    viewport.width,
    viewport.height,
    {
      horizontalSpan: Math.max(3, state.roomDepth),
      verticalSpan: Math.max(2.8, snapshot.geometry.ridgeHeight),
    },
  );
  drawRoom(context, projection, state.roomDepth, state.roomHeight);
  const geometry = planGeometry(state);
  drawMount(context, projection, geometry, state.tubeDiameter * projection.scale);
  drawMeasurements(context, projection, geometry, state.concreteHeight);
  label(context, "VISTA DE PERFIL · GEM", { x: 24, y: 32 }, { color: "#e2e8f0" });
  label(context, `Polo ${Math.abs(state.latitude).toFixed(1)}°`, {
    x: 24, y: 52,
  }, { color: "#f59e0b" });
}

function drawRoom(
  context: CanvasRenderingContext2D,
  projection: MetricProjection,
  depth: number,
  height: number,
): void {
  const half = depth / 2;
  const points = [
    projection.point({ x: -half, y: 0 }),
    projection.point({ x: -half, y: height }),
    projection.point({ x: half, y: height }),
    projection.point({ x: half, y: 0 }),
  ];
  polygon(context, points, "rgba(30, 41, 59, 0.18)", "#334155");
  line(context, projection.point({ x: -half - 0.3, y: 0 }), projection.point({
    x: half + 0.3, y: 0,
  }), { color: "#475569", width: 3 });
}

function drawMount(
  context: CanvasRenderingContext2D,
  projection: MetricProjection,
  geometry: PlanGeometry,
  tubeWidth: number,
): void {
  const map = projection.point;
  line(context, map(geometry.ground), map(geometry.pillarTop), {
    color: "#cbd5e1", width: 26,
  });
  line(context, map(geometry.pillarTop), map(geometry.extensionTop), {
    color: "#64748b", width: 12,
  });
  line(context, map(geometry.extensionTop), map(geometry.pivot), {
    color: "#334155", width: 10,
  });
  line(context, map(geometry.polarBase), map(geometry.declinationJoint), {
    color: "#3b82f6", width: 7,
  });
  line(context, map(geometry.counterweight), map(geometry.tubeCenter), {
    color: "#eab308", width: 7,
  });
  line(context, map(geometry.tubeBack), map(geometry.tubeFront), {
    color: "#e2e8f0", width: Math.max(8, tubeWidth),
  });
  circle(context, map(geometry.pivot), 6, { fill: "#ef4444" });
  circle(context, map(geometry.counterweight), 12, { fill: "#111827", stroke: "#94a3b8" });
}

function drawMeasurements(
  context: CanvasRenderingContext2D,
  projection: MetricProjection,
  geometry: PlanGeometry,
  pillarHeight: number,
): void {
  const map = projection.point;
  dimension(context, map(geometry.ground), map(geometry.pillarTop), {
    text: `${pillarHeight.toFixed(2)} m`, offset: -36,
  });
  dimension(context, map(geometry.tubeBack), map(geometry.tubeFront), {
    text: "TUBE_LEN", offset: 22,
  });
}

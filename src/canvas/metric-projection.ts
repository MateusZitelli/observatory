import type { Point } from "./primitives";

export type MetricProjection = {
  point: (point: Point) => Point;
  scale: number;
};

type MetricProjectionSpans = {
  horizontalSpan: number;
  verticalSpan: number;
  groundRatio?: number;
};

export function metricProjection(
  width: number,
  height: number,
  spans: MetricProjectionSpans,
): MetricProjection {
  const { horizontalSpan, verticalSpan, groundRatio = 0.82 } = spans;
  const scale = Math.min(width * 0.78 / horizontalSpan, height * 0.72 / verticalSpan);
  const centerX = width / 2;
  const groundY = height * groundRatio;
  return {
    scale,
    point: (point) => ({
      x: centerX + point.x * scale,
      y: groundY - point.y * scale,
    }),
  };
}

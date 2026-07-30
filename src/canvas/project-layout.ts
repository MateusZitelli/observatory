import { label, type Point } from "./primitives";
import type { CanvasViewport } from "./types";

export type DrawingArea = { x: number; y: number; width: number; height: number };
export type ProjectAreas = {
  floorPlan: DrawingArea;
  northSouth: DrawingArea;
  eastWest: DrawingArea;
};
export type ProjectProjection = {
  point: (point: Point) => Point;
  scale: number;
};

const margin = 16;
const gap = 12;
const headerHeight = 54;

export function projectAreas(viewport: CanvasViewport): ProjectAreas {
  const width = viewport.width - margin * 2;
  const height = viewport.height - headerHeight - margin;
  if (viewport.width >= 760) return wideAreas(width, height);
  return stackedAreas(width, height);
}

export function projectProjection(
  area: DrawingArea,
  horizontalSpan: number,
  verticalSpan: number,
): ProjectProjection {
  const padding = 28;
  const titleSpace = 26;
  const width = Math.max(1, area.width - padding * 2);
  const height = Math.max(1, area.height - padding - titleSpace);
  const scale = Math.min(width / horizontalSpan, height / verticalSpan);
  const centerX = area.x + area.width / 2;
  const groundY = area.y + area.height - 16;
  return {
    scale,
    point: (point) => ({ x: centerX + point.x * scale, y: groundY - point.y * scale }),
  };
}

export function drawProjectFrame(
  context: CanvasRenderingContext2D,
  area: DrawingArea,
  title: string,
): void {
  context.fillStyle = "rgba(15, 23, 42, 0.7)";
  context.fillRect(area.x, area.y, area.width, area.height);
  context.strokeStyle = "#334155";
  context.strokeRect(area.x, area.y, area.width, area.height);
  label(context, title, { x: area.x + 12, y: area.y + 19 }, { color: "#e2e8f0" });
}

function wideAreas(width: number, height: number): ProjectAreas {
  const leftWidth = (width - gap) * 0.52;
  const rightWidth = width - gap - leftWidth;
  const sectionHeight = (height - gap) / 2;
  return {
    floorPlan: { x: margin, y: headerHeight, width: leftWidth, height },
    northSouth: {
      x: margin + leftWidth + gap, y: headerHeight, width: rightWidth, height: sectionHeight,
    },
    eastWest: {
      x: margin + leftWidth + gap, y: headerHeight + sectionHeight + gap,
      width: rightWidth, height: sectionHeight,
    },
  };
}

function stackedAreas(width: number, height: number): ProjectAreas {
  const drawingHeight = (height - gap * 2) / 3;
  return {
    floorPlan: { x: margin, y: headerHeight, width, height: drawingHeight },
    northSouth: {
      x: margin, y: headerHeight + drawingHeight + gap, width, height: drawingHeight,
    },
    eastWest: {
      x: margin, y: headerHeight + (drawingHeight + gap) * 2, width, height: drawingHeight,
    },
  };
}
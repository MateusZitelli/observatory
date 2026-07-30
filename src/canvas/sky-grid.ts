import { label, line } from "./primitives";
import type { SkyProjection } from "./sky-projection";

const elevations = [0, 15, 30, 45, 60, 75] as const;
const cardinals = [
  { azimuth: 0, name: "N" },
  { azimuth: 90, name: "L" },
  { azimuth: 180, name: "S" },
  { azimuth: 270, name: "O" },
] as const;

export function drawSkyGrid(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
): void {
  context.strokeStyle = "#334155";
  context.lineWidth = 1;
  for (const elevation of elevations) {
    context.beginPath();
    context.arc(
      projection.center.x,
      projection.center.y,
      projection.radial(elevation),
      0,
      Math.PI * 2,
    );
    context.stroke();
    if (elevation > 0) labelElevation(context, projection, elevation);
  }
  for (let azimuth = 0; azimuth < 360; azimuth += 45) {
    line(context, projection.center, projection.point(azimuth, 0), { color: "#334155" });
  }
  for (const cardinal of cardinals) {
    const point = projection.point(cardinal.azimuth, -5);
    label(context, cardinal.name, { x: point.x, y: point.y + 5 }, {
      align: "center", color: "#cbd5e1",
    });
  }
  label(context, "Zênite", {
    x: projection.center.x + 6,
    y: projection.center.y - 6,
  }, { color: "#64748b" });
}

function labelElevation(
  context: CanvasRenderingContext2D,
  projection: SkyProjection,
  elevation: number,
): void {
  label(context, `${elevation}°`, {
    x: projection.center.x + 4,
    y: projection.center.y - projection.radial(elevation) + 12,
  }, { color: "#64748b" });
}

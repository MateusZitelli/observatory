import { toRadians } from "../astronomy/angles";
import type { Point } from "./primitives";

export type SkyProjection = {
  center: Point;
  radius: number;
  point: (azimuth: number, altitude: number) => Point;
  radial: (altitude: number) => number;
};

export function skyProjection(width: number, height: number): SkyProjection {
  const radius = Math.max(24, Math.min(width, height) * 0.4);
  const center = { x: width / 2, y: height / 2 };
  const radial = (altitude: number): number => radius * (1 - altitude / 90);
  return {
    center,
    radius,
    radial,
    point: (azimuth, altitude) => {
      const distance = radial(altitude);
      const angle = toRadians(azimuth - 90);
      return {
        x: center.x + Math.cos(angle) * distance,
        y: center.y + Math.sin(angle) * distance,
      };
    },
  };
}

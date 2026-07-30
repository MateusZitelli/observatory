import { toDegrees, toRadians, wrapDegrees } from "./angles";
import type { EquatorialCoordinate, HorizontalCoordinate } from "./types";

export function equatorialToHorizontal(
  coordinate: EquatorialCoordinate,
  latitude: number,
  siderealDegrees: number,
): HorizontalCoordinate {
  const declination = toRadians(coordinate.declination);
  const observerLatitude = toRadians(latitude);
  const hourAngle = toRadians(siderealDegrees - coordinate.rightAscension);
  const altitude = Math.asin(
    Math.sin(declination) * Math.sin(observerLatitude)
      + Math.cos(declination) * Math.cos(observerLatitude) * Math.cos(hourAngle),
  );
  const azimuth = Math.atan2(
    -Math.cos(declination) * Math.sin(hourAngle),
    Math.sin(declination) * Math.cos(observerLatitude)
      - Math.cos(declination) * Math.sin(observerLatitude) * Math.cos(hourAngle),
  );
  return { altitude: toDegrees(altitude), azimuth: wrapDegrees(toDegrees(azimuth)) };
}

export function celestialEquator(
  latitude: number,
  siderealDegrees: number,
): readonly HorizontalCoordinate[] {
  return Array.from({ length: 73 }, (_, index) => equatorialToHorizontal(
    { rightAscension: index * 5 + siderealDegrees, declination: 0 },
    latitude,
    siderealDegrees,
  ));
}

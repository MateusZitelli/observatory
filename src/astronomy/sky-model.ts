import { equatorialToHorizontal } from "./coordinates";
import { BRIGHT_STARS } from "./stars";
import { localSiderealDegrees, observationDate } from "./time";
import type { ObservatoryState } from "../domain/types";
import type { ObservatorySite, PositionedStar } from "./types";

export type SkyModel = {
  date: Date;
  siderealDegrees: number;
  stars: readonly PositionedStar[];
};

export function createSkyModel(
  state: ObservatoryState,
  site: ObservatorySite,
  now = new Date(),
): SkyModel {
  const date = observationDate(state.skyHour, state.skyDay, site, now);
  const siderealDegrees = localSiderealDegrees(date, site.longitude);
  const latitude = state.latitude;
  const stars = BRIGHT_STARS.map((star) =>
    positionStar(star, latitude, siderealDegrees),
  ).filter((star) => star.altitude >= 0);
  return { date, siderealDegrees, stars };
}

function positionStar(
  star: (typeof BRIGHT_STARS)[number],
  latitude: number,
  siderealDegrees: number,
): PositionedStar {
  const horizontal = equatorialToHorizontal(star, latitude, siderealDegrees);
  return {
    name: star.name,
    magnitude: star.magnitude,
    rightAscension: star.rightAscension,
    declination: star.declination,
    azimuth: horizontal.azimuth,
    altitude: horizontal.altitude,
  };
}

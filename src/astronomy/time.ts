import { wrapDegrees } from "./angles";
import type { ObservatorySite } from "./types";

const millisecondsPerDay = 86_400_000;

export function observationDate(
  hour: number,
  day: number,
  site: ObservatorySite,
  now = new Date(),
): Date {
  if (hour < 0 && day < 0) return now;
  const year = now.getFullYear();
  const selectedDay = day < 0 ? dayOfYear(now) : day;
  const localHour = hour < 0 ? localDecimalHour(now, site) : hour;
  const utcHour = localHour - site.utcOffsetHours;
  const start = Date.UTC(year, 0, 1);
  return new Date(start + (selectedDay - 1) * millisecondsPerDay + utcHour * 3_600_000);
}

export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / millisecondsPerDay);
}

export function localSiderealDegrees(date: Date, longitude: number): number {
  const julianDays = date.getTime() / millisecondsPerDay + 2_440_587.5;
  const sinceJ2000 = julianDays - 2_451_545;
  const universalHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return wrapDegrees(100.46 + 0.985_647 * sinceJ2000 + longitude + 15 * universalHours);
}

function localDecimalHour(date: Date, site: ObservatorySite): number {
  const utc = date.getUTCHours() + date.getUTCMinutes() / 60;
  return wrapDegrees((utc + site.utcOffsetHours) * 15) / 15;
}

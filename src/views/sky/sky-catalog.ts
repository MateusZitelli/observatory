import { deepSkyA } from "./sky-deep-catalog-a";
import { deepSkyB } from "./sky-deep-catalog-b";
import { stars } from "./sky-stars-catalog";
import type { DeepSkyObject, SkyCatalog } from "./sky-types";

type Orbit = readonly [string, number, number, number, number, number, number, string];
const orbits: readonly Orbit[] = [
  ["Mercúrio ☿", 252.251, 149472.675, 0.387, 0.2056, 77.46, -0.5, "Difícil de ver, sempre perto do Sol"],
  ["Vênus ♀", 181.980, 58517.816, 0.723, 0.0068, 131.53, -4.0, "Estrela d'alva"],
  ["Marte ♂", 355.433, 19140.299, 1.524, 0.0934, 336.06, 1.0, "Planeta vermelho"],
  ["Júpiter ♃", 34.351, 3034.906, 5.203, 0.0484, 14.33, -2.5, "O gigante, 4 luas visíveis"],
  ["Saturno ♄", 50.077, 1222.114, 9.537, 0.0542, 93.06, 0.7, "Anéis visíveis no telescópio"],
];
type Earth = { readonly x: number; readonly y: number; readonly T: number };
function createEarth(T: number): Earth {
  const L = ((100.464 + 35999.373 * T) % 360) * Math.PI / 180;
  const M = L - 102.94 * Math.PI / 180;
  const e = 0.0167 - 0.00004 * T;
  const C = (2 * e - e * e * e / 4) * Math.sin(M) + 1.25 * e * e * Math.sin(2 * M);
  const v = M + C;
  const r = 1.0 * (1 - e * e) / (1 + e * Math.cos(v));
  const lon = L + C;
  return { x: r * Math.cos(lon), y: r * Math.sin(lon), T };
}
function appendPlanet(deepSky: DeepSkyObject[], orbit: Orbit, earth: Earth, eps: number): void {
  const L = ((orbit[1] + orbit[2] * earth.T) % 360) * Math.PI / 180;
  const wBar = orbit[5] * Math.PI / 180;
  const M = L - wBar;
  const e = orbit[4];
  const C = (2 * e - e * e * e / 4) * Math.sin(M) + 1.25 * e * e * Math.sin(2 * M);
  const v = M + C;
  const r = orbit[3] * (1 - e * e) / (1 + e * Math.cos(v));
  const lon = L + C;
  const x = r * Math.cos(lon) - earth.x, y = r * Math.sin(lon) - earth.y;
  const ecl = Math.atan2(y, x);
  const ra = Math.atan2(Math.sin(ecl) * Math.cos(eps), Math.cos(ecl));
  const dec = Math.asin(Math.sin(ecl) * Math.sin(eps));
  deepSky.push([orbit[0], ((ra * 180 / Math.PI) + 360) % 360, dec * 180 / Math.PI, "planet", orbit[6], orbit[7]]);
}
function appendPlanets(deepSky: DeepSkyObject[], T: number): void {
  const earth = createEarth(T);
  const eps = 23.44 * Math.PI / 180;
  for (const orbit of orbits) appendPlanet(deepSky, orbit, earth, eps);
}
type MoonTerms = { readonly Lp: number; readonly Mm: number; readonly Ms2: number; readonly Fm: number; readonly Dm: number };
function calculateMoonTerms(T: number): MoonTerms {
  const Lp = ((218.316 + 481267.881 * T) % 360 + 360) % 360;
  const Mm = ((134.963 + 477198.868 * T) % 360 + 360) % 360;
  const Ms2 = ((357.529 + 35999.050 * T) % 360 + 360) % 360;
  const Fm = ((93.272 + 483202.018 * T) % 360 + 360) % 360;
  const Dm = ((297.850 + 445267.111 * T) % 360 + 360) % 360;
  return { Dm, Fm, Lp, Mm, Ms2 };
}
function appendMoon(deepSky: DeepSkyObject[], T: number): number {
  const { Dm, Fm, Lp, Mm, Ms2 } = calculateMoonTerms(T);
  const DmR = Dm * Math.PI / 180;
  const FmR = Fm * Math.PI / 180;
  const MmR = Mm * Math.PI / 180;
  const Ms2R = Ms2 * Math.PI / 180;
  const moonLon = Lp + 6.289 * Math.sin(MmR) + 1.274 * Math.sin(2 * DmR - MmR) + 0.658 * Math.sin(2 * DmR) + 0.214 * Math.sin(2 * MmR) - 0.186 * Math.sin(Ms2R) - 0.114 * Math.sin(2 * FmR);
  const moonLat = 5.128 * Math.sin(FmR) + 0.281 * Math.sin(MmR + FmR) + 0.278 * Math.sin(MmR - FmR) + 0.173 * Math.sin(2 * DmR - FmR);
  const eps = 23.44 * Math.PI / 180;
  const lat = moonLat * Math.PI / 180;
  const lon = moonLon * Math.PI / 180;
  const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
  const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
  const phase = (1 - Math.cos(Dm * Math.PI / 180)) / 2;
  const phasePct = Math.round(phase * 100);
  const phaseNames = ["Nova", "Crescente", "Q.Cresc.", "Gibosa+", "Cheia", "Gibosa-", "Q.Ming.", "Minguante"];
  const phaseName = phaseNames[Math.round(((Dm % 360 + 360) % 360) / 45) % 8] ?? "Nova";
  deepSky.push(["Lua ☽ " + phasePct + "% " + phaseName, ((ra * 180 / Math.PI) + 360) % 360, dec * 180 / Math.PI, "moon", -12, "Fase: " + phaseName + " (" + phasePct + "%)"]);
  return Dm;
}
export function createSkyCatalog(dayOfYear: number, skyDayVal: number, now: Date): SkyCatalog {
  const deepSky: DeepSkyObject[] = [...deepSkyA, ...deepSkyB];
  const yr = skyDayVal < 0 ? now.getFullYear() : now.getFullYear();
  const JD = 367 * yr - Math.floor(7 * (yr + Math.floor(10 / 12)) / 4) + Math.floor(275 / 9) + dayOfYear + 1721013.5;
  const T = (JD - 2451545.0) / 36525.0;
  appendPlanets(deepSky, T);
  const moonDm = appendMoon(deepSky, T);
  return { stars, deepSky, moonDm };
}

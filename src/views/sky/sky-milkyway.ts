import type { EquatorialToHorizontal, SkyFrame } from "./sky-types";

type GalacticPath = { readonly frame: SkyFrame; readonly eqToHoriz: EquatorialToHorizontal; readonly bDeg: number; readonly color: string; readonly width: number };
function galacticPosition(eqToHoriz: EquatorialToHorizontal, l: number, bDeg: number): ReturnType<EquatorialToHorizontal> {
  const alphaP = (192.85 * Math.PI) / 180;
  const deltaP = (27.13 * Math.PI) / 180;
  const lOmega = (32.93 * Math.PI) / 180;
  const b = (bDeg * Math.PI) / 180;
  const cosB = Math.cos(b);
  const lml = l - lOmega;
  const sinB = Math.sin(b);
  const cosDp = Math.cos(deltaP);
  const sinDp = Math.sin(deltaP);
  const dec = Math.asin(sinB * cosDp + cosB * sinDp * Math.sin(lml));
  const x = sinB * sinDp - cosB * cosDp * Math.sin(lml);
  const y = cosB * Math.cos(lml);
  const ra = Math.atan2(y, x) + alphaP;
  return eqToHoriz(((ra * 180) / Math.PI + 360) % 360, (dec * 180) / Math.PI);
}
function drawGalacticPath(path: GalacticPath): void {
  const { ctx, skyToXY } = path.frame;
  ctx.strokeStyle = path.color; ctx.lineWidth = path.width; ctx.beginPath();
  let started = false;
  for (let li = 0; li <= 360; li++) {
    const position = galacticPosition(path.eqToHoriz, (li * Math.PI) / 180, path.bDeg);
    if (position.alt < 0) { started = false; continue; }
    const point = skyToXY(position.az, position.alt);
    if (started) ctx.lineTo(point.x, point.y);
    else { ctx.moveTo(point.x, point.y); started = true; }
  }
  ctx.stroke();
}
function evaluateGalacticCenter(): void {
  const alphaP = (192.85 * Math.PI) / 180;
  const deltaP = (27.13 * Math.PI) / 180;
  const lOmega = (32.93 * Math.PI) / 180;
  const l = 0;
  const bR = 0;
  const lml = l - lOmega;
  const cosDp = Math.cos(deltaP);
  const sinDp = Math.sin(deltaP);
  const dec = Math.asin(cosDp * Math.sin(lml));
  const x = -cosDp * Math.sin(lml);
  const y = Math.cos(lml);
  const ra = Math.atan2(Math.cos(0) * Math.cos(lml), Math.sin(0) * sinDp - Math.cos(0) * cosDp * Math.sin(lml)) + alphaP;
  const decDeg = (dec * 180) / Math.PI;
  const raDeg = ((ra * 180) / Math.PI + 360) % 360;
  void bR; void x; void y; void raDeg; void decDeg;
}
function drawGalacticCenter(frame: SkyFrame, eqToHoriz: EquatorialToHorizontal): void {
  evaluateGalacticCenter();
  const position = eqToHoriz(266.4, -29.0);
  if (position.alt <= 0) return;
  const point = frame.skyToXY(position.az, position.alt);
  const { ctx } = frame;
  ctx.fillStyle = "rgba(200, 150, 255, 0.9)"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("✦ Centro Galáctico", point.x, point.y - 8); ctx.beginPath(); ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(200, 150, 255, 0.7)"; ctx.fill();
}
export function drawMilkyWay(frame: SkyFrame, eqToHoriz: EquatorialToHorizontal): void {
  frame.ctx.lineCap = "round"; frame.ctx.setLineDash([]);
  drawGalacticPath({ frame, eqToHoriz, bDeg: 0, color: "rgba(200, 150, 255, 0.5)", width: 8 });
  for (const bDeg of [-8, 8]) drawGalacticPath({ frame, eqToHoriz, bDeg, color: "rgba(200, 150, 255, 0.12)", width: 6 });
  drawGalacticCenter(frame, eqToHoriz);
}

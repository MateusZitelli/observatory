import type { SkyFrame, SkyPoint, TraceRay } from "./sky-types";

type PoleStyle = { readonly color: string; readonly border: string };
function drawPoleMarker(input: { readonly ctx: CanvasRenderingContext2D; readonly point: SkyPoint; readonly style: PoleStyle }): void {
  const { ctx, point, style } = input;
  ctx.beginPath(); ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
  ctx.fillStyle = style.color; ctx.fill(); ctx.strokeStyle = style.border; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(point.x - 12, point.y); ctx.lineTo(point.x + 12, point.y);
  ctx.moveTo(point.x, point.y - 12); ctx.lineTo(point.x, point.y + 12);
  ctx.strokeStyle = style.border; ctx.lineWidth = 1; ctx.stroke();
}
function drawPole(frame: SkyFrame, traceRay: TraceRay): void {
  const { ctx, lat, HTotal, skyToXY } = frame;
  const poleLat = Math.abs(lat);
  const poleAz = lat < 0 ? 180 : 0;
  if (poleLat <= 0 || poleLat > 90) return;
  const point = skyToXY(poleAz, poleLat);
  const poleBlocked = traceRay((poleAz * Math.PI) / 180, (poleLat * Math.PI) / 180, HTotal) !== null;
  const style = { color: poleBlocked ? "#ef4444" : "#22c55e", border: poleBlocked ? "#fca5a5" : "#86efac" };
  drawPoleMarker({ ctx, point, style });
  const poleName = lat < 0 ? "PCS" : "PCN";
  const statusText = poleBlocked ? " BLOQUEADO" : " VISÍVEL";
  ctx.fillStyle = style.color; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(poleName + " (" + poleLat.toFixed(1) + "°)" + statusText, point.x + 14, point.y + 4);
}
function getEquatorPoint(frame: SkyFrame, cosLat: number, sinLat: number, i: number): SkyPoint | null {
  const ha = (i * Math.PI) / 180;
  const alt = Math.asin(cosLat * Math.cos(ha));
  const altDeg = (alt * 180) / Math.PI;
  if (altDeg < 0) return null;
  const A = Math.atan2(Math.sin(ha), Math.cos(ha) * sinLat);
  let azDeg = frame.lat < 0 ? (A * 180) / Math.PI : 180 + (A * 180) / Math.PI;
  azDeg = ((azDeg % 360) + 360) % 360;
  return frame.skyToXY(azDeg, altDeg);
}
function drawEquatorPath(frame: SkyFrame, cosLat: number, sinLat: number): void {
  const { ctx } = frame;
  ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath();
  let eqStarted = false;
  for (let i = 0; i <= 360; i++) {
    const point = getEquatorPoint(frame, cosLat, sinLat, i);
    if (point === null) { eqStarted = false; continue; }
    if (eqStarted) ctx.lineTo(point.x, point.y);
    else { ctx.moveTo(point.x, point.y); eqStarted = true; }
  }
  ctx.stroke(); ctx.setLineDash([]);
}
function drawEquator(frame: SkyFrame): void {
  const { ctx, lat, skyToXY } = frame;
  const latRad = Math.abs(lat) * (Math.PI / 180);
  drawEquatorPath(frame, Math.cos(latRad), Math.sin(latRad));
  const eqMaxElev = 90 - Math.abs(lat);
  const eqP = skyToXY(lat < 0 ? 0 : 180, eqMaxElev);
  ctx.fillStyle = "#22d3ee"; ctx.font = "11px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("Eq. Celeste (" + eqMaxElev.toFixed(1) + "°)", eqP.x + 8, eqP.y - 6);
}
export function drawCelestialReference(frame: SkyFrame, traceRay: TraceRay): void {
  drawPole(frame, traceRay);
  drawEquator(frame);
}

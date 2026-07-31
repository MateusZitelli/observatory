import type { DeepSkyObject, EquatorialToHorizontal, SkyFrame, TraceRay, SkyColors } from "./sky-types";

const dsColors: SkyColors = {
  neb: [244, 114, 182], gal: [167, 139, 250], oc: [96, 165, 250], gc: [251, 191, 36],
  pn: [139, 233, 253], planet: [255, 200, 50], moon: [230, 230, 210],
};
type Moon = { readonly ctx: CanvasRenderingContext2D; readonly x: number; readonly y: number; readonly sz: number; readonly alpha: number; readonly moonDm: number; readonly colStr: string };
function drawMoonLight(moon: Moon, phaseAngle: number): void {
  const { ctx, x, y, sz, alpha } = moon;
  const waxing = phaseAngle < 180;
  ctx.beginPath();
  if (waxing) ctx.arc(x, y, sz, -Math.PI / 2, Math.PI / 2);
  else ctx.arc(x, y, sz, Math.PI / 2, -Math.PI / 2);
  ctx.closePath(); ctx.fillStyle = "rgba(230,230,210," + alpha * 0.9 + ")"; ctx.fill();
  const k = Math.cos(phaseAngle * Math.PI / 180);
  ctx.beginPath(); ctx.ellipse(x, y, Math.abs(k) * sz, sz, 0, 0, 2 * Math.PI);
  ctx.fillStyle = k > 0 ? "rgba(40,40,50," + alpha + ")" : "rgba(230,230,210," + alpha * 0.9 + ")"; ctx.fill();
}
function drawMoon(moon: Moon): void {
  const { ctx, x, y, sz, alpha, colStr, moonDm } = moon;
  const phaseAngle = ((moonDm % 360) + 360) % 360;
  ctx.beginPath(); ctx.arc(x, y, sz, 0, 2 * Math.PI); ctx.fillStyle = "rgba(40,40,50," + alpha + ")"; ctx.fill();
  ctx.strokeStyle = colStr + alpha + ")"; ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.arc(x, y, sz, 0, 2 * Math.PI); ctx.clip();
  drawMoonLight(moon, phaseAngle);
  ctx.restore();
}
type ShapeInput = { readonly ctx: CanvasRenderingContext2D; readonly type: string; readonly x: number; readonly y: number; readonly sz: number; readonly alpha: number; readonly colStr: string; readonly moonDm: number };
function drawPlanet(shape: ShapeInput): void { const { ctx, x, y, sz, alpha, colStr } = shape; ctx.arc(x, y, sz, 0, 2 * Math.PI); ctx.fillStyle = colStr + alpha * 0.6 + ")"; ctx.fill(); ctx.stroke(); }
function drawGalaxy(shape: ShapeInput): void { const { ctx, x, y, sz, alpha, colStr } = shape; ctx.ellipse(x, y, sz, sz * 0.55, 0.4, 0, 2 * Math.PI); ctx.stroke(); ctx.fillStyle = colStr + alpha * 0.2 + ")"; ctx.fill(); }
function drawGlobular(shape: ShapeInput): void { const { ctx, x, y, sz } = shape; ctx.arc(x, y, sz, 0, 2 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - sz, y); ctx.lineTo(x + sz, y); ctx.moveTo(x, y - sz); ctx.lineTo(x, y + sz); ctx.stroke(); }
function drawPlanetary(shape: ShapeInput): void { const { ctx, x, y, sz } = shape; ctx.arc(x, y, sz, 0, 2 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - sz - 3, y); ctx.lineTo(x - sz, y); ctx.moveTo(x + sz, y); ctx.lineTo(x + sz + 3, y); ctx.stroke(); }
function drawOpen(shape: ShapeInput): void { const { ctx, x, y, sz, alpha, colStr } = shape; ctx.rect(x - sz, y - sz, sz * 2, sz * 2); ctx.stroke(); ctx.fillStyle = colStr + alpha * 0.15 + ")"; ctx.fill(); }
function drawShape(shape: ShapeInput): void {
  if (shape.type === "moon") { drawMoon(shape); return; }
  if (shape.type === "planet") { drawPlanet(shape); return; }
  if (shape.type === "gal") { drawGalaxy(shape); return; }
  if (shape.type === "gc") { drawGlobular(shape); return; }
  if (shape.type === "pn") { drawPlanetary(shape); return; }
  drawOpen(shape);
}
type LabelInput = { readonly ctx: CanvasRenderingContext2D; readonly blocked: boolean; readonly name: string; readonly hint: string; readonly x: number; readonly y: number; readonly sz: number; readonly colStr: string };
function drawObjectLabel(label: LabelInput): void {
  const { ctx, blocked, name, hint, x, y, sz, colStr } = label;
  if (blocked) { ctx.fillStyle = colStr + "0.3)"; ctx.font = "8px sans-serif"; ctx.textAlign = "left"; ctx.fillText(name, x + sz + 4, y + 3); return; }
  ctx.fillStyle = colStr + "0.9)"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "left"; ctx.fillText(name, x + sz + 4, y - 2);
  if (hint) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "8px sans-serif"; ctx.fillText(hint, x + sz + 4, y + 8); }
}
type DeepSkyInput = { readonly frame: SkyFrame; readonly traceRay: TraceRay; readonly deepSky: readonly DeepSkyObject[]; readonly eqToHoriz: EquatorialToHorizontal; readonly moonDm: number };
export function drawDeepSky(input: DeepSkyInput): void {
  const objects = [...input.deepSky];
  Array.prototype.sort.call(objects, (a: DeepSkyObject, b: DeepSkyObject) => b[4] - a[4]);
  for (const [name, ra, dec, type, mag, hint] of objects) {
    const pos = input.eqToHoriz(ra, dec);
    if (pos.alt < 0) continue;
    const blocked = input.traceRay((pos.az * Math.PI) / 180, (pos.alt * Math.PI) / 180, input.frame.HTotal);
    const point = input.frame.skyToXY(pos.az, pos.alt);
    const rgb = dsColors[type] ?? [148, 163, 184];
    const alpha = blocked ? 0.25 : 0.9;
    const colStr = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",";
    const sz = type === "moon" ? 10 : type === "planet" ? Math.max(4, 8 - mag) : Math.max(3, 7 - mag * 0.5);
    input.frame.ctx.strokeStyle = colStr + alpha + ")"; input.frame.ctx.lineWidth = blocked ? 1 : 2; input.frame.ctx.beginPath();
    drawShape({ ctx: input.frame.ctx, type, x: point.x, y: point.y, sz, alpha, colStr, moonDm: input.moonDm });
    drawObjectLabel({ ctx: input.frame.ctx, blocked: blocked !== null, name, hint, x: point.x, y: point.y, sz, colStr });
  }
}

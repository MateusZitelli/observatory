import type { SkyFrame, SkyStar, TraceRay, EquatorialToHorizontal } from "./sky-types";

export function drawStars(frame: SkyFrame, traceRay: TraceRay, stars: readonly SkyStar[], eqToHoriz: EquatorialToHorizontal): void {
  const { ctx, skyToXY, HTotal } = frame;
  for (const [name, ra, dec, mag] of stars) {
    const pos = eqToHoriz(ra, dec);
    if (pos.alt < 0) continue;
    const p = skyToXY(pos.az, pos.alt);
    const r = Math.max(1.5, 5 - mag * 1.5);
    const blocked = traceRay((pos.az * Math.PI) / 180, (pos.alt * Math.PI) / 180, HTotal);
    const alpha = blocked ? 0.2 : 1.0;
    ctx.shadowColor = "rgba(255,255,255," + alpha * 0.8 + ")";
    ctx.shadowBlur = blocked ? 0 : r * 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * (blocked ? 0.6 : 1), 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
    ctx.fill();
    ctx.shadowBlur = 0;
    if (mag <= 1.2) {
      ctx.fillStyle = "rgba(255,255,200," + alpha * 0.85 + ")";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(name, p.x + r + 4, p.y + 4);
    }
  }
}

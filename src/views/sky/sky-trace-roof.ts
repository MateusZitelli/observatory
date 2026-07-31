import type { HitType } from "./sky-types";

type RoofRay = {
  readonly lox: number; readonly loz: number; readonly loy: number;
  readonly ldx: number; readonly ldz: number; readonly ldy: number;
  readonly hSpan: number; readonly ridgeH: number; readonly ridgeHalf: number;
  readonly pitchTan: number;
};
type RoofHit = { readonly t: number; readonly type: HitType | "window" };
function collectSlopeHits(ray: RoofRay, hits: RoofHit[]): void {
  for (const side of [1, -1]) {
    const denom = ray.ldy + side * ray.ldx * ray.pitchTan;
    if (Math.abs(denom) < 1e-9) continue;
    const t = (ray.ridgeH - ray.loy - side * ray.lox * ray.pitchTan) / denom;
    if (t <= 0) continue;
    const hx = ray.lox + t * ray.ldx;
    const hy = ray.loy + t * ray.ldy;
    const hz = ray.loz + t * ray.ldz;
    if (side * hx < 0 || Math.abs(hx) > ray.hSpan) continue;
    if (hy < globalThis.state.rH || hy > ray.ridgeH) continue;
    if (Math.abs(hz) > ray.ridgeHalf) continue;
    hits.push({ t, type: "roof" });
  }
}
function collectGableHits(ray: RoofRay, hits: RoofHit[]): void {
  const cutWg = Math.max(globalThis.derived.currentMaxVolR * 2 + 0.2, 1.0);
  const cutHg = Math.min(
    ray.ridgeH - globalThis.state.rH - 0.08,
    Math.max(globalThis.derived.currentMaxVolZ - globalThis.state.rH + 0.15, (ray.ridgeH - globalThis.state.rH) * 0.65),
  );
  for (const gz of [-ray.ridgeHalf, ray.ridgeHalf]) {
    if (Math.abs(ray.ldz) < 1e-9) continue;
    const t = (gz - ray.loz) / ray.ldz;
    if (t <= 0) continue;
    const hx = ray.lox + t * ray.ldx;
    const hy = ray.loy + t * ray.ldy;
    if (hy < globalThis.state.rH || Math.abs(hx) > ray.hSpan) continue;
    const maxH = ray.ridgeH - Math.abs(hx) * ray.pitchTan;
    if (hy > maxH) continue;
    const opening = gz > 0 && Math.abs(hx) < cutWg / 2 && hy < globalThis.state.rH + cutHg;
    if (opening) continue;
    hits.push({ t, type: "roof" });
  }
}
export function collectRoofHits(ray: RoofRay, hits: Array<{ readonly t: number; readonly type: HitType | "window" }>): void {
  collectSlopeHits(ray, hits);
  collectGableHits(ray, hits);
}

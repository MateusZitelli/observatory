import type { UpdateContext } from "./context";

type WorstElevation = { angle: number; wallName: string; dec: number };
function output(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element === null) throw new Error(`Missing output: ${id}`);
  return element;
}
function evaluateWall(worst: WorstElevation, wall: { name: string; d: number }, wa: number, dec: number): void {
  if (wall.d <= 0) return;
  const angle = Math.atan2(wa, wall.d) * (180 / Math.PI);
  if (angle > worst.angle) {
    worst.angle = angle;
    worst.wallName = wall.name;
    worst.dec = dec * (180 / Math.PI);
  }
}

function evaluateAtDeclination(context: UpdateContext, tip: { len: number; dir: number }, dec: number, worst: WorstElevation): void {
  const { lat, Y_DEC, Z_RA, Y_BASE, H_total, X_PIVOT, rW, rD, rH } = context;
  const theta = ((90 - Math.abs(lat)) * Math.PI) / 180;
  const x_dec = Y_DEC;
  const y_dec = tip.dir * tip.len;
  const y_ra0 = y_dec * Math.cos(dec);
  const z_ra0 = y_dec * Math.sin(dec) + Z_RA;
  const x_tilt = x_dec * Math.cos(Math.PI) - y_ra0 * Math.sin(Math.PI);
  const y_tilt = x_dec * Math.sin(Math.PI) + y_ra0 * Math.cos(Math.PI) + Y_BASE;
  const z_tilt = z_ra0;
  const y_w = y_tilt * Math.cos(theta) - z_tilt * Math.sin(theta);
  const z_w = y_tilt * Math.sin(theta) + z_tilt * Math.cos(theta);
  const tipX = x_tilt;
  const tipY = z_w + H_total;
  const tipZ = -y_w - X_PIVOT;
  const wa = rH - tipY;
  if (wa <= 0) return;
  const wallDirs = [
    { name: "Leste", d: rW / 2 - tipX },
    { name: "Oeste", d: rW / 2 + tipX },
    { name: "Sul", d: rD / 2 - tipZ },
    { name: "Norte", d: rD / 2 + tipZ },
  ];
  for (const wall of wallDirs) evaluateWall(worst, wall, wa, dec);
}
function evaluateTip(context: UpdateContext, tip: { len: number; dir: number }, worst: WorstElevation): void {
  for (let j = 0; j <= 72; j++) evaluateAtDeclination(context, tip, (j / 72) * Math.PI - Math.PI / 2, worst);
}

export function updateElevation(context: UpdateContext): void {
  const worst: WorstElevation = { angle: 0, wallName: "", dec: 0 };
  evaluateTip(context, { len: context.Z_FRONT, dir: -1 }, worst);
  evaluateTip(context, { len: context.Z_BACK_TOTAL, dir: 1 }, worst);
  if (worst.angle <= 0) {
    output("outMinElev").innerText = "0.0°";
    output("outMinElevDir").innerText = "Tubo sempre acima das paredes";
  } else {
    output("outMinElev").innerText = worst.angle.toFixed(1) + "°";
    output("outMinElevDir").innerText =
      "Parede " + worst.wallName + " (RA 180°, Dec " + worst.dec.toFixed(0) + "°)";
  }
}

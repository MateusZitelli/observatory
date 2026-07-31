import type { SkyFrame } from "./sky-types";

type PanoramaInput = { readonly pW: number; readonly pH: number; readonly pD: Uint8ClampedArray; readonly panoRot: number };
type PanoramaPixel = { readonly frame: SkyFrame; readonly input: PanoramaInput; readonly out: Uint8ClampedArray; readonly px: number; readonly py: number };
type PanoramaSample = PanoramaPixel & { readonly elev: number; readonly az: number };
function writePanoramaSample(sample: PanoramaSample): void {
  const { frame, input, out, px, py, elev, az } = sample;
  const panoAz = (az + input.panoRot) % 360;
  const srcX = Math.floor((panoAz / 360) * input.pW) % input.pW;
  const srcY = Math.floor(((90 - elev) / 180) * input.pH);
  if (srcX < 0 || srcX >= input.pW || srcY < 0 || srcY >= input.pH) return;
  const outIdx = (py * frame.w + px) * 4;
  const srcIdx = (srcY * input.pW + srcX) * 4;
  const blue = input.pD[srcIdx + 2];
  const green = input.pD[srcIdx + 1];
  const red = input.pD[srcIdx];
  if (red === undefined || green === undefined || blue === undefined) return;
  out[outIdx] = red; out[outIdx + 1] = green; out[outIdx + 2] = blue; out[outIdx + 3] = 180;
}
function drawPanoramaPixel(pixel: PanoramaPixel): void {
  const { frame, input, out, px, py } = pixel;
  const dx = px - frame.cx, dy = py - frame.cy;
  const dist2 = dx * dx + dy * dy;
  if (dist2 > frame.R * frame.R) return;
  const dist = Math.sqrt(dist2), elev = 90 * (1 - dist / frame.R);
  if (elev < 0) return;
  let az = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (az < 0) az += 360;
  writePanoramaSample({ frame, input, out, px, py, elev, az });
}
export function drawPanorama(frame: SkyFrame): void {
  const panoData = globalThis.panoData;
  if (!panoData) return;
  const imgData = frame.ctx.createImageData(frame.w, frame.h);
  const input = { pW: panoData.width, pH: panoData.height, pD: panoData.data, panoRot: globalThis.state.panoRot || 0 };
  for (let py = 0; py < frame.h; py++) {
    for (let px = 0; px < frame.w; px++) drawPanoramaPixel({ frame, input, out: imgData.data, px, py });
  }
  frame.ctx.putImageData(imgData, 0, 0);
}
function drawElevationGrid(frame: SkyFrame): void {
  const { ctx, cx, cy, elevToR } = frame;
  ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
  [0, 15, 30, 45, 60, 75].forEach((elev) => { ctx.beginPath(); ctx.arc(cx, cy, elevToR(elev), 0, 2 * Math.PI); ctx.stroke(); });
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, frame.R, 0, 2 * Math.PI); ctx.stroke();
}
function drawAzimuthGrid(frame: SkyFrame): void {
  const { ctx, cx, cy, skyToXY } = frame;
  ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
  for (let az = 0; az < 360; az += 45) { const p = skyToXY(az, 0); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke(); }
}
function drawElevationLabels(frame: SkyFrame): void {
  const { ctx, cx, cy, elevToR } = frame;
  ctx.fillStyle = "#64748b"; ctx.font = "11px sans-serif"; ctx.textAlign = "left";
  [15, 30, 45, 60, 75].forEach((elev) => {
    ctx.fillText(elev + "°", cx + 4, cy - elevToR(elev) + 12);
  });
}
export function drawSkyGrid(frame: SkyFrame): void {
  drawElevationGrid(frame);
  drawAzimuthGrid(frame);
  drawElevationLabels(frame);
}

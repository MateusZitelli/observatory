import type { SkyFrame } from "./sky-types";

const parseElevation = globalThis.parseFloat;

export function drawMinimumElevation(frame: SkyFrame): void {
  const { ctx, cx, cy, elevToR } = frame;
  const element = document.querySelector<HTMLElement>("#outMinElev");
  if (element === null) throw new Error("Missing element: outMinElev");
  const minElev = parseElevation(element.innerText);
  if (minElev <= 0 || minElev >= 90) return;
  const rr = elevToR(minElev);
  ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2; ctx.setLineDash([8, 4]); ctx.beginPath();
  ctx.arc(cx, cy, rr, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#22c55e"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("Elev. Mín. " + minElev.toFixed(1) + "° (RA 180°)", cx + rr * Math.cos(-0.3) + 6, cy + rr * Math.sin(-0.3));
}
function drawLegendBlocks(ctx: CanvasRenderingContext2D, lx: number, ly: number): void {
  ctx.fillStyle = "rgba(239,68,68,0.35)"; ctx.fillRect(lx, ly - 8, 12, 12);
  ctx.fillStyle = "#94a3b8"; ctx.fillText("Parede bloqueia", lx + 18, ly + 2);
  ctx.fillStyle = "rgba(234,179,8,0.35)"; ctx.fillRect(lx, ly + 8, 12, 12);
  ctx.fillStyle = "#94a3b8"; ctx.fillText("Telhado bloqueia", lx + 18, ly + 18);
  ctx.fillStyle = "#22d3ee"; ctx.fillRect(lx, ly + 28, 12, 3);
  ctx.fillStyle = "#94a3b8"; ctx.fillText("Equador celeste", lx + 18, ly + 36);
  ctx.fillStyle = "rgba(200,150,255,0.5)"; ctx.fillRect(lx, ly + 42, 12, 6);
  ctx.fillStyle = "#94a3b8"; ctx.fillText("Via Láctea", lx + 18, ly + 50);
}
function drawLegendText(input: { readonly ctx: CanvasRenderingContext2D; readonly lx: number; readonly ly: number; readonly eyeLow: number; readonly eyeHigh: number }): void {
  const { ctx, lx, ly, eyeLow, eyeHigh } = input;
  ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif";
  ctx.fillText("Claro = 1 nível | Escuro = ambos", lx, ly + 52);
  ctx.fillText("Baixo: " + eyeLow.toFixed(2) + "m | Alto: " + eyeHigh.toFixed(2) + "m", lx, ly + 64);
}
function drawLegend(frame: SkyFrame, eyeLow: number, eyeHigh: number): void {
  const { ctx, cx, cy, R } = frame;
  const lx = cx - R + 10, ly = cy + R + 30;
  ctx.font = "11px sans-serif"; ctx.textAlign = "left";
  drawLegendBlocks(ctx, lx, ly);
  drawLegendText({ ctx, lx, ly, eyeLow, eyeHigh });
}
export function drawSkyFinish(frame: SkyFrame, eyeLow: number, eyeHigh: number): void {
  const { ctx, cx, lat } = frame;
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "14px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("Mapa do Céu — Lat " + lat.toFixed(1) + "°", cx, 30);
  drawLegend(frame, eyeLow, eyeHigh);
}

import type { SkyFrame } from "./sky-types";

export function drawCardinals(frame: SkyFrame): void {
  const { ctx, cx, cy, skyToXY } = frame;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  const cardinals = [
    { label: "N", az: 0 },
    { label: "L", az: 90 },
    { label: "S", az: 180 },
    { label: "O", az: 270 },
  ];
  cardinals.forEach((c) => {
    const p = skyToXY(c.az, 0);
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    ctx.fillText(c.label, p.x + (dx / d) * 18, p.y + (dy / d) * 18 + 5);
  });
  ctx.fillStyle = "#475569";
  ctx.font = "10px sans-serif";
  ctx.fillText("Zênite", cx + 6, cy - 4);
}

import type { SkyFrame, SkyPoint, SkySnapshot } from "./sky-types";

export function captureSkySnapshot(): SkySnapshot {
  const H_con = globalThis.state.H_con;
  const H_ext = globalThis.state.H_ext;
  const X_PIVOT = globalThis.state.X_PIVOT;
  const Y_MOUNT = globalThis.state.Y_MOUNT;
  const lat = globalThis.state.lat;
  const rW = globalThis.state.rW;
  const rD = globalThis.state.rD;
  const rH = globalThis.state.rH;
  return { H_con, H_ext, X_PIVOT, Y_MOUNT, lat, rW, rD, rH };
}
export function createSkyFrame(snapshot: SkySnapshot): SkyFrame {
  const ctx = globalThis.canvas2D.getContext("2d");
  if (ctx === null) throw new Error("2D canvas context unavailable");
  const w = globalThis.canvas2D.width;
  const h = globalThis.canvas2D.height;
  const uiWidth = 400;
  const cx = (w + uiWidth) / 2;
  const cy = h / 2;
  const R = Math.min((w - uiWidth) / 2, h / 2) * 0.82;
  const { H_con, H_ext, Y_MOUNT, lat } = snapshot;
  const HTotal = H_con + H_ext + Y_MOUNT;
  function elevToR(elev: number): number { return R * (1 - elev / 90); }
  function skyToXY(az: number, elev: number): SkyPoint {
    const r = elevToR(elev);
    const a = ((az - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  return { ctx, w, h, cx, cy, R, lat, HTotal, elevToR, skyToXY };
}

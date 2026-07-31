import type { SkyFrame, SkyPoint, SkySnapshot } from "./sky-types";

export type SkySetup = { readonly frame: SkyFrame; readonly snapshot: SkySnapshot };
function captureSkySnapshot(): SkySnapshot {
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
export function createSkySetup(): SkySetup {
  const ctx = globalThis.canvas2D.getContext("2d");
  const w = globalThis.canvas2D.width;
  const h = globalThis.canvas2D.height;
  if (ctx === null) throw new TypeError("Canvas 2D context unavailable");
  ctx.clearRect(0, 0, w, h);
  const uiWidth = 400;
  const cx = (w + uiWidth) / 2;
  const cy = h / 2;
  const R = Math.min((w - uiWidth) / 2, h / 2) * 0.82;
  const snapshot = captureSkySnapshot();
  const HTotal = snapshot.H_con + snapshot.H_ext + snapshot.Y_MOUNT;
  function elevToR(elev: number): number { return R * (1 - elev / 90); }
  function skyToXY(az: number, elev: number): SkyPoint {
    const r = elevToR(elev);
    const a = ((az - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  const frame = { ctx, w, h, cx, cy, R, lat: snapshot.lat, HTotal, elevToR, skyToXY };
  return { frame, snapshot };
}

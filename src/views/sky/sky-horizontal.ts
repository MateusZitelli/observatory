import type { EquatorialToHorizontal } from "./sky-types";

export function createHorizontalProjection(sinLatR: number, cosLatR: number, LST_deg: number): EquatorialToHorizontal {
  return (raDeg: number, decDeg: number) => {
    const decR = (decDeg * Math.PI) / 180;
    const haR = ((LST_deg - raDeg) * Math.PI) / 180;
    const cosDec = Math.cos(decR), sinDec = Math.sin(decR);
    const cosHA = Math.cos(haR), sinHA = Math.sin(haR);
    const alt = Math.asin(sinDec * sinLatR + cosDec * cosLatR * cosHA);
    const az = Math.atan2(-cosDec * sinHA, sinDec * cosLatR - cosDec * sinLatR * cosHA);
    return { alt: (alt * 180) / Math.PI, az: ((az * 180) / Math.PI + 360) % 360 };
  };
}

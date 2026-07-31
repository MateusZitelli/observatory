export type SkyTime = {
  readonly now: Date;
  readonly dayOfYear: number;
  readonly skyDayVal: number;
  readonly LST_deg: number;
  readonly sinLatR: number;
  readonly cosLatR: number;
};
export function calculateSkyTime(lat: number): SkyTime {
  const latR = lat * (Math.PI / 180);
  const sinLatR = Math.sin(latR);
  const cosLatR = Math.cos(latR);
  const now = new Date();
  const longitude = -46.6;
  const skyHourVal = globalThis.state.skyHour;
  const skyDayVal = globalThis.state.skyDay;
  let utcH: number;
  if (skyHourVal < 0) {
    utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
  } else {
    utcH = (skyHourVal + 3) % 24;
  }
  let dayOfYear: number;
  if (skyDayVal < 0) {
    const yearStart = new Date(now.getFullYear(), 0, 0);
    dayOfYear = Math.floor((Number(now) - Number(yearStart)) / 86400000);
  } else {
    dayOfYear = skyDayVal;
  }
  const LST_deg = (100.46 + 0.985647 * dayOfYear + longitude + utcH * 15 + 360) % 360;
  return { now, dayOfYear, skyDayVal, LST_deg, sinLatR, cosLatR };
}

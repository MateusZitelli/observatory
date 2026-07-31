export type SkyTime = {
  readonly now: Date;
  readonly dayOfYear: number;
  readonly skyDayVal: number;
  readonly LST_deg: number;
};
export function calculateSkyTime(): SkyTime {
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
    dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  } else {
    dayOfYear = skyDayVal;
  }
  const LST_deg = (100.46 + 0.985647 * dayOfYear + longitude + utcH * 15 + 360) % 360;
  return { now, dayOfYear, skyDayVal, LST_deg };
}

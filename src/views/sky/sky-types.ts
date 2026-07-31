export type SkyPoint = { readonly x: number; readonly y: number };
export type HitType = "wall" | "roof";
export type TraceRay = (azRad: number, elevRad: number, originY: number) => HitType | null;
export type SkyFrame = {
  readonly ctx: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;
  readonly cx: number;
  readonly cy: number;
  readonly R: number;
  readonly lat: number;
  readonly HTotal: number;
  readonly elevToR: (elev: number) => number;
  readonly skyToXY: (az: number, elev: number) => SkyPoint;
};
export type SkyStar = readonly [name: string, ra: number, dec: number, magnitude: number];
export type DeepSkyType = "neb" | "gal" | "oc" | "gc" | "pn" | "planet" | "moon";
export type DeepSkyObject = readonly [
  name: string,
  ra: number,
  dec: number,
  type: DeepSkyType,
  magnitude: number,
  hint: string,
];
export type HorizontalPosition = { readonly alt: number; readonly az: number };
export type EquatorialToHorizontal = (raDeg: number, decDeg: number) => HorizontalPosition;
export type SkyCatalog = {
  readonly stars: readonly SkyStar[];
  readonly deepSky: DeepSkyObject[];
  readonly moonDm: number;
};
export type SkyColors = Partial<Record<DeepSkyType, readonly [number, number, number]>>;
export type SkyLayer = { readonly ctx: CanvasRenderingContext2D; readonly originY: number };

declare global {
  var panoImg: HTMLImageElement | null;
  var panoCanvas: HTMLCanvasElement | null;
  var panoData: ImageData | null;
}

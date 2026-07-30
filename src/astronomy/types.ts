export type EquatorialCoordinate = {
  rightAscension: number;
  declination: number;
};

export type HorizontalCoordinate = {
  azimuth: number;
  altitude: number;
};

export type ObservatorySite = {
  name: string;
  latitude: number;
  longitude: number;
  utcOffsetHours: number;
};

export type BrightStar = EquatorialCoordinate & {
  name: string;
  magnitude: number;
};

export type PositionedStar = BrightStar & HorizontalCoordinate;

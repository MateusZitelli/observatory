export type RoofDirection = "N" | "S" | "L" | "O";
export type ObserverPosture = "standing" | "sitting";
export type ViewId = "telescope" | "room" | "plan" | "sky" | "project";

export type ObservatoryState = {
  concreteHeight: number;
  pierDiameter: number;
  extensionHeight: number;
  pivotOffset: number;
  mountHeight: number;
  latitude: number;
  baseOffset: number;
  rightAscensionOffset: number;
  declinationOffset: number;
  counterweightOffset: number;
  tubeLength: number;
  tubeOffset: number;
  eyepieceLength: number;
  tubeDiameter: number;
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  roofOpen: number;
  roofPitch: number;
  roofDirection: RoofDirection;
  rightAscension: number;
  declination: number;
  showFurniture: boolean;
  sofaBedOpen: boolean;
  showVolume: boolean;
  showObserver: boolean;
  observerPosture: ObserverPosture;
  observerX: number;
  observerZ: number;
  skyHour: number;
  skyDay: number;
  panoramaRotation: number;
  showGemOverlay: boolean;
  showBlockOverlay: boolean;
  showMeridianOverlay: boolean;
};

export type Geometry = {
  mountPivotHeight: number;
  tubeRadius: number;
  tubeFront: number;
  tubeBack: number;
  sweptRadius: number;
  sweptTop: number;
  eyeLowest: number;
  eyeHighest: number;
  roofRise: number;
  ridgeHeight: number;
  minimumElevation: number;
};

export type AppSnapshot = {
  state: ObservatoryState;
  geometry: Geometry;
  view: ViewId;
};

const fullCircle = 360;

export const toRadians = (degrees: number): number => degrees * Math.PI / 180;

export const toDegrees = (radians: number): number => radians * 180 / Math.PI;

export function wrapDegrees(degrees: number): number {
  return (degrees % fullCircle + fullCircle) % fullCircle;
}

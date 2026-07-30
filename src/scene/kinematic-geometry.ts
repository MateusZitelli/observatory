import type * as Three from "three";
import { createKinematicSamples, type KinematicSampleInput } from "./kinematic-samples";

export type KinematicGeometryResult = {
  readonly geometry: Three.BufferGeometry;
  readonly maxZ: number;
  readonly minZ: number;
  readonly maxRadius: number;
};
export type KinematicGeometryArguments = readonly [
  H: number,
  Y_DEC: number,
  Z_length: number,
  lat: number,
  isReversed: boolean,
  Z_RA: number,
  X_PIVOT: number,
  Y_BASE: number,
  collisionRadius: number,
];

export type KinematicGeometryGenerator = (
  ...args: KinematicGeometryArguments
) => KinematicGeometryResult;

type GeometryAdjustmentInput = {
  readonly geometry: Three.BufferGeometry;
  readonly H: number;
  readonly X_PIVOT: number;
  readonly collisionRadius: number;
};
type GeometryBounds = {
  readonly maxZ: number;
  readonly minZ: number;
  readonly maxRadius: number;
};
function adjustGeometryVertices(input: GeometryAdjustmentInput): GeometryBounds {
  const { geometry, H, X_PIVOT, collisionRadius } = input;
  const posAttr = geometry.getAttribute("position");
  const normAttr = geometry.getAttribute("normal");
  let maxRadius = -Infinity,
    maxZ = -Infinity,
    minZ = Infinity;
  for (let i = 0; i < posAttr.count; i++) {
    let nx = normAttr.getX(i),
      ny = normAttr.getY(i),
      nz = normAttr.getZ(i);
    const px = posAttr.getX(i),
      py = posAttr.getY(i),
      pz = posAttr.getZ(i);
    const vx = px,
      vy = py - H,
      vz = pz - -X_PIVOT;
    if (vx * nx + vy * ny + vz * nz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const fx = px + nx * collisionRadius,
      fy = py + ny * collisionRadius,
      fz = pz + nz * collisionRadius;
    posAttr.setXYZ(i, fx, fy, fz);
    if (fy > maxZ) maxZ = fy;
    if (fy < minZ) minZ = fy;
    const r = Math.sqrt(fx * fx + fz * fz);
    if (r > maxRadius) maxRadius = r;
  }
  return { maxZ, minZ, maxRadius };
}
export const generateKinematicGeometry: KinematicGeometryGenerator = (...args) => {
  const [H, Y_DEC, Z_length, lat, isReversed, Z_RA, X_PIVOT, Y_BASE, collisionRadius] = args;
  const samples: KinematicSampleInput = {
    H,
    Y_DEC,
    Z_length,
    lat,
    isReversed,
    Z_RA,
    X_PIVOT,
    Y_BASE,
  };
  const { vertices, indices } = createKinematicSamples(samples);
  const geo = new globalThis.THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new globalThis.THREE.Float32BufferAttribute(vertices, 3),
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const bounds = adjustGeometryVertices({ geometry: geo, H, X_PIVOT, collisionRadius });
  geo.computeVertexNormals();
  return { geometry: geo, maxZ: bounds.maxZ, minZ: bounds.minZ, maxRadius: bounds.maxRadius };
};
export function installKinematicGeometryGlobal(): void {
  globalThis.generateKinematicGeometry = generateKinematicGeometry;
}
declare global {
  var generateKinematicGeometry: KinematicGeometryGenerator;
}

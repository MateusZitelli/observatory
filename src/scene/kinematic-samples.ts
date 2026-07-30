export type KinematicSampleInput = {
  readonly H: number;
  readonly Y_DEC: number;
  readonly Z_length: number;
  readonly lat: number;
  readonly isReversed: boolean;
  readonly Z_RA: number;
  readonly X_PIVOT: number;
  readonly Y_BASE: number;
};
type KinematicPointInput = KinematicSampleInput & {
  readonly theta: number;
  readonly ra: number;
  readonly dec: number;
};
type KinematicPoint = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};
export type KinematicSamples = {
  readonly vertices: number[];
  readonly indices: number[];
};
function createKinematicPoint(input: KinematicPointInput): KinematicPoint {
  const {
    H,
    Y_DEC,
    Z_length,
    isReversed,
    Z_RA,
    X_PIVOT,
    Y_BASE,
    theta,
    ra,
    dec,
  } = input;
  const direction = isReversed ? 1 : -1;
  const x_dec = Y_DEC,
    y_dec = direction * Z_length,
    z_dec = 0;
  const x_ra0 = x_dec,
    y_ra0 = y_dec * Math.cos(dec) - z_dec * Math.sin(dec),
    z_ra0 = y_dec * Math.sin(dec) + z_dec * Math.cos(dec);
  const x_ra = x_ra0,
    y_ra = y_ra0,
    z_ra = z_ra0 + Z_RA;
  const x_tilt = x_ra * Math.cos(ra) - y_ra * Math.sin(ra),
    y_tilt = x_ra * Math.sin(ra) + y_ra * Math.cos(ra) + Y_BASE,
    z_tilt = z_ra;
  const x_world0 = x_tilt,
    y_world0 = y_tilt * Math.cos(theta) - z_tilt * Math.sin(theta),
    z_world0 = y_tilt * Math.sin(theta) + z_tilt * Math.cos(theta);
  const x_final = x_world0,
    y_final = z_world0 + H,
    z_final = -y_world0 - X_PIVOT;
  return { x: x_final, y: y_final, z: z_final };
}
function createVertices(input: KinematicSampleInput): number[] {
  const theta = ((90 - Math.abs(input.lat)) * Math.PI) / 180;
  const raSegments = 40;
  const decSegments = 40;
  const vertices: number[] = [];
  for (let i = 0; i <= raSegments; i++) {
    const ra = (i / raSegments) * 2 * Math.PI;
    for (let j = 0; j <= decSegments; j++) {
      const dec = (j / decSegments) * Math.PI - Math.PI / 2;
      const point = createKinematicPoint({ ...input, theta, ra, dec });
      vertices.push(point.x, point.y, point.z);
    }
  }
  return vertices;
}
function addTriangle(indices: number[], a: number, b: number, c: number): void {
  indices.push(a, b, c);
}
function createIndices(): number[] {
  const raSegments = 40;
  const decSegments = 40;
  const indices: number[] = [];
  for (let i = 0; i < raSegments; i++) {
    for (let j = 0; j < decSegments; j++) {
      const a = i * (decSegments + 1) + j;
      const b = i * (decSegments + 1) + j + 1;
      const c = (i + 1) * (decSegments + 1) + j;
      const d = (i + 1) * (decSegments + 1) + j + 1;
      addTriangle(indices, a, b, d);
      addTriangle(indices, a, d, c);
    }
  }
  return indices;
}
export function createKinematicSamples(input: KinematicSampleInput): KinematicSamples {
  const vertices = createVertices(input);
  const indices = createIndices();
  return { vertices, indices };
}

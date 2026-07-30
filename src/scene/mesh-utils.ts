import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  type Material,
} from "three";

export function box(
  material: Material,
  width = 1,
  height = 1,
  depth = 1,
): Mesh {
  return new Mesh(new BoxGeometry(width, height, depth), material);
}

export function cylinder(
  material: Material,
  radius = 1,
  height = 1,
  segments = 24,
): Mesh {
  return new Mesh(
    new CylinderGeometry(radius, radius, height, segments),
    material,
  );
}

export function standard(
  color: number,
  roughness = 0.7,
  metalness = 0,
): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, metalness, roughness });
}

import type * as Three from "three";
import type { AddBox, BoxSpec, WallFrameMaterials } from "./types";

export function createAddBox(
  group: Three.Group,
  materials: WallFrameMaterials,
): AddBox {
  return (box: BoxSpec): void => {
    const { BoxGeometry, EdgesGeometry, LineSegments, Mesh } = globalThis.THREE;
    const geometry = new BoxGeometry(box.width, box.height, box.depth);
    const mesh = new Mesh(geometry, box.material ?? materials.wall);
    mesh.add(new LineSegments(new EdgesGeometry(geometry), materials.edge));
    mesh.position.set(box.x, box.y, box.z);
    group.add(mesh);
  };
}

export function clearWallFrame(group: Three.Group): void {
  while (group.children.length > 0) {
    const child = group.children[0];
    if (!child) break;
    child.traverse((object) => {
      if (
        "geometry" in object
        && object.geometry instanceof globalThis.THREE.BufferGeometry
      ) object.geometry.dispose();
    });
    group.remove(child);
  }
}

import type * as Three from "three";

export function createRoom(): Three.Group {
  const {
    BackSide,
    BoxGeometry,
    EdgesGeometry,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshStandardMaterial,
  } = globalThis.THREE;
  const roomGeometry = new BoxGeometry(1, 1, 1);
  roomGeometry.translate(0, 0.5, 0);
  const room = new Mesh(roomGeometry, new MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.1,
    side: BackSide,
    depthWrite: false,
  }));
  const edges = new LineSegments(
    new EdgesGeometry(roomGeometry),
    new LineBasicMaterial({ color: 0x38bdf8, opacity: 0.5, transparent: true }),
  );
  const group = new Group();
  group.add(room);
  group.add(edges);
  group.visible = false;
  return group;
}

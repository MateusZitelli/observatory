import { Group, type Material } from "three";
import { box, cylinder } from "./mesh-utils";

export type FurnitureMaterials = {
  wood: Material;
  metal: Material;
  sofa: Material;
  bedding: Material;
};

export function buildDesk(materials: FurnitureMaterials): Group {
  const group = new Group();
  const top = box(materials.wood, 1.6, 0.05, 0.7);
  top.position.y = 0.75;
  group.add(top);
  for (const x of [-0.75, 0.75]) {
    for (const z of [-0.3, 0.3]) {
      const leg = box(materials.metal, 0.05, 0.725, 0.05);
      leg.position.set(x, 0.365, z);
      group.add(leg);
    }
  }
  const monitor = box(materials.metal, 0.6, 0.35, 0.04);
  monitor.position.set(0, 1, 0);
  group.add(monitor);
  return group;
}

export function buildChair(materials: FurnitureMaterials): Group {
  const group = new Group();
  const seat = box(materials.sofa, 0.5, 0.08, 0.5);
  const back = box(materials.sofa, 0.5, 0.5, 0.08);
  const pole = cylinder(materials.metal, 0.025, 0.4);
  seat.position.y = 0.5;
  back.position.set(0, 0.75, 0.22);
  pole.position.y = 0.25;
  group.add(seat, back, pole);
  return group;
}

export function buildSofa(materials: FurnitureMaterials): Group {
  const group = new Group();
  const seat = box(materials.sofa, 1.8, 0.42, 0.95);
  const back = box(materials.sofa, 1.8, 0.48, 0.18);
  const leftArm = box(materials.sofa, 0.18, 0.55, 0.95);
  const rightArm = box(materials.sofa, 0.18, 0.55, 0.95);
  seat.position.y = 0.21;
  back.position.set(0, 0.5, 0.39);
  leftArm.position.set(-0.81, 0.28, 0);
  rightArm.position.set(0.81, 0.28, 0);
  group.add(seat, back, leftArm, rightArm);
  return group;
}

export function buildBed(materials: FurnitureMaterials): Group {
  const group = new Group();
  const mattress = box(materials.bedding, 1.8, 0.15, 1.05);
  const first = box(materials.bedding, 0.55, 0.08, 0.35);
  const second = box(materials.bedding, 0.55, 0.08, 0.35);
  mattress.position.y = 0.1;
  first.position.set(-0.42, 0.22, 0.3);
  second.position.set(0.42, 0.22, 0.3);
  group.add(mattress, first, second);
  return group;
}

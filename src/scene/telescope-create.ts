import { Group, type Material } from "three";
import { box, cylinder } from "./mesh-utils";
import { createGemMaterials } from "./palette";
import type { TelescopeParts } from "./types";

export function createTelescope(): TelescopeParts {
  const materials = createGemMaterials();
  const parts = createParts(materials);
  assemble(parts);
  parts.root.name = "equatorial-mount";
  return parts;
}

function createParts(materials: ReturnType<typeof createGemMaterials>): TelescopeParts {
  const root = new Group();
  const tilt = new Group();
  const rightAscension = new Group();
  const declination = new Group();
  const baseRod = cylinder(materials.black);
  const rightAscensionHousing = cylinder(materials.black);
  const declinationHousing = cylinder(materials.black);
  const declinationRing = cylinder(materials.orange);
  const saddle = box(materials.black);
  const dovetail = box(materials.orange);
  const tube = cylinder(materials.black);
  const dewShield = cylinder(materials.dark);
  const rearCell = cylinder(materials.black);
  const eyepiece = cylinder(materials.silver, 1, 1, 16);
  const counterweightShaft = cylinder(materials.silver, 0.015, 1, 16);
  const counterweights = createCounterweights(materials.black);
  return {
    root, tilt, rightAscension, declination, baseRod,
    rightAscensionHousing, declinationHousing, declinationRing,
    saddle, dovetail, tube, dewShield, rearCell, eyepiece,
    counterweightShaft, counterweights,
  };
}

function createCounterweights(material: Material): Group {
  const group = new Group();
  const first = cylinder(material, 0.08, 0.06, 32);
  const second = cylinder(material, 0.08, 0.06, 32);
  first.rotation.z = Math.PI / 2;
  second.rotation.z = Math.PI / 2;
  second.position.x = -0.065;
  group.add(first, second);
  return group;
}

function assemble(parts: TelescopeParts): void {
  parts.root.rotation.x = -Math.PI / 2;
  parts.root.add(parts.tilt);
  parts.tilt.add(parts.rightAscension);
  parts.rightAscension.add(parts.declination);
  parts.tilt.add(parts.baseRod, parts.rightAscensionHousing);
  parts.rightAscension.add(
    parts.declinationHousing,
    parts.declinationRing,
  );
  parts.declination.add(
    parts.saddle,
    parts.dovetail,
    parts.tube,
    parts.dewShield,
    parts.rearCell,
    parts.eyepiece,
    parts.counterweightShaft,
    parts.counterweights,
  );
}

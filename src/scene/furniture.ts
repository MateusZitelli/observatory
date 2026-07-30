import { createArchitecture } from "./furniture-architecture";
import { createChair } from "./furniture-chair";
import { createDesk } from "./furniture-desk";
import { createMattress } from "./furniture-mattress";
import {
  createFurnitureMaterials,
  type FurnitureMaterials,
} from "./furniture-materials";
import { createSofa } from "./furniture-sofa";

function createFurniture(): void {
  globalThis.furnitureGroup = new globalThis.THREE.Group();
  const materials = createFurnitureMaterials();
  createFurnitureItems(materials);
  createArchitecturalItems(materials);
}

function createFurnitureItems(materials: FurnitureMaterials): void {
  globalThis.deskGroup = createDesk(materials);
  globalThis.furnitureGroup.add(globalThis.deskGroup);
  globalThis.chairGroup = createChair(materials);
  globalThis.furnitureGroup.add(globalThis.chairGroup);
  const sofa = createSofa(materials);
  globalThis.sofaGroup = sofa.sofaGroup;
  globalThis.sofaBedMat = sofa.sofaBedMat;
  globalThis.furnitureGroup.add(globalThis.sofaGroup);
  globalThis.mattressGroup = createMattress(sofa.pillowMat);
  globalThis.furnitureGroup.add(globalThis.mattressGroup);
  globalThis.scene.add(globalThis.furnitureGroup);
  globalThis.furnitureGroup.visible = false;
}

function createArchitecturalItems(materials: FurnitureMaterials): void {
  const architecture = createArchitecture(materials);
  globalThis.wallFrameGroup = architecture.wallFrameGroup;
  globalThis.scene.add(globalThis.wallFrameGroup);
  globalThis.wallFrameGroup.visible = false;
  globalThis.archGroup = architecture.archGroup;
  globalThis.doorMesh = architecture.doorMesh;
  globalThis.windowMesh = architecture.windowMesh;
  globalThis.scene.add(globalThis.archGroup);
  globalThis.archGroup.visible = false;
  globalThis.roofGroup = architecture.roofGroup;
  globalThis.scene.add(globalThis.roofGroup);
  globalThis.roofGroup.visible = false;
}

export function installFurnitureGlobal(): void {
  globalThis.createFurniture = createFurniture;
}

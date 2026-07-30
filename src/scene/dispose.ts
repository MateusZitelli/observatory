import {
  Mesh,
  type Material,
  type Object3D,
  type WebGLRenderer,
} from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function disposeTree(root: Object3D): void {
  const materials = new Set<Material>();
  root.traverse((object) => {
    if (!isMesh(object)) return;
    object.geometry.dispose();
    collectMaterials(object.material, materials);
  });
  materials.forEach((material) => {
    material.dispose();
  });
}

export function disposeRuntime(
  renderer: WebGLRenderer,
  controls: OrbitControls,
  root: Object3D,
): void {
  controls.dispose();
  disposeTree(root);
  renderer.dispose();
  renderer.domElement.remove();
}

function collectMaterials(
  material: Material | readonly Material[],
  output: Set<Material>,
): void {
  if (isMaterialArray(material)) {
    material.forEach((item) => {
      output.add(item);
    });
    return;
  }
  output.add(material);
}

function isMesh(
  object: Object3D,
): object is Mesh {
  return object instanceof Mesh;
}

function isMaterialArray(
  material: Material | readonly Material[],
): material is readonly Material[] {
  return Array.isArray(material);
}

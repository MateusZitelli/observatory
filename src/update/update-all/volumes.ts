import type { BufferGeometry, Object3D } from "three";
import type { KinematicGeometryResult } from "../../scene/kinematic-geometry";
import type { UpdateContext } from "./context";

type GeometryChild = Object3D & { geometry: BufferGeometry };
function hasGeometry(child: Object3D | undefined): child is GeometryChild {
  return child !== undefined && child.type === "LineSegments" && "geometry" in child;
}
function replaceGeometry(mesh: typeof globalThis.volumeMesh, next: KinematicGeometryResult): void {
  mesh.geometry.dispose();
  mesh.geometry = next.geometry;
  const wireframe = mesh.children[0];
  if (!hasGeometry(wireframe)) throw new Error("Missing volume wireframe");
  wireframe.geometry.dispose();
  wireframe.geometry = new globalThis.THREE.WireframeGeometry(next.geometry);
}
function output(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element === null) throw new Error(`Missing output: ${id}`);
  return element;
}

export function updateVolumes(context: UpdateContext): void {
  const { H_total, Y_DEC, Z_FRONT, Z_BACK_TOTAL, lat, Z_RA, X_PIVOT, Y_BASE, TUBE_R } = context;
  const frontData = globalThis.generateKinematicGeometry(
    H_total, Y_DEC, Z_FRONT, lat, false, Z_RA, X_PIVOT, Y_BASE, TUBE_R,
  );
  replaceGeometry(globalThis.volumeMesh, frontData);
  const eyeData = globalThis.generateKinematicGeometry(
    H_total, Y_DEC, Z_BACK_TOTAL, lat, true, Z_RA, X_PIVOT, Y_BASE, TUBE_R,
  );
  replaceGeometry(globalThis.eyeVolumeMesh, eyeData);
  globalThis.derived.currentMaxVolZ = Math.max(frontData.maxZ, eyeData.maxZ);
  globalThis.derived.currentMaxVolR = Math.max(frontData.maxRadius, eyeData.maxRadius);
  globalThis.derived.currentEyeMinZ = eyeData.minZ;
  output("outMaxZ").innerText = globalThis.derived.currentMaxVolZ.toFixed(2) + " m";
  output("outMaxR").innerText = globalThis.derived.currentMaxVolR.toFixed(2) + " m";
  output("outMinEyeZ").innerText = eyeData.minZ.toFixed(2) + " m";
  output("outMaxEyeZ").innerText = eyeData.maxZ.toFixed(2) + " m";
  globalThis.volumeMesh.visible = globalThis.state.showVolumes;
  globalThis.eyeVolumeMesh.visible = globalThis.state.showVolumes;
}

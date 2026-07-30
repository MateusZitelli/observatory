import type { UpdateContext } from "./context";

export function updateMechanics(context: UpdateContext): void {
  const { pierD, H_con, H_ext, X_PIVOT, Y_MOUNT } = context;
  for (let i = 0; i < globalThis.scene.children.length; i++) {
    const child = globalThis.scene.children[i];
    if (child !== undefined && Object.hasOwn(child.userData, "roofRail") && child.userData["roofRail"] === true) {
      child.visible = globalThis.currentTab === "ROOM";
    }
  }

  globalThis.pierMesh.scale.set(pierD / 2, H_con, pierD / 2);
  globalThis.pierExtMesh.scale.set(0.075, H_ext, 0.075);
  globalThis.pierExtMesh.position.set(0, H_con, -X_PIVOT);
  globalThis.mountBaseMesh.scale.set(
    0.085,
    Y_MOUNT > 0.001 && !Number.isNaN(Y_MOUNT) ? Y_MOUNT : 0.001,
    0.085,
  );
  globalThis.mountBaseMesh.position.set(0, H_con + H_ext, -X_PIVOT);
}

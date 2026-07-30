import { optionalGlobal, type UpdateContext } from "./context";

function updateDoorAndWindow({ rW, rD, rH }: UpdateContext): void {
  const hWT = 0.175 / 2;
  const doorMaxH = 2.1;
  const doorAvail = rH - 0.20;
  const doorScale = Math.min(1, doorAvail / doorMaxH);
  globalThis.doorMesh.scale.set(1, doorScale, 1);
  globalThis.doorMesh.position.set(rW / 2 - hWT, 0.20, -rD / 2 + hWT + 0.6);
  globalThis.doorMesh.rotation.y = 0;
  globalThis.doorMesh.visible = doorAvail > 0.5;
  const winAvail = rH - 1.1;
  globalThis.windowMesh.visible = winAvail > 0.3;
  if (globalThis.windowMesh.visible) {
    const winScale = Math.min(1, winAvail / 0.9);
    globalThis.windowMesh.scale.set(1, winScale, 1);
    const winCenterY = 1.1 + (0.9 * winScale) / 2;
    globalThis.windowMesh.position.set(0, winCenterY, rD / 2 - hWT);
  }
}

function updateRoof({ rW, rD, rH }: UpdateContext): void {
  const roofGroup = optionalGlobal("roofGroup", globalThis.roofGroup);
  if (!roofGroup) return;
  roofGroup.visible = globalThis.currentTab === "ROOM";
  globalThis.buildRoof(rW, rD, rH);
  const openPct = globalThis.state.roofOpen / 100;
  const slideMax = globalThis.derived.roofTotalZ + Math.max(rW, rD);
  const slideDir = globalThis.state.roofDir;
  let rotY = 0, slidePosX = 0, slidePosZ = 0;
  if (slideDir === "N") {
    rotY = Math.PI;
    slidePosZ = -openPct * slideMax;
  } else if (slideDir === "S") {
    rotY = 0;
    slidePosZ = openPct * slideMax;
  } else if (slideDir === "L") {
    rotY = -Math.PI / 2;
    slidePosX = openPct * slideMax;
  } else if (slideDir === "O") {
    rotY = Math.PI / 2;
    slidePosX = -openPct * slideMax;
  }
  roofGroup.rotation.y = rotY;
  roofGroup.position.set(slidePosX, 0, slidePosZ);
}

export function updateArchitecture(context: UpdateContext): void {
  const archGroup = optionalGlobal("archGroup", globalThis.archGroup);
  if (archGroup) updateDoorAndWindow(context);
  updateRoof(context);
}

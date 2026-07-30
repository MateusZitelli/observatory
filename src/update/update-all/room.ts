import { optionalGlobal, type UpdateContext } from "./context";

function positionFurniture(context: UpdateContext): void {
  const { rW, rD } = context;
  const hWT = 0.175 / 2;
  const intE = rW / 2 - hWT;
  const intW2 = -rW / 2 + hWT;
  const intS = rD / 2 - hWT;
  const intN = -rD / 2 + hWT;
  const flY = 0.20;
  globalThis.deskGroup.position.set(intW2 + 0.35, flY, intN + 0.8);
  globalThis.deskGroup.rotation.y = -Math.PI / 2;
  globalThis.chairGroup.position.set(intW2 + 1.0, flY, intN + 0.8);
  globalThis.chairGroup.rotation.y = -Math.PI / 2;
  globalThis.sofaGroup.position.set(intE - 0.9, flY, intS - 0.475);
  globalThis.sofaGroup.rotation.y = Math.PI;
  const sofaBedMat = optionalGlobal("sofaBedMat", globalThis.sofaBedMat);
  if (sofaBedMat) sofaBedMat.visible = globalThis.state.sofaBedOpen && globalThis.state.showFurniture;
  const mattressGroup = optionalGlobal("mattressGroup", globalThis.mattressGroup);
  if (mattressGroup) {
    mattressGroup.visible = globalThis.state.showFurniture;
    mattressGroup.position.set(intW2 + 0.79, flY, intS - 0.99);
  }
}

export function updateRoom(context: UpdateContext): void {
  const { rW, rD, rH } = context;
  const roomGroup = globalThis.roomGroup;
  if (roomGroup === undefined) throw new Error("Missing room group");
  roomGroup.scale.set(rW, rH, rD);
  globalThis.furnitureGroup.visible = globalThis.currentTab === "ROOM" && globalThis.state.showFurniture;
  const archGroup = optionalGlobal("archGroup", globalThis.archGroup);
  if (archGroup) archGroup.visible = globalThis.currentTab === "ROOM";
  const wallFrameGroup = optionalGlobal("wallFrameGroup", globalThis.wallFrameGroup);
  if (wallFrameGroup) {
    wallFrameGroup.visible = globalThis.currentTab === "ROOM";
    globalThis.buildWallFrame(rW, rD, rH);
  }
  positionFurniture(context);
}

import type { UpdateContext } from "./context";

function updateBase(context: UpdateContext): void {
  const { H_total, X_PIVOT, lat, Y_BASE, Z_RA } = context;
  globalThis.rigGroup.position.set(0, H_total, -X_PIVOT);
  globalThis.tiltGroup.rotation.x = ((90 - Math.abs(lat)) * Math.PI) / 180;
  globalThis.raNode.rotation.z = globalThis.THREE.MathUtils.degToRad(globalThis.state.RA + 90);
  globalThis.decNode.rotation.x = globalThis.THREE.MathUtils.degToRad(-globalThis.state.Dec);
  globalThis.baseBlock.position.set(0, -0.11, -0.06);
  globalThis.baseDial.position.set(0, -0.11, -0.06);
  const rodLen = Y_BASE > 0.001 && !Number.isNaN(Y_BASE) ? Y_BASE : 0.001;
  globalThis.baseRod.scale.set(1, rodLen, 1);
  globalThis.baseRod.position.set(0, Y_BASE / 2, 0);
  globalThis.raHousing.scale.set(1, Z_RA + 0.05, 1);
  globalThis.raHousing.position.set(0, Y_BASE, Z_RA / 2);
  globalThis.controlPanel.position.set(0.09, Y_BASE, Z_RA / 2);
  globalThis.raNode.position.set(0, Y_BASE, 0);
  globalThis.decHousingGroup.position.set(0, 0, Z_RA);
}

function updateDeclination(context: UpdateContext): void {
  const { Y_DEC, TUBE_R } = context;
  const decStart = -0.12;
  const dovetailThick = 0.02, saddleThick = 0.04;
  const saddleX = Y_DEC - TUBE_R - dovetailThick - saddleThick / 2;
  const decHousingEndX = Y_DEC - TUBE_R - dovetailThick - saddleThick;
  const decLen = decHousingEndX - decStart;
  globalThis.decHousing.scale.set(0.08, Math.max(0.05, decLen), 0.08);
  globalThis.decHousing.position.set(decStart + decLen / 2, 0, 0);
  globalThis.decRing.scale.set(0.082, 0.015, 0.082);
  globalThis.decRing.position.set(decHousingEndX - 0.0075, 0, 0);
  const saddlePart = globalThis.saddle.children[0];
  if (saddlePart === undefined) throw new Error("Missing saddle");
  saddlePart.scale.set(saddleThick, 0.22, 1);
  globalThis.saddle.position.set(saddleX, 0, 0);
}

export function updateMount(context: UpdateContext): void {
  updateBase(context);
  updateDeclination(context);
}

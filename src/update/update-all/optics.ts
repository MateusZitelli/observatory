import type { UpdateContext } from "./context";

type TubeGeometry = {
  readonly Y_DEC: number;
  readonly TUBE_R: number;
  readonly EYE_LEN: number;
  readonly dovetailThick: number;
  readonly dovetailX: number;
  readonly lenDew: number;
  readonly lenRear: number;
  readonly lenMain: number;
  readonly Z_FRONT: number;
};
function updateTubeMeshes(data: TubeGeometry): void {
  const { TUBE_R, Y_DEC, Z_FRONT, EYE_LEN, dovetailThick, dovetailX, lenDew, lenRear, lenMain } = data;
  let currentY = -Z_FRONT;
  globalThis.dewShield.scale.set(TUBE_R * 1.05, lenDew, TUBE_R * 1.05);
  globalThis.dewShield.position.set(Y_DEC, currentY + lenDew / 2, 0);
  currentY += lenDew;
  globalThis.mainTube.scale.set(TUBE_R, lenMain, TUBE_R);
  globalThis.mainTube.position.set(Y_DEC, currentY + lenMain / 2, 0);
  globalThis.dovetailBar.scale.set(dovetailThick, lenMain + 0.05, 1);
  globalThis.dovetailBar.position.set(dovetailX, currentY + lenMain / 2, 0);
  currentY += lenMain;
  globalThis.rearCell.scale.set(TUBE_R, lenRear, TUBE_R);
  globalThis.rearCell.position.set(Y_DEC, currentY + lenRear / 2, 0);
  currentY += lenRear;
  if (EYE_LEN > 0.001) {
    globalThis.visualBack.visible = true;
    globalThis.visualBack.scale.set(0.03, EYE_LEN, 0.03);
    globalThis.visualBack.position.set(Y_DEC, currentY + EYE_LEN / 2, 0);
  } else {
    globalThis.visualBack.visible = false;
  }
}
function updateTube(context: UpdateContext): void {
  const { TUBE_LEN, TUBE_R, Y_DEC, Z_FRONT, EYE_LEN } = context;
  const dovetailThick = 0.02;
  const dovetailX = Y_DEC - TUBE_R - dovetailThick / 2;
  const lenDew = Math.min(0.35, TUBE_LEN * 0.3);
  const lenRear = 0.08;
  let lenMain = TUBE_LEN - lenDew - lenRear;
  if (lenMain < 0.1) lenMain = 0.1;
  updateTubeMeshes({ Y_DEC, TUBE_R, EYE_LEN, dovetailThick, dovetailX, lenDew, lenRear, lenMain, Z_FRONT });
}
function updateCounterweights({ Y_CW }: UpdateContext): void {
  globalThis.cwShaft.scale.set(1, Y_CW, 1);
  globalThis.cwShaft.position.set(-Y_CW / 2, 0, 0);
  globalThis.cwWeightsGroup.position.set(-Y_CW + 0.15, 0, 0);
}
export function updateOptics(context: UpdateContext): void {
  updateTube(context);
  updateCounterweights(context);
}

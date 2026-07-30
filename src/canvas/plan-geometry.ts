import { toRadians } from "../astronomy/angles";
import type { ObservatoryState } from "../domain/types";
import type { Point } from "./primitives";

export type PlanGeometry = {
  ground: Point;
  pillarTop: Point;
  extensionTop: Point;
  pivot: Point;
  polarBase: Point;
  declinationJoint: Point;
  tubeCenter: Point;
  counterweight: Point;
  tubeFront: Point;
  tubeBack: Point;
};

export function planGeometry(state: ObservatoryState): PlanGeometry {
  const ground = point(0, 0);
  const pillarTop = point(0, state.concreteHeight);
  const extensionTop = point(state.pivotOffset, state.concreteHeight + state.extensionHeight);
  const pivot = point(extensionTop.x, extensionTop.y + state.mountHeight);
  const polarBase = point(pivot.x, pivot.y + state.baseOffset);
  const polarAngle = toRadians(180 - Math.abs(state.latitude));
  const declinationJoint = extend(polarBase, polarAngle, state.rightAscensionOffset);
  const declinationAngle = polarAngle + toRadians(90 + state.rightAscension);
  const tubeCenter = extend(declinationJoint, declinationAngle, state.declinationOffset);
  const counterweight = extend(
    declinationJoint,
    declinationAngle + Math.PI,
    state.counterweightOffset,
  );
  const tubeAngle = declinationAngle + toRadians(90 - state.declination);
  const tubeFront = extend(tubeCenter, tubeAngle, state.tubeLength / 2 + state.tubeOffset);
  const tubeBack = extend(tubeCenter, tubeAngle + Math.PI, state.tubeLength / 2);
  return {
    ground,
    pillarTop,
    extensionTop,
    pivot,
    polarBase,
    declinationJoint,
    tubeCenter,
    counterweight,
    tubeFront,
    tubeBack,
  };
}

function point(x: number, y: number): Point {
  return { x, y };
}

function extend(origin: Point, angle: number, length: number): Point {
  return {
    x: origin.x + Math.cos(angle) * length,
    y: origin.y + Math.sin(angle) * length,
  };
}

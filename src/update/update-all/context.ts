export type UpdateContext = {
  readonly H_con: number;
  readonly H_ext: number;
  readonly Y_MOUNT: number;
  readonly X_PIVOT: number;
  readonly pierD: number;
  readonly lat: number;
  readonly Y_BASE: number;
  readonly Z_RA: number;
  readonly Y_DEC: number;
  readonly Y_CW: number;
  readonly TUBE_LEN: number;
  readonly TUBE_OFF: number;
  readonly EYE_LEN: number;
  readonly TUBE_R: number;
  readonly rW: number;
  readonly rD: number;
  readonly rH: number;
  readonly Z_FRONT: number;
  readonly Z_BACK: number;
  readonly Z_BACK_TOTAL: number;
  readonly H_total: number;
};

export function optionalGlobal<T>(name: string, value: T): T | undefined {
  return Object.hasOwn(globalThis, name) ? value : undefined;
}

export function readUpdateContext(): UpdateContext {
  const {
    H_con, H_ext, Y_MOUNT, X_PIVOT, pierD, lat, Y_BASE, Z_RA, Y_DEC, Y_CW,
    TUBE_LEN, TUBE_OFF, EYE_LEN, TUBE_D, rW, rD, rH,
  } = globalThis.state;
  const TUBE_R = TUBE_D / 2;
  const Z_FRONT = TUBE_LEN / 2 + TUBE_OFF;
  const Z_BACK = TUBE_LEN / 2 - TUBE_OFF;
  const Z_BACK_TOTAL = Z_BACK + EYE_LEN;
  const H_total = H_con + H_ext + Y_MOUNT;
  return {
    H_con, H_ext, Y_MOUNT, X_PIVOT, pierD, lat, Y_BASE, Z_RA, Y_DEC,
    Y_CW, TUBE_LEN, TUBE_OFF, EYE_LEN, TUBE_R, rW, rD, rH, Z_FRONT,
    Z_BACK, Z_BACK_TOTAL, H_total,
  };
}

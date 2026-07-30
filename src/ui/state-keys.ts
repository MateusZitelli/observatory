import { defaultState } from "../domain/default-state";
import type { ObservatoryState, ViewId } from "../domain/types";
import type { BooleanStateKey, NumericStateKey, StringStateKey } from "./control-types";

export function isStateKey(value: string): value is keyof ObservatoryState {
  return Object.hasOwn(defaultState, value);
}

export function isNumericKey(value: string): value is NumericStateKey {
  return isStateKey(value) && typeof defaultState[value] === "number";
}

export function isBooleanKey(value: string): value is BooleanStateKey {
  return isStateKey(value) && typeof defaultState[value] === "boolean";
}

export function isStringKey(value: string): value is StringStateKey {
  return isStateKey(value) && typeof defaultState[value] === "string";
}

export function isViewId(value: string): value is ViewId {
  return ["telescope", "room", "plan", "sky", "project"].includes(value);
}

import type { ObservatoryState } from "../domain/types";

export type NumericStateKey = {
  [Key in keyof ObservatoryState]: ObservatoryState[Key] extends number ? Key : never;
}[keyof ObservatoryState];

export type BooleanStateKey = {
  [Key in keyof ObservatoryState]: ObservatoryState[Key] extends boolean ? Key : never;
}[keyof ObservatoryState];

export type StringStateKey = {
  [Key in keyof ObservatoryState]: ObservatoryState[Key] extends string ? Key : never;
}[keyof ObservatoryState];

export type RangeSpec = {
  key: NumericStateKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  precision?: number;
  tone?: "blue" | "cyan" | "green" | "orange" | "yellow";
};

export type Option = {
  label: string;
  value: string;
};

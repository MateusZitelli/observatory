import { bindings, type Binding } from "./runtime-bindings";
import { createRuntimeDomGlobals } from "./runtime-dom";
import {
  derived,
  LS_KEY_V2,
  state,
  type DerivedValues,
  type ObservatoryState,
} from "./runtime-state";
import {
  computeDerived as computeDerivedImpl,
  loadStateFromLS as loadStateFromLSImpl,
  saveStateToLS as saveStateToLSImpl,
  syncAllToDOM as syncAllToDOMImpl,
  syncFromDOM as syncFromDOMImpl,
} from "./runtime-sync";

export type LegacyRuntimeGlobals = {
  state: ObservatoryState;
  derived: DerivedValues;
  bindings: readonly Binding[];
  LS_KEY_V2: string;
  syncFromDOM: typeof syncFromDOMImpl;
  syncAllToDOM: typeof syncAllToDOMImpl;
  computeDerived: typeof computeDerivedImpl;
  saveStateToLS: typeof saveStateToLSImpl;
  loadStateFromLS: typeof loadStateFromLSImpl;
};

declare global {
  var state: ObservatoryState;
  var derived: DerivedValues;
  var bindings: readonly Binding[];
  var LS_KEY_V2: string;
  var syncFromDOM: typeof syncFromDOMImpl;
  var syncAllToDOM: typeof syncAllToDOMImpl;
  var computeDerived: typeof computeDerivedImpl;
  var saveStateToLS: typeof saveStateToLSImpl;
  var loadStateFromLS: typeof loadStateFromLSImpl;
}

const globals: LegacyRuntimeGlobals = {
  state,
  derived,
  bindings,
  LS_KEY_V2,
  syncFromDOM: syncFromDOMImpl,
  syncAllToDOM: syncAllToDOMImpl,
  computeDerived: computeDerivedImpl,
  saveStateToLS: saveStateToLSImpl,
  loadStateFromLS: loadStateFromLSImpl,
};

export function installLegacyRuntimeGlobals(): void {
  Object.assign(globalThis, globals, createRuntimeDomGlobals());
}

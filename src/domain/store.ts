import { defaultState } from "./default-state";
import { deriveGeometry } from "./geometry";
import { parsePersistedState } from "./state-validation";
import type { AppSnapshot, ObservatoryState, ViewId } from "./types";

type Listener = (snapshot: AppSnapshot) => void;
const storageKey = "observatorio_state_v5";

export type Store = {
  getSnapshot: () => AppSnapshot;
  setState: (patch: Partial<ObservatoryState>) => void;
  setValue: <Key extends keyof ObservatoryState>(
    key: Key,
    value: ObservatoryState[Key],
  ) => void;
  setView: (view: ViewId) => void;
  subscribe: (listener: Listener) => () => void;
};

export function createStore(): Store {
  let state = loadState();
  let view: ViewId = "telescope";
  const listeners = new Set<Listener>();
  const getSnapshot = (): AppSnapshot => ({ state, geometry: deriveGeometry(state), view });
  const notify = (): void => {
    listeners.forEach((listener) => {
      listener(getSnapshot());
    });
  };
  const setState = (patch: Partial<ObservatoryState>): void => {
    state = { ...state, ...patch };
    persistState(state);
    notify();
  };
  return {
    getSnapshot,
    setState,
    setValue: (key, value) => {
      setState({ [key]: value });
    },
    setView: (nextView) => {
      view = nextView;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(getSnapshot());
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function loadState(): ObservatoryState {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return { ...defaultState };
    const value: unknown = JSON.parse(saved);
    return parsePersistedState(value);
  } catch {
    return { ...defaultState };
  }
}

function persistState(state: ObservatoryState): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
  }
}

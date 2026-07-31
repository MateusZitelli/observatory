import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ThreeRuntime } from "./runtime-scene";

const threeRuntime: ThreeRuntime = { ...Three, OrbitControls };

export function installVendorRuntime(): void {
  globalThis.THREE = threeRuntime;
}

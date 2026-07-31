import { installInitializer } from "./runtime-init";
import { installTabBindings } from "./runtime-tabs";
import { installObserverResizeGlobals } from "./update/observer-resize-runtime";
import { installUpdateAllGlobal } from "./update/update-all-runtime";
import { installPlan2DGlobal } from "./views/plan/runtime";
import { installProjectViewGlobal } from "./views/project/runtime";
import { installSkyViewGlobal } from "./views/sky/runtime";

export function installUiRuntime(): void {
  installUpdateAllGlobal();
  installObserverResizeGlobals();
  installPlan2DGlobal();
  installSkyViewGlobal();
  installProjectViewGlobal();
  installTabBindings();
  installInitializer();
}

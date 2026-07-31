import { installPanoramaRuntime } from "./panorama/runtime";
import { installCoreRuntime } from "./runtime-installers-core";
import { installUiRuntime } from "./runtime-installers-ui";
import { installLifecycleRuntime } from "./runtime-lifecycle";

export function installRuntime(): void {
  installCoreRuntime();
  installUiRuntime();
  installPanoramaRuntime();
  installLifecycleRuntime();
}

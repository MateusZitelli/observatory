import { installLegacyRuntimeGlobals } from "./runtime-compat";
import { installCollisionGlobal } from "./scene/collision";
import { installSceneGlobal } from "./scene/create-meshes";
import { installFurnitureGlobal } from "./scene/furniture";
import { installKinematicGeometryGlobal } from "./scene/kinematic-geometry";
import { installRoofGlobal } from "./scene/roof-runtime";
import { installRoomCollisionGlobal } from "./scene/room-collision-runtime";
import { installWallFrameGlobal } from "./scene/wall-frame-runtime";

export function installCoreRuntime(): void {
  installLegacyRuntimeGlobals();
  installFurnitureGlobal();
  installSceneGlobal();
  installKinematicGeometryGlobal();
  installCollisionGlobal();
  installRoomCollisionGlobal();
  installWallFrameGlobal();
  installRoofGlobal();
}

import { checkRoomCrash } from "./room-collision/check-room-crash";

export { checkRoomCrash } from "./room-collision/check-room-crash";

export function installRoomCollisionGlobal(): void {
  globalThis.checkRoomCrash = checkRoomCrash;
}

declare global {
  var checkRoomCrash: () => string | null;
}

import { checkPierCrash } from "./collision-pier";

export function installCollisionGlobal(): void {
  globalThis.checkPierCrash = checkPierCrash;
}

declare global {
  var checkPierCrash: () => boolean;
}

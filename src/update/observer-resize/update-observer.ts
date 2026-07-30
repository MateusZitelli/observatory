import type * as Three from "three";

function requiredTextElement(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (element === null) throw new Error(`Missing element: ${id}`);
  return element;
}

function observerMaterial(observer: Three.Group): Three.MeshStandardMaterial {
  const body = observer.children[0];
  if (!(body instanceof globalThis.THREE.Mesh)) throw new Error("Missing observer body");
  if (!(body.material instanceof globalThis.THREE.MeshStandardMaterial)) {
    throw new Error("Invalid observer material");
  }
  return body.material;
}

export function updateObserver(): void {
  const observer = globalThis.observerGroup;
  observer.visible =
    globalThis.state.showObserver &&
    globalThis.currentTab !== "2D" &&
    globalThis.currentTab !== "SKY" &&
    globalThis.currentTab !== "PROJ";

  const scaleY = globalThis.state.observerPosture === "sitting" ? 0.65 : 1.0;
  observer.scale.set(1, scaleY, 1);
  const posX = globalThis.state.obsX;
  const posY = globalThis.state.obsY;
  observer.position.set(posX, 0, -posY);
  requiredTextElement("valObsX").innerText = `${posX.toFixed(1)} m`;
  requiredTextElement("valObsY").innerText = `${posY.toFixed(1)} m`;

  const limitRadius = globalThis.derived.currentMaxVolR;
  const material = observerMaterial(observer);
  const isInVolume = Math.sqrt(posX * posX + posY * posY) < limitRadius + 0.1;
  material.color.setHex(isInVolume ? 0xef4444 : 0x22c55e);
}

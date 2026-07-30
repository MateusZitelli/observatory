function onWindowResize(): void {
  globalThis.camera.aspect = window.innerWidth / window.innerHeight;
  globalThis.camera.updateProjectionMatrix();
  globalThis.renderer.setSize(window.innerWidth, window.innerHeight);
  globalThis.resize2D();
  if (globalThis.is2DMode) {
    if (globalThis.currentTab === "SKY") globalThis.drawSky();
    else if (globalThis.currentTab === "PROJ") globalThis.drawProject();
    else globalThis.draw2D();
  }
}

function animate(): void {
  requestAnimationFrame(animate);
  if (!globalThis.is2DMode) {
    globalThis.controls.update();
    globalThis.renderer.render(globalThis.scene, globalThis.camera);
  }
}

export function installLifecycleRuntime(): void {
  globalThis.onWindowResize = onWindowResize;
  globalThis.animate = animate;
  window["onload"] = globalThis.init;
}

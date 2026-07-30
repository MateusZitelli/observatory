function resetTabs(): void {
  globalThis.btnTab3D.classList.replace("bg-blue-600", "bg-gray-700");
  globalThis.btnTabRoom.classList.replace("bg-blue-600", "bg-gray-700");
  globalThis.btnTab2D.classList.replace("bg-blue-600", "bg-gray-700");
  globalThis.btnTabSky.classList.replace("bg-blue-600", "bg-gray-700");
  globalThis.btnTabProj.classList.replace("bg-blue-600", "bg-gray-700");

  globalThis.content2D.classList.add("hidden-content");
  globalThis.content3D.classList.add("hidden-content");
  globalThis.contentROOM.classList.add("hidden-content");
  globalThis.contentSKY.classList.add("hidden-content");
  globalThis.contentPROJ.classList.add("hidden-content");
  globalThis.motorsBlock.classList.add("hidden-content");
}

function show2DTab(): void {
  globalThis.btnTab2D.classList.replace("bg-gray-700", "bg-blue-600");
  globalThis.content2D.classList.remove("hidden-content");
  globalThis.canvasContainer.style.display = "none";
  globalThis.canvas2D.style.display = "block";
  globalThis.draw2D();
}

function showSkyTab(): void {
  globalThis.btnTabSky.classList.replace("bg-gray-700", "bg-blue-600");
  globalThis.contentSKY.classList.remove("hidden-content");
  globalThis.canvasContainer.style.display = "none";
  globalThis.canvas2D.style.display = "block";
  globalThis.drawSky();
}

function showProjectTab(): void {
  globalThis.btnTabProj.classList.replace("bg-gray-700", "bg-blue-600");
  globalThis.contentPROJ.classList.remove("hidden-content");
  globalThis.canvasContainer.style.display = "none";
  globalThis.canvas2D.style.display = "block";
  globalThis.drawProject();
}

function showRoomTab(): void {
  globalThis.btnTabRoom.classList.replace("bg-gray-700", "bg-blue-600");
  globalThis.contentROOM.classList.remove("hidden-content");
  globalThis.motorsBlock.classList.remove("hidden-content");
  globalThis.canvas2D.style.display = "none";
  globalThis.canvasContainer.style.display = "block";
  if (globalThis.roomGroup) globalThis.roomGroup.visible = true;
}

function showThreeDTab(): void {
  globalThis.btnTab3D.classList.replace("bg-gray-700", "bg-blue-600");
  globalThis.content3D.classList.remove("hidden-content");
  globalThis.motorsBlock.classList.remove("hidden-content");
  globalThis.canvas2D.style.display = "none";
  globalThis.canvasContainer.style.display = "block";
  if (globalThis.roomGroup) globalThis.roomGroup.visible = false;
}

function switchTab(tabStr: string): void {
  globalThis.currentTab = tabStr;
  globalThis.is2DMode = tabStr === "2D" || tabStr === "SKY" || tabStr === "PROJ";
  resetTabs();
  if (tabStr === "2D") show2DTab();
  else if (tabStr === "SKY") showSkyTab();
  else if (tabStr === "PROJ") showProjectTab();
  else if (tabStr === "ROOM") showRoomTab();
  else showThreeDTab();

  // Força a atualização da visibilidade dos móveis
  globalThis.updateAll();
}

export function installTabBindings(): void {
  globalThis.switchTab = switchTab;
  globalThis.btnTab3D.addEventListener("click", () => { switchTab("3D"); });
  globalThis.btnTabRoom.addEventListener("click", () => { switchTab("ROOM"); });
  globalThis.btnTab2D.addEventListener("click", () => { switchTab("2D"); });
  globalThis.btnTabSky.addEventListener("click", () => { switchTab("SKY"); });
  globalThis.btnTabProj.addEventListener("click", () => { switchTab("PROJ"); });
}

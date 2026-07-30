function updateWarning(): void {
  const isPierC = globalThis.checkPierCrash();
  const roomCType = globalThis.checkRoomCrash();
  const warningEl = document.querySelector<HTMLElement>("#collisionWarning");
  const panel = document.querySelector<HTMLElement>("#ui-panel");
  if (warningEl === null || panel === null) throw new Error("Missing warning UI");
  if (isPierC || roomCType !== null && roomCType !== "") {
    warningEl.style.display = "block";
    panel.style.borderColor = "#ef4444";
    if (isPierC) {
      warningEl.innerHTML = `<span class="text-white font-bold text-sm uppercase tracking-wide">⚠️ Perigo: Pier Crash!</span><p class="text-red-200 text-xs leading-tight mt-1">Colisão detetada com a estrutura ou mobília.</p>`;
    } else {
      const localM = roomCType === "telhado"
        ? "O telescópio vai bater no TELHADO! Abra mais o telhado."
        : roomCType === "teto"
          ? "O telescópio vai bater no TETO!"
          : "O telescópio vai bater na PAREDE!";
      warningEl.innerHTML = `<span class="text-white font-bold text-sm uppercase tracking-wide">⚠️ Perigo: Falta de Espaço!</span><p class="text-red-200 text-xs leading-tight mt-1">${localM}</p>`;
    }
  } else {
    warningEl.style.display = "none";
    panel.style.borderColor = "rgba(255,255,255,0.1)";
  }
}

function updateViews(): void {
  if (!globalThis.is2DMode) return;
  if (globalThis.currentTab === "SKY") globalThis.drawSky();
  else if (globalThis.currentTab === "PROJ") globalThis.drawProject();
  else globalThis.draw2D();
}

export function updateFinish(): void {
  updateWarning();
  updateViews();
}

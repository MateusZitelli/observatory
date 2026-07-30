import type { AppSnapshot } from "../domain/types";
import { mountPanel } from "./panels/mount-panel";
import { observerPanel } from "./panels/observer-panel";
import { pierPanel } from "./panels/pier-panel";
import { projectPanel } from "./panels/project-panel";
import { resultsPanel } from "./panels/results-panel";
import { roomPanel } from "./panels/room-panel";
import { skyPanel } from "./panels/sky-panel";
import { tabMarkup } from "./tabs";

export function renderShell(root: HTMLElement, snapshot: AppSnapshot): void {
  root.innerHTML = `
    <main class="app-shell">
      <div class="viewport">
        <div id="scene-host"></div>
        <canvas id="drawing-canvas"></canvas>
        <div class="compass"><span>N</span><span>L</span><span>S</span><span>O</span></div>
      </div>
      <aside class="sidebar" data-sidebar>
        <header class="sidebar__header">
          <div>
            <p>Observatório Piedade</p>
            <h1>Simulador técnico</h1>
          </div>
          <button class="collapse" data-action="collapse" aria-label="Recolher painel">‹</button>
        </header>
        <nav class="tabs" aria-label="Visualizações">${tabMarkup()}</nav>
        <div class="panel-scroll">
          ${pierPanel(snapshot.state)}
          ${roomPanel(snapshot.state)}
          ${skyPanel(snapshot.state)}
          ${mountPanel(snapshot.state)}
          ${observerPanel(snapshot.state)}
          ${projectPanel()}
          ${resultsPanel(snapshot.state, snapshot.geometry)}
        </div>
      </aside>
    </main>`;
}

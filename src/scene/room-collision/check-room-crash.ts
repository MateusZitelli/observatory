export type RoomCrashType = "parede" | "telhado" | null;

type VolumeMesh = typeof globalThis.volumeMesh;

type RoofCollisionInput = {
  readonly rW: number;
  readonly rD: number;
  readonly rH: number;
  readonly openPct: number;
  readonly roofPitch: number;
  readonly roofDir: string;
  readonly roofTotalZ: number;
};

type RoofCollisionContext = {
  readonly rH: number;
  readonly roofZmin: number;
  readonly roofZmax: number;
  readonly halfSpan: number;
  readonly ridgeH: number;
  readonly PITCH_TAN: number;
};

function checkRoofMeshes(
  meshes: readonly VolumeMesh[],
  context: RoofCollisionContext,
): boolean {
  for (const mesh of meshes) {
    const attr = mesh.geometry.getAttribute("position");
    for (let i = 0; i < attr.count; i++) {
      const py = attr.getY(i);
      if (py <= context.rH) continue;

      const pz = attr.getZ(i);
      // Se o ponto está fora da cobertura do telhado em Z, sem colisão
      if (pz < context.roofZmin || pz > context.roofZmax) continue;

      // Distância ao plano da cumeeira (eixo X, perpendicular)
      const dRidge = Math.abs(attr.getX(i));
      if (dRidge > context.halfSpan) continue;

      const roofAtPoint = context.ridgeH - dRidge * context.PITCH_TAN;
      if (py > roofAtPoint) return true;
    }
  }

  return false;
}

function createRoofCollisionContext(input: RoofCollisionInput): RoofCollisionContext {
  const { rW, rD, rH, openPct, roofPitch, roofDir, roofTotalZ } = input;
  const BEIRAL = 0.15;
  const PITCH_TAN = Math.tan(roofPitch * Math.PI / 180);
  // cumeeira L-O quando abre N/S
  const ridgeX = (roofDir === "N" || roofDir === "S");
  const halfSpan = (ridgeX ? rD : rW) / 2 + BEIRAL;
  const ridgeRise = halfSpan * PITCH_TAN;
  const ridgeH = rH + ridgeRise;
  // Telhado desliza ao longo da cumeeira (Z)
  const slideMax = roofTotalZ + rD;
  const slideOff = -openPct * slideMax;

  // O telhado cobre Z de (slideOff - rD/2 - BEIRAL) a (slideOff + rD/2 + BEIRAL)
  const roofZmin = slideOff - rD / 2 - BEIRAL;
  const roofZmax = slideOff + rD / 2 + BEIRAL;
  return { rH, roofZmin, roofZmax, halfSpan, ridgeH, PITCH_TAN };
}

export function checkRoomCrash(): RoomCrashType {
  if (globalThis.currentTab !== "ROOM") return null;

  const rW = globalThis.state.rW;
  const rD = globalThis.state.rD;
  const rH = globalThis.state.rH;

  const maxSafeR = Math.min(rW, rD) / 2;
  if (globalThis.derived.currentMaxVolR > maxSafeR) return "parede";

  const openPct = globalThis.state.roofOpen / 100;

  // Se telhado 100% aberto, só verificar paredes (sem teto)
  if (openPct >= 0.99) return null;

  const context = createRoofCollisionContext({
    rW,
    rD,
    rH,
    openPct,
    roofPitch: globalThis.state.roofPitch,
    roofDir: globalThis.state.roofDir,
    roofTotalZ: globalThis.derived.roofTotalZ,
  });
  // Verificar vértices do volume varrido contra o plano do telhado
  const meshes = [globalThis.volumeMesh, globalThis.eyeVolumeMesh];
  if (checkRoofMeshes(meshes, context)) return "telhado";

  return null;
}

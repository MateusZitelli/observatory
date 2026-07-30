import type { RoofMaterials, RoofTileInput } from "./types";

function buildWheels(input: RoofTileInput): void {
  const wheelMat = new globalThis.THREE.MeshStandardMaterial({
    color: 0x333333, roughness: 0.5, metalness: 0.6,
  });
  const wheelR = 0.05, wheelW = 0.04;
  for (const sx of [-1, 1]) {
    for (const zf of [0, -input.totalRidge * 0.35, input.totalRidge * 0.35]) {
      const wGeo = new globalThis.THREE.CylinderGeometry(wheelR, wheelR, wheelW, 12);
      const wheel = new globalThis.THREE.Mesh(wGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx * input.halfSpan, input.rH + wheelR, zf);
      globalThis.roofGroup.add(wheel);
    }
  }
}

function buildTileGrid(input: RoofTileInput, materials: RoofMaterials): void {
  const { nRidge, nSlope, ridgeX, PITCH, rHB, ridgeRise } = input;
  for (const side of [-1, 1]) {
    for (let r = 0; r < nRidge; r++) {
      for (let s = 0; s < nSlope; s++) {
        const isAlt = (r + s) % 2 === 0;
        const geo = ridgeX
          ? new globalThis.THREE.BoxGeometry(input.tileW, input.tileH, input.tileL)
          : new globalThis.THREE.BoxGeometry(input.tileL, input.tileH, input.tileW);
        const tile = new globalThis.THREE.Mesh(geo, isAlt ? materials.roofMatA : materials.roofMatB);
        tile.add(new globalThis.THREE.LineSegments(
          new globalThis.THREE.EdgesGeometry(geo), materials.roofEdgeMat,
        ));
        const ridgePos = (r - (nRidge - 1) / 2) * input.tileW;
        const slopeDist = s * (input.tileL - input.overlap) + input.tileL / 2;
        const hz = slopeDist * Math.cos(PITCH), vt = -slopeDist * Math.sin(PITCH);
        const tileOffX = 0.14 * Math.sin(PITCH), tileOffY = 0.14 * Math.cos(PITCH);
        if (ridgeX) {
          tile.position.set(ridgePos, rHB + ridgeRise + vt + tileOffY, side * (hz - tileOffX));
          tile.rotation.x = side * PITCH;
        } else {
          tile.position.set(side * (hz - tileOffX), rHB + ridgeRise + vt + tileOffY, ridgePos);
          tile.rotation.z = -side * PITCH;
        }
        globalThis.roofGroup.add(tile);
      }
    }
  }
}

function buildRidge(input: RoofTileInput, materials: RoofMaterials): void {
  const ridgeGeo = input.ridgeX
    ? new globalThis.THREE.BoxGeometry(input.totalRidge, 0.06, 0.08)
    : new globalThis.THREE.BoxGeometry(0.08, 0.06, input.totalRidge);
  const ridgeBeam = new globalThis.THREE.Mesh(ridgeGeo, materials.roofMatA);
  ridgeBeam.position.set(0, input.rHB + input.ridgeRise + 0.03, 0);
  globalThis.roofGroup.add(ridgeBeam);
}

export function buildRoofTiles(input: RoofTileInput, materials: RoofMaterials): void {
  buildWheels(input);
  buildTileGrid(input, materials);
  buildRidge(input, materials);
}

      function checkRoomCrash() {
        if (currentTab !== "ROOM") return null;

        const rW = state.rW;
        const rD = state.rD;
        const rH = state.rH;

        const maxSafeR = Math.min(rW, rD) / 2;
        if (derived.currentMaxVolR > maxSafeR) return "parede";

        const openPct = state.roofOpen / 100;

        // Se telhado 100% aberto, só verificar paredes (sem teto)
        if (openPct >= 0.99) return null;

        const BEIRAL = 0.15;
        const PITCH_TAN = Math.tan(state.roofPitch * Math.PI / 180);
        const dirC = state.roofDir;
        const ridgeX = (dirC === "N" || dirC === "S"); // cumeeira L-O quando abre N/S
        const halfSpan = (ridgeX ? rD : rW) / 2 + BEIRAL;
        const ridgeRise = halfSpan * PITCH_TAN;
        const ridgeH = rH + ridgeRise;
        // Telhado desliza ao longo da cumeeira (Z)
        const slideMax = derived.roofTotalZ + rD;
        const slideOff = -openPct * slideMax;

        // O telhado cobre Z de (slideOff - rD/2 - BEIRAL) a (slideOff + rD/2 + BEIRAL)
        const roofZmin = slideOff - rD / 2 - BEIRAL;
        const roofZmax = slideOff + rD / 2 + BEIRAL;

        // Verificar vértices do volume varrido contra o plano do telhado
        for (const mesh of [volumeMesh, eyeVolumeMesh]) {
          const attr = mesh.geometry.getAttribute("position");
          for (let i = 0; i < attr.count; i++) {
            const py = attr.getY(i);
            if (py <= rH) continue;

            const pz = attr.getZ(i);
            // Se o ponto está fora da cobertura do telhado em Z, sem colisão
            if (pz < roofZmin || pz > roofZmax) continue;

            // Distância ao plano da cumeeira (eixo X, perpendicular)
            const dRidge = Math.abs(attr.getX(i));
            if (dRidge > halfSpan) continue;

            const roofAtPoint = ridgeH - dRidge * PITCH_TAN;
            if (py > roofAtPoint) return "telhado";
          }
        }

        return null;
      }

      // ---- buildWallFrame: reconstrói paredes e assoalho quando dimensões mudam ----
      let prevWFKey = "";
      const wfMat = new THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.85 });
      const wfEdge = new THREE.LineBasicMaterial({ color: 0x8b7332, transparent: true, opacity: 0.3 });
      const floorMat = new THREE.MeshStandardMaterial({ color: 0xb8943e, roughness: 0.9 });
      const frontalMat = new THREE.MeshStandardMaterial({ color: 0xd4b86a, roughness: 0.95, side: THREE.DoubleSide });
      const epsMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 1.0, transparent: true, opacity: 0.6 });

      function buildWallFrame(rW, rD, rH) {
        const key = rW + "," + rD + "," + rH + "," + state.pierD;
        if (key === prevWFKey) return;
        prevWFKey = key;

        // Limpar
        while (wallFrameGroup.children.length > 0) {
          const c = wallFrameGroup.children[0];
          c.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
          wallFrameGroup.remove(c);
        }

        const S = 0.045, D = 0.09, SP = 0.60;
        const FRONTAL = 0.02; // frontal pinus 2cm
        const EPS = 0.045; // isopor entre montantes
        const WALL_T = FRONTAL + S + EPS + S + FRONTAL; // 17.5cm total
        const hWT = WALL_T / 2; // 0.0875 — usado em todo buildWallFrame
        const FLOOR_ELEV = 0.20; // assoalho 20cm acima da entrada
        const FLOOR_T = 0.02; // assoalho frontal 2cm
        const pierD2 = state.pierD;
        const pierClearance = pierD2 / 2 + 0.05;

        function addB(x, y, z, bx, by, bz, mat) {
          const g = new THREE.BoxGeometry(bx, by, bz);
          const m = new THREE.Mesh(g, mat || wfMat);
          m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), wfEdge));
          m.position.set(x, y, z);
          wallFrameGroup.add(m);
        }

        // ---- ASSOALHO (elevado 20cm, frontal 2cm) ----
        const VIGA_W = 0.06, VIGA_H = 0.18, BARR_W = 0.05, BARR_H = 0.15;
        const BARR_SP = 0.40;
        const floorBaseY = FLOOR_ELEV - FLOOR_T; // topo da estrutura

        // 3 vigas mestras (apoiam no chão, sobem até floorBaseY)
        for (const vz of [-rD / 2 + VIGA_W / 2, 0, rD / 2 - VIGA_W / 2])
          addB(0, FLOOR_ELEV - VIGA_H / 2 - FLOOR_T, vz, rW, VIGA_H, VIGA_W, floorMat);

        // Barrotes
        const nBarr = Math.ceil(rW / BARR_SP) + 1;
        const barrSP = rW / (nBarr - 1);
        for (let bi = 0; bi < nBarr; bi++) {
          const bx = -rW / 2 + bi * barrSP;
          if (Math.abs(bx) < pierClearance) continue;
          addB(bx, FLOOR_ELEV - BARR_H / 2 - FLOOR_T, 0, BARR_W, BARR_H, rD);
        }

        // Assoalho frontal 2cm com furo para pilar
        const holeR = pierClearance + 0.02;
        const floorY = FLOOR_ELEV - FLOOR_T / 2;
        const wW = rW / 2 - holeR;
        if (wW > 0.01) {
          addB(-rW / 2 + wW / 2, floorY, 0, wW, FLOOR_T, rD, frontalMat);
          addB(rW / 2 - wW / 2, floorY, 0, wW, FLOOR_T, rD, frontalMat);
        }
        const cH2 = rD / 2 - holeR;
        if (cH2 > 0.01) {
          addB(0, floorY, -rD / 2 + cH2 / 2, holeR * 2, FLOOR_T, cH2, frontalMat);
          addB(0, floorY, rD / 2 - cH2 / 2, holeR * 2, FLOOR_T, cH2, frontalMat);
        }

        // Trimmer joists ao redor do furo
        const barY = FLOOR_ELEV - BARR_H / 2 - FLOOR_T;
        for (const sz of [-1, 1])
          addB(0, barY, sz * holeR, holeR * 2 + BARR_W * 2, BARR_H, BARR_W);
        for (const sx of [-1, 1]) {
          const segLen = rD / 2 - holeR;
          if (segLen > 0.1) {
            addB(sx * holeR, barY, -rD / 2 + segLen / 2, BARR_W, BARR_H, segLen);
            addB(sx * holeR, barY, rD / 2 - segLen / 2, BARR_W, BARR_H, segLen);
          }
        }

        // ---- PAREDES ----
        const studH = rH - S * 3;

        function buildWall(startX, startZ, len, dirX, dirZ, hasOp, opS, opE, opB, opT) {
          const nSt = Math.ceil(len / SP) + 1;
          const sp = len / (nSt - 1);
          for (let si = 0; si < nSt; si++) {
            const t = si * sp;
            const mx = startX + dirX * t, mz = startZ + dirZ * t;
            const inOp = hasOp && t >= opS && t <= opE;
            const bw = Math.abs(dirZ) * S + Math.abs(dirX) * D;
            const bd = Math.abs(dirX) * S + Math.abs(dirZ) * D;
            if (!inOp) {
              addB(mx, S + studH / 2, mz, bw, studH, bd);
            } else {
              if (opB > S) addB(mx, S + (opB - S) / 2, mz, bw, opB - S, bd);
              if (opT < rH - S * 2) {
                const h = rH - S * 2 - opT;
                addB(mx, opT + h / 2, mz, bw, h, bd);
              }
            }
          }
          // Soleiras
          addB(startX + dirX * len / 2, S / 2, startZ + dirZ * len / 2,
            Math.abs(dirX) * len + Math.abs(dirZ) * D, S,
            Math.abs(dirZ) * len + Math.abs(dirX) * D);
          for (let i = 0; i < 2; i++)
            addB(startX + dirX * len / 2, rH - S / 2 - i * S, startZ + dirZ * len / 2,
              Math.abs(dirX) * len + Math.abs(dirZ) * D, S,
              Math.abs(dirZ) * len + Math.abs(dirX) * D);
          // Travessa
          if (!hasOp)
            addB(startX + dirX * len / 2, rH / 2, startZ + dirZ * len / 2,
              Math.abs(dirX) * len + Math.abs(dirZ) * D, S,
              Math.abs(dirZ) * len + Math.abs(dirX) * D);
          // Abertura
          if (hasOp) {
            const vLen = opE - opS + 0.20, vMid = (opS + opE) / 2;
            const vW = Math.abs(dirX) * vLen + Math.abs(dirZ) * 0.14;
            const vD = Math.abs(dirZ) * vLen + Math.abs(dirX) * 0.14;
            addB(startX + dirX * vMid, opT + S / 2, startZ + dirZ * vMid, vW, S, vD);
            if (opB > S * 2)
              addB(startX + dirX * vMid, opB - S / 2, startZ + dirZ * vMid, vW, S, vD);
            for (const edge of [opS, opE]) {
              const jx = startX + dirX * edge, jz = startZ + dirZ * edge;
              const jBot = opB > S * 2 ? opB : S, jH = opT - jBot;
              if (jH > 0.05) addB(jx + dirZ * S * 0.6, jBot + jH / 2, jz + dirX * S * 0.6,
                Math.abs(dirZ) * S + Math.abs(dirX) * D, jH,
                Math.abs(dirX) * S + Math.abs(dirZ) * D);
            }
          }
        }

        // Ajustar base das paredes para o nível do assoalho
        buildWall(-rW / 2, -rD / 2, rW, 1, 0, false);
        const winS = rW / 2 - 0.75, winE = rW / 2 + 0.75;
        buildWall(-rW / 2, rD / 2, rW, 1, 0, true, winS, winE, 1.1, 2.0);
        buildWall(rW / 2, -rD / 2, rD, 0, 1, true, hWT + 0.15, hWT + 1.05, 0, 2.1);
        buildWall(-rW / 2, -rD / 2, rD, 0, 1, false);

        // ---- REVESTIMENTO: Frontais 2cm + EPS — posicionamento explícito ----
        const wH = rH - FLOOR_ELEV;
        const wMY = FLOOR_ELEV + wH / 2;

        // Coordenadas das faces (centro da parede ± hWT para ext/int)
        // Parede Norte: z = -rD/2, ext z = -rD/2 - hWT, int z = -rD/2 + hWT
        // Parede Sul:   z = +rD/2, ext z = +rD/2 + hWT, int z = +rD/2 - hWT
        // Parede Leste: x = +rW/2, ext x = +rW/2 + hWT, int x = +rW/2 - hWT
        // Parede Oeste: x = -rW/2, ext x = -rW/2 - hWT, int x = -rW/2 + hWT

        // Helper: placa horizontal (ao longo de X) em posição Z
        function hPlate(x, y, z, lenX, h, thick, mat) { addB(x, y, z, lenX, h, thick, mat); }
        // Helper: placa vertical (ao longo de Z) em posição X
        function vPlate(x, y, z, thick, h, lenZ, mat) { addB(x, y, z, thick, h, lenZ, mat); }

        // ---- NORTE (sólida, ao longo de X) ----
        for (const zOff of [-hWT, 0, hWT]) {
          const mat = Math.abs(zOff) > 0.01 ? frontalMat : epsMat;
          const th = Math.abs(zOff) > 0.01 ? FRONTAL : EPS;
          hPlate(0, wMY, -rD / 2 - zOff, rW, wH, th, mat);
        }

        // ---- OESTE (sólida, ao longo de Z) ----
        for (const xOff of [-hWT, 0, hWT]) {
          const mat = Math.abs(xOff) > 0.01 ? frontalMat : epsMat;
          const th = Math.abs(xOff) > 0.01 ? FRONTAL : EPS;
          vPlate(-rW / 2 - xOff, wMY, 0, th, wH, rD, mat);
        }

        // ---- SUL (janela: x de -0.75 a +0.75, y de 1.1 a 2.0) ----
        {
          const wL = -0.75, wR = 0.75, wB = 1.1, wT = 2.0;
          for (const zOff of [hWT, 0, -hWT]) {
            const mat = Math.abs(zOff) > 0.01 ? frontalMat : epsMat;
            const th = Math.abs(zOff) > 0.01 ? FRONTAL : EPS;
            const z = rD / 2 + zOff;
            // Esquerda (de -rW/2 até wL)
            const lLen = wL + rW / 2;
            if (lLen > 0.01) hPlate(-rW / 2 + lLen / 2, wMY, z, lLen, wH, th, mat);
            // Direita (de wR até +rW/2)
            const rLen = rW / 2 - wR;
            if (rLen > 0.01) hPlate(rW / 2 - rLen / 2, wMY, z, rLen, wH, th, mat);
            // Acima da janela
            const aH = rH - wT;
            if (aH > 0.01) hPlate(0, wT + aH / 2, z, wR - wL, aH, th, mat);
            // Abaixo da janela
            const bH = wB - FLOOR_ELEV;
            if (bH > 0.01) hPlate(0, FLOOR_ELEV + bH / 2, z, wR - wL, bH, th, mat);
          }
        }

        // ---- LESTE (porta alinhada com doorMesh) ----
        {
          const doorCenterZ = -rD / 2 + hWT + 0.6; // mesmo que updateAll
          const dN = doorCenterZ - 0.45, dS = doorCenterZ + 0.45;
          const dB = FLOOR_ELEV, dT = FLOOR_ELEV + 2.1;
          for (const xOff of [hWT, 0, -hWT]) {
            const mat = Math.abs(xOff) > 0.01 ? frontalMat : epsMat;
            const th = Math.abs(xOff) > 0.01 ? FRONTAL : EPS;
            const x = rW / 2 + xOff;
            // Norte da porta (de -rD/2 até dN)
            const nLen = dN + rD / 2;
            if (nLen > 0.01) vPlate(x, wMY, -rD / 2 + nLen / 2, th, wH, nLen, mat);
            // Sul da porta (de dS até +rD/2)
            const sLen = rD / 2 - dS;
            if (sLen > 0.01) vPlate(x, wMY, rD / 2 - sLen / 2, th, wH, sLen, mat);
            // Acima da porta
            const aH = rH - dT;
            if (aH > 0.01) vPlate(x, dT + aH / 2, (dN + dS) / 2, th, aH, dS - dN, mat);
          }
        }

        // Degrau de entrada (alinhado com a porta)
        const doorCZ = -rD / 2 + hWT + 0.6;
        addB(rW / 2 + hWT, FLOOR_ELEV / 2, doorCZ, 0.30, FLOOR_ELEV, 0.90, floorMat);
      }

      let prevRoofKey = "";
      function buildRoof(rW, rD, rH) {
        const key = rW + "," + rD + "," + rH + "," +
          derived.currentMaxVolZ.toFixed(2) + "," + derived.currentMaxVolR.toFixed(2) + "," +
          state.roofPitch + "," + state.roofDir;
        if (key === prevRoofKey) return;
        prevRoofKey = key;

        // Limpar trilhos anteriores da cena
        for (let i = scene.children.length - 1; i >= 0; i--) {
          const c = scene.children[i];
          if (c.userData && c.userData.roofRail) {
            if (c.geometry) c.geometry.dispose();
            scene.remove(c);
          }
        }

        // Limpar telhas anteriores
        while (roofGroup.children.length > 0) {
          const c = roofGroup.children[0];
          c.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
            if (o.material && o.material !== roofMatA && o.material !== roofMatB)
              o.material.dispose();
          });
          roofGroup.remove(c);
        }

        const TILE_L = 2.5,
          TILE_W = 1.0,
          TILE_H = 0.04;
        const OVERLAP = 0.05,
          BEIRAL = 0.15;
        const PITCH = (state.roofPitch * Math.PI) / 180;
        const WHEEL_H = 0.10; // altura dos rodízios sobre o trilho
        const rHB = rH + WHEEL_H; // base real do telhado (acima dos trilhos)

        // Cumeeira ao longo do eixo MAIOR
        // Sempre construir com cumeeira ao longo de Z (ridgeX=false)
        // A rotação do roofGroup ajusta a orientação final
        const ridgeX = false;
        const ridgeLen = (ridgeX ? rW : rD) + 2 * BEIRAL;
        const halfSpan = (ridgeX ? rD : rW) / 2 + BEIRAL;
        const slopeLen = halfSpan / Math.cos(PITCH);
        const ridgeRise = halfSpan * Math.tan(PITCH);

        // TILE_L (3m) desce o talude, TILE_W (1m) ao longo da cumeeira
        const nRidge = Math.round(ridgeLen / TILE_W) + 1; // +1 telha para beiral (meio de cada lado)
        const nSlope = Math.ceil(slopeLen / (TILE_L - OVERLAP)); // 3m tiles descendo o talude
        const totalRidge = nRidge * TILE_W;
        derived.roofTotalZ = totalRidge; // salvar para slide e colisão

        // Estrutura de madeira (pinus autoclavado)
        const woodMat2 = new THREE.MeshStandardMaterial({
          color: 0xc4a35a, roughness: 0.8, metalness: 0.0,
        });
        const woodEdge = new THREE.LineBasicMaterial({
          color: 0x8b7332, transparent: true, opacity: 0.4,
        });

        function addBeam(sx, sy, sz, ex, ey, ez, bw, bh) {
          const dx = ex - sx, dy = ey - sy, dz = ez - sz;
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (len < 0.01) return;
          const geo = new THREE.BoxGeometry(bw, bh, len);
          const beam = new THREE.Mesh(geo, woodMat2);
          beam.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), woodEdge));
          beam.position.set((sx + ex) / 2, (sy + ey) / 2, (sz + ez) / 2);
          beam.lookAt(ex, ey, ez);
          roofGroup.add(beam);
        }

        // Tesouras (A-frames): 4 unidades espaçadas ao longo da cumeeira (Z)
        // Tesouras alinhadas com as paredes N/S
        // Primeira e última tesoura nas paredes, intermediárias espaçadas ≤1.5m
        const nTruss = Math.max(3, Math.ceil(rD / 1.5) + 1);
        const trussSpacing = rD / (nTruss - 1);
        const trussPositions = [];
        for (let ti = 0; ti < nTruss; ti++) {
          trussPositions.push(-rD / 2 + ti * trussSpacing);
        }

        for (const zz of trussPositions) {
          // 2 caibros (rafters) 6×12cm: do frechal à cumeeira
          for (const sx of [-1, 1]) {
            addBeam(
              sx * halfSpan, rHB, zz,
              0, rHB + ridgeRise, zz,
              0.06, 0.12,
            );
          }
          // Tirante (tie beam) 6×12cm: horizontal conectando as bases
          addBeam(
            -halfSpan, rHB, zz,
            halfSpan, rHB, zz,
            0.06, 0.12,
          );
          // Pendural (king post) 6×6cm: vertical do tirante à cumeeira
          addBeam(0, rHB, zz, 0, rHB + ridgeRise, zz, 0.06, 0.06);
          // Escoras (struts) 6×6cm: diagonais do pendural ao caibro
          for (const sx of [-1, 1]) {
            addBeam(
              0, rHB + ridgeRise * 0.4, zz,
              sx * halfSpan * 0.5, rHB + ridgeRise * 0.5, zz,
              0.06, 0.06,
            );
          }
        }

        // Cumeeira: viga 6×16cm ao longo de Z conectando os picos
        addBeam(
          0, rHB + ridgeRise, -totalRidge / 2,
          0, rHB + ridgeRise, totalRidge / 2,
          0.06, 0.16,
        );

        // Frechais / vigas-trilho: 6×15cm ao longo de Z nas bases L/O
        for (const sx of [-1, 1]) {
          addBeam(
            sx * halfSpan, rHB - 0.075, -totalRidge / 2,
            sx * halfSpan, rHB - 0.075, totalRidge / 2,
            0.06, 0.15,
          );
        }

        // Terças intermediárias: 5×7cm entre tesouras, ao longo do talude
        // 2 terças por lado (a 1/3 e 2/3 do talude)
        for (const frac of [0.33, 0.66]) {
          for (const sx of [-1, 1]) {
            const tx = sx * halfSpan * (1 - frac);
            const ty = rHB + ridgeRise * frac;
            addBeam(
              tx, ty, -totalRidge / 2,
              tx, ty, totalRidge / 2,
              0.05, 0.07,
            );
          }
        }

        // Contraventamento em X entre tesouras (rigidez lateral)
        for (let ti = 0; ti < nTruss - 1; ti++) {
          const z1 = trussPositions[ti];
          const z2 = trussPositions[ti + 1];
          // X no plano do talude (apenas no lado Leste)
          addBeam(halfSpan * 0.5, rHB + ridgeRise * 0.5, z1,
                  halfSpan, rHB, z2, 0.05, 0.05);
          addBeam(halfSpan, rHB, z1,
                  halfSpan * 0.5, rHB + ridgeRise * 0.5, z2, 0.05, 0.05);
        }

        // Rodízios (wheels) sob os frechais — 3 por lado
        {
          const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x333333, roughness: 0.5, metalness: 0.6,
          });
          const wheelR = 0.05; // raio 5cm
          const wheelW = 0.04; // largura 4cm
          for (const sx of [-1, 1]) {
            for (const zf of [0, -totalRidge * 0.35, totalRidge * 0.35]) {
              const wGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 12);
              const wheel = new THREE.Mesh(wGeo, wheelMat);
              wheel.rotation.z = Math.PI / 2;
              wheel.position.set(sx * halfSpan, rH + wheelR, zf);
              roofGroup.add(wheel);
            }
          }
        }

        for (const side of [-1, 1]) {
          for (let r = 0; r < nRidge; r++) {
            for (let s = 0; s < nSlope; s++) {
              const isAlt = (r + s) % 2 === 0;
              // TILE_L (3m) ao longo do talude (X), TILE_W (1m) ao longo da cumeeira (Z)
              const geo = ridgeX
                ? new THREE.BoxGeometry(TILE_W, TILE_H, TILE_L)
                : new THREE.BoxGeometry(TILE_L, TILE_H, TILE_W);
              const tile = new THREE.Mesh(
                geo,
                isAlt ? roofMatA : roofMatB,
              );
              tile.add(
                new THREE.LineSegments(
                  new THREE.EdgesGeometry(geo),
                  roofEdgeMat,
                ),
              );

              const ridgePos =
                (r - (nRidge - 1) / 2) * TILE_W;
              const slopeDist =
                s * (TILE_L - OVERLAP) + TILE_L / 2;
              const hz = slopeDist * Math.cos(PITCH);
              const vt = -slopeDist * Math.sin(PITCH);
              // Telhas acima da estrutura: offset perpendicular ao talude
              const structH = 0.14; // caibro 12cm + folga + meia telha
              const tileOffY = structH * Math.cos(PITCH);
              const tileOffX = structH * Math.sin(PITCH);

              if (ridgeX) {
                tile.position.set(
                  ridgePos,
                  rHB + ridgeRise + vt + tileOffY,
                  side * (hz - tileOffX),
                );
                tile.rotation.x = side * PITCH;
              } else {
                tile.position.set(
                  side * (hz - tileOffX),
                  rHB + ridgeRise + vt + tileOffY,
                  ridgePos,
                );
                tile.rotation.z = -side * PITCH;
              }

              roofGroup.add(tile);
            }
          }
        }

        // Cumeeira (viga no topo)
        const ridgeGeo = ridgeX
          ? new THREE.BoxGeometry(totalRidge, 0.06, 0.08)
          : new THREE.BoxGeometry(0.08, 0.06, totalRidge);
        const ridgeBeam = new THREE.Mesh(ridgeGeo, roofMatA);
        ridgeBeam.position.set(0, rHB + ridgeRise + 0.03, 0);
        roofGroup.add(ridgeBeam);

        // Empenas removidas — telhado aberto nas laterais N/S

        // Trilhos e suporte — direção depende do slide
        const railMat = new THREE.MeshStandardMaterial({
          color: 0x4b5563, roughness: 0.6, metalness: 0.4,
        });
        const slideDir = state.roofDir;
        // Slide ao longo de Z (N/S) ou X (L/O)
        const slideAlongZ = (slideDir === "N" || slideDir === "S");
        const slideSign = (slideDir === "N" || slideDir === "O") ? -1 : 1;
        const slideRoomDim = slideAlongZ ? rD : rW;
        const slideLen = totalRidge + slideRoomDim + 0.5;
        const railW = 0.15, railH = 0.08; // trilho 15×8cm (mais robusto)
        const postMat = new THREE.MeshStandardMaterial({
          color: 0xc4a35a, roughness: 0.8, metalness: 0.0,
        });
        const PS = 0.15; // postes 15×15cm
        const postEdgeMat = new THREE.LineBasicMaterial({ color: 0x8b7332, transparent: true, opacity: 0.3 });
        const perpDim = slideAlongZ ? rW : rD;
        const perpOff = perpDim / 2 + 0.04;

        function addRailPiece(x, y, z, bx, by, bz, mat) {
          const g = new THREE.BoxGeometry(bx, by, bz);
          const m = new THREE.Mesh(g, mat || postMat);
          m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), postEdgeMat));
          m.position.set(x, y, z);
          m.userData.roofRail = true;
          scene.add(m);
        }

        // Trilhos: sobre a casa + extensão para fora
        {
          // Trilho sobre a casa: de -slideRoomDim/2 a +slideRoomDim/2
          for (const side of [-1, 1]) {
            if (slideAlongZ) {
              addRailPiece(side * perpOff, rH - railH / 2, 0, railW, railH, slideRoomDim, railMat);
            } else {
              addRailPiece(0, rH - railH / 2, side * perpOff, slideRoomDim, railH, railW, railMat);
            }
          }
          // Trilho extensão fora da casa (do lado da abertura até o fim)
          const extStart = slideSign * slideRoomDim / 2;
          const extEnd = slideSign * (slideLen - slideRoomDim / 2);
          const extL = Math.abs(extEnd - extStart);
          const extM = (extStart + extEnd) / 2;
          for (const side of [-1, 1]) {
            if (slideAlongZ) {
              addRailPiece(side * perpOff, rH - railH / 2, extM, railW, railH, extL, railMat);
            } else {
              addRailPiece(extM, rH - railH / 2, side * perpOff, extL, railH, railW, railMat);
            }
          }
        }

        // Postes 15×15cm: 4 a cada lado (sala + 2 intermediários + fim)
        const railEnd = slideSign * (slideLen - slideRoomDim / 2);
        const railStart = -slideSign * slideRoomDim / 2;
        const extLen = Math.abs(railEnd - railStart);
        const nPostExt = Math.max(3, Math.ceil(extLen / 1.5) + 1);
        const postPositions = [];
        for (let pi = 0; pi < nPostExt; pi++) {
          postPositions.push(railStart + (railEnd - railStart) * pi / (nPostExt - 1));
        }

        for (const side of [-1, 1]) {
          for (const pa of postPositions) {
            // Só postes FORA da sala
            const inSala = pa > -slideRoomDim / 2 - 0.1 && pa < slideRoomDim / 2 + 0.1;
            if (inSala) continue;
            if (slideAlongZ) {
              addRailPiece(side * perpOff, rH / 2, pa, PS, rH, PS);
            } else {
              addRailPiece(pa, rH / 2, side * perpOff, PS, rH, PS);
            }
          }
        }

        // Vigas transversais no topo (só fora da sala)
        for (const pa of postPositions) {
          const inSala = pa > -slideRoomDim / 2 - 0.1 && pa < slideRoomDim / 2 + 0.1;
          if (inSala) continue;
          if (slideAlongZ) {
            addRailPiece(0, rH - PS / 2, pa, perpDim + 0.30, PS, PS);
          } else {
            addRailPiece(pa, rH - PS / 2, 0, PS, PS, perpDim + 0.30);
          }
        }

      }

      const roofMatA = new THREE.MeshStandardMaterial({
        color: 0x78716c,
        roughness: 0.4,
        metalness: 0.7,
        side: THREE.DoubleSide,
      });
      const roofMatB = new THREE.MeshStandardMaterial({
        color: 0x6b6560,
        roughness: 0.4,
        metalness: 0.7,
        side: THREE.DoubleSide,
      });
      const roofEdgeMat = new THREE.LineBasicMaterial({
        color: 0xa8a29e,
        opacity: 0.6,
        transparent: true,
      });

      function updateAll() {
        // Bridge: read from state (Phase 2) — local consts used by the rest of updateAll
        const H_con = state.H_con;
        const H_ext = state.H_ext;
        const Y_MOUNT = state.Y_MOUNT;
        const X_PIVOT = state.X_PIVOT;
        const pierD = state.pierD;
        const lat = state.lat;
        const Y_BASE = state.Y_BASE;
        const Z_RA = state.Z_RA;
        const Y_DEC = state.Y_DEC;
        const Y_CW = state.Y_CW;
        const TUBE_LEN = state.TUBE_LEN;
        const TUBE_OFF = state.TUBE_OFF;
        const EYE_LEN = state.EYE_LEN;
        const TUBE_D = state.TUBE_D;
        const TUBE_R = TUBE_D / 2;
        const rW = state.rW;
        const rD = state.rD;
        const rH = state.rH;

        const Z_FRONT = TUBE_LEN / 2 + TUBE_OFF;
        const Z_BACK = TUBE_LEN / 2 - TUBE_OFF;
        const Z_BACK_TOTAL = Z_BACK + EYE_LEN;

        const H_total = H_con + H_ext + Y_MOUNT;

        roomGroup.scale.set(rW, rH, rD);

        // Posicionar Móveis e Arquitetura contra as paredes
        furnitureGroup.visible =
          currentTab === "ROOM" && state.showFurniture;
        if (archGroup) archGroup.visible = currentTab === "ROOM";
        if (wallFrameGroup) {
          wallFrameGroup.visible = currentTab === "ROOM";
          buildWallFrame(rW, rD, rH);
        }

        // Posições internas (descontando espessura das paredes e elevação do piso)
        const WT = 0.175; // espessura total parede
        const hWT = WT / 2;
        const intE = rW / 2 - hWT;  // face interna Leste
        const intW2 = -rW / 2 + hWT; // face interna Oeste
        const intS = rD / 2 - hWT;  // face interna Sul
        const intN = -rD / 2 + hWT; // face interna Norte
        const flY = 0.20; // nível do assoalho

        // Mesa no canto Noroeste, virada para Leste
        deskGroup.position.set(intW2 + 0.35, flY, intN + 0.8);
        deskGroup.rotation.y = -Math.PI / 2;
        chairGroup.position.set(intW2 + 1.0, flY, intN + 0.8);
        chairGroup.rotation.y = -Math.PI / 2;

        // Sofá-cama na parede Sul, encostado na parede Leste
        sofaGroup.position.set(intE - 0.9, flY, intS - 0.475);
        sofaGroup.rotation.y = Math.PI;

        // Abrir/fechar sofá-cama
        if (sofaBedMat) {
          sofaBedMat.visible = state.sofaBedOpen && state.showFurniture;
        }

        // Colchão no canto Sudoeste, encostado nas paredes internas Sul e Oeste
        if (mattressGroup) {
          mattressGroup.visible = state.showFurniture;
          mattressGroup.position.set(intW2 + 0.79, flY, intS - 0.99);
        }


        if (archGroup) {
          // Porta: escalar para caber se o muro for menor que 2.1m
          const doorMaxH = 2.1;
          const doorAvail = rH - flY; // espaço disponível acima do piso
          const doorScale = Math.min(1, doorAvail / doorMaxH);
          doorMesh.scale.set(1, doorScale, 1);
          doorMesh.position.set(rW / 2 - hWT, flY, -rD / 2 + hWT + 0.6);
          doorMesh.rotation.y = 0;
          doorMesh.visible = doorAvail > 0.5; // esconder se espaço < 50cm

          // Janela: esconder se não cabe (muro < 1.3m acima do piso)
          const winAvail = rH - 1.1; // espaço acima do peitoril
          windowMesh.visible = winAvail > 0.3;
          if (windowMesh.visible) {
            const winScale = Math.min(1, winAvail / 0.9);
            windowMesh.scale.set(1, winScale, 1);
            const winCenterY = 1.1 + (0.9 * winScale) / 2;
            windowMesh.position.set(0, winCenterY, rD / 2 - hWT);
          }
        }

        // Telhado de duas águas — reconstroi se dimensões mudaram + slide
        if (roofGroup) {
          roofGroup.visible = currentTab === "ROOM";
          buildRoof(rW, rD, rH);

          // Rotação e slide do telhado baseado na direção de abertura
          // O telhado é construído com cumeeira ao longo de Z
          // Rotacionar para alinhar com a direção correta:
          //   Abre N: cumeeira L-O → rotar 90° → slide -Z
          //   Abre S: cumeeira L-O → rotar 90° → slide +Z
          //   Abre L: cumeeira N-S → sem rotação → slide +X (no local = +Z rotacionado)
          //   Abre O: cumeeira N-S → sem rotação → slide -X
          const openPct = state.roofOpen / 100;
          const slideMax = derived.roofTotalZ + Math.max(rW, rD);
          const slideDir = state.roofDir;

          let rotY = 0, slidePosX = 0, slidePosZ = 0;
          if (slideDir === "N") {
            rotY = Math.PI;
            slidePosZ = -openPct * slideMax;
          } else if (slideDir === "S") {
            rotY = 0;
            slidePosZ = openPct * slideMax;
          } else if (slideDir === "L") {
            rotY = -Math.PI / 2;
            slidePosX = openPct * slideMax;
          } else if (slideDir === "O") {
            rotY = Math.PI / 2;
            slidePosX = -openPct * slideMax;
          }
          roofGroup.rotation.y = rotY;
          roofGroup.position.set(slidePosX, 0, slidePosZ);
        }

        // Trilhos visíveis apenas no Cômodo 3D
        for (let i = 0; i < scene.children.length; i++) {
          const c = scene.children[i];
          if (c.userData && c.userData.roofRail) c.visible = currentTab === "ROOM";
        }

        pierMesh.scale.set(pierD / 2, H_con, pierD / 2);
        pierExtMesh.scale.set(0.075, H_ext, 0.075);
        pierExtMesh.position.set(0, H_con, -X_PIVOT);

        mountBaseMesh.scale.set(
          0.085,
          Y_MOUNT > 0.001 ? Y_MOUNT : 0.001,
          0.085,
        );
        mountBaseMesh.position.set(0, H_con + H_ext, -X_PIVOT);

        const frontData = generateKinematicGeometry(
          H_total,
          Y_DEC,
          Z_FRONT,
          lat,
          false,
          Z_RA,
          X_PIVOT,
          Y_BASE,
          TUBE_R,
        );
        volumeMesh.geometry.dispose();
        volumeMesh.geometry = frontData.geometry;
        volumeMesh.children[0].geometry.dispose();
        volumeMesh.children[0].geometry = new THREE.WireframeGeometry(
          frontData.geometry,
        );

        const eyeData = generateKinematicGeometry(
          H_total,
          Y_DEC,
          Z_BACK_TOTAL,
          lat,
          true,
          Z_RA,
          X_PIVOT,
          Y_BASE,
          TUBE_R,
        );
        eyeVolumeMesh.geometry.dispose();
        eyeVolumeMesh.geometry = eyeData.geometry;
        eyeVolumeMesh.children[0].geometry.dispose();
        eyeVolumeMesh.children[0].geometry = new THREE.WireframeGeometry(
          eyeData.geometry,
        );

        derived.currentMaxVolZ = Math.max(frontData.maxZ, eyeData.maxZ);
        derived.currentMaxVolR = Math.max(frontData.maxRadius, eyeData.maxRadius);
        derived.currentEyeMinZ = eyeData.minZ;

        document.getElementById("outMaxZ").innerText =
          derived.currentMaxVolZ.toFixed(2) + " m";
        document.getElementById("outMaxR").innerText =
          derived.currentMaxVolR.toFixed(2) + " m";
        document.getElementById("outMinEyeZ").innerText =
          eyeData.minZ.toFixed(2) + " m";
        document.getElementById("outMaxEyeZ").innerText =
          eyeData.maxZ.toFixed(2) + " m";

        // Visibilidade dos volumes baseada no estado
        volumeMesh.visible = state.showVolumes;
        eyeVolumeMesh.visible = state.showVolumes;

        // Elevação mínima observável: considera a posição física do tubo
        // a RA=180° (pior caso), varrendo todas as declinações
        {
          const raAngle = Math.PI; // RA = 180°
          const theta = ((90 - Math.abs(lat)) * Math.PI) / 180;
          const tips = [
            { len: Z_FRONT, dir: -1 }, // frente do tubo
            { len: Z_BACK_TOTAL, dir: 1 }, // ocular
          ];
          const decSteps = 72;
          let worst = { angle: 0, wallName: "", dec: 0 };

          for (const tip of tips) {
            for (let j = 0; j <= decSteps; j++) {
              const dec = (j / decSteps) * Math.PI - Math.PI / 2;

              const x_dec = Y_DEC;
              const y_dec = tip.dir * tip.len;

              const y_ra0 = y_dec * Math.cos(dec);
              const z_ra0 = y_dec * Math.sin(dec) + Z_RA;

              const x_tilt =
                x_dec * Math.cos(raAngle) - y_ra0 * Math.sin(raAngle);
              const y_tilt =
                x_dec * Math.sin(raAngle) +
                y_ra0 * Math.cos(raAngle) +
                Y_BASE;
              const z_tilt = z_ra0;

              const y_w =
                y_tilt * Math.cos(theta) - z_tilt * Math.sin(theta);
              const z_w =
                y_tilt * Math.sin(theta) + z_tilt * Math.cos(theta);

              const tipX = x_tilt;
              const tipY = z_w + H_total;
              const tipZ = -y_w - X_PIVOT;

              const wa = rH - tipY;
              if (wa <= 0) continue;

              const wallDirs = [
                { name: "Leste", d: rW / 2 - tipX },
                { name: "Oeste", d: rW / 2 + tipX },
                { name: "Sul", d: rD / 2 - tipZ },
                { name: "Norte", d: rD / 2 + tipZ },
              ];

              for (const w of wallDirs) {
                if (w.d <= 0) continue;
                const a =
                  Math.atan2(wa, w.d) * (180 / Math.PI);
                if (a > worst.angle) {
                  worst.angle = a;
                  worst.wallName = w.name;
                  worst.dec = dec * (180 / Math.PI);
                }
              }
            }
          }

          if (worst.angle <= 0) {
            document.getElementById("outMinElev").innerText = "0.0°";
            document.getElementById("outMinElevDir").innerText =
              "Tubo sempre acima das paredes";
          } else {
            document.getElementById("outMinElev").innerText =
              worst.angle.toFixed(1) + "°";
            document.getElementById("outMinElevDir").innerText =
              "Parede " +
              worst.wallName +
              " (RA 180°, Dec " +
              worst.dec.toFixed(0) +
              "°)";
          }
        }

        rigGroup.position.set(0, H_total, -X_PIVOT);
        tiltGroup.rotation.x = ((90 - Math.abs(lat)) * Math.PI) / 180;

        raNode.rotation.z = THREE.MathUtils.degToRad(state.RA + 90);
        decNode.rotation.x = THREE.MathUtils.degToRad(-state.Dec);

        baseBlock.position.set(0, -0.11, -0.06);
        baseDial.position.set(0, -0.11, -0.06);

        const rodLen = Y_BASE > 0.001 ? Y_BASE : 0.001;
        baseRod.scale.set(1, rodLen, 1);
        baseRod.position.set(0, Y_BASE / 2, 0);

        raHousing.scale.set(1, Z_RA + 0.05, 1);
        raHousing.position.set(0, Y_BASE, Z_RA / 2);
        controlPanel.position.set(0.09, Y_BASE, Z_RA / 2);

        raNode.position.set(0, Y_BASE, 0);
        decHousingGroup.position.set(0, 0, Z_RA);

        const decStart = -0.12;
        const dovetailThick = 0.02,
          saddleThick = 0.04;

        const dovetailX = Y_DEC - TUBE_R - dovetailThick / 2;
        const saddleX = Y_DEC - TUBE_R - dovetailThick - saddleThick / 2;
        const decHousingEndX = Y_DEC - TUBE_R - dovetailThick - saddleThick;

        const decLen = decHousingEndX - decStart;
        decHousing.scale.set(0.08, Math.max(0.05, decLen), 0.08);
        decHousing.position.set(decStart + decLen / 2, 0, 0);
        decRing.scale.set(0.082, 0.015, 0.082);
        decRing.position.set(decHousingEndX - 0.0075, 0, 0);

        saddle.children[0].scale.set(saddleThick, 0.22, 1);
        saddle.position.set(saddleX, 0, 0);

        let lenDew = Math.min(0.35, TUBE_LEN * 0.3);
        let lenRear = 0.08;
        let lenMain = TUBE_LEN - lenDew - lenRear;
        if (lenMain < 0.1) lenMain = 0.1;

        let currentY = -Z_FRONT;

        dewShield.scale.set(TUBE_R * 1.05, lenDew, TUBE_R * 1.05);
        dewShield.position.set(Y_DEC, currentY + lenDew / 2, 0);
        currentY += lenDew;

        mainTube.scale.set(TUBE_R, lenMain, TUBE_R);
        mainTube.position.set(Y_DEC, currentY + lenMain / 2, 0);

        dovetailBar.scale.set(dovetailThick, lenMain + 0.05, 1);
        dovetailBar.position.set(dovetailX, currentY + lenMain / 2, 0);
        currentY += lenMain;

        rearCell.scale.set(TUBE_R, lenRear, TUBE_R);
        rearCell.position.set(Y_DEC, currentY + lenRear / 2, 0);
        currentY += lenRear;

        if (EYE_LEN > 0.001) {
          visualBack.visible = true;
          visualBack.scale.set(0.03, EYE_LEN, 0.03);
          visualBack.position.set(Y_DEC, currentY + EYE_LEN / 2, 0);
        } else {
          visualBack.visible = false;
        }

        cwShaft.scale.set(1, Y_CW, 1);
        cwShaft.position.set(-Y_CW / 2, 0, 0);
        cwWeightsGroup.position.set(-Y_CW + 0.15, 0, 0);

        if (observerGroup) updateObserver();

        // Calcular abertura mínima segura do telhado (após geometria do volume)
        if (roofGroup && currentTab === "ROOM") {
          const BEIRAL_M = 0.15;
          const PITCH_TAN_M = Math.tan((state.roofPitch * Math.PI) / 180);
          const halfSpanM = rW / 2 + BEIRAL_M;
          const ridgeRiseM = halfSpanM * PITCH_TAN_M;
          const ridgeHM = rH + ridgeRiseM;
          const slideMx = derived.roofTotalZ + rD;

          let minSafe = 0;
          for (let test = 0; test <= 100; test++) {
            const sOff = -(test / 100) * slideMx;
            const zMin = sOff - derived.roofTotalZ / 2;
            const zMax = sOff + derived.roofTotalZ / 2;
            let hit = false;
            for (const mesh of [volumeMesh, eyeVolumeMesh]) {
              if (hit) break;
              const attr = mesh.geometry.getAttribute("position");
              for (let vi = 0; vi < attr.count; vi += 3) {
                const py = attr.getY(vi);
                if (py <= rH) continue;
                const pz = attr.getZ(vi);
                if (pz < zMin || pz > zMax) continue;
                const dR = Math.abs(attr.getX(vi));
                if (dR > halfSpanM) continue;
                if (py > ridgeHM - dR * PITCH_TAN_M) {
                  hit = true;
                  break;
                }
              }
            }
            if (!hit) {
              minSafe = test;
              break;
            }
          }
          const curLabel = document.getElementById("valRoofOpen").innerText;
          if (minSafe > 0) {
            document.getElementById("valRoofOpen").innerText =
              curLabel + " (mín: " + minSafe + "%)";
          }
        }

        // LÓGICA DE AVISO CONJUNTA
        const isPierC = checkPierCrash();
        const roomCType = checkRoomCrash();

        const warningEl = document.getElementById("collisionWarning");
        if (isPierC || roomCType) {
          warningEl.style.display = "block";
          document.getElementById("ui-panel").style.borderColor = "#ef4444";

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
          document.getElementById("ui-panel").style.borderColor =
            "rgba(255,255,255,0.1)";
        }

        if (is2DMode) {
          if (currentTab === "SKY") drawSky();
          else if (currentTab === "PROJ") drawProject();
          else draw2D();
        }
      }

      function updateObserver() {
        observerGroup.visible =
          state.showObserver &&
          currentTab !== "2D" && currentTab !== "SKY" && currentTab !== "PROJ";
        const scaleY = state.observerPosture === "sitting" ? 0.65 : 1.0;
        observerGroup.scale.set(1, scaleY, 1);
        const posX = state.obsX,
          posY = state.obsY;
        observerGroup.position.set(posX, 0, -posY);
        document.getElementById("valObsX").innerText = posX.toFixed(1) + " m";
        document.getElementById("valObsY").innerText = posY.toFixed(1) + " m";

        const limitRadius = derived.currentMaxVolR;
        const obsMat = observerGroup.children[0].material;
        if (Math.sqrt(posX * posX + posY * posY) < limitRadius + 0.1)
          obsMat.color.setHex(0xef4444);
        else obsMat.color.setHex(0x22c55e);
      }

      function resize2D() {
        canvas2D.width = window.innerWidth;
        canvas2D.height = window.innerHeight;
      }

      function draw2D() {
        const ctx = canvas2D.getContext("2d");
        const w = canvas2D.width;
        const h = canvas2D.height;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, h);
          ctx.stroke();
        }
        for (let i = 0; i < h; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(w, i);
          ctx.stroke();
        }

        const uiWidth = 400;
        const cx = (w + uiWidth) / 2;
        const cy = h - 100;
        const scale = 250;

        const H_con = state.H_con;
        const H_ext = state.H_ext;
        const X_PIVOT = state.X_PIVOT;
        const Y_MOUNT = state.Y_MOUNT;
        const lat = Math.abs(state.lat);
        const rad = (lat * Math.PI) / 180;
        const Y_BASE = state.Y_BASE;
        const Z_RA = state.Z_RA;
        const Y_DEC = state.Y_DEC;
        const Y_CW = state.Y_CW;

        const TUBE_LEN = state.TUBE_LEN;
        const TUBE_OFF = state.TUBE_OFF;
        const EYE_LEN = state.EYE_LEN;
        const TUBE_D = state.TUBE_D;

        const Z_FRONT = TUBE_LEN / 2 + TUBE_OFF;
        const Z_BACK = TUBE_LEN / 2 - TUBE_OFF;

        const pBase = { x: 0, y: H_con };
        const pPivotBase = { x: -X_PIVOT, y: H_con };
        const pExtTop = { x: -X_PIVOT, y: H_con + H_ext };
        const pPivot = { x: -X_PIVOT, y: H_con + H_ext + Y_MOUNT };

        const vUp = { x: -Math.sin(rad), y: Math.cos(rad) };
        const pRaStart = {
          x: pPivot.x + vUp.x * Y_BASE,
          y: pPivot.y + vUp.y * Y_BASE,
        };

        const vRA = { x: Math.cos(rad), y: Math.sin(rad) };
        const pCross = {
          x: pRaStart.x + vRA.x * Z_RA,
          y: pRaStart.y + vRA.y * Z_RA,
        };

        const vDec = { x: -Math.sin(rad), y: Math.cos(rad) };
        const pTube = {
          x: pCross.x + vDec.x * Y_DEC,
          y: pCross.y + vDec.y * Y_DEC,
        };
        const pCW = {
          x: pCross.x - vDec.x * Y_CW,
          y: pCross.y - vDec.y * Y_CW,
        };

        const pFront = {
          x: pTube.x + vRA.x * Z_FRONT,
          y: pTube.y + vRA.y * Z_FRONT,
        };
        const pBack = {
          x: pTube.x - vRA.x * Z_BACK,
          y: pTube.y - vRA.y * Z_BACK,
        };
        const pEye = {
          x: pBack.x - vRA.x * EYE_LEN,
          y: pBack.y - vRA.y * EYE_LEN,
        };

        const pCenter = {
          x: pTube.x + vRA.x * TUBE_OFF,
          y: pTube.y + vRA.y * TUBE_OFF,
        };

        function drawSeg(p1, p2, color, width) {
          ctx.beginPath();
          ctx.moveTo(cx + p1.x * scale, cy - p1.y * scale);
          ctx.lineTo(cx + p2.x * scale, cy - p2.y * scale);
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.stroke();
        }
        function drawCirc(p, color, r) {
          ctx.beginPath();
          ctx.arc(cx + p.x * scale, cy - p.y * scale, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }
        function drawDim(p1, p2, text, color, offsetPxls = 30) {
          const mx = cx + ((p1.x + p2.x) / 2) * scale;
          const my = cy - ((p1.y + p2.y) / 2) * scale;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const l = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / l;
          const ny = -dx / l;
          ctx.fillStyle = color;
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(text, mx + nx * offsetPxls, my + ny * offsetPxls + 4);
          ctx.beginPath();
          ctx.moveTo(
            cx + p1.x * scale + nx * (offsetPxls - 10),
            cy - p1.y * scale + ny * (offsetPxls - 10),
          );
          ctx.lineTo(
            cx + p2.x * scale + nx * (offsetPxls - 10),
            cy - p2.y * scale + ny * (offsetPxls - 10),
          );
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        drawSeg({ x: -3, y: 0 }, { x: 3, y: 0 }, "#334155", 4);
        drawSeg({ x: 0, y: 0 }, pBase, "#d1d5db", 30);
        drawSeg({ x: -0.15, y: H_con }, { x: 0.15, y: H_con }, "#64748b", 6);
        drawSeg(pPivotBase, pExtTop, "#4b5563", 14);

        if (Y_MOUNT > 0.001) drawSeg(pExtTop, pPivot, "#1f2937", 12);
        if (Y_BASE > 0.01) drawSeg(pPivot, pRaStart, "#94a3b8", 12);

        drawSeg(pRaStart, pCross, "#3b82f6", 8);
        drawSeg(pCW, pTube, "#eab308", 8);
        drawCirc(pPivot, "#ef4444", 8);
        drawCirc(pCross, "#3b82f6", 6);
        drawCirc(pTube, "#eab308", 6);
        drawCirc(pCW, "#111827", 16);

        const tubePixelWidth = TUBE_D * scale;
        drawSeg(pBack, pFront, "#1f2937", tubePixelWidth);

        if (EYE_LEN > 0.001) drawSeg(pEye, pBack, "#9ca3af", 10);

        const dovetailOffset = TUBE_D / 2 + 0.01;
        const dtFront = {
          x: pFront.x - vDec.x * dovetailOffset,
          y: pFront.y - vDec.y * dovetailOffset,
        };
        const dtBack = {
          x: pBack.x - vDec.x * dovetailOffset,
          y: pBack.y - vDec.y * dovetailOffset,
        };
        drawSeg(dtBack, dtFront, "#f97316", 4);

        if (Y_MOUNT > 0.01) drawDim(pExtTop, pPivot, "Y_MOUNT", "#f87171", -30);
        if (Y_BASE > 0.01) drawDim(pPivot, pRaStart, "Y_BASE", "#f87171", 40);
        drawDim(pRaStart, pCross, "Z_RA", "#60a5fa");
        drawDim(pCross, pTube, "Y_DEC", "#facc15", -(tubePixelWidth / 2 + 20));
        drawDim(pCW, pCross, "Y_CW", "#cbd5e1", -40);

        drawDim(pBack, pFront, "TUBE_LEN", "#d1d5db", tubePixelWidth / 2 + 35);
        if (EYE_LEN > 0.01)
          drawDim(pEye, pBack, "EYE_LEN", "#fdba74", tubePixelWidth / 2 + 35);
        if (Math.abs(TUBE_OFF) > 0.001)
          drawDim(
            pCenter,
            pTube,
            "OFFSET",
            "#fca5a5",
            -(tubePixelWidth / 2 + 45),
          );

        if (Math.abs(X_PIVOT) > 0.01) {
          drawDim(pBase, pPivotBase, "X_PIVOT", "#f87171", 20);
        }

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Vista de Perfil 2D - GEM (Apontada ao Polo)",
          cx,
          cy - 20,
        );
      }

      // Panorama 360°
      const PANO_BASE64 = "data:image/jpeg;base64,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";
      let panoImg = null;
      let panoCanvas = null;
      let panoData = null;

      // Carregar panorama padrão (tenta arquivo, fallback base64)
      function loadPanoImage(src) {
        const img = new Image();
        img.onload = function () {
          panoImg = img;
          panoCanvas = document.createElement("canvas");
          panoCanvas.width = img.width;
          panoCanvas.height = img.height;
          const pctx = panoCanvas.getContext("2d");
          pctx.drawImage(img, 0, 0);
          panoData = pctx.getImageData(0, 0, img.width, img.height);
          if (currentTab === "SKY") drawSky();
        };
        img.src = src;
      }
      {
        const img = new Image();
        img.onload = function () { loadPanoImage("pano360.jpg"); };
        img.onerror = function () {
          // Fallback: carregar versão embutida em base64
          loadPanoImage(PANO_BASE64);
        };
        img.src = "pano360.jpg";
      }

      // Carregar panorama custom via file input
      document.getElementById("panoFileInput").addEventListener(
        "change",
        function (e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (ev) {
            const img = new Image();
            img.onload = function () {
              panoImg = img;
              panoCanvas = document.createElement("canvas");
              panoCanvas.width = img.width;
              panoCanvas.height = img.height;
              const pctx = panoCanvas.getContext("2d");
              pctx.drawImage(img, 0, 0);
              panoData = pctx.getImageData(0, 0, img.width, img.height);
              if (currentTab === "SKY") drawSky();
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        },
      );

      function drawSky() {
        const ctx = canvas2D.getContext("2d");
        const w = canvas2D.width;
        const h = canvas2D.height;
        ctx.clearRect(0, 0, w, h);

        const uiWidth = 400;
        const cx = (w + uiWidth) / 2;
        const cy = h / 2;
        const R = Math.min((w - uiWidth) / 2, h / 2) * 0.82;

        const H_con = state.H_con;
        const H_ext = state.H_ext;
        const X_PIVOT = state.X_PIVOT;
        const Y_MOUNT = state.Y_MOUNT;
        const lat = state.lat;
        const rW = state.rW;
        const rD = state.rD;
        const rH = state.rH;
        const H_total = H_con + H_ext + Y_MOUNT;

        function elevToR(elev) {
          return R * (1 - elev / 90);
        }
        function skyToXY(az, elev) {
          const r = elevToR(elev);
          const a = ((az - 90) * Math.PI) / 180;
          return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
        }

        // --- Panorama 360° como fundo ---
        if (panoData) {
          const pW = panoData.width;
          const pH = panoData.height;
          const pD = panoData.data;
          const panoRot = state.panoRot || 0;
          const imgData = ctx.createImageData(w, h);
          const out = imgData.data;
          const R2 = R * R;

          for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
              const dx = px - cx;
              const dy = py - cy;
              const dist2 = dx * dx + dy * dy;
              if (dist2 > R2) continue;

              const dist = Math.sqrt(dist2);
              const elev = 90 * (1 - dist / R); // graus
              if (elev < 0) continue;

              // Azimute: ângulo do pixel no mapa (0=Norte=topo)
              let az = (Math.atan2(dx, -dy) * 180) / Math.PI;
              if (az < 0) az += 360;

              // Mapear para equirectangular
              // X no pano: azimute (com rotação)
              let panoAz = (az + panoRot) % 360;
              const srcX = Math.floor((panoAz / 360) * pW) % pW;
              // Y no pano: 0=topo=zenite, pH/2=horizonte, pH=nadir
              const srcY = Math.floor(((90 - elev) / 180) * pH);

              if (srcX < 0 || srcX >= pW || srcY < 0 || srcY >= pH)
                continue;

              const srcIdx = (srcY * pW + srcX) * 4;
              const outIdx = (py * w + px) * 4;
              out[outIdx] = pD[srcIdx];
              out[outIdx + 1] = pD[srcIdx + 1];
              out[outIdx + 2] = pD[srcIdx + 2];
              out[outIdx + 3] = 180; // semi-transparente para grade visível
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // --- Grade de fundo ---

        // Círculos de elevação
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        [0, 15, 30, 45, 60, 75].forEach((elev) => {
          ctx.beginPath();
          ctx.arc(cx, cy, elevToR(elev), 0, 2 * Math.PI);
          ctx.stroke();
        });

        // Horizonte (borda, mais grosso)
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.stroke();

        // Linhas de azimute (cada 45°)
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        for (let az = 0; az < 360; az += 45) {
          const p = skyToXY(az, 0);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        // Labels de elevação
        ctx.fillStyle = "#64748b";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        [15, 30, 45, 60, 75].forEach((elev) => {
          ctx.fillText(elev + "°", cx + 4, cy - elevToR(elev) + 12);
        });

        // Pontos cardeais
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        const cardinals = [
          { label: "N", az: 0 },
          { label: "L", az: 90 },
          { label: "S", az: 180 },
          { label: "O", az: 270 },
        ];
        cardinals.forEach((c) => {
          const p = skyToXY(c.az, 0);
          const dx = p.x - cx,
            dy = p.y - cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          ctx.fillText(
            c.label,
            p.x + (dx / d) * 18,
            p.y + (dy / d) * 18 + 5,
          );
        });

        // Zênite
        ctx.fillStyle = "#475569";
        ctx.font = "10px sans-serif";
        ctx.fillText("Zênite", cx + 6, cy - 4);

        // --- Ray tracing: para cada direção do céu, verificar se está bloqueada ---
        const pivotX = 0;
        const pivotZ = -X_PIVOT;

        // Janela na parede Sul: abertura clara dentro dos frames
        const winSill = 1.125;
        const winTop = 2.075;
        const winHalfW = 0.725;

        // Ray trace: transformar raio para o espaço local do roofGroup
        // No espaço local: cumeeira SEMPRE ao longo de Z, água desce em X
        const roofOpen = state.roofOpen / 100;
        const BEIRAL_S = 0.15;
        const PITCH_TAN_S = Math.tan((state.roofPitch * Math.PI) / 180);
        const hSpan = rW / 2 + BEIRAL_S; // local: água desce em X
        const rRise = hSpan * PITCH_TAN_S;
        const ridgeH_s = rH + rRise;

        // Posição e rotação do roofGroup (mesma lógica do updateAll)
        const skyDir = state.roofDir;
        const slideMx = derived.roofTotalZ + Math.max(rW, rD);
        let roofRotY = 0, roofPosX = 0, roofPosZ = 0;
        if (skyDir === "N") { roofRotY = Math.PI; roofPosZ = -roofOpen * slideMx; }
        else if (skyDir === "S") { roofRotY = 0; roofPosZ = roofOpen * slideMx; }
        else if (skyDir === "L") { roofRotY = -Math.PI / 2; roofPosX = roofOpen * slideMx; }
        else if (skyDir === "O") { roofRotY = Math.PI / 2; roofPosX = -roofOpen * slideMx; }

        const cosR = Math.cos(-roofRotY), sinR = Math.sin(-roofRotY);

        // Cobertura no espaço local
        const localRidgeHalf = derived.roofTotalZ / 2; // ao longo de Z local
        const localRidgeLen = rD + 2 * BEIRAL_S; // comprimento real da cumeeira

        // Raio do pivô: retorna "wall", "roof", ou null (céu/janela)
        // originY = altura de origem do raio
        function traceRay(azRad, elevRad, originY) {
          const ce = Math.cos(elevRad),
            se = Math.sin(elevRad);
          const dx = Math.sin(azRad) * ce;
          const dy = se;
          const dz = -Math.cos(azRad) * ce;
          if (dy <= 0) return "wall";

          const hits = [];

          // 4 Paredes (0 até rH)
          const wallPlanes = [
            { axis: "x", val: rW / 2, dir: dx },
            { axis: "x", val: -rW / 2, dir: dx },
            { axis: "z", val: rD / 2, dir: dz },
            { axis: "z", val: -rD / 2, dir: dz },
          ];
          for (const wp of wallPlanes) {
            if (
              (wp.val > 0 && wp.dir <= 0) ||
              (wp.val < 0 && wp.dir >= 0)
            )
              continue;
            const origin = wp.axis === "x" ? pivotX : pivotZ;
            const t = (wp.val - origin) / wp.dir;
            if (t <= 0) continue;
            const hy = originY + t * dy;
            if (hy < 0 || hy > rH) continue;
            const otherAxis =
              wp.axis === "x" ? pivotZ + t * dz : pivotX + t * dx;
            const otherLimit = wp.axis === "x" ? rD / 2 : rW / 2;
            if (Math.abs(otherAxis) > otherLimit) continue;

            // Janela na parede Sul
            if (wp.val === rD / 2 && wp.axis === "z") {
              const hx = pivotX + t * dx;
              if (
                Math.abs(hx) <= winHalfW &&
                hy >= winSill &&
                hy <= winTop
              ) {
                hits.push({ t, type: "window" });
                continue;
              }
            }
            hits.push({ t, type: "wall" });
          }

          // Telhado — raio transformado para espaço LOCAL do roofGroup
          // Local: cumeeira ao longo de Z, água desce em X, Y = altura
          {
            const wx = pivotX - roofPosX, wz = pivotZ - roofPosZ;
            const lox = wx * cosR - wz * sinR;
            const loz = wx * sinR + wz * cosR;
            const loy = originY;
            const ldx = dx * cosR - dz * sinR;
            const ldz = dx * sinR + dz * cosR;
            const ldy = dy;

            // Planos inclinados: y + side*x*tan = ridgeH_s
            for (const side of [1, -1]) {
              const denom = ldy + side * ldx * PITCH_TAN_S;
              if (Math.abs(denom) < 1e-9) continue;
              const t = (ridgeH_s - loy - side * lox * PITCH_TAN_S) / denom;
              if (t <= 0) continue;
              const hx = lox + t * ldx;
              const hy = loy + t * ldy;
              const hz = loz + t * ldz;
              if (side * hx < 0) continue;
              if (Math.abs(hx) > hSpan) continue;
              if (hy < rH || hy > ridgeH_s) continue;
              if (Math.abs(hz) > localRidgeHalf) continue;
              hits.push({ t, type: "roof" });
            }

            // Empenas (paredes verticais em z = ±localRidgeHalf local)
            const cutWg = Math.max(derived.currentMaxVolR * 2 + 0.2, 1.0);
            const cutHg = Math.min(
              ridgeH_s - rH - 0.08,
              Math.max(derived.currentMaxVolZ - rH + 0.15, (ridgeH_s - rH) * 0.65),
            );
            for (const gz of [-localRidgeHalf, localRidgeHalf]) {
              if (Math.abs(ldz) < 1e-9) continue;
              const t = (gz - loz) / ldz;
              if (t <= 0) continue;
              const hx = lox + t * ldx;
              const hy = loy + t * ldy;
              if (hy < rH) continue;
              if (Math.abs(hx) > hSpan) continue;
              const maxH = ridgeH_s - Math.abs(hx) * PITCH_TAN_S;
              if (hy > maxH) continue;
              if (gz > 0) {
                if (Math.abs(hx) < cutWg / 2 && hy < rH + cutHg) continue;
              }
              hits.push({ t, type: "roof" });
            }
          }

          if (hits.length === 0) return null;
          hits.sort((a, b) => a.t - b.t);
          return hits[0].type === "window" ? null : hits[0].type;
        }

        // Dois níveis: mais baixo (ocular mínima) e mais alto (topo do volume)
        const eyeLow = Math.max(derived.currentEyeMinZ, 0.5);
        const eyeHigh = Math.max(derived.currentMaxVolZ, H_total);

        const azRes = 360;
        const elRes = 45;

        function renderLayer(originY, wallColor, roofColor) {
          for (let ai = 0; ai < azRes; ai++) {
            const azMid = ((ai + 0.5) / azRes) * 2 * Math.PI;
            for (let ei = 0; ei < elRes; ei++) {
              const el1 = (ei / elRes) * 90;
              const el2 = ((ei + 1) / elRes) * 90;
              const elMid = ((el1 + el2) / 2) * (Math.PI / 180);

              const hit = traceRay(azMid, elMid, originY);
              if (!hit) continue;

              const r1 = elevToR(el1);
              const r2 = elevToR(el2);
              const a1 = ((ai / azRes) * 360 - 90) * (Math.PI / 180);
              const a2 = (((ai + 1) / azRes) * 360 - 90) * (Math.PI / 180);

              ctx.beginPath();
              ctx.arc(cx, cy, r1, a1, a2);
              ctx.arc(cx, cy, r2, a2, a1, true);
              ctx.closePath();
              ctx.fillStyle = hit === "roof" ? roofColor : wallColor;
              ctx.fill();
            }
          }
        }

        // Garantir que derived.roofTotalZ está calculado
        if (derived.roofTotalZ === 0) {
          const TILE_L_t = 3.0, OVERLAP_t = 0.05, BEIRAL_t = 0.15;
          const ridgeLen_t = rD + 2 * BEIRAL_t;
          const nRidge_t = Math.ceil(ridgeLen_t / (TILE_L_t - OVERLAP_t));
          derived.roofTotalZ = nRidge_t * TILE_L_t - (nRidge_t - 1) * OVERLAP_t;
        }

        // Renderizar nível baixo e nível alto como duas camadas independentes
        // Usar offscreen canvas para cada camada, depois compor

        // Camada nível baixo
        const offLow = document.createElement("canvas");
        offLow.width = w;
        offLow.height = h;
        const ctxLow = offLow.getContext("2d");

        // Camada nível alto
        const offHigh = document.createElement("canvas");
        offHigh.width = w;
        offHigh.height = h;
        const ctxHigh = offHigh.getContext("2d");

        for (let ai = 0; ai < azRes; ai++) {
          const azMid = ((ai + 0.5) / azRes) * 2 * Math.PI;
          const a1 = ((ai / azRes) * 360 - 90) * (Math.PI / 180);
          const a2 = (((ai + 1) / azRes) * 360 - 90) * (Math.PI / 180);

          for (let ei = 0; ei < elRes; ei++) {
            const el1 = (ei / elRes) * 90;
            const el2 = ((ei + 1) / elRes) * 90;
            const elMid = ((el1 + el2) / 2) * (Math.PI / 180);
            const r1 = elevToR(el1);
            const r2 = elevToR(el2);

            // Nível baixo
            const hitLow = traceRay(azMid, elMid, eyeLow);
            if (hitLow) {
              ctxLow.beginPath();
              ctxLow.arc(cx, cy, r1, a1, a2);
              ctxLow.arc(cx, cy, r2, a2, a1, true);
              ctxLow.closePath();
              ctxLow.fillStyle = hitLow === "roof"
                ? "rgba(234, 179, 8, 0.35)"
                : "rgba(239, 68, 68, 0.30)";
              ctxLow.fill();
            }

            // Nível alto
            const hitHigh = traceRay(azMid, elMid, eyeHigh);
            if (hitHigh) {
              ctxHigh.beginPath();
              ctxHigh.arc(cx, cy, r1, a1, a2);
              ctxHigh.arc(cx, cy, r2, a2, a1, true);
              ctxHigh.closePath();
              ctxHigh.fillStyle = hitHigh === "roof"
                ? "rgba(234, 179, 8, 0.35)"
                : "rgba(239, 68, 68, 0.30)";
              ctxHigh.fill();
            }
          }
        }

        // Compor: desenhar nível baixo com 50% opacidade, depois nível alto com 50%
        ctx.globalAlpha = 0.5;
        ctx.drawImage(offLow, 0, 0);
        ctx.drawImage(offHigh, 0, 0);
        ctx.globalAlpha = 1.0;

        // --- Polo celeste ---
        const poleLat = Math.abs(lat);
        const poleAz = lat < 0 ? 180 : 0;
        if (poleLat > 0 && poleLat <= 90) {
          const pp = skyToXY(poleAz, poleLat);

          // Verificar se o polo é visível via ray trace
          const poleAzRad = (poleAz * Math.PI) / 180;
          const poleElevRad = (poleLat * Math.PI) / 180;
          const poleHit = traceRay(poleAzRad, poleElevRad, H_total);
          const poleBlocked = poleHit !== null;
          const poleColor = poleBlocked ? "#ef4444" : "#22c55e";
          const poleBorder = poleBlocked ? "#fca5a5" : "#86efac";

          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = poleColor;
          ctx.fill();
          ctx.strokeStyle = poleBorder;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pp.x - 12, pp.y);
          ctx.lineTo(pp.x + 12, pp.y);
          ctx.moveTo(pp.x, pp.y - 12);
          ctx.lineTo(pp.x, pp.y + 12);
          ctx.strokeStyle = poleBorder;
          ctx.lineWidth = 1;
          ctx.stroke();

          const poleName = lat < 0 ? "PCS" : "PCN";
          const statusText = poleBlocked
            ? " BLOQUEADO"
            : " VISÍVEL";
          ctx.fillStyle = poleColor;
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(
            poleName + " (" + poleLat.toFixed(1) + "°)" + statusText,
            pp.x + 14,
            pp.y + 4,
          );
        }

        // --- Equador celeste ---
        const latRad = Math.abs(lat) * (Math.PI / 180);
        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);

        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        let eqStarted = false;
        for (let i = 0; i <= 360; i++) {
          const ha = (i * Math.PI) / 180;
          const alt = Math.asin(cosLat * Math.cos(ha));
          const altDeg = (alt * 180) / Math.PI;
          if (altDeg < 0) {
            eqStarted = false;
            continue;
          }

          const A = Math.atan2(Math.sin(ha), Math.cos(ha) * sinLat);
          let azDeg;
          if (lat < 0) {
            azDeg = (A * 180) / Math.PI;
          } else {
            azDeg = 180 + (A * 180) / Math.PI;
          }
          azDeg = ((azDeg % 360) + 360) % 360;

          const p = skyToXY(azDeg, altDeg);
          if (!eqStarted) {
            ctx.moveTo(p.x, p.y);
            eqStarted = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Label equador
        const eqMaxElev = 90 - Math.abs(lat);
        const eqP = skyToXY(lat < 0 ? 0 : 180, eqMaxElev);
        ctx.fillStyle = "#22d3ee";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Eq. Celeste (" + eqMaxElev.toFixed(1) + "°)", eqP.x + 8, eqP.y - 6);

        // --- Astros celestes (estrelas brilhantes + objetos deep-sky) ---
        // Conversão equatorial → horizontal
        // HA = LST - RA; alt = asin(sin(dec)*sin(lat) + cos(dec)*cos(lat)*cos(HA))
        // az = atan2(-cos(dec)*sin(HA), sin(dec)*cos(lat) - cos(dec)*sin(lat)*cos(HA))
        const latR = lat * (Math.PI / 180);
        const sinLatR = Math.sin(latR);
        const cosLatR = Math.cos(latR);

        // LST: hora sideral local
        const now = new Date();
        const longitude = -46.6;
        const skyHourVal = state.skyHour;
        const skyDayVal = state.skyDay;

        // Hora: -1 = agora, senão valor do slider (hora local)
        let utcH;
        if (skyHourVal < 0) {
          utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
        } else {
          // Converter hora local para UTC (fuso -3 para São Paulo)
          utcH = ((skyHourVal + 3) % 24);
        }

        // Dia: -1 = hoje, senão valor do slider
        let dayOfYear;
        if (skyDayVal < 0) {
          dayOfYear = Math.floor(
            (now - new Date(now.getFullYear(), 0, 0)) / 86400000,
          );
        } else {
          dayOfYear = skyDayVal;
        }

        const LST_deg =
          (100.46 + 0.985647 * dayOfYear + longitude + utcH * 15 + 360) % 360;

        function eqToHoriz(raDeg, decDeg) {
          const raR = (raDeg * Math.PI) / 180;
          const decR = (decDeg * Math.PI) / 180;
          const haR = ((LST_deg - raDeg) * Math.PI) / 180;
          const sinDec = Math.sin(decR);
          const cosDec = Math.cos(decR);
          const cosHA = Math.cos(haR);
          const sinHA = Math.sin(haR);

          const alt = Math.asin(
            sinDec * sinLatR + cosDec * cosLatR * cosHA,
          );
          const az = Math.atan2(
            -cosDec * sinHA,
            sinDec * cosLatR - cosDec * sinLatR * cosHA,
          );
          return {
            alt: (alt * 180) / Math.PI,
            az: (((az * 180) / Math.PI + 360) % 360),
          };
        }

        // Catálogo: estrelas brilhantes (nome, RA°, Dec°, magnitude)
        // Estrelas brilhantes (nome, RA°, Dec°, magnitude)
        const stars = [
          ["Sirius", 101.3, -16.7, -1.5],
          ["Canopus", 96.0, -52.7, -0.7],
          ["α Centauri", 219.9, -60.8, -0.3],
          ["Arcturus", 213.9, 19.2, -0.1],
          ["Vega", 279.2, 38.8, 0.0],
          ["Capella", 79.2, 46.0, 0.1],
          ["Rigel", 78.6, -8.2, 0.1],
          ["Procyon", 114.8, 5.2, 0.3],
          ["Achernar", 24.4, -57.2, 0.5],
          ["Betelgeuse", 88.8, 7.4, 0.5],
          ["Altair", 297.7, 8.9, 0.8],
          ["Aldebaran", 69.0, 16.5, 0.9],
          ["Antares", 247.4, -26.4, 1.0],
          ["Spica", 201.3, -11.2, 1.0],
          ["Pollux", 116.3, 28.0, 1.1],
          ["Fomalhaut", 344.4, -29.6, 1.2],
          ["Deneb", 310.4, 45.3, 1.3],
          ["Mimosa", 191.9, -59.7, 1.3],
          ["Acrux", 186.6, -63.1, 1.3],
          ["Regulus", 152.1, 12.0, 1.4],
          ["Gacrux", 187.8, -57.1, 1.6],
          ["Shaula", 263.4, -37.1, 1.6],
          ["Castor", 113.6, 31.9, 1.6],
          ["Bellatrix", 81.3, 6.3, 1.6],
          ["Alnilam", 84.1, -1.2, 1.7],
          ["Alnitak", 85.2, -1.9, 1.7],
          ["Mintaka", 83.0, -0.3, 2.2],
        ];

        // Objetos deep-sky (nome, RA°, Dec°, tipo, mag, dica)
        // neb=nebulosa, gal=galáxia, oc=aglom.aberto, gc=aglom.globular, pn=neb.planetária
        const deepSky = [
          // Nebulosas — as melhores do hemisfério sul
          ["M42 Orion", 83.8, -5.4, "neb", 4.0, "A melhor nebulosa do céu"],
          ["Eta Carina", 161.3, -59.9, "neb", 3.0, "Nebulosa gigante, visível a olho nu"],
          ["M8 Lagoa", 271.0, -24.4, "neb", 5.0, "Linda em binóculo"],
          ["M20 Trífida", 270.6, -23.0, "neb", 6.3, "Tricolor no telescópio"],
          ["M17 Ômega", 275.2, -16.2, "neb", 6.0, "Formato de cisne"],
          ["NGC 3132", 153.1, -40.4, "pn", 8.2, "Nebulosa do Anel Sul"],
          ["NGC 7293 Hélice", 337.4, -20.8, "pn", 7.6, "Maior neb. planetária"],
          ["NGC 3918", 177.5, -57.0, "pn", 8.1, "Planetária Azul"],
          ["IC 2944", 170.3, -63.0, "neb", 4.5, "Running Chicken"],
          ["NGC 2070 Tarântula", 84.7, -69.1, "neb", 5.0, "Na LMC, enorme"],
          // Galáxias
          ["LMC", 80.9, -69.8, "gal", 0.9, "Galáxia satélite, visível a olho nu"],
          ["SMC", 13.2, -72.8, "gal", 2.7, "Galáxia satélite menor"],
          ["M31 Andrômeda", 10.7, 41.3, "gal", 3.4, "Galáxia mais próxima (baixa no céu)"],
          ["NGC 253 Sculptor", 11.9, -25.3, "gal", 7.1, "Galáxia brilhante no sul"],
          ["NGC 5128 Cen A", 201.4, -43.0, "gal", 6.8, "Galáxia com jato, rádio-galáxia"],
          ["M83 Catavento Sul", 204.3, -29.9, "gal", 7.5, "Espiral de frente"],
          ["NGC 1365 Fornax", 53.4, -36.1, "gal", 9.5, "Espiral barrada elegante"],
          ["NGC 4945", 196.4, -49.5, "gal", 8.6, "Galáxia de perfil"],
          // Aglomerados globulares
          ["ω Centauri", 201.7, -47.5, "gc", 3.7, "O maior glob. do céu, espetacular"],
          ["47 Tucanae", 6.0, -72.1, "gc", 4.1, "Segundo melhor, ao lado da SMC"],
          ["M22", 279.1, -23.9, "gc", 5.1, "Dos melhores, em Sagitário"],
          ["M4", 245.9, -26.5, "gc", 5.6, "Perto de Antares"],
          ["NGC 6752", 287.7, -60.0, "gc", 5.4, "Terceiro mais brilhante"],
          ["M55", 294.9, -31.0, "gc", 6.3, "Grande e difuso"],
          ["NGC 6397", 265.2, -53.7, "gc", 5.7, "Um dos mais próximos"],
          // Aglomerados abertos
          ["M45 Plêiades", 56.9, 24.1, "oc", 1.6, "As 7 irmãs, icônico"],
          ["Hyades", 66.8, 15.9, "oc", 0.5, "Aglom. mais próximo, em touro"],
          ["M7 Ptolemy", 268.5, -34.8, "oc", 3.3, "Visível a olho nu"],
          ["M6 Borboleta", 265.1, -32.2, "oc", 4.2, "Formato de borboleta"],
          ["NGC 4755 Jóia", 193.5, -60.3, "oc", 4.2, "Caixa de Jóias, multicolorido"],
          ["NGC 3532", 166.4, -58.7, "oc", 3.0, "O melhor aglom. aberto do sul"],
          ["IC 2602 θ Car", 160.7, -64.4, "oc", 1.9, "Plêiades do Sul"],
          ["NGC 2516", 119.5, -60.9, "oc", 3.8, "Grande, belo em binóculo"],
          ["M44 Presepe", 130.0, 19.7, "oc", 3.1, "Colmeia, visível a olho nu"],
          ["NGC 6231", 253.5, -41.8, "oc", 2.6, "Coração do Escorpião"],
        ];

        // Planetas e Lua — posições calculadas via elementos orbitais
        let moonDm = 0; // elongação lunar para desenho da fase
        {
          const yr = skyDayVal < 0 ? now.getFullYear() : now.getFullYear();
          const doy = dayOfYear;
          const JD = 367*yr - Math.floor(7*(yr+Math.floor(10/12))/4) + Math.floor(275/9) + doy + 1721013.5;
          const T = (JD - 2451545.0) / 36525.0;

          // Terra (para geocêntrico)
          const Le = ((100.464 + 35999.373*T) % 360) * Math.PI/180;
          const Me = Le - 102.94*Math.PI/180;
          const ee = 0.0167 - 0.00004*T;
          const Ce = (2*ee - ee*ee*ee/4)*Math.sin(Me) + 1.25*ee*ee*Math.sin(2*Me);
          const ve = Me + Ce;
          const re = 1.0*(1-ee*ee)/(1+ee*Math.cos(ve));
          const le = Le + Ce;
          const xe = re*Math.cos(le), ye = re*Math.sin(le);

          const orbits = [
            ["Mercúrio ☿", 252.251, 149472.675, 0.387, 0.2056, 77.46, -0.5, "Difícil de ver, sempre perto do Sol"],
            ["Vênus ♀", 181.980, 58517.816, 0.723, 0.0068, 131.53, -4.0, "Estrela d'alva"],
            ["Marte ♂", 355.433, 19140.299, 1.524, 0.0934, 336.06, 1.0, "Planeta vermelho"],
            ["Júpiter ♃", 34.351, 3034.906, 5.203, 0.0484, 14.33, -2.5, "O gigante, 4 luas visíveis"],
            ["Saturno ♄", 50.077, 1222.114, 9.537, 0.0542, 93.06, 0.7, "Anéis visíveis no telescópio"],
          ];

          const eps = 23.44 * Math.PI / 180;

          for (const orb of orbits) {
            const L = ((orb[1] + orb[2]*T) % 360) * Math.PI/180;
            const wBar = orb[5] * Math.PI/180;
            const Mp = L - wBar;
            const ep = orb[4];
            const Cp = (2*ep - ep*ep*ep/4)*Math.sin(Mp) + 1.25*ep*ep*Math.sin(2*Mp);
            const vp = Mp + Cp;
            const rp = orb[3]*(1-ep*ep)/(1+ep*Math.cos(vp));
            const lp = L + Cp;
            const xp = rp*Math.cos(lp) - xe;
            const yp = rp*Math.sin(lp) - ye;
            let lonEcl = Math.atan2(yp, xp);
            const ra = Math.atan2(Math.sin(lonEcl)*Math.cos(eps), Math.cos(lonEcl));
            const dec = Math.asin(Math.sin(lonEcl)*Math.sin(eps));
            let raDeg = ((ra*180/Math.PI)+360)%360;
            const decDeg = dec*180/Math.PI;
            deepSky.push([orb[0], raDeg, decDeg, "planet", orb[6], orb[7]]);
          }

          // Lua — posição e fase via termos principais de Meeus
          const Lp = ((218.316 + 481267.881*T) % 360 + 360) % 360;
          const Mm = ((134.963 + 477198.868*T) % 360 + 360) % 360;
          const Ms2 = ((357.529 + 35999.050*T) % 360 + 360) % 360;
          const Fm = ((93.272 + 483202.018*T) % 360 + 360) % 360;
          const Dm = ((297.850 + 445267.111*T) % 360 + 360) % 360;
          moonDm = Dm;
          const MmR=Mm*Math.PI/180, Ms2R=Ms2*Math.PI/180;
          const FmR=Fm*Math.PI/180, DmR=Dm*Math.PI/180;

          const moonLon = Lp
            + 6.289*Math.sin(MmR)
            + 1.274*Math.sin(2*DmR - MmR)
            + 0.658*Math.sin(2*DmR)
            + 0.214*Math.sin(2*MmR)
            - 0.186*Math.sin(Ms2R)
            - 0.114*Math.sin(2*FmR);
          const moonLat = 5.128*Math.sin(FmR)
            + 0.281*Math.sin(MmR + FmR)
            + 0.278*Math.sin(MmR - FmR)
            + 0.173*Math.sin(2*DmR - FmR);

          const moonLonR = moonLon*Math.PI/180;
          const moonLatR = moonLat*Math.PI/180;
          const moonRA = Math.atan2(
            Math.sin(moonLonR)*Math.cos(eps) - Math.tan(moonLatR)*Math.sin(eps),
            Math.cos(moonLonR));
          const moonDec = Math.asin(
            Math.sin(moonLatR)*Math.cos(eps) +
            Math.cos(moonLatR)*Math.sin(eps)*Math.sin(moonLonR));
          const moonPhase = (1 - Math.cos(Dm*Math.PI/180))/2;
          const moonPhasePct = Math.round(moonPhase*100);

          const moonRAd = ((moonRA*180/Math.PI)+360)%360;
          const moonDecd = moonDec*180/Math.PI;

          const phaseNames = ["Nova","Crescente","Q.Cresc.","Gibosa+","Cheia","Gibosa-","Q.Ming.","Minguante"];
          const phaseIdx = Math.round(((Dm%360+360)%360) / 45) % 8;
          const pName = phaseNames[phaseIdx];

          deepSky.push([
            "Lua ☽ " + moonPhasePct + "% " + pName,
            moonRAd, moonDecd, "moon", -12, "Fase: " + pName + " (" + moonPhasePct + "%)"
          ]);
        }

        // Desenhar estrelas
        for (const s of stars) {
          const pos = eqToHoriz(s[1], s[2]);
          if (pos.alt < 0) continue;
          const p = skyToXY(pos.az, pos.alt);
          const mag = s[3];
          const r = Math.max(1.5, 5 - mag * 1.5);

          const blocked = traceRay(
            (pos.az * Math.PI) / 180,
            (pos.alt * Math.PI) / 180,
            H_total,
          );
          const alpha = blocked ? 0.2 : 1.0;

          ctx.shadowColor = "rgba(255,255,255," + alpha * 0.8 + ")";
          ctx.shadowBlur = blocked ? 0 : r * 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * (blocked ? 0.6 : 1), 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
          ctx.fill();
          ctx.shadowBlur = 0;

          if (mag <= 1.2) {
            ctx.fillStyle = "rgba(255,255,200," + alpha * 0.85 + ")";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(s[0], p.x + r + 4, p.y + 4);
          }
        }

        // Desenhar objetos deep-sky e planetas
        const dsColors = {
          neb: [244, 114, 182],
          gal: [167, 139, 250],
          oc: [96, 165, 250],
          gc: [251, 191, 36],
          pn: [139, 233, 253],
          planet: [255, 200, 50],
          moon: [230, 230, 210],
        };

        // Ordenar por magnitude (mais fracos primeiro, brilhantes por cima)
        const dsSorted = [...deepSky].sort(
          (a, b) => b[4] - a[4],
        );

        for (const d of dsSorted) {
          const pos = eqToHoriz(d[1], d[2]);
          if (pos.alt < 0) continue;

          // Verificar se está bloqueado
          const blocked = traceRay(
            (pos.az * Math.PI) / 180,
            (pos.alt * Math.PI) / 180,
            H_total,
          );

          const p = skyToXY(pos.az, pos.alt);
          const rgb = dsColors[d[3]] || [148, 163, 184];
          const alpha = blocked ? 0.25 : 0.9;
          const colStr =
            "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",";

          const mag = d[4];
          const sz = d[3] === "moon"
            ? 10
            : d[3] === "planet"
              ? Math.max(4, 8 - mag)
              : Math.max(3, 7 - mag * 0.5);

          ctx.strokeStyle = colStr + alpha + ")";
          ctx.lineWidth = blocked ? 1 : 2;
          ctx.beginPath();
          if (d[3] === "moon") {
            // Fase: 0=nova, 0.5=Q.Cresc/Ming, 1=cheia
            const illum = (1 - Math.cos(moonDm * Math.PI / 180)) / 2;
            // Ângulo de fase: 0-360, 0=nova, 180=cheia
            const phaseAngle = ((moonDm % 360) + 360) % 360;
            const waxing = phaseAngle < 180; // crescente

            // 1. Disco escuro (lado não iluminado)
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(40,40,50," + alpha + ")";
            ctx.fill();
            ctx.strokeStyle = colStr + alpha + ")";
            ctx.stroke();

            // 2. Metade iluminada (semicírculo)
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz, 0, 2 * Math.PI);
            ctx.clip();

            // Semicírculo iluminado (direito se crescente, esquerdo se minguante)
            ctx.beginPath();
            if (waxing) {
              ctx.arc(p.x, p.y, sz, -Math.PI/2, Math.PI/2); // metade direita
            } else {
              ctx.arc(p.x, p.y, sz, Math.PI/2, -Math.PI/2); // metade esquerda
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(230,230,210," + alpha * 0.9 + ")";
            ctx.fill();

            // 3. Terminador (elipse que cobre ou revela)
            // k = cos(phaseAngle) vai de 1(nova) a -1(cheia)
            const k = Math.cos(phaseAngle * Math.PI / 180);
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, Math.abs(k) * sz, sz, 0, 0, 2 * Math.PI);
            // Se k > 0: fase < 90° ou > 270° → terminador cobre parte iluminada (escuro)
            // Se k < 0: fase 90-270° → terminador revela mais (iluminado)
            ctx.fillStyle = k > 0
              ? "rgba(40,40,50," + alpha + ")"
              : "rgba(230,230,210," + alpha * 0.9 + ")";
            ctx.fill();

            ctx.restore();
          } else if (d[3] === "planet") {
            ctx.arc(p.x, p.y, sz, 0, 2 * Math.PI);
            ctx.fillStyle = colStr + alpha * 0.6 + ")";
            ctx.fill();
            ctx.stroke();
          } else if (d[3] === "gal") {
            ctx.ellipse(p.x, p.y, sz, sz * 0.55, 0.4, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = colStr + alpha * 0.2 + ")";
            ctx.fill();
          } else if (d[3] === "gc") {
            ctx.arc(p.x, p.y, sz, 0, 2 * Math.PI);
            ctx.stroke();
            // Cruz no centro
            ctx.beginPath();
            ctx.moveTo(p.x - sz, p.y);
            ctx.lineTo(p.x + sz, p.y);
            ctx.moveTo(p.x, p.y - sz);
            ctx.lineTo(p.x, p.y + sz);
            ctx.stroke();
          } else if (d[3] === "pn") {
            // Nebulosa planetária: círculo com linhas laterais
            ctx.arc(p.x, p.y, sz, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x - sz - 3, p.y);
            ctx.lineTo(p.x - sz, p.y);
            ctx.moveTo(p.x + sz, p.y);
            ctx.lineTo(p.x + sz + 3, p.y);
            ctx.stroke();
          } else {
            // Nebulosa / aglom. aberto: quadrado
            ctx.rect(p.x - sz, p.y - sz, sz * 2, sz * 2);
            ctx.stroke();
            ctx.fillStyle = colStr + alpha * 0.15 + ")";
            ctx.fill();
          }

          // Label + dica
          if (!blocked) {
            ctx.fillStyle = colStr + "0.9)";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(d[0], p.x + sz + 4, p.y - 2);
            if (d[5]) {
              ctx.fillStyle = "rgba(255,255,255,0.5)";
              ctx.font = "8px sans-serif";
              ctx.fillText(d[5], p.x + sz + 4, p.y + 8);
            }
          } else {
            // Bloqueado: só nome, mais discreto
            ctx.fillStyle = colStr + "0.3)";
            ctx.font = "8px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(d[0], p.x + sz + 4, p.y + 3);
          }
        }

        // --- Plano da Via Láctea (plano galáctico) ---
        // O polo norte galáctico está em RA=192.85°, Dec=+27.13°
        // O plano galáctico é o grande círculo perpendicular a este polo.
        // Pontos no plano: latitude galáctica b=0, longitude l varia de 0 a 360
        // Conversão galáctica → equatorial:
        // Polo N galáctico: αp=192.85°, δp=27.13°
        // Ascensão do nodo: l_Ω=32.93° (onde o plano galáctico cruza o equador celeste)
        {
          const alphaP = (192.85 * Math.PI) / 180;
          const deltaP = (27.13 * Math.PI) / 180;
          const lOmega = (32.93 * Math.PI) / 180;
          const sinDp = Math.sin(deltaP);
          const cosDp = Math.cos(deltaP);

          ctx.strokeStyle = "rgba(200, 150, 255, 0.5)";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.setLineDash([]);
          ctx.beginPath();
          let mwStarted = false;

          for (let li = 0; li <= 360; li++) {
            const l = (li * Math.PI) / 180;
            const b = 0; // plano galáctico

            // Galáctico (l, b=0) → Equatorial (RA, Dec)
            const sinB = Math.sin(b);
            const cosB = Math.cos(b);
            const lml = l - lOmega;

            const dec = Math.asin(
              sinB * cosDp + cosB * sinDp * Math.sin(lml),
            );
            const y = cosB * Math.cos(lml);
            const x =
              sinB * sinDp - cosB * cosDp * Math.sin(lml);
            const ra = Math.atan2(y, x) + alphaP;

            const raDeg = ((ra * 180) / Math.PI + 360) % 360;
            const decDeg = (dec * 180) / Math.PI;

            const pos = eqToHoriz(raDeg, decDeg);
            if (pos.alt < 0) {
              mwStarted = false;
              continue;
            }
            const p = skyToXY(pos.az, pos.alt);
            if (!mwStarted) {
              ctx.moveTo(p.x, p.y);
              mwStarted = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();

          // Banda mais larga (simular a largura da Via Láctea ~±10°)
          for (const bDeg of [-8, 8]) {
            const bRad = (bDeg * Math.PI) / 180;
            ctx.strokeStyle = "rgba(200, 150, 255, 0.12)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            mwStarted = false;
            for (let li = 0; li <= 360; li++) {
              const l = (li * Math.PI) / 180;
              const sinB = Math.sin(bRad);
              const cosB = Math.cos(bRad);
              const lml = l - lOmega;
              const dec = Math.asin(
                sinB * cosDp + cosB * sinDp * Math.sin(lml),
              );
              const y = cosB * Math.cos(lml);
              const x = sinB * sinDp - cosB * cosDp * Math.sin(lml);
              const ra = Math.atan2(y, x) + alphaP;
              const raDeg = ((ra * 180) / Math.PI + 360) % 360;
              const decDeg = (dec * 180) / Math.PI;
              const pos = eqToHoriz(raDeg, decDeg);
              if (pos.alt < 0) { mwStarted = false; continue; }
              const p = skyToXY(pos.az, pos.alt);
              if (!mwStarted) { ctx.moveTo(p.x, p.y); mwStarted = true; }
              else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
          }

          // Centro galáctico (l=0, b=0) → Sagitário
          {
            const l = 0, bR = 0;
            const lml = l - lOmega;
            const dec = Math.asin(cosDp * Math.sin(lml));
            const y = Math.cos(lml);
            const x = -cosDp * Math.sin(lml); // b=0 → sinB=0
            const ra = Math.atan2(Math.cos(0) * Math.cos(lml), Math.sin(0) * sinDp - Math.cos(0) * cosDp * Math.sin(lml)) + alphaP;
            const raDeg = ((ra * 180) / Math.PI + 360) % 360;
            const decDeg = (dec * 180) / Math.PI;
            // Centro galáctico ≈ RA 266.4°, Dec -29.0° (Sgr A*)
            const gcPos = eqToHoriz(266.4, -29.0);
            if (gcPos.alt > 0) {
              const gp = skyToXY(gcPos.az, gcPos.alt);
              ctx.fillStyle = "rgba(200, 150, 255, 0.9)";
              ctx.font = "bold 10px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("✦ Centro Galáctico", gp.x, gp.y - 8);
              ctx.beginPath();
              ctx.arc(gp.x, gp.y, 4, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(200, 150, 255, 0.7)";
              ctx.fill();
            }
          }
        }

        // --- Elevação mínima observável (anel) ---
        const minElevText = document.getElementById("outMinElev").innerText;
        const minElev = parseFloat(minElevText);
        if (minElev > 0 && minElev < 90) {
          const rr = elevToR(minElev);
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = "#22c55e";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(
            "Elev. Mín. " + minElev.toFixed(1) + "° (RA 180°)",
            cx + rr * Math.cos(-0.3) + 6,
            cy + rr * Math.sin(-0.3),
          );
        }

        // --- Título ---
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Mapa do Céu — Lat " + lat.toFixed(1) + "°",
          cx,
          30,
        );

        // Legenda
        const lx = cx - R + 10;
        const ly = cy + R + 30;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(239,68,68,0.35)";
        ctx.fillRect(lx, ly - 8, 12, 12);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Parede bloqueia", lx + 18, ly + 2);
        ctx.fillStyle = "rgba(234,179,8,0.35)";
        ctx.fillRect(lx, ly + 8, 12, 12);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Telhado bloqueia", lx + 18, ly + 18);
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(lx, ly + 28, 12, 3);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Equador celeste", lx + 18, ly + 36);
        ctx.fillStyle = "rgba(200,150,255,0.5)";
        ctx.fillRect(lx, ly + 42, 12, 6);
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Via Láctea", lx + 18, ly + 50);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px sans-serif";
        ctx.fillText(
          "Claro = 1 nível | Escuro = ambos",
          lx, ly + 52,
        );
        ctx.fillText(
          "Baixo: " + eyeLow.toFixed(2) + "m | Alto: " + eyeHigh.toFixed(2) + "m",
          lx, ly + 64,
        );
      }

      function drawProject() {
        const ctx = canvas2D.getContext("2d");
        const w = canvas2D.width;
        const h = canvas2D.height;
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        // Read parameters
        const H_con = state.H_con;
        const H_ext = state.H_ext;
        const Y_MOUNT = state.Y_MOUNT;
        const X_PIVOT = state.X_PIVOT;
        const pierD = state.pierD;
        const rW = state.rW;
        const rD = state.rD;
        const rH = state.rH;
        const H_total = H_con + H_ext + Y_MOUNT;
        const pitchDeg = state.roofPitch;
        const BEIRAL = 0.15;
        const PITCH_TAN = Math.tan(pitchDeg * Math.PI / 180);
        const halfSpan = rW / 2 + BEIRAL;
        const ridgeRise = halfSpan * PITCH_TAN;
        const roofPeakH = rH + ridgeRise;

        // Door: East wall, near NE corner, 0.9m wide
        const DOOR_W = 0.9;
        const DOOR_H = 2.1;
        const DOOR_OFFSET = 0.15; // from NE corner

        // Window: South wall, centered, 1.5m wide
        const WIN_W = 1.5;
        const WIN_SILL = 1.1;
        const WIN_TOP = 2.1;

        // Furniture
        const DESK_W = 1.2, DESK_D = 0.6;
        const SOFA_W = 1.8, SOFA_D = 0.95;
        const MATT_W = 1.58, MATT_D = 1.98;

        // Rail extension
        const slideLen = rD + 1.5;

        // UI panel offset
        const uiWidth = 400;
        const availW = w - uiWidth;
        const availH = h;

        // Padding for dimension lines
        const PAD = 60;

        // ---- Dimension line helper ----
        function drawDimLine(x1, y1, x2, y2, label, offset) {
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return;
          const nx = -dy / len * offset, ny = dx / len * offset;

          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);

          // Extension lines
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x1 + nx, y1 + ny);
          ctx.moveTo(x2, y2); ctx.lineTo(x2 + nx, y2 + ny);
          ctx.stroke();

          // Dimension line
          ctx.beginPath();
          ctx.moveTo(x1 + nx, y1 + ny);
          ctx.lineTo(x2 + nx, y2 + ny);
          ctx.stroke();

          // Ticks at ends
          const tx = dx / len * 4, ty = dy / len * 4;
          ctx.beginPath();
          ctx.moveTo(x1 + nx - tx, y1 + ny - ty);
          ctx.lineTo(x1 + nx + tx, y1 + ny + ty);
          ctx.moveTo(x2 + nx - tx, y2 + ny - ty);
          ctx.lineTo(x2 + nx + tx, y2 + ny + ty);
          ctx.stroke();

          // Label
          ctx.fillStyle = "#94a3b8";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, (x1 + x2) / 2 + nx * 1.5, (y1 + y2) / 2 + ny * 1.5);
        }

        // ============================================
        // LEFT HALF: FLOOR PLAN (PLANTA BAIXA)
        // ============================================
        ctx.save();
        {
          const vpW = (availW) / 2;
          const vpH = availH;

          // Auto-scale: fit room + rails + padding
          const totalPlanW = rW + 1.0;
          const totalPlanH = rD + slideLen + 0.5;
          const scaleX = (vpW - PAD * 2) / totalPlanW;
          const scaleY = (vpH - PAD * 3) / totalPlanH;
          const scale = Math.min(scaleX, scaleY);

          // Center of floor plan viewport
          const cx = uiWidth + vpW / 2;
          const cy = vpH / 2 + PAD / 2;

          // toScreen: x = East(+) / West(-), y = South(+) / North(-)
          // In plan view: X maps to screen X, Y (depth/N-S) maps to screen Y
          // North is up (negative screen Y)
          function toS(rx, ry) {
            return { x: cx + rx * scale, y: cy + ry * scale };
          }

          const planScale = scale;

          // Room corners (origin at room center)
          const nw = toS(-rW / 2, -rD / 2);
          const ne = toS(rW / 2, -rD / 2);
          const se = toS(rW / 2, rD / 2);
          const sw = toS(-rW / 2, rD / 2);

          // Walls - thick gray lines
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.beginPath();

          // North wall (full)
          ctx.moveTo(nw.x, nw.y); ctx.lineTo(ne.x, ne.y);

          // West wall (full)
          ctx.moveTo(nw.x, nw.y); ctx.lineTo(sw.x, sw.y);

          // South wall: left of window, window gap, right of window
          const winL = toS(-WIN_W / 2, rD / 2);
          const winR = toS(WIN_W / 2, rD / 2);
          ctx.moveTo(sw.x, sw.y); ctx.lineTo(winL.x, winL.y);
          ctx.moveTo(winR.x, winR.y); ctx.lineTo(se.x, se.y);

          // East wall: bottom to door, door gap, door to top
          const doorS = toS(rW / 2, -rD / 2 + DOOR_OFFSET + DOOR_W);
          const doorN = toS(rW / 2, -rD / 2 + DOOR_OFFSET);
          ctx.moveTo(se.x, se.y); ctx.lineTo(doorS.x, doorS.y);
          ctx.moveTo(doorN.x, doorN.y); ctx.lineTo(ne.x, ne.y);
          ctx.stroke();

          // Window: thin double line on South wall
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          const winOffset = 3;
          ctx.beginPath();
          ctx.moveTo(winL.x, winL.y - winOffset); ctx.lineTo(winR.x, winR.y - winOffset);
          ctx.moveTo(winL.x, winL.y + winOffset); ctx.lineTo(winR.x, winR.y + winOffset);
          ctx.stroke();

          // Door: arc showing swing direction
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          const doorPivot = doorN;
          const doorEnd = doorS;
          const doorRadius = DOOR_W * scale;
          ctx.beginPath();
          // Arc swings inward (west)
          const doorAngleStart = Math.PI / 2; // pointing south
          const doorAngleEnd = Math.PI; // pointing west
          ctx.arc(doorPivot.x, doorPivot.y, doorRadius, doorAngleStart, doorAngleEnd);
          ctx.stroke();
          // Door leaf line
          const leafEnd = toS(rW / 2 - DOOR_W, -rD / 2 + DOOR_OFFSET);
          ctx.beginPath();
          ctx.moveTo(doorPivot.x, doorPivot.y);
          ctx.lineTo(leafEnd.x, leafEnd.y);
          ctx.stroke();

          // Pier: filled gray circle at center with diameter label
          ctx.fillStyle = "#9ca3af";
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 1;
          const pierCenter = toS(0, 0);
          const pierR = (pierD / 2) * scale;
          ctx.beginPath();
          ctx.arc(pierCenter.x, pierCenter.y, Math.max(pierR, 4), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Pier diameter dimension
          ctx.fillStyle = "#d1d5db";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⌀" + (pierD * 100).toFixed(0) + "cm", pierCenter.x, pierCenter.y + pierR + 14);

          // Estrutura de suporte dos trilhos: 4 postes + vigas
          // Postes nas bordas L/O, nos cantos N e extensão Norte
          ctx.strokeStyle = "#4b5563";
          ctx.fillStyle = "#4b5563";
          ctx.lineWidth = 1.5;
          const postSize = 0.12; // 12cm postes de madeira/metal
          const railW2 = rW / 2 + 0.04;
          const postPositions = [
            // 2 postes nos cantos NE e NO da sala
            [-railW2, -rD / 2],
            [railW2, -rD / 2],
            // 2 postes no fim dos trilhos
            [-railW2, -rD / 2 - slideLen],
            [railW2, -rD / 2 - slideLen],
            // 2 postes intermediários
            [-railW2, -rD / 2 - slideLen / 2],
            [railW2, -rD / 2 - slideLen / 2],
          ];
          for (const pp of postPositions) {
            const pt = toS(pp[0], pp[1]);
            ctx.fillRect(
              pt.x - postSize * scale / 2,
              pt.y - postSize * scale / 2,
              postSize * scale,
              postSize * scale,
            );
          }
          // Viga transversal conectando postes (no fim dos trilhos e intermediária)
          ctx.strokeStyle = "#4b5563";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          for (const zz of [-rD / 2 - slideLen, -rD / 2 - slideLen / 2]) {
            const vL = toS(-railW2, zz);
            const vR = toS(railW2, zz);
            ctx.beginPath();
            ctx.moveTo(vL.x, vL.y);
            ctx.lineTo(vR.x, vR.y);
            ctx.stroke();
          }

          // Furniture outlines
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);

          // Desk: NW corner
          const deskTL = toS(-rW / 2 + 0.05, -rD / 2 + 0.05);
          ctx.strokeRect(deskTL.x, deskTL.y, DESK_D * scale, DESK_W * scale);
          ctx.fillStyle = "#64748b";
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("mesa", deskTL.x + DESK_D * scale / 2, deskTL.y + DESK_W * scale / 2 + 3);

          // Sofa-bed: SE area, along south wall, near east wall
          const sofaTL = toS(rW / 2 - SOFA_W - 0.05, rD / 2 - SOFA_D - 0.05);
          ctx.strokeStyle = "#64748b";
          ctx.strokeRect(sofaTL.x, sofaTL.y, SOFA_W * scale, SOFA_D * scale);
          ctx.fillStyle = "#64748b";
          ctx.fillText("sofá", sofaTL.x + SOFA_W * scale / 2, sofaTL.y + SOFA_D * scale / 2 + 3);

          // Mattress: SW corner
          const mattTL = toS(-rW / 2 + 0.05, rD / 2 - MATT_D - 0.05);
          ctx.strokeStyle = "#64748b";
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(mattTL.x, mattTL.y, MATT_W * scale, MATT_D * scale);
          ctx.setLineDash([]);
          ctx.fillStyle = "#64748b";
          ctx.fillText("colchão", mattTL.x + MATT_W * scale / 2, mattTL.y + MATT_D * scale / 2 + 3);

          // Roof rails: dashed lines extending North from room edges
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          const railW = rW / 2 + 0.04;
          for (const sx of [-1, 1]) {
            const rStart = toS(sx * railW, -rD / 2);
            const rEnd = toS(sx * railW, -rD / 2 - slideLen);
            ctx.beginPath();
            ctx.moveTo(rStart.x, rStart.y);
            ctx.lineTo(rEnd.x, rEnd.y);
            ctx.stroke();
          }
          ctx.setLineDash([]);

          // Layout das telhas (vista de cima, projetadas sobre a sala)
          {
            const TILE_L = 2.5, TILE_W2 = 1.0, TILE_OV = 0.05;
            const projDir = state.roofDir;
            const ridgeX2 = (projDir === "N" || projDir === "S");
            const ridgeLen2 = (ridgeX2 ? rW : rD) + 2 * BEIRAL;
            const halfSpan2 = (ridgeX2 ? rD : rW) / 2 + BEIRAL;
            const slopeLen2 = halfSpan2 / Math.cos(pitchDeg * Math.PI / 180);
            const nRidge2 = Math.ceil(ridgeLen2 / (TILE_L - TILE_OV));
            const nSlope2 = Math.ceil(slopeLen2 / (TILE_W2 - TILE_OV));
            const totalTiles = nRidge2 * nSlope2 * 2;

            // Cada telha projetada no plano (vista de cima)
            // Cumeeira ao longo de Z (N-S), telhas estendem em X (L-O)
            // Projeção horizontal da telha no talude: TILE_W2 * cos(pitch)
            const tileHorizW = TILE_W2 * Math.cos(pitchDeg * Math.PI / 180);

            ctx.strokeStyle = "rgba(120, 113, 108, 0.5)";
            ctx.lineWidth = 1;
            let tileCount = 0;

            for (const side of [1, -1]) { // +1=Leste, -1=Oeste
              for (let r = 0; r < nRidge2; r++) {
                for (let s = 0; s < nSlope2; s++) {
                  tileCount++;
                  const isAlt = (r + s) % 2 === 0;

                  // Posição ao longo da cumeeira (Z)
                  const zCenter = (r - (nRidge2 - 1) / 2) * (TILE_L - TILE_OV);

                  // Posição horizontal desde a cumeeira (X)
                  const xStart = s * (tileHorizW - TILE_OV * Math.cos(pitchDeg * Math.PI / 180));
                  const xEnd = xStart + tileHorizW;

                  // Retângulo da telha projetada
                  const tl = toS(side * xStart, zCenter - TILE_L / 2);
                  const br = toS(side * xEnd, zCenter + TILE_L / 2);

                  ctx.fillStyle = isAlt
                    ? "rgba(120, 113, 108, 0.12)"
                    : "rgba(107, 101, 96, 0.12)";
                  const rx = Math.min(tl.x, br.x);
                  const ry = Math.min(tl.y, br.y);
                  const rw = Math.abs(br.x - tl.x);
                  const rh = Math.abs(br.y - tl.y);
                  ctx.fillRect(rx, ry, rw, rh);
                  ctx.strokeRect(rx, ry, rw, rh);

                  // Número da telha
                  ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
                  ctx.font = "8px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText(
                    tileCount.toString(),
                    rx + rw / 2,
                    ry + rh / 2 + 3,
                  );
                }
              }
            }

            // Linha da cumeeira
            ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            const cTop = toS(0, -rD / 2 - BEIRAL);
            const cBot = toS(0, rD / 2 + BEIRAL);
            ctx.beginPath();
            ctx.moveTo(cTop.x, cTop.y);
            ctx.lineTo(cBot.x, cBot.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label total de telhas
            ctx.fillStyle = "#eab308";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "left";
            const tlLabel = toS(-rW / 2 - 0.3, rD / 2 + 0.2);
            ctx.fillText(totalTiles + " telhas 3×1m", tlLabel.x, tlLabel.y);
          }

          // Dimension lines
          // Room width (bottom)
          drawDimLine(sw.x, sw.y, se.x, se.y, rW.toFixed(2) + " m", 25);

          // Room depth (right)
          drawDimLine(ne.x, ne.y, se.x, se.y, rD.toFixed(2) + " m", 25);

          // Window width
          drawDimLine(winL.x, winL.y, winR.x, winR.y, WIN_W.toFixed(1) + " m", 15);

          // Door width
          drawDimLine(doorN.x, doorN.y, doorS.x, doorS.y, DOOR_W.toFixed(1) + " m", 18);

          // Pier position from west wall
          const pierLeft = toS(-rW / 2, 0);
          drawDimLine(pierLeft.x, pierLeft.y, pierCenter.x, pierCenter.y, (rW / 2).toFixed(2) + " m", -18);

          // North arrow
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          const arrowTop = toS(0, -rD / 2 - slideLen - 0.3);
          ctx.fillText("N", arrowTop.x, arrowTop.y - 10);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(arrowTop.x, arrowTop.y);
          ctx.lineTo(arrowTop.x, arrowTop.y + 20);
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(arrowTop.x, arrowTop.y);
          ctx.lineTo(arrowTop.x - 5, arrowTop.y + 8);
          ctx.moveTo(arrowTop.x, arrowTop.y);
          ctx.lineTo(arrowTop.x + 5, arrowTop.y + 8);
          ctx.stroke();

          // Estrutura wood frame na planta baixa
          {
            const S = 0.045, D = 0.09, SP = 0.60;
            ctx.strokeStyle = "rgba(196, 163, 90, 0.5)";
            ctx.lineWidth = Math.max(1, S * planScale);

            // Montantes em cada parede
            function drawStuds(sx, sz, len, dirX, dirZ) {
              const n = Math.ceil(len / SP) + 1;
              const sp = len / (n - 1);
              for (let i = 0; i < n; i++) {
                const t = i * sp;
                const p = toS(sx + dirX * t, sz + dirZ * t);
                ctx.beginPath();
                // Pequeno traço perpendicular à parede
                const px = -dirZ * D * planScale / 2;
                const py = -dirX * D * planScale / 2;
                ctx.moveTo(p.x - px, p.y - py);
                ctx.lineTo(p.x + px, p.y + py);
                ctx.stroke();
              }
            }
            drawStuds(-rW / 2, -rD / 2, rW, 1, 0); // Norte
            drawStuds(-rW / 2, rD / 2, rW, 1, 0);  // Sul
            drawStuds(rW / 2, -rD / 2, rD, 0, 1);  // Leste
            drawStuds(-rW / 2, -rD / 2, rD, 0, 1); // Oeste

            // Barrotes do assoalho (linhas finas tracejadas ao longo de Z)
            ctx.strokeStyle = "rgba(184, 148, 62, 0.3)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            const BARR_SP = 0.40;
            const nBarr = Math.ceil(rW / BARR_SP) + 1;
            const bsp = rW / (nBarr - 1);
            const pierClr = state.pierD / 2 + 0.07;
            for (let bi = 0; bi < nBarr; bi++) {
              const bx = -rW / 2 + bi * bsp;
              if (Math.abs(bx) < pierClr) continue;
              const p1 = toS(bx, -rD / 2);
              const p2 = toS(bx, rD / 2);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
            ctx.setLineDash([]);
          }

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          const escNum = Math.round(1 / (scale / 96 * 0.0254));
          ctx.fillText("PLANTA BAIXA", cx, vpH - 20);
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText("esc. aprox. 1:" + escNum, cx, vpH - 6);

          // Cardinal directions at edges
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          const sLabel = toS(0, rD / 2);
          ctx.fillText("S", sLabel.x, sLabel.y + 42);
          const eLabel = toS(rW / 2, 0);
          ctx.textAlign = "left";
          ctx.fillText("L", eLabel.x + 32, eLabel.y + 4);
          const wLabel = toS(-rW / 2, 0);
          ctx.textAlign = "right";
          ctx.fillText("O", wLabel.x - 32, wLabel.y + 4);
        }
        ctx.restore();

        // ============================================
        // RIGHT TOP: E-W CROSS SECTION (CORTE TRANSVERSAL)
        // ============================================
        ctx.save();
        {
          const vpX = uiWidth + availW / 2;
          const vpW = availW / 2;
          const vpH = availH / 2;

          // Auto-scale
          const totalSecW = rW + BEIRAL * 2 + 0.6;
          const totalSecH = roofPeakH + 0.8;
          const scaleX = (vpW - PAD * 2) / totalSecW;
          const scaleY = (vpH - PAD * 2.5) / totalSecH;
          const scale = Math.min(scaleX, scaleY);

          const cx = vpX + vpW / 2;
          const groundY = vpH - PAD * 1.5;

          // toScreen: x = horizontal (East/West), y = height (up = negative screen)
          function toS(rx, ry) {
            return { x: cx + rx * scale, y: groundY - ry * scale };
          }

          // Ground line
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          const gl = toS(-totalSecW / 2, 0);
          const gr = toS(totalSecW / 2, 0);
          ctx.moveTo(gl.x, gl.y); ctx.lineTo(gr.x, gr.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Walls
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 3;
          const wallBL = toS(-rW / 2, 0);
          const wallTL = toS(-rW / 2, rH);
          const wallBR = toS(rW / 2, 0);
          const wallTR = toS(rW / 2, rH);
          ctx.beginPath();
          ctx.moveTo(wallBL.x, wallBL.y); ctx.lineTo(wallTL.x, wallTL.y);
          ctx.moveTo(wallBR.x, wallBR.y); ctx.lineTo(wallTR.x, wallTR.y);
          ctx.stroke();

          // Floor
          ctx.beginPath();
          ctx.moveTo(wallBL.x, wallBL.y); ctx.lineTo(wallBR.x, wallBR.y);
          ctx.stroke();

          // Roof profile
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 2;
          const roofL = toS(-halfSpan, rH);
          const roofR = toS(halfSpan, rH);
          const ridge = toS(0, roofPeakH);
          ctx.beginPath();
          ctx.moveTo(roofL.x, roofL.y);
          ctx.lineTo(ridge.x, ridge.y);
          ctx.lineTo(roofR.x, roofR.y);
          ctx.stroke();

          // Eave lines connecting to walls
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(roofL.x, roofL.y); ctx.lineTo(wallTL.x, wallTL.y);
          ctx.moveTo(roofR.x, roofR.y); ctx.lineTo(wallTR.x, wallTR.y);
          ctx.stroke();

          // Telhas individuais no talude (corte transversal)
          {
            const TILE_W3 = 1.0, TILE_OV3 = 0.05, TILE_H3 = 0.04;
            const pitch3 = pitchDeg * Math.PI / 180;
            const slopeLen3 = halfSpan / Math.cos(pitch3);
            const nSlope3 = Math.ceil(slopeLen3 / (TILE_W3 - TILE_OV3));

            ctx.strokeStyle = "rgba(120, 113, 108, 0.6)";
            ctx.lineWidth = 1;

            for (const side of [-1, 1]) {
              for (let s = 0; s < nSlope3; s++) {
                // Posição ao longo do talude desde a cumeeira
                const slopeDist = s * (TILE_W3 - TILE_OV3);
                const slopeEnd = slopeDist + TILE_W3;

                // Converter para posição horizontal e vertical
                const x1 = slopeDist * Math.cos(pitch3);
                const y1 = -slopeDist * Math.sin(pitch3);
                const x2 = slopeEnd * Math.cos(pitch3);
                const y2 = -slopeEnd * Math.sin(pitch3);

                const p1 = toS(side * x1, roofPeakH + y1);
                const p2 = toS(side * x2, roofPeakH + y2);

                // Linha de junta entre telhas
                ctx.beginPath();
                ctx.moveTo(p2.x, p2.y);
                // Pequeno tick perpendicular ao talude
                const nx = -Math.sin(pitch3) * 3 * side;
                const ny = -Math.cos(pitch3) * 3;
                ctx.lineTo(p2.x + nx, p2.y + ny);
                ctx.stroke();
              }
            }
          }

          // Pier rectangle com cota de espessura
          ctx.fillStyle = "#9ca3af";
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 1;
          const pierBL = toS(-pierD / 2, 0);
          const pierTR = toS(pierD / 2, H_con);
          ctx.fillRect(pierBL.x, pierTR.y, (pierTR.x - pierBL.x), (pierBL.y - pierTR.y));
          ctx.strokeRect(pierBL.x, pierTR.y, (pierTR.x - pierBL.x), (pierBL.y - pierTR.y));

          // Extension on top of pier
          ctx.fillStyle = "#6b7280";
          const extW = 0.15;
          const extBL = toS(-extW / 2, H_con);
          const extTR = toS(extW / 2, H_con + H_ext);
          ctx.fillRect(extBL.x, extTR.y, (extTR.x - extBL.x), (extBL.y - extTR.y));

          // Telescope envelope (simplified circle)
          const TUBE_LEN = state.TUBE_LEN;
          const TUBE_D = state.TUBE_D;
          const pivotPt = toS(-X_PIVOT, H_total);
          const envR = Math.max(TUBE_LEN / 2, TUBE_D) * scale;
          ctx.strokeStyle = "rgba(59,130,246,0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(pivotPt.x, pivotPt.y, envR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Estrutura de suporte dos trilhos nos cantos L/O
          ctx.fillStyle = "#4b5563";
          ctx.strokeStyle = "#4b5563";
          const postW = 0.12;
          for (const sx of [-1, 1]) {
            // Poste vertical na borda da parede
            const postBL = toS(sx * (rW / 2 + 0.04) - postW / 2, 0);
            const postTR = toS(sx * (rW / 2 + 0.04) + postW / 2, rH);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((postBL.x + postTR.x) / 2, postBL.y);
            ctx.lineTo((postBL.x + postTR.x) / 2, postTR.y);
            ctx.stroke();
            // Trilho no topo
            const railPt = toS(sx * (rW / 2 + 0.04), rH);
            ctx.fillRect(railPt.x - 4, railPt.y - 2, 8, 4);
          }

          // Dimension lines
          // Room width
          drawDimLine(wallBL.x, wallBL.y, wallBR.x, wallBR.y, rW.toFixed(2) + " m", 22);

          // Wall height (left)
          drawDimLine(wallBL.x, wallBL.y, wallTL.x, wallTL.y, rH.toFixed(2) + " m", -22);

          // Ridge height
          drawDimLine(wallBR.x, wallBR.y, toS(rW / 2, roofPeakH).x, toS(rW / 2, roofPeakH).y, roofPeakH.toFixed(2) + " m", 22);

          // Pier height + diameter
          drawDimLine(toS(pierD / 2 + 0.1, 0).x, toS(pierD / 2 + 0.1, 0).y,
                      toS(pierD / 2 + 0.1, H_con).x, toS(pierD / 2 + 0.1, H_con).y,
                      H_con.toFixed(2) + " m", 15);
          // Pier diameter
          drawDimLine(pierBL.x, pierBL.y, toS(pierD / 2, 0).x, toS(pierD / 2, 0).y,
                      "⌀" + (pierD * 100).toFixed(0) + "cm", 12);

          // Estrutura wood frame das paredes no corte
          {
            const wfCol = "rgba(196, 163, 90, 0.6)";
            const S = 0.045, D = 0.09;
            // Montantes nas paredes L e O (vistos em corte = retângulos)
            for (const sx of [-1, 1]) {
              const wx = sx * rW / 2;
              // Soleira inferior
              const sBot = toS(wx - sx * D / 2, 0);
              const sTop = toS(wx + sx * D / 2, S);
              ctx.fillStyle = wfCol;
              ctx.fillRect(Math.min(sBot.x, sTop.x), sTop.y,
                Math.abs(sTop.x - sBot.x), sBot.y - sTop.y);
              // Soleira superior dupla
              for (let i = 0; i < 2; i++) {
                const y1 = rH - S * (i + 1), y2 = rH - S * i;
                const p1 = toS(wx - sx * D / 2, y1);
                const p2 = toS(wx + sx * D / 2, y2);
                ctx.fillRect(Math.min(p1.x, p2.x), p2.y,
                  Math.abs(p2.x - p1.x), p1.y - p2.y);
              }
              // Montante (linha vertical)
              ctx.strokeStyle = wfCol;
              ctx.lineWidth = Math.max(1, S * scale);
              const mBot = toS(wx, S);
              const mTop = toS(wx, rH - S * 2);
              ctx.beginPath();
              ctx.moveTo(mBot.x, mBot.y);
              ctx.lineTo(mTop.x, mTop.y);
              ctx.stroke();
            }
            // Barrotes do assoalho no corte
            ctx.fillStyle = "rgba(184, 148, 62, 0.4)";
            const BARR_H = 0.15, BARR_W = 0.05, BARR_SP = 0.40;
            const nB = Math.ceil(rW / BARR_SP) + 1;
            const bsp = rW / (nB - 1);
            const pClr = state.pierD / 2 + 0.07;
            for (let bi = 0; bi < nB; bi++) {
              const bx = -rW / 2 + bi * bsp;
              if (Math.abs(bx) < pClr) continue;
              const p = toS(bx, 0);
              const pw = Math.max(1, BARR_W * scale);
              const ph = BARR_H * scale;
              ctx.fillRect(p.x - pw / 2, p.y, pw, ph);
            }
            // Vigas mestras no corte (na base)
            ctx.fillStyle = "rgba(184, 148, 62, 0.5)";
            const vBot = toS(0, -0.20);
            const vTop = toS(0, 0);
            const vH = vTop.y - vBot.y;
            ctx.fillRect(toS(-rW / 2, 0).x, vBot.y, toS(rW / 2, 0).x - toS(-rW / 2, 0).x, -vH);
          }

          // Estrutura de madeira — tesoura completa no corte
          {
            const woodCol = "#c4a35a";
            const beamW = Math.max(2, 0.06 * scale);

            // Caibros (rafters) 6×12cm — diagonais
            ctx.strokeStyle = woodCol;
            ctx.lineWidth = Math.max(2, 0.12 * scale);
            for (const sx of [-1, 1]) {
              const cBot = toS(sx * halfSpan, rH);
              const cTop = toS(0, roofPeakH);
              ctx.beginPath();
              ctx.moveTo(cBot.x, cBot.y);
              ctx.lineTo(cTop.x, cTop.y);
              ctx.stroke();
            }

            // Tirante (tie beam) 6×12cm — horizontal na base
            ctx.lineWidth = Math.max(2, 0.12 * scale);
            const tL = toS(-halfSpan, rH);
            const tR = toS(halfSpan, rH);
            ctx.beginPath();
            ctx.moveTo(tL.x, tL.y);
            ctx.lineTo(tR.x, tR.y);
            ctx.stroke();

            // Pendural (king post) 6×6cm — vertical
            ctx.lineWidth = Math.max(1, 0.06 * scale);
            const pBot = toS(0, rH);
            const pTop = toS(0, roofPeakH);
            ctx.beginPath();
            ctx.moveTo(pBot.x, pBot.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.stroke();

            // Escoras (struts) 6×6cm — diagonais do pendural ao caibro
            for (const sx of [-1, 1]) {
              const sBot = toS(0, rH + ridgeRise * 0.4);
              const sTop = toS(sx * halfSpan * 0.5, rH + ridgeRise * 0.5);
              ctx.beginPath();
              ctx.moveTo(sBot.x, sBot.y);
              ctx.lineTo(sTop.x, sTop.y);
              ctx.stroke();
            }

            // Cumeeira 6×16cm no pico (seção transversal)
            ctx.fillStyle = woodCol;
            ctx.strokeStyle = "#8b7332";
            ctx.lineWidth = 1;
            const cBL = toS(-0.03, roofPeakH - 0.16);
            const cTR = toS(0.03, roofPeakH);
            ctx.fillRect(cBL.x, cTR.y, cTR.x - cBL.x, cBL.y - cTR.y);
            ctx.strokeRect(cBL.x, cTR.y, cTR.x - cBL.x, cBL.y - cTR.y);

            // Frechais 6×15cm nos beirais (seção transversal)
            for (const sx of [-1, 1]) {
              const fBL = toS(sx * halfSpan - 0.03, rH - 0.15);
              const fTR = toS(sx * halfSpan + 0.03, rH);
              ctx.fillRect(fBL.x, fTR.y, fTR.x - fBL.x, fBL.y - fTR.y);
              ctx.strokeRect(fBL.x, fTR.y, fTR.x - fBL.x, fBL.y - fTR.y);
            }

            // Terças intermediárias 5×7cm (seções transversais nos taludes)
            for (const frac of [0.33, 0.66]) {
              for (const sx of [-1, 1]) {
                const tx = sx * halfSpan * (1 - frac);
                const ty = rH + ridgeRise * frac;
                const tBL = toS(tx - 0.025, ty - 0.035);
                const tTR = toS(tx + 0.025, ty + 0.035);
                ctx.fillRect(tBL.x, tTR.y, tTR.x - tBL.x, tBL.y - tTR.y);
                ctx.strokeRect(tBL.x, tTR.y, tTR.x - tBL.x, tBL.y - tTR.y);
              }
            }

            // Labels
            ctx.fillStyle = woodCol;
            ctx.font = "8px sans-serif";
            ctx.textAlign = "left";
            const lCum = toS(0.05, roofPeakH - 0.05);
            ctx.fillText("cumeeira 6×16", lCum.x, lCum.y);
            const lFre = toS(halfSpan + 0.05, rH - 0.08);
            ctx.fillText("frechal 6×15", lFre.x, lFre.y);
            const lCaib = toS(halfSpan * 0.55, rH + ridgeRise * 0.45);
            ctx.fillText("caibro 6×12", lCaib.x + 5, lCaib.y - 8);
            const lPend = toS(0.05, rH + ridgeRise * 0.2);
            ctx.fillText("pendural 6×6", lPend.x, lPend.y);
            const lEsc = toS(halfSpan * 0.2, rH + ridgeRise * 0.35);
            ctx.fillText("escora 6×6", lEsc.x + 3, lEsc.y + 12);
            const lTerca = toS(halfSpan * 0.35, rH + ridgeRise * 0.65);
            ctx.fillText("terça 5×7", lTerca.x + 5, lTerca.y - 3);
          }

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("CORTE TRANSVERSAL (L-O)", cx, vpH - 8);

          // Wall labels
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("O", wallBL.x - 20, wallBL.y - (wallBL.y - wallTL.y) / 2);
          ctx.fillText("L", wallBR.x + 20, wallBR.y - (wallBR.y - wallTR.y) / 2);
        }
        ctx.restore();

        // ============================================
        // RIGHT BOTTOM: N-S CROSS SECTION (CORTE LONGITUDINAL)
        // ============================================
        ctx.save();
        {
          const vpX = uiWidth + availW / 2;
          const vpW = availW / 2;
          const vpY = availH / 2;
          const vpH = availH / 2;

          // Auto-scale
          const totalSecW = rD + slideLen + 1.0;
          const totalSecH = roofPeakH + 0.8;
          const scaleX = (vpW - PAD * 2) / totalSecW;
          const scaleY = (vpH - PAD * 2.5) / totalSecH;
          const scale = Math.min(scaleX, scaleY);

          const cx = vpX + vpW / 2;
          const groundY = vpY + vpH - PAD * 1.5;

          // toScreen: x = N-S axis (North left, South right), y = height
          function toS(rx, ry) {
            return { x: cx + rx * scale, y: groundY - ry * scale };
          }

          // Ground line
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          const glNS = toS(-rD / 2 - slideLen - 0.3, 0);
          const grNS = toS(rD / 2 + 0.5, 0);
          ctx.beginPath();
          ctx.moveTo(glNS.x, glNS.y); ctx.lineTo(grNS.x, grNS.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Walls (North = left, South = right)
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 3;
          const wallN_B = toS(-rD / 2, 0);
          const wallN_T = toS(-rD / 2, rH);
          const wallS_B = toS(rD / 2, 0);
          const wallS_T = toS(rD / 2, rH);
          ctx.beginPath();
          ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallN_T.x, wallN_T.y);
          ctx.moveTo(wallS_B.x, wallS_B.y); ctx.lineTo(wallS_T.x, wallS_T.y);
          ctx.stroke();

          // Floor
          ctx.beginPath();
          ctx.moveTo(wallN_B.x, wallN_B.y); ctx.lineTo(wallS_B.x, wallS_B.y);
          ctx.stroke();

          // Roof profile: flat at ridge height between two gable ends
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 2;
          const ridgeN = toS(-rD / 2, roofPeakH);
          const ridgeS = toS(rD / 2, roofPeakH);
          ctx.beginPath();
          ctx.moveTo(ridgeN.x, ridgeN.y);
          ctx.lineTo(ridgeS.x, ridgeS.y);
          ctx.stroke();

          // Gable triangles at N and S
          // North gable
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wallN_T.x, wallN_T.y);
          ctx.lineTo(ridgeN.x, ridgeN.y);
          ctx.stroke();

          // South gable
          ctx.beginPath();
          ctx.moveTo(wallS_T.x, wallS_T.y);
          ctx.lineTo(ridgeS.x, ridgeS.y);
          ctx.stroke();

          // Eave lines (left/right of gable)
          // At N and S, show small horizontal eave at wall top height
          const eaveN = toS(-rD / 2 - BEIRAL, rH);
          const eaveS = toS(rD / 2 + BEIRAL, rH);
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(eaveN.x, eaveN.y); ctx.lineTo(wallN_T.x, wallN_T.y);
          ctx.moveTo(eaveS.x, eaveS.y); ctx.lineTo(wallS_T.x, wallS_T.y);
          ctx.stroke();

          // Pier rectangle com contorno
          ctx.fillStyle = "#9ca3af";
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 1;
          const pBL = toS(-pierD / 2, 0);
          const pTR = toS(pierD / 2, H_con);
          ctx.fillRect(pBL.x, pTR.y, (pTR.x - pBL.x), (pBL.y - pTR.y));
          ctx.strokeRect(pBL.x, pTR.y, (pTR.x - pBL.x), (pBL.y - pTR.y));

          // Extension
          ctx.fillStyle = "#6b7280";
          const extW2 = 0.15;
          const eBL = toS(-extW2 / 2, H_con);
          const eTR = toS(extW2 / 2, H_con + H_ext);
          ctx.fillRect(eBL.x, eTR.y, (eTR.x - eBL.x), (eBL.y - eTR.y));

          // Estrutura de suporte dos trilhos: postes verticais ao longo da extensão
          ctx.strokeStyle = "#4b5563";
          ctx.lineWidth = 2;
          const postPositionsNS = [
            -rD / 2, // canto norte da sala
            -rD / 2 - slideLen / 2, // intermediário
            -rD / 2 - slideLen, // fim dos trilhos
          ];
          for (const zp of postPositionsNS) {
            const postBot = toS(zp, 0);
            const postTop = toS(zp, rH);
            ctx.beginPath();
            ctx.moveTo(postBot.x, postBot.y);
            ctx.lineTo(postTop.x, postTop.y);
            ctx.stroke();
            // Pé do poste
            ctx.fillStyle = "#4b5563";
            ctx.fillRect(postBot.x - 3, postBot.y - 2, 6, 4);
            // Topo do poste (apoio do trilho)
            ctx.fillRect(postTop.x - 4, postTop.y - 2, 8, 4);
          }

          // Window opening on South wall
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          const winBot = toS(rD / 2, WIN_SILL);
          const winTop = toS(rD / 2, WIN_TOP);
          ctx.beginPath();
          ctx.moveTo(winBot.x - 3, winBot.y); ctx.lineTo(winBot.x + 3, winBot.y);
          ctx.moveTo(winTop.x - 3, winTop.y); ctx.lineTo(winTop.x + 3, winTop.y);
          ctx.moveTo(winBot.x, winBot.y); ctx.lineTo(winTop.x, winTop.y);
          ctx.stroke();

          // Rails extending North
          ctx.strokeStyle = "#78716c";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          const railStart = toS(-rD / 2, rH);
          const railEnd = toS(-rD / 2 - slideLen, rH);
          ctx.beginPath();
          ctx.moveTo(railStart.x, railStart.y);
          ctx.lineTo(railEnd.x, railEnd.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Dimension lines
          // Room depth
          drawDimLine(wallN_B.x, wallN_B.y, wallS_B.x, wallS_B.y, rD.toFixed(2) + " m", 22);

          // Wall height (right/south)
          drawDimLine(wallS_B.x, wallS_B.y, wallS_T.x, wallS_T.y, rH.toFixed(2) + " m", 22);

          // Ridge height
          drawDimLine(toS(rD / 2 + 0.15, 0).x, toS(rD / 2 + 0.15, 0).y,
                      toS(rD / 2 + 0.15, roofPeakH).x, toS(rD / 2 + 0.15, roofPeakH).y,
                      roofPeakH.toFixed(2) + " m", 35);

          // Window height
          drawDimLine(toS(rD / 2 - 0.1, WIN_SILL).x, toS(rD / 2 - 0.1, WIN_SILL).y,
                      toS(rD / 2 - 0.1, WIN_TOP).x, toS(rD / 2 - 0.1, WIN_TOP).y,
                      (WIN_TOP - WIN_SILL).toFixed(1) + " m", -15);

          // Rail extension
          drawDimLine(railStart.x, railStart.y + 15, railEnd.x, railEnd.y + 15,
                      slideLen.toFixed(1) + " m", 0);

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          // Estrutura wood frame no corte longitudinal
          {
            const wfCol = "rgba(196, 163, 90, 0.6)";
            const S2 = 0.045, D2 = 0.09;
            for (const sz of [-1, 1]) {
              const wz = sz * rD / 2;
              // Montante
              ctx.strokeStyle = wfCol;
              ctx.lineWidth = Math.max(1, S2 * scale);
              const mb = toS(wz, S2), mt = toS(wz, rH - S2 * 2);
              ctx.beginPath(); ctx.moveTo(mb.x, mb.y); ctx.lineTo(mt.x, mt.y); ctx.stroke();
              // Soleiras
              ctx.fillStyle = wfCol;
              const sb = toS(wz - sz * D2 / 2, 0), st = toS(wz + sz * D2 / 2, S2);
              ctx.fillRect(Math.min(sb.x, st.x), st.y, Math.abs(st.x - sb.x), sb.y - st.y);
              for (let i = 0; i < 2; i++) {
                const p1 = toS(wz - sz * D2 / 2, rH - S2 * (i + 1));
                const p2 = toS(wz + sz * D2 / 2, rH - S2 * i);
                ctx.fillRect(Math.min(p1.x, p2.x), p2.y, Math.abs(p2.x - p1.x), p1.y - p2.y);
              }
            }
          }

          ctx.fillText("CORTE LONGITUDINAL (N-S)", cx, vpY + vpH - 8);

          // Wall labels
          ctx.fillStyle = "#94a3b8";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("N", wallN_B.x - 20, wallN_B.y - (wallN_B.y - wallN_T.y) / 2);
          ctx.fillText("S", wallS_B.x + 20, wallS_B.y - (wallS_B.y - wallS_T.y) / 2);
        }
        ctx.restore();

        // Divider lines between views
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        // Vertical divider
        ctx.beginPath();
        ctx.moveTo(uiWidth + availW / 2, 0);
        ctx.lineTo(uiWidth + availW / 2, h);
        ctx.stroke();
        // Horizontal divider (right half only)
        ctx.beginPath();
        ctx.moveTo(uiWidth + availW / 2, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        resize2D();
        if (is2DMode) {
          if (currentTab === "SKY") drawSky();
          else if (currentTab === "PROJ") drawProject();
          else draw2D();
        }
      }

      function animate() {
        requestAnimationFrame(animate);
        if (!is2DMode) {
          controls.update();
          renderer.render(scene, camera);
        }
      }

      window.onload = init;
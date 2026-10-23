/* ============================================================
   NEFRONA INTERACTIVA — Modelo cuantitativo (v1: ATR tipo 4)
   ------------------------------------------------------------
   Modelo semi-mecanicista. Cada canal tiene una "actividad" (1 = normal).
   Las actividades se combinan en flujos (mEq/día). Los flujos cambian
   K⁺ y HCO₃⁻ plasmáticos por balance de masa. Las concentraciones
   retroalimentan a hormonas y canales. Tiempo en días.
   Los números son plausibles y calibrados a rangos clínicos publicados
   (ver INVESTIGATION.md, tabla B); NO son predicciones para un paciente.
   Ecuaciones numeradas según INVESTIGATION.md Parte D3.
   ============================================================ */
(function (global) {
  'use strict';

  // ---------- Parámetros (constantes de calibración) ----------
  const P = {
    peso: 70,                 // kg
    espacioHCO3: 35,          // L (≈ 0,5 × peso)
    espacioK: 45,             // L aparente (amortiguación intracelular → ascenso lento)
    volumenOrina: 1.5,        // L/día
    osmOrina: 500, osmPlasma: 290,
    anionGap: 12,
    naPlasma: 140,
    // expresión genómica mínima (independiente de aldosterona) y τ (días)
    exprMin: 0.30,            // ENaC/ROMK/NaK
    exprMinHATP: 0.70,        // la H⁺-ATPasa depende poco de aldosterona (más de acidosis)
    kExprK: 0.30,             // inducción directa de expresión por K⁺ (por mEq/L, tope 0,45)
    tauENaC: 0.5, tauNaK: 1.5, tauROMK: 1.5, tauHATP: 1.5,
    tauAdapt: 2.5,            // adaptación de la amoniogénesis a la acidosis
    tauNH3: 1.0,              // depósito de NH₃ medular
    // flujos máximos normales (mEq/día)
    jKmax: 72,                // secreción de K⁺ con todo = 1 (ingesta 80 − colon 8)
    gKporMEq: 0.55,            // efecto directo del K⁺ plasmático sobre la secreción
    jHmax: 110,               // capacidad de secreción de H⁺ (célula α)
    prodNH4: 50,              // amoniogénesis proximal basal
    taBase: 30,               // acidez titulable basal
    talFrac: 0.75,            // fracción de NH₄⁺ reabsorbida en TAL (normal)
    vMax: 40,                 // mV, voltaje luminal máximo (negativo)
    colonBase: 8              // mEq/día de K⁺ por heces
  };

  // ---------- Entradas (lo que mueve el usuario) ----------
  function entradasNormales() {
    return {
      // causas 0–1
      espironolactona: 0, amilorida: 0, ieca: 0, aine: 0,
      heparina: 0, diabetes: 0, addison: 0, calcineurina: 0,
      // contexto
      tfg: 100,               // mL/min
      ingestaK: 80,           // mEq/día
      cargaAcida: 70          // mEq/día
    };
  }

  // ---------- Estado (lo que cambia con el tiempo) ----------
  function estadoNormal() {
    return {
      t: 0,
      K: 4.0, HCO3: 24.0,
      exprENaC: 1, exprNaK: 1, exprROMK: 1, exprHATP: 1,
      adapt: 1,               // adaptación amoniogénica (1 = basal)
      nh3Medular: P.prodNH4 * P.talFrac   // mEq/día disponibles en el colector
    };
  }

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  // Curva K⁺ → amoniogénesis (K 4 = 1; 5 ≈ 0,68; 6 ≈ 0,44; 7 ≈ 0,31)
  function mK(K) { return K >= 4 ? 1 / (1 + Math.pow((K - 4) / 1.7, 1.4)) : 1 + 0.3 * (4 - K); }
  // Curva K⁺ → reabsorción de NH₄⁺ en TAL (más leve: 6 ≈ 0,65)
  function pK(K) { return K >= 4 ? 1 / (1 + Math.pow((K - 4) / 3, 1.5)) : 1; }
  // Respuesta al MR: 1 cuando MR = 1, saturando hacia 1,4
  function fMR(mr) { return 1.4 * mr / (mr + 0.4); }

  // ---------- Cálculo de variables derivadas a partir del estado ----------
  function derivar(s, e) {
    const d = {};
    // (20) escala de masa nefronal para amoniogénesis/H⁺/acidez titulable: plana hasta TFG ≈ 60, cae por debajo
    const fTFG = 0.35 + 0.65 * Math.min(1, clamp(e.tfg, 5, 150) / 60);
    const tfgEf = e.tfg * (1 - 0.15 * e.aine);                 // AINE baja algo la TFG

    // --- Expresiones y actividades de la célula principal ---
    // (6) actividad de ENaC. angII se calcula abajo; usamos una estimación previa para evitar circularidad
    // Primero renina/angII dependen de ENaC (volumen) → resolvemos con la expresión (no la actividad instantánea)
    const enacPre = s.exprENaC * (1 - 0.95 * e.amilorida) * (1 - 0.5 * e.calcineurina);
    // (1) renina: factores hiporreninémicos × señal de natriuresis (menos ENaC → más renina)
    const hiporenina = (1 - 0.8 * e.aine) * (1 - 0.8 * e.diabetes) * (1 - 0.4 * e.calcineurina);
    const capacidad = (1 - e.addison) * (1 - 0.7 * e.heparina) * (1 - 0.75 * e.diabetes);
    d.renina = hiporenina * (1 + 2.0 * Math.max(0, 1 - enacPre) + 1.0 * (1 - capacidad));   // natriuresis y falta de aldosterona → más renina
    // (2) angiotensina II efectiva
    d.angII = d.renina * (1 - 0.9 * e.ieca);
    // (3) aldosterona: capacidad de síntesis × (AngII + K⁺ + basal)
    d.aldo = capacidad * (0.55 * d.angII + 0.45 + 0.3 * Math.max(0, s.K - 4));
    // (4) ocupación del receptor mineralocorticoide
    d.mr = d.aldo * (1 - 0.95 * e.espironolactona);
    // (5) objetivos de expresión genómica
    const indK = Math.min(0.40, P.kExprK * Math.max(0, s.K - 4));   // el K⁺ alto induce ENaC/ROMK/NaK por sí mismo
    d.objExpr = clamp(P.exprMin + (1 - P.exprMin) * fMR(d.mr) + indK, 0, 1.3);
    d.objExprHATP = clamp(P.exprMinHATP + (1 - P.exprMinHATP) * fMR(d.mr), 0, 1.2);
    // (6) actividad de ENaC
    d.actENaC = enacPre * (0.8 + 0.2 * clamp(d.angII, 0, 2));
    // (7) voltaje luminal (mV, negativo)
    d.voltaje = -P.vMax * Math.pow(clamp(d.actENaC, 0, 1.3), 0.7);   // casi proporcional a ENaC
    const hV = Math.min(1.1, Math.abs(d.voltaje) / P.vMax);
    // (8) secreción de K⁺
    const gK = Math.max(0.2, 1 + P.gKporMEq * (s.K - 4));       // efecto directo del K⁺ plasmático
    const jKmaxEf = P.jKmax * (0.25 + 0.75 * tfgEf / 100) * (1 - 0.2 * e.diabetes);   // nefropatía diabética: daño tubulointersticial
    d.actROMK = s.exprROMK;
    d.actNaK = s.exprNaK * (1 - 0.2 * e.calcineurina);
    // 78 % por ROMK (depende del voltaje) + 22 % por BK (depende del flujo, no del voltaje)
    d.actBK = s.exprROMK;
    d.jKromk = jKmaxEf * 0.78 * s.exprROMK * Math.sqrt(d.actNaK) * hV * gK;
    d.jKbk = jKmaxEf * 0.22 * d.actBK * gK;
    d.jK = d.jKromk + d.jKbk;
    d.jK = Math.max(0, d.jK);
    d.colonK = P.colonBase * (1 + 0.3 * (s.K - 4)) * (1 + 1.5 * Math.max(0, 1 - tfgEf / 100));

    // --- Célula intercalada α ---
    d.acidosis = clamp((24 - s.HCO3) / 6, -0.5, 2);            // 1 cuando HCO₃⁻ = 18
    const hVp = 0.5 + 0.5 * hV;                                 // el voltaje modula, no anula
    // (10) secreción de H⁺
    d.actHATP = s.exprHATP * hVp * (1 + 0.8 * d.acidosis) * (0.85 + 0.15 * clamp(d.aldo, 0, 2)) * (0.9 + 0.1 * clamp(d.angII, 0, 2));
    d.jH = P.jHmax * fTFG * Math.max(0.05, d.actHATP);

    // --- Túbulo proximal y TAL ---
    // (11) amoniogénesis
    d.mK = mK(s.K);
    d.prodNH4 = P.prodNH4 * fTFG * s.adapt * d.mK * (0.9 + 0.1 * clamp(d.angII, 0, 2));
    d.objAdapt = 1 + 1.6 * d.acidosis;
    // (12) reabsorción en TAL → NH₃ medular
    d.pK = pK(s.K);
    d.talFrac = P.talFrac * d.pK;
    d.objNH3 = d.prodNH4 * d.talFrac;
    const nh4Directo = 0.25 * d.prodNH4 * (1 - d.talFrac);   // parte que llega sin pasar por el reciclaje
    d.nh3Disponible = s.nh3Medular + nh4Directo;
    // (13) NH₄⁺ urinario: lo que hay de NH₃ o lo que la bomba puede atrapar
    d.nh4u = Math.min(d.nh3Disponible, 0.75 * d.jH);
    // (18) pH urinario: límite por voltaje + exceso de H⁺ sobre amortiguadores
    const taPot = P.taBase * fTFG;
    const r = d.jH / (d.nh3Disponible + taPot + 5);
    const pHexceso = 7.4 - 1.5 * r;
    const pHmin = 4.4 + 1.6 * (1 - hV);                        // sin voltaje la bomba no logra gradiente
    d.pHu = clamp(Math.max(pHmin, pHexceso), 4.6, 7.5);
    // (14) acidez titulable
    const tf = clamp((6.8 - d.pHu) / 1.3, 0.2, 1);
    d.ta = taPot * tf;
    // (15) excreción neta de ácido
    d.hco3u = (d.pHu > 6.2 ? 5 * (d.pHu - 6.2) : 0) + 15 * Math.max(0, s.HCO3 - 25);
    d.ena = d.nh4u + d.ta - d.hco3u;

    // --- Sangre derivada (17) ---
    d.Cl = P.naPlasma - s.HCO3 - P.anionGap;
    d.pCO2 = 1.5 * s.HCO3 + 8;
    d.pH = 6.1 + Math.log10(s.HCO3 / (0.03 * d.pCO2));
    d.Na = P.naPlasma;
    d.aldoNgdl = d.aldo * 10;        // ng/dL (normal ≈ 10)
    d.reninaNgmlh = d.renina * 1.5;  // ng/mL/h (normal ≈ 1,5)

    // --- Orina derivada (19) ---
    d.Ku = d.jK / P.volumenOrina;
    d.ttkg = (d.Ku / s.K) / (P.osmOrina / P.osmPlasma);
    d.nh4uL = d.nh4u / P.volumenOrina;
    d.uag = 30 - 1.0 * d.nh4uL;
    d.Nau = 100 + 60 * Math.max(0, 1 - d.actENaC);  // natriuresis leve si cae ENaC (ilustrativo)
    return d;
  }

  // ---------- Paso de integración (Euler) ----------
  function paso(s, e, dt) {
    const d = derivar(s, e);
    const n = Object.assign({}, s);
    n.t = s.t + dt;
    n.exprENaC += dt * (d.objExpr - s.exprENaC) / P.tauENaC;
    n.exprNaK += dt * (d.objExpr - s.exprNaK) / P.tauNaK;
    n.exprROMK += dt * (d.objExpr - s.exprROMK) / P.tauROMK;
    n.exprHATP += dt * (d.objExprHATP - s.exprHATP) / P.tauHATP;
    n.adapt += dt * (d.objAdapt - s.adapt) / P.tauAdapt;
    n.nh3Medular += dt * (d.objNH3 - s.nh3Medular) / P.tauNH3;
    // (9) balance de K⁺
    n.K += dt * (e.ingestaK - d.jK - d.colonK) / P.espacioK;
    // (16) balance de HCO₃⁻
    n.HCO3 += dt * (d.ena - e.cargaAcida) / P.espacioHCO3;
    n.K = clamp(n.K, 2.0, 9.0);
    n.HCO3 = clamp(n.HCO3, 5, 40);
    return n;
  }

  // ---------- Simulador con historial ----------
  function crearSimulador() {
    const sim = {
      e: entradasNormales(),
      s: estadoNormal(),
      dt: 0.05,
      historial: [],          // muestras cada 0,1 día de los últimos 14 días
      _acum: 0,
      maxDias: 14
    };
    sim.derivado = function () { return derivar(sim.s, sim.e); };
    sim.reset = function () { sim.s = estadoNormal(); sim.historial = []; sim._acum = 0; sim.muestrear(); };
    sim.muestrear = function () {
      const d = derivar(sim.s, sim.e);
      sim.historial.push({ t: sim.s.t, K: sim.s.K, HCO3: sim.s.HCO3, nh4u: d.nh4u, pHu: d.pHu, Cl: d.Cl, aldo: d.aldo, voltaje: d.voltaje });
      while (sim.historial.length && sim.historial[0].t < sim.s.t - sim.maxDias) sim.historial.shift();
    };
    sim.avanzar = function (dias) {
      let restante = dias;
      while (restante > 1e-9) {
        const h = Math.min(sim.dt, restante);
        sim.s = paso(sim.s, sim.e, h);
        restante -= h;
        sim._acum += h;
        if (sim._acum >= 0.1 - 1e-9) { sim._acum = 0; sim.muestrear(); }
      }
      return sim.s;
    };
    sim.muestrear();
    return sim;
  }

  const NI = global.NI || (global.NI = {});
  NI.model = { P, entradasNormales, estadoNormal, derivar, paso, crearSimulador, mK, pK };
  if (typeof module !== 'undefined' && module.exports) module.exports = NI;
})(typeof window !== 'undefined' ? window : globalThis);

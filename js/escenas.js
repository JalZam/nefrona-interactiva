/* Escenas de partículas: define las corrientes de cada vista y las actualiza con el estado del modelo.
   Cada corriente refleja un flujo del modelo; las cadenas reflejan dependencias entre movimientos. */
(function (global) {
  'use strict';
  const NI = global.NI;
  const P = NI.particulas;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const azar = () => Math.random();
  const escenas = {};
  let D = null;   // último estado derivado

  // ───────── Célula principal ─────────
  function principal(svg) {
    const e = P.crearEscena(svg, { radio: 15, fuente: 11.5 });
    e.agregar('na_ap', { path: 'g-na-ap', ion: 'na', tasa: 2.4, alLlegar: (esc) => {
      esc.emitir('na_bl');
      // la bomba mete K⁺ a cambio del Na⁺ que sale
      esc.emitir('k_in');
    }});
    e.agregar('na_bl', { path: 'g-na-bl', ion: 'na', modo: 'cadena' });
    e.agregar('k_in', { path: 'g-k-in', ion: 'k', modo: 'cadena', alLlegar: (esc) => {
      // ¿sale a la luz? depende del voltaje y de ROMK; si no, vuelve a la sangre por Kir4.1
      const pRomk = clamp(D.hV * D.actROMK, 0, 1);
      const r = azar();
      if (r < pRomk) esc.emitir('k_romk');
      else if (r < pRomk + 0.22 * D.actBK) esc.emitir('k_bk');
      else esc.emitir('k_kir');
    }});
    e.agregar('k_romk', { path: 'g-k-romk', ion: 'k', modo: 'cadena' });
    e.agregar('k_bk', { path: 'g-k-bk', ion: 'k', modo: 'cadena' });
    e.agregar('k_kir', { path: 'g-k-kir', ion: 'k', modo: 'cadena' });
    e.agregar('cl', { path: 'g-cl-para', ion: 'cl', tasa: 1.2, pequeno: true });
    e.agregar('aldo', { path: 'g-aldo', ion: 'aldo', tasa: 1.4, alLlegar: (esc) => {
      if (azar() < NI.sim.e.espironolactona * 0.95) esc.rebote(736, 416, 'aldo');
    }});
    e.agregar('h2o', { path: 'g-h2o', ion: 'h2o', tasa: 0.6, pequeno: true });
    e.actualizar = () => {
      e.setFlujo('na_ap', D.actENaC);
      e.setFlujo('cl', D.actENaC);
      e.setFlujo('aldo', clamp(D.aldo, 0, 2.5));
    };
    return e;
  }

  // ───────── Célula intercalada α ─────────
  function alfa(svg) {
    const e = P.crearEscena(svg, { radio: 15, fuente: 11.5 });
    e.agregar('co2', { path: 'g-co2', ion: 'co2', tasa: 2.2, pequeno: true, alLlegar: (esc) => {
      esc.emitir('h_ap'); esc.emitir('hco3_bl'); esc.emitir('cl_ae1');
    }});
    e.agregar('h_ap', { path: 'g-h-ap', ion: 'h', modo: 'cadena', alLlegar: (esc) => { esc.emitir('h_fade'); } });
    e.agregar('h_fade', { path: 'g-h-fade', ion: 'h', modo: 'cadena', desvanecer: 40 });
    e.agregar('hco3_bl', { path: 'g-hco3-bl', ion: 'hco3', modo: 'cadena' });
    e.agregar('cl_ae1', { path: 'g-cl-ae1', ion: 'cl', modo: 'cadena', pequeno: true });
    e.agregar('nh3', { path: 'g-nh3', ion: 'nh3', tasa: 2.2, alLlegar: (esc) => {
      // en la luz, el NH₃ queda atrapado como NH₄⁺ solo si hay H⁺ suficiente
      const pAtrapa = clamp(0.75 * D.jH / (D.nh3Disponible + 1e-6), 0, 1);
      if (azar() < pAtrapa) esc.emitir('nh4_orina'); else esc.emitir('nh3_escapa');
    }});
    e.agregar('nh4_orina', { path: 'g-nh4-orina', ion: 'nh4', modo: 'cadena', desvanecer: 60 });
    e.agregar('nh3_escapa', { path: 'g-nh3-escapa', ion: 'nh3', modo: 'cadena', desvanecer: 120 });
    e.agregar('k_hk', { path: 'g-k-hk', ion: 'k', tasa: 0.35, alLlegar: (esc) => esc.emitir('h_hk') });
    e.agregar('h_hk', { path: 'g-h-hk', ion: 'h', modo: 'cadena' });
    e.actualizar = () => {
      e.setFlujo('co2', D.actHATP);
      e.setFlujo('nh3', D.nh3Disponible / 44);
      e.setFlujo('k_hk', D.Kp < 3.5 ? 1 : 0.35);
    };
    return e;
  }

  // ───────── Túbulo proximal ─────────
  function proximal(svg) {
    const e = P.crearEscena(svg, { radio: 15, fuente: 11.5 });
    e.agregar('gln', { path: 'g-gln', ion: 'gln', tasa: 1.4, alLlegar: (esc) => {
      esc.emitir('nh4_ap'); setTimeout(() => esc.emitir('nh4_ap'), 350);
      esc.emitir('hco3_nbc'); setTimeout(() => esc.emitir('hco3_nbc'), 350);
    }});
    e.agregar('nh4_ap', { path: 'g-nh4-ap', ion: 'nh4', modo: 'cadena', alLlegar: (esc) => { esc.emitir('na_nhe3'); esc.emitir('nh4_lumen'); } });
    e.agregar('na_nhe3', { path: 'g-na-nhe3', ion: 'na', modo: 'cadena', pequeno: true, alLlegar: (esc) => esc.emitir('na_nak') });
    e.agregar('na_nak', { path: 'g-na-nak', ion: 'na', modo: 'cadena', pequeno: true });
    e.agregar('nh4_lumen', { path: 'g-nh4-lumen', ion: 'nh4', modo: 'cadena', desvanecer: 80 });
    e.agregar('hco3_nbc', { path: 'g-hco3-nbc', ion: 'hco3', modo: 'cadena' });
    e.agregar('k_prox', { path: 'g-k-prox', ion: 'k', tasa: 1.6, desvanecer: 70, flujo: 0 });
    e.actualizar = () => {
      e.setFlujo('gln', D.prodNH4 / 50);
      e.setFlujo('k_prox', clamp((D.Kp - 4.3) / 1.5, 0, 1.5));
    };
    return e;
  }

  // ───────── Asa gruesa ascendente ─────────
  function asa(svg) {
    const e = P.crearEscena(svg, { radio: 15, fuente: 11.5 });
    e.agregar('nh4_llega', { path: 'g-nh4-llega', ion: 'nh4', tasa: 2.0, alLlegar: (esc) => {
      // compite con el K⁺ por NKCC2
      if (azar() < D.pK) esc.emitir('nh4_cell'); else { esc.rebote(160, 150, 'nh4'); esc.emitir('nh4_sigue'); }
    }});
    e.agregar('nh4_cell', { path: 'g-nh4-cell', ion: 'nh4', modo: 'cadena' });
    e.agregar('nh4_sigue', { path: 'g-nh4-sigue', ion: 'nh4', modo: 'cadena', desvanecer: 150 });
    e.agregar('k_llega', { path: 'g-k-llega', ion: 'k', tasa: 1.2, alLlegar: (esc) => esc.emitir('k_cell') });
    e.agregar('k_cell', { path: 'g-k-cell', ion: 'k', modo: 'cadena', alLlegar: (esc) => esc.emitir('k_recicla') });
    e.agregar('k_recicla', { path: 'g-k-recicla', ion: 'k', modo: 'cadena', desvanecer: 30 });
    e.agregar('na', { path: 'g-na-asa', ion: 'na', tasa: 1.0, pequeno: true });
    e.agregar('cl', { path: 'g-cl-asa', ion: 'cl', tasa: 1.6, pequeno: true });
    e.actualizar = () => {
      e.setFlujo('nh4_llega', D.prodNH4 / 50);
      e.setFlujo('k_llega', 0.35 + 1.0 * clamp(D.Kp - 4, 0, 2));
    };
    return e;
  }

  // ───────── Mapa del nefrón ─────────
  function nefron(svg) {
    const e = P.crearEscena(svg, { radio: 11, fuente: 9, maxParticulas: 120 });
    e.agregar('nh4_prox', { path: 'o-nh4-prox', ion: 'nh4', tasa: 1.6, velocidad: 110, alLlegar: (esc) => {
      if (azar() < D.pK) esc.emitir('nh4_inter'); else esc.emitir('nh4_sigue');
    }});
    e.agregar('nh4_inter', { path: 'o-nh4-inter', ion: 'nh4', modo: 'cadena', velocidad: 110, desvanecer: 20 });
    e.agregar('nh4_sigue', { path: 'o-nh4-sigue', ion: 'nh4', modo: 'cadena', velocidad: 140, desvanecer: 200 });
    e.agregar('nh3_cd', { path: 'o-nh3-cd', ion: 'nh3', tasa: 1.4, velocidad: 110, alLlegar: (esc) => esc.emitir('nh4_orina') });
    e.agregar('nh4_orina', { path: 'o-nh4-orina', ion: 'nh4', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    e.agregar('k_cd', { path: 'o-k-cd', ion: 'k', tasa: 1.4, velocidad: 110, alLlegar: (esc) => esc.emitir('k_orina') });
    e.agregar('k_orina', { path: 'o-k-orina', ion: 'k', modo: 'cadena', velocidad: 160, desvanecer: 400 });
    e.agregar('na_cd', { path: 'o-na-cd', ion: 'na', tasa: 1.4, velocidad: 110, desvanecer: 30 });
    e.agregar('h_cd', { path: 'o-h-cd', ion: 'h', tasa: 1.4, velocidad: 110, alLlegar: (esc) => esc.emitir('h_orina') });
    e.agregar('h_orina', { path: 'o-h-orina', ion: 'h', modo: 'cadena', velocidad: 160, desvanecer: 300, pequeno: true });
    e.agregar('k_prox', { path: 'o-k-prox', ion: 'k', tasa: 1.0, velocidad: 90, desvanecer: 30, flujo: 0 });
    e.agregar('k_tal', { path: 'o-k-tal', ion: 'k', tasa: 1.0, velocidad: 90, desvanecer: 30, flujo: 0 });
    e.actualizar = () => {
      e.setFlujo('nh4_prox', D.prodNH4 / 50);
      e.setFlujo('nh3_cd', D.nh4u / 40);
      e.setFlujo('k_cd', D.jK / 72);
      e.setFlujo('na_cd', D.actENaC);
      e.setFlujo('h_cd', D.actHATP);
      const kAlto = clamp((D.Kp - 4.5) / 1.5, 0, 1.5);
      e.setFlujo('k_prox', kAlto); e.setFlujo('k_tal', kAlto);
    };
    return e;
  }

  // ───────── Eje RAAS ─────────
  function raas(svg) {
    const e = P.crearEscena(svg, { radio: 11, fuente: 9 });
    e.agregar('renina', { path: 'r-renina', ion: 'renina', tasa: 1.2, velocidad: 120, alLlegar: (esc) => {
      if (azar() < 0.9 * NI.sim.e.ieca) esc.rebote(500, 60, 'renina'); else esc.emitir('angii');
    }});
    e.agregar('angii', { path: 'r-angii', ion: 'angii', modo: 'cadena', velocidad: 120, alLlegar: (esc) => {
      const cap = (1 - NI.sim.e.addison) * (1 - 0.7 * NI.sim.e.heparina) * (1 - 0.75 * NI.sim.e.diabetes);
      if (azar() < cap) esc.emitir('aldo'); else esc.rebote(960, 60, 'angii');
    }});
    e.agregar('aldo', { path: 'r-aldo', ion: 'aldo', modo: 'cadena', velocidad: 120, alLlegar: (esc) => {
      if (azar() < 0.95 * NI.sim.e.espironolactona) esc.rebote(1215, 60, 'aldo');
    }});
    e.agregar('aldo_k', { path: 'r-aldo', ion: 'aldo', tasa: 1.0, velocidad: 120, flujo: 0, alLlegar: (esc) => {
      if (azar() < 0.95 * NI.sim.e.espironolactona) esc.rebote(1215, 60, 'aldo');
    }});
    e.actualizar = () => {
      e.setFlujo('renina', clamp(D.renina, 0, 3));
      // aldosterona estimulada directamente por el K⁺ (independiente de AngII)
      const cap = (1 - NI.sim.e.addison) * (1 - 0.7 * NI.sim.e.heparina) * (1 - 0.75 * NI.sim.e.diabetes);
      e.setFlujo('aldo_k', cap * 0.4 * clamp(D.Kp - 4, 0, 3));
    };
    return e;
  }

  NI.escenas = {
    iniciar() {
      escenas.principal = principal(document.getElementById('svg-principal'));
      escenas.alfa = alfa(document.getElementById('svg-alfa'));
      escenas.proximal = proximal(document.getElementById('svg-proximal'));
      escenas.asa = asa(document.getElementById('svg-asa'));
      escenas.nefron = nefron(document.getElementById('svg-nefron'));
      escenas.raas = raas(document.getElementById('svg-raas'));
      return escenas;
    },
    actualizar(d) { D = d; for (const k in escenas) escenas[k].actualizar(); },
    tick(dt, vistaActiva) {
      for (const k in escenas) {
        const esc = escenas[k];
        esc.activa = (k === 'nefron' || k === 'raas' || k === vistaActiva);
        if (esc.activa) esc.tick(dt); else if (esc.particulas.length) esc.limpiar();
      }
    },
    escenas
  };
})(window);

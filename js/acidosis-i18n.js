/* ============================================================
   ACIDOSIS — textos en inglés de esta página.
   Extiende NI.i18n y, al cambiar de idioma, traduce:
     · la interfaz (data-i18n del HTML),
     · los rótulos de dentro del dibujo,
     · las tarjetas «¿por qué?» (NI.porque),
     · las listas numeradas de cada ATR (NI.atrAPI.ATR),
   y vuelve a pintar. Los textos vienen de ACIDOSIS_EN (archivo generado
   a partir de la traducción revisada).
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI;
  if (!NI || !NI.i18n) return;
  const D = global.ACIDOSIS_EN || {};

  /* ---------- Interfaz ---------- */

  const ES = {
    'ac.logosub': 'Animación · Acidosis metabólica sin anion gap',
    'ac.pasivo': 'transporte pasivo', 'ac.activo': 'transporte activo (ATP)',
    'ac.canal': 'canal', 'ac.parcial': 'parcial',
    'ac.apagado': 'apagado · ✕ bloqueado',
    'ac.esperando': 'esperando a completar la cuenta',
    'ac.tocaCanal': 'toca un canal, bomba o caja para leer qué lo activa',
    'ac.porque': '¿Por qué? Toca un canal, bomba o caja del esquema y aquí sale qué lo activa, qué lo apaga y la referencia.',
    'ac.elige': 'Acidosis metabólica sin anion gap · toca una · luego toca cada número en orden (o usa ← →)',
    'ac.biblio': 'Referencias', 'ac.sangre': 'Sangre', 'ac.orina': 'Orina',
    'ac.refTarjeta': 'Referencias:',
    'doc.titulo': 'Nefrona Interactiva — Acidosis metabólica sin anion gap',
    'ac.pie': 'Nefrona Interactiva · Herramienta educativa · CiMedical · Esquemas dibujados según la convención de los textos clásicos de fisiología renal · Sin publicidad. Se cuentan las visitas con PostHog (servidor en Europa); las cookies, solo con su permiso.',
    'leyenda.nh4': 'Amonio', 'leyenda.nh3': 'Amoniaco', 'leyenda.gln': 'Glutamina',
    'leyenda.hpo4': 'Fosfato', 'leyenda.h2po4': 'Fosfato ácido (acidez titulable)',
    'leyenda.aldo': 'Aldosterona', 'leyenda.angii': 'Angiotensina II', 'leyenda.renina': 'Renina'
  };
  const EN = {
    'ac.logosub': 'Animation · Normal anion gap metabolic acidosis',
    'ac.pasivo': 'passive transport', 'ac.activo': 'active transport (ATP)',
    'ac.canal': 'channel', 'ac.parcial': 'partial',
    'ac.apagado': 'off · ✕ blocked',
    'ac.esperando': 'waiting to complete its count',
    'ac.tocaCanal': 'tap a channel, pump or box to read what drives it',
    'ac.porque': 'Why? Tap a channel, pump or box in the diagram and this panel shows what turns it on, what turns it off, and the reference.',
    'ac.elige': 'Normal anion gap metabolic acidosis · tap one · then tap each number in order (or use ← →)',
    'ac.biblio': 'References', 'ac.sangre': 'Blood', 'ac.orina': 'Urine',
    'ac.refTarjeta': 'References:',
    'doc.titulo': 'Nefrona Interactiva — Normal anion gap metabolic acidosis',
    'ac.pie': 'Nefrona Interactiva · Learning tool · CiMedical · Diagrams drawn following the convention of the classic renal physiology texts · No advertising. Visits are counted with PostHog (servers in Europe); cookies only with your permission.',
    'leyenda.nh4': 'Ammonium', 'leyenda.nh3': 'Ammonia', 'leyenda.gln': 'Glutamine',
    'leyenda.hpo4': 'Phosphate', 'leyenda.h2po4': 'Acid phosphate (titratable acid)',
    'leyenda.aldo': 'Aldosterone', 'leyenda.angii': 'Angiotensin II', 'leyenda.renina': 'Renin'
  };

  // Nombres de los botones de cada ATR
  const BTN_ES = {
    normal: 'Funcionamiento normal', diarrea: 'Diarrea · riñón sano',
    atr2: 'ATR 2 · proximal', atr1: 'ATR 1 · distal', atr3: 'ATR 3 · mixta (CA II)',
    atr4h: 'ATR 4 · hipoaldo-steronismo', atr4r: 'ATR 4 · antagonista del MR',
    atr4v: 'ATR 4 · bloqueo de ENaC'
  };
  Object.keys(BTN_ES).forEach(id => {
    ES['ac.btn.' + id] = BTN_ES[id];
    EN['ac.btn.' + id] = (D.btn && D.btn[id]) || (D.atr[id] && D.atr[id].nombre) || BTN_ES[id];
  });

  NI.i18n.extender(ES, EN, D.textos || {});

  /* ---------- Guardar el español para poder volver ---------- */

  const ORIG = { porque: null, atr: null };

  function guardar() {
    if (ORIG.porque) return;
    ORIG.porque = {};
    for (const k in NI.porque) ORIG.porque[k] = { t: NI.porque[k].titulo, x: NI.porque[k].texto };
    ORIG.atr = {};
    const A = (NI.atrAPI || {}).ATR || {};
    for (const k in A) {
      ORIG.atr[k] = {
        nombre: A[k].nombre, causas: A[k].causas || '',
        pasos: (A[k].pasos || []).map(p => ({ t: p.titulo, x: p.texto }))
      };
    }
  }

  function aplicarDatos(en) {
    guardar();
    for (const k in NI.porque) {
      const f = en ? (D.porque || {})[k] : ORIG.porque[k];
      if (!f) continue;
      NI.porque[k].titulo = f.t; NI.porque[k].texto = f.x;
    }
    const A = (NI.atrAPI || {}).ATR || {};
    for (const k in A) {
      const f = en ? (D.atr || {})[k] : ORIG.atr[k];
      if (!f) continue;
      A[k].nombre = f.nombre;
      if (A[k].causas != null) A[k].causas = f.causas;
      (A[k].pasos || []).forEach((p, i) => {
        const q = f.pasos && f.pasos[i];
        if (!q) return;
        p.titulo = q.t; p.texto = q.x;
      });
    }
  }

  /* ---------- Rótulos de dentro del dibujo ---------- */

  function rotulosSVG() {
    const svg = document.getElementById('svg-nefron');
    if (!svg) return;
    svg.querySelectorAll('text, tspan').forEach(n => {
      if (n.children.length) return;                 // contenedor: no tocar
      if (n.dataset.es == null) n.dataset.es = n.textContent;
      n.textContent = NI.i18n.tx(n.dataset.es);
    });
  }

  /* ---------- Repintar ---------- */

  function refrescar() {
    NI.i18n.pintarHTML();
    aplicarDatos(NI.i18n.lang === 'en');
    rotulosSVG();
    const api = NI.atrAPI;
    if (api && api.estado) {
      try { api.elegir(api.estado().id || api.actualId || 'normal'); } catch (e) { /* ver abajo */ }
    }
  }

  /* ---------- Arranque ---------- */

  function init() {
    const api = NI.atrAPI;
    if (!api) { setTimeout(init, 60); return; }
    guardar();

    // Interruptor de idioma
    const sw = document.getElementById('dm-lang');
    if (sw) {
      const marcar = () => sw.querySelectorAll('button').forEach(b =>
        b.classList.toggle('activo', b.dataset.lang === NI.i18n.lang));
      sw.querySelectorAll('button').forEach(b =>
        b.addEventListener('click', () => NI.i18n.set(b.dataset.lang)));
      NI.i18n.alCambiar(marcar);
      marcar();
    }

    NI.i18n.alCambiar(() => {
      const sel = document.querySelector('.atr-btn.activo');
      const cual = sel ? sel.dataset.atr : 'normal';
      NI.i18n.pintarHTML();
      aplicarDatos(NI.i18n.lang === 'en');
      rotulosSVG();
      // Si había una tarjeta «¿por qué?» abierta, se cierra: su texto es del idioma anterior
      const cerrar = document.querySelector('.tarjeta.abierta .tarjeta-cerrar');
      if (cerrar) cerrar.click();
      try { api.elegir(cual); } catch (e) { console.warn(e); }
    });

    NI.i18n.pintarHTML();
    if (NI.i18n.lang === 'en') {
      aplicarDatos(true);
      rotulosSVG();
      try { api.elegir(document.querySelector('.atr-btn.activo')?.dataset.atr || 'normal'); } catch (e) { /* nada */ }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  NI.acI18n = { refrescar, aplicarDatos, rotulosSVG };
})(typeof window !== 'undefined' ? window : globalThis);

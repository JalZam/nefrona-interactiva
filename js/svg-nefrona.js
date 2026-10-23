/* Dibujo: actualiza el SVG de la célula principal a partir del estado derivado */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const $ = (id) => document.getElementById(id);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function claseEstado(el, actividad) {
    el.classList.remove('ok', 'parcial', 'off');
    el.classList.add(actividad >= 0.75 ? 'ok' : actividad >= 0.35 ? 'parcial' : 'off');
  }
  const fmt = (x, dec = 0) => x.toFixed(dec).replace('.', ',');

  function render(d, s) {
    // Canales
    claseEstado($('ch-enac'), Math.min(d.actENaC, d.exprENaC));
    claseEstado($('ch-romk'), d.actROMK);
    claseEstado($('ch-nak'), d.actNaK);
    claseEstado($('ch-bk'), d.actBK);
    // Flujos: grosor proporcional (normal = 6)
    const w = (x, base = 6, min = 1.2) => Math.max(min, base * x).toFixed(1);
    $('fl-na-apical').style.strokeWidth = w(d.actENaC);
    $('fl-na-baso').style.strokeWidth = w(d.actENaC);
    $('fl-k-in').style.strokeWidth = w(d.jK / 72);
    $('fl-k-romk').style.strokeWidth = w(d.jKromk / 56.2);
    $('fl-k-bk').style.strokeWidth = w(d.jKbk / 15.8, 4);
    // Voltaje
    const frac = clamp(Math.abs(d.voltaje) / 50, 0, 1);
    const h = 270 * frac;
    const barra = $('volt-barra');
    barra.setAttribute('height', h.toFixed(1));
    barra.setAttribute('y', (136 + 270 - h).toFixed(1));
    barra.style.fill = frac > 0.5 ? '#2563eb' : frac > 0.25 ? '#d97706' : '#dc2626';
    $('volt-val').textContent = `${fmt(d.voltaje)} mV`;
    // Vía aldosterona
    const dots = $('aldo-dots').querySelectorAll('circle');
    const nVis = Math.round(clamp(d.aldo, 0, 2) * 3);
    dots.forEach((c, i) => { c.style.opacity = i < nVis ? 1 : 0.12; });
    $('fl-aldo').style.opacity = 0.25 + 0.75 * clamp(d.aldo, 0, 1);
    $('box-mr').classList.toggle('apagada', d.mr < 0.35);
    $('box-sgk1').classList.toggle('apagada', d.mr < 0.35);
    $('fl-mr-nuc').style.opacity = 0.2 + 0.8 * clamp(d.mr, 0, 1);
    $('fl-nuc-sgk').style.opacity = 0.2 + 0.8 * clamp(d.mr, 0, 1);
    $('fl-sgk-nedd').style.opacity = 0.2 + 0.8 * clamp(d.mr, 0, 1);
    const neddActiva = d.mr < 0.5;
    $('box-nedd').classList.toggle('apagada', !neddActiva);
    $('fl-nedd-enac').style.opacity = neddActiva ? 1 : 0.2;
    $('nedd-estado').textContent = neddActiva ? 'retira ENaC (ACTIVA)' : 'retira ENaC (inhibida)';
    $('nedd-estado').style.fill = neddActiva ? '#dc2626' : '#6d28d9';
    // Bandas
    $('l-na').textContent = fmt(d.Nau);
    $('l-k').textContent = fmt(d.Ku);
    $('l-ph').textContent = fmt(d.pHu, 1);
    $('s-k').textContent = fmt(s.K, 1);
    $('s-hco3').textContent = fmt(s.HCO3);
    $('s-aldo').textContent = fmt(d.aldoNgdl);
  }

  NI.svg = { render, claseEstado };
})(typeof window !== 'undefined' ? window : globalThis);

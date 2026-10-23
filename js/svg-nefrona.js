/* Dibujo: actualiza los SVG (mapa, RAAS y las 4 células) a partir del estado derivado */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const $ = (id) => document.getElementById(id);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = (x, dec = 0) => (+x).toFixed(dec).replace('.', ',');
  const pct = (x) => Math.round(clamp(x, 0, 9) * 100);

  function claseEstado(el, actividad) {
    if (!el) return;
    el.classList.remove('ok', 'parcial', 'off');
    el.classList.add(actividad >= 0.75 ? 'ok' : actividad >= 0.35 ? 'parcial' : 'off');
  }
  function voltimetro(barraId, valId, voltaje) {
    const frac = clamp(Math.abs(voltaje) / 50, 0, 1);
    const h = 270 * frac;
    const barra = $(barraId);
    barra.setAttribute('height', h.toFixed(1));
    barra.setAttribute('y', (136 + 270 - h).toFixed(1));
    barra.style.fill = frac > 0.5 ? '#2563eb' : frac > 0.25 ? '#d97706' : '#dc2626';
    $(valId).textContent = `${fmt(voltaje)} mV`;
  }

  function renderPrincipal(d, s) {
    claseEstado($('ch-enac'), Math.min(d.actENaC, s.exprENaC));
    claseEstado($('ch-romk'), d.actROMK);
    claseEstado($('ch-nak'), d.actNaK);
    claseEstado($('ch-bk'), d.actBK);
    voltimetro('volt-barra', 'volt-val', d.voltaje);
    $('fl-aldo').style.opacity = 0.25 + 0.75 * clamp(d.aldo, 0, 1);
    $('box-mr').classList.toggle('apagada', d.mr < 0.35);
    $('box-sgk1').classList.toggle('apagada', d.mr < 0.35);
    ['fl-mr-nuc', 'fl-nuc-sgk', 'fl-sgk-nedd'].forEach(id => { $(id).style.opacity = 0.2 + 0.8 * clamp(d.mr, 0, 1); });
    const neddActiva = d.mr < 0.5;
    $('box-nedd').classList.toggle('apagada', !neddActiva);
    $('fl-nedd-enac').style.opacity = neddActiva ? 1 : 0.2;
    $('nedd-estado').textContent = neddActiva ? 'retira ENaC (ACTIVA)' : 'retira ENaC (inhibida)';
    $('nedd-estado').style.fill = neddActiva ? '#dc2626' : '#6d28d9';
    $('l-na').textContent = fmt(d.Nau); $('l-k').textContent = fmt(d.Ku); $('l-ph').textContent = fmt(d.pHu, 1);
    $('s-k').textContent = fmt(d.Kp, 1); $('s-hco3').textContent = fmt(s.HCO3); $('s-aldo').textContent = fmt(d.aldoNgdl);
  }

  function renderAlfa(d, s) {
    claseEstado($('ch-hatp'), d.actHATP);
    claseEstado($('ch-ae1'), d.actHATP);
    claseEstado($('ch-rhcg-ap'), d.nh3Disponible / 44);
    claseEstado($('ch-rhcg-bl'), d.nh3Disponible / 44);
    voltimetro('volt-barra-a', 'volt-val-a', d.voltaje);
    $('a-ph').textContent = fmt(d.pHu, 1); $('a-nh4').textContent = fmt(d.nh4u);
    $('a-nh3').textContent = pct(d.nh3Disponible / 44);
    $('a-hco3').textContent = fmt(s.HCO3); $('a-k').textContent = fmt(d.Kp, 1);
    $('a-pool').textContent = pct(s.nh3Medular / 37.5);
  }

  function renderProximal(d, s) {
    const act = d.prodNH4 / 50;
    const mito = $('box-mito');
    mito.classList.remove('parcial', 'off');
    if (d.mK < 0.35) mito.classList.add('off'); else if (d.mK < 0.75) mito.classList.add('parcial');
    const deberia = d.prodNH4 / Math.max(0.05, d.mK);
    $('mito-estado').textContent = d.mK < 0.95
      ? `produce ${fmt(d.prodNH4)} mEq/día · sin el freno del K⁺ produciría ${fmt(deberia)} · freno ${pct(1 - d.mK)} %`
      : `produce ${fmt(d.prodNH4)} mEq/día (${pct(act)} % del basal · adaptación ×${fmt(s.adapt, 1)})`;
    claseEstado($('ch-nhe3'), act); claseEstado($('ch-nbc'), act); claseEstado($('ch-snat3'), act);
    $('p-prod').textContent = fmt(d.prodNH4); $('p-pct').textContent = pct(act);
    $('p-k').textContent = fmt(d.Kp, 1); $('p-hco3').textContent = fmt(s.HCO3);
    $('p-nota-k').classList.toggle('oculta', d.Kp < 4.8);
  }

  function renderAsa(d, s) {
    claseEstado($('ch-nkcc2'), d.pK);
    claseEstado($('ch-nh4-salida'), d.pK);
    $('t-llega').textContent = fmt(d.prodNH4); $('t-pct').textContent = pct(d.talFrac);
    $('t-pool').textContent = pct(s.nh3Medular / 37.5); $('t-k').textContent = fmt(d.Kp, 1);
    $('t-deposito').style.opacity = (0.12 + 0.6 * clamp(s.nh3Medular / 37.5, 0, 1.2)).toFixed(2);
    $('t-nota-k').classList.toggle('oculta', d.Kp < 4.8);
  }

  function renderNefron(d, s) {
    claseEstado($('seg-proximal'), d.prodNH4 / 50);
    claseEstado($('seg-asa'), d.pK);
    claseEstado($('seg-principal'), Math.min(d.actENaC, s.exprENaC));
    claseEstado($('seg-alfa'), d.actHATP);
    claseEstado($('seg-medular'), d.nh4u / 40);
    const pool = clamp(s.nh3Medular / 37.5, 0, 1.2);
    $('inter-pool').style.opacity = (0.1 + 0.5 * pool).toFixed(2);
    $('inter-val').textContent = `NH₃ medular ${pct(pool)} %`;
    $('o-nota-k').classList.toggle('visible', d.Kp >= 4.8);
    $('o-nota-tal').classList.toggle('visible', d.Kp >= 4.8);
  }

  function renderRaas(d, s, e) {
    $('r-val-renina').textContent = `renina ${fmt(d.reninaNgmlh, 1)}`;
    $('r-val-angii').textContent = `AngII ${pct(d.angII)} %`;
    $('r-val-aldo').textContent = `aldo ${fmt(d.aldoNgdl)} ng/dL`;
    $('m-aine').classList.toggle('activa', e.aine > 0 || e.diabetes > 0 || e.calcineurina > 0);
    $('m-ieca').classList.toggle('activa', e.ieca > 0);
    $('m-supra').classList.toggle('activa', e.addison > 0 || e.heparina > 0);
    $('m-mr').classList.toggle('activa', e.espironolactona > 0);
    $('box-suprarrenal').classList.toggle('apagada', d.aldo < 0.35);
    $('box-angii').classList.toggle('apagada', d.angII < 0.35);
    $('box-renina').classList.toggle('apagada', d.renina < 0.35);
  }

  function render(d, s, e, vista) {
    renderNefron(d, s); renderRaas(d, s, e);
    if (vista === 'principal') renderPrincipal(d, s);
    else if (vista === 'alfa') renderAlfa(d, s);
    else if (vista === 'proximal') renderProximal(d, s);
    else if (vista === 'asa') renderAsa(d, s);
  }

  NI.svg = { render, claseEstado };
})(typeof window !== 'undefined' ? window : globalThis);

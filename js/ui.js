/* Interfaz: deslizadores, reloj, laboratorio, tarjetas, cascada */
(function (global) {
  'use strict';
  const NI = global.NI;
  const $ = (id) => document.getElementById(id);
  const fmt = (x, dec = 0) => (+x).toFixed(dec).replace('.', ',');

  const sim = NI.model.crearSimulador();
  NI.sim = sim;
  let corriendo = false;
  let velocidad = 0.25;         // días simulados por segundo real
  let ultimo = null;
  let ultimoRender = 0;
  let seleccion = null;

  // ---------- Deslizadores ----------
  document.querySelectorAll('.causa[data-causa]').forEach(div => {
    const input = div.querySelector('input');
    const b = div.querySelector('label b');
    input.addEventListener('input', () => {
      const v = +input.value;
      sim.e[div.dataset.causa] = v / 100;
      b.textContent = v + ' %';
      div.classList.toggle('activa', v > 0);
      if (!corriendo) reproducir(true);
      pintar(true);
    });
  });
  const ctxUnidades = { tfg: ' mL/min', ingestaK: ' mEq/día', cargaAcida: ' mEq/día' };
  document.querySelectorAll('.causa[data-ctx]').forEach(div => {
    const input = div.querySelector('input');
    const b = div.querySelector('label b');
    input.addEventListener('input', () => {
      sim.e[div.dataset.ctx] = +input.value;
      b.textContent = input.value + ctxUnidades[div.dataset.ctx];
      if (!corriendo) reproducir(true);
      pintar(true);
    });
  });

  $('btn-normal').addEventListener('click', () => {
    sim.e = NI.model.entradasNormales();
    document.querySelectorAll('.causa[data-causa]').forEach(div => {
      div.querySelector('input').value = 0; div.querySelector('label b').textContent = '0 %'; div.classList.remove('activa');
    });
    document.querySelectorAll('.causa[data-ctx]').forEach(div => {
      const k = div.dataset.ctx; const v = sim.e[k];
      div.querySelector('input').value = v; div.querySelector('label b').textContent = v + ctxUnidades[k];
    });
    sim.reset(); reproducir(false); pintar(true);
  });
  $('btn-reiniciar').addEventListener('click', () => { sim.reset(); pintar(true); });

  // ---------- Reloj ----------
  function reproducir(on) {
    corriendo = on;
    $('btn-play').textContent = on ? '❚❚ Pausar' : '▶ Reproducir';
    ultimo = null;
    if (on) requestAnimationFrame(bucle);
  }
  $('btn-play').addEventListener('click', () => reproducir(!corriendo));
  document.querySelectorAll('.btn-vel').forEach(btn => btn.addEventListener('click', () => {
    velocidad = +btn.dataset.vel;
    document.querySelectorAll('.btn-vel').forEach(b => b.classList.toggle('activo', b === btn));
  }));

  function bucle(ts) {
    if (!corriendo) return;
    if (ultimo !== null) {
      const dtReal = Math.min(0.1, (ts - ultimo) / 1000);
      sim.avanzar(dtReal * velocidad);
    }
    ultimo = ts;
    if (ts - ultimoRender > 50) { ultimoRender = ts; pintar(false); }
    requestAnimationFrame(bucle);
  }

  // ---------- Laboratorio ----------
  // rangos: [bajoRojo, bajoAmbar, altoAmbar, altoRojo]
  const rangos = {
    Na: [130, 135, 145, 150], K: [3.0, 3.5, 5.0, 5.9], Cl: [92, 98, 107, 112], HCO3: [16, 22, 28, 32],
    pH: [7.25, 7.35, 7.45, 7.55], pCO2: [28, 35, 45, 55], AG: [4, 8, 12.5, 16], aldo: [2, 5, 20, 30], renina: [0.3, 0.6, 3, 5],
    pHu: null, nh4u: null, Ku: null, ttkg: null, uag: null, Nau: null
  };
  function filaLab(tabla, k, valor, dec, clase, flag) {
    const tr = tabla.querySelector(`tr[data-k="${k}"]`);
    tr.querySelector('.val').textContent = fmt(valor, dec);
    tr.className = clase || '';
    tr.querySelector('.flag').textContent = flag || '';
  }
  function clasificar(k, v) {
    const r = rangos[k]; if (!r) return ['', ''];
    if (v < r[0]) return ['bajo', '↓↓']; if (v < r[1]) return ['leve', '↓'];
    if (v > r[3]) return ['alto', '↑↑']; if (v > r[2]) return ['leve', '↑'];
    return ['ok', '✓'];
  }
  function renderLabs(d, s) {
    const S = $('labs-sangre'), O = $('labs-orina');
    const sangre = [['Na', d.Na, 0], ['K', s.K, 1], ['Cl', d.Cl, 0], ['HCO3', s.HCO3, 0], ['pH', d.pH, 2], ['pCO2', d.pCO2, 0], ['AG', NI.model.P.anionGap, 0], ['aldo', d.aldoNgdl, 0], ['renina', d.reninaNgmlh, 1]];
    sangre.forEach(([k, v, dec]) => { const [c, f] = clasificar(k, v); filaLab(S, k, v, dec, c, f); });
    // Orina: interpretación contextual
    const acidosis = s.HCO3 < 22, hiperK = s.K > 5.0;
    filaLab(O, 'pHu', d.pHu, 2, acidosis ? (d.pHu < 5.5 ? 'ok' : 'alto') : '', acidosis ? (d.pHu < 5.5 ? '✓' : '↑') : '');
    filaLab(O, 'nh4u', d.nh4u, 0, acidosis ? (d.nh4u < 60 ? 'bajo' : 'ok') : '', acidosis ? (d.nh4u < 60 ? '↓' : '✓') : '');
    filaLab(O, 'Ku', d.Ku, 0, '', '');
    filaLab(O, 'ttkg', d.ttkg, 1, hiperK ? (d.ttkg < 7 ? 'bajo' : 'ok') : '', hiperK ? (d.ttkg < 7 ? '↓' : '✓') : '');
    filaLab(O, 'uag', d.uag, 0, acidosis ? (d.uag > 0 ? 'alto' : 'ok') : '', acidosis ? (d.uag > 0 ? '+' : '−') : '');
    filaLab(O, 'Nau', d.Nau, 0, '', '');
    // Nota interpretativa
    let nota = '';
    if (acidosis && hiperK) {
      nota = d.pHu < 5.5
        ? 'Acidosis con anion gap normal, hiperkalemia, pH urinario < 5,5 y NH₄⁺ bajo para el grado de acidosis: patrón de ATR tipo 4.'
        : 'Hiperkalemia con acidosis y pH urinario que no baja de 5,5: ATR hiperkalémica dependiente de voltaje (bloqueo directo de ENaC).';
      if (d.ttkg < 7) nota += ' TTKG < 7 con K⁺ alto = secreción de K⁺ inapropiadamente baja.';
    } else if (hiperK) {
      nota = 'Hiperkalemia sin acidosis todavía: el HCO₃⁻ tarda días en caer porque el NH₄⁺ se reduce después de que sube el K⁺.';
    } else if (acidosis) {
      nota = 'HCO₃⁻ bajo con K⁺ normal.';
    } else {
      nota = 'Valores dentro de lo normal. En acidosis el riñón sano sube el NH₄⁺ urinario por encima de 100 mEq/día.';
    }
    $('labs-nota').textContent = nota;
  }

  // ---------- Sparklines ----------
  const sparks = { K: { ref: 4.0, min: 3, max: 8 }, HCO3: { ref: 24, min: 10, max: 30 }, nh4u: { ref: 40, min: 0, max: 120 }, pHu: { ref: 5.5, min: 4.5, max: 7 } };
  function renderSparks() {
    const h = sim.historial; if (h.length < 2) return;
    const t0 = h[0].t, t1 = Math.max(h[h.length - 1].t, t0 + 14);
    for (const k in sparks) {
      const sp = sparks[k], svg = $('sp-' + k);
      const y = (v) => 46 - 42 * (Math.max(sp.min, Math.min(sp.max, v)) - sp.min) / (sp.max - sp.min);
      const x = (t) => 300 * (t - t0) / (t1 - t0);
      const pts = h.map(p => `${x(p.t).toFixed(1)},${y(p[k]).toFixed(1)}`).join(' ');
      svg.innerHTML = `<line class="ref" x1="0" x2="300" y1="${y(sp.ref).toFixed(1)}" y2="${y(sp.ref).toFixed(1)}"/><polyline points="${pts}"/>`;
    }
  }

  // ---------- Cascada ----------
  function renderCascada(d, s) {
    const pasos = {
      aldo: d.mr < 0.75, enac: Math.min(d.actENaC, d.exprENaC) < 0.75, volt: Math.abs(d.voltaje) < 32,
      k: s.K > 5.0, nh4: d.mK < 0.75, hco3: s.HCO3 < 22
    };
    const fuerte = { aldo: d.mr < 0.35, enac: Math.min(d.actENaC, d.exprENaC) < 0.35, volt: Math.abs(d.voltaje) < 18, k: s.K > 6.0, nh4: d.mK < 0.5, hco3: s.HCO3 < 18 };
    document.querySelectorAll('#cascada li').forEach(li => {
      const p = li.dataset.paso;
      li.classList.toggle('activo', !!pasos[p]);
      li.classList.toggle('fuerte', !!fuerte[p]);
    });
  }

  // ---------- Tarjetas ¿por qué? ----------
  function mostrarTarjeta(clave, d) {
    const info = NI.porque[clave]; if (!info) return;
    const t = $('tarjeta');
    t.innerHTML = `<div class="tarjeta-titulo">${info.titulo}</div><p class="tarjeta-texto">${info.texto}</p>` +
      `<span class="tarjeta-estado" id="tarjeta-estado">${info.estado(d)}</span>` +
      `<div class="tarjeta-refs">Referencias: ${info.refs.map(n => `<a href="#ref-${n}" title="${(NI.referencias[n - 1] || {}).cita || ''}">[${n}]</a>`).join(' ')}</div>`;
  }
  document.querySelectorAll('[data-porque]').forEach(el => el.addEventListener('click', () => {
    seleccion = el.dataset.porque;
    document.querySelectorAll('.seleccionado').forEach(x => x.classList.remove('seleccionado'));
    el.classList.add('seleccionado');
    mostrarTarjeta(seleccion, sim.derivado());
  }));

  // ---------- Pintar todo ----------
  function pintar(forzar) {
    const d = sim.derivado(); const s = sim.s;
    d.exprENaC = s.exprENaC;
    NI.svg.render(d, s);
    renderLabs(d, s);
    renderSparks();
    renderCascada(d, s);
    $('dia').textContent = fmt(s.t, 1);
    $('dia-barra').style.width = Math.min(100, 100 * s.t / 14) + '%';
    if (seleccion) { const e = $('tarjeta-estado'); if (e) e.textContent = NI.porque[seleccion].estado(d); }
  }

  NI.pintar = pintar;
  NI.renderReferencias($('lista-refs'));
  document.querySelectorAll('#lista-refs li').forEach(li => { li.id = 'ref-' + li.getAttribute('value'); });
  pintar(true);
})(window);

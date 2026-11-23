/* ============================================================
   ACIDOSIS — vista «normal junto a la enfermedad».
   «Funcionamiento normal» se ve en la fila de cuatro células (index.html). Al elegir una
   enfermedad se abre esta vista: por cada célula que se daña, y en el orden en que se daña,
   la célula NORMAL a la izquierda, la ENFERMA a la derecha y sus pasos al lado.
   Cada célula es celda.html dentro de un iframe (la fila completa recortada a una célula),
   así cada copia tiene su propio motor y sus propias colas de estequiometría.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI;
  if (!NI || !NI.i18n) return;
  const $ = id => document.getElementById(id);
  const t = k => NI.i18n.t(k);

  NI.i18n.extender({
    'cmp.normal': 'NORMAL', 'cmp.resaltar': 'Resaltar lo afectado',
    'cmp.pista': 'Toca cada paso, en orden, para verlo en la célula enferma.',
    'cmp.resultado': 'Resultado en sangre y orina', 'cmp.cargando': 'Cargando…',
    'cmp.elige': 'Acidosis metabólica sin anion gap · toca una · luego toca cada paso en orden',
    'cmp.cerrar': 'Cerrar explicación',
    'cmp.cel.prox': 'Túbulo proximal', 'cmp.cel.asa': 'Asa gruesa ascendente',
    'cmp.cel.prin': 'Célula principal (colector)', 'cmp.cel.alfa': 'Intercalada α (con la orina)',
    'cmp.corto.diarrea': 'DIARREA', 'cmp.corto.atr2': 'ATR 2', 'cmp.corto.atr1': 'ATR 1', 'cmp.corto.atr3': 'ATR 3',
    'cmp.corto.atr4h': 'ATR 4 · HIPOALDO', 'cmp.corto.atr4r': 'ATR 4 · ANTAGONISTA MR', 'cmp.corto.atr4v': 'ATR 4 · BLOQUEO ENaC'
  }, {
    'cmp.normal': 'NORMAL', 'cmp.resaltar': 'Highlight what is affected',
    'cmp.pista': 'Tap each step, in order, to see it in the diseased cell.',
    'cmp.resultado': 'Result in blood and urine', 'cmp.cargando': 'Loading…',
    'cmp.elige': 'Normal anion gap metabolic acidosis · tap one · then tap each step in order',
    'cmp.cerrar': 'Close explanation',
    'cmp.cel.prox': 'Proximal tubule', 'cmp.cel.asa': 'Thick ascending limb',
    'cmp.cel.prin': 'Principal cell (collecting duct)', 'cmp.cel.alfa': 'Type A intercalated cell (with the urine)',
    'cmp.corto.diarrea': 'DIARRHEA', 'cmp.corto.atr2': 'RTA 2', 'cmp.corto.atr1': 'RTA 1', 'cmp.corto.atr3': 'RTA 3',
    'cmp.corto.atr4h': 'RTA 4 · HYPOALDO', 'cmp.corto.atr4r': 'RTA 4 · MR ANTAGONIST', 'cmp.corto.atr4v': 'RTA 4 · ENaC BLOCKADE'
  });

  const CELDA = 'celda.html';
  // El eje renina–angiotensina–aldosterona actúa sobre la célula principal
  const RAAS = ['box-renina', 'box-angii', 'box-suprarrenal', 'g-aldo'];
  // Piezas de apoyo: si una participa, se dibujan también las que le dan o le reciben sus sustancias
  const APOYO = {
    'ch-hatp': ['box-ca', 'ch-ae1'], 'ch-ae1': ['box-ca', 'ch-hatp'], 'box-ca': ['ch-hatp', 'ch-ae1'], 'box-aldo-a': ['ch-hatp'],
    'ch-rhcg-ap': ['ch-rhcg-bl', 'ch-hatp'], 'ch-rhcg-bl': ['ch-rhcg-ap'],
    'ch-enac': ['ch-nak'], 'ch-romk': ['ch-nak', 'ch-kir'], 'ch-nak': ['ch-enac', 'ch-romk'], 'ch-kir': ['ch-romk'],
    'box-suprarrenal': ['box-mr'], 'g-aldo': ['box-mr'], 'box-angii': ['box-suprarrenal'],
    'box-mr': ['box-sgk1', 'box-nedd', 'ch-enac'], 'box-sgk1': ['box-mr', 'box-nedd'], 'box-nedd': ['ch-enac'],
    'box-mito': ['ch-snat3', 'ch-nhe3', 'ch-nbc'], 'ch-nhe3': ['ch-nak-p'], 'ch-nak-p': ['ch-k-p'], 'ch-nbc': ['ch-nhe3'], 'box-ca-p': ['ch-nhe3', 'ch-nbc'],
    'ch-nkcc2': ['ch-nh4-salida', 'ch-nak-t'], 'ch-nh4-salida': ['ch-nkcc2']
  };

  let actual = null, gen = 0, celDeId = null, obs = null, obsCarga = null;
  const api = () => NI.atrAPI;

  function cuandoCargue(f) {
    return new Promise(r => {
      const ver = () => {
        if (!f.isConnected) return;   // la vista cambió: se abandona
        try { if (f.contentWindow && f.contentWindow.CELDA_LISTA) return r(); } catch (e) { /* aún no */ }
        setTimeout(ver, 80);
      };
      ver();
    });
  }
  function url(atr, cel, extra) {
    return `${CELDA}?v=23&atr=${atr}&celula=${cel}&lang=${NI.i18n.lang}${extra || ''}`;
  }

  // En qué célula está cada pieza, según su posición horizontal en la fila.
  // Se mide una sola vez, con la fila todavía a la vista (oculta no se puede medir).
  function medirCelulas() {
    if (celDeId) return;
    celDeId = {};
    const ATR = api().ATR, ids = new Set();
    for (const k in ATR) ATR[k].pasos.forEach(p => (p.resaltar || []).forEach(id => ids.add(id)));
    ids.forEach(id => {
      let c = null;
      if (RAAS.includes(id)) c = 'prin';
      else if (!/^(pila-|orina-)/.test(id)) {
        const n = $(id);
        if (n && n.getBBox) {
          const b = n.getBBox();
          const m = /translate\(\s*([-\d.]+)/.exec(n.getAttribute('transform') || '');
          const x = b.x + b.width / 2 + (m ? +m[1] : 0);
          c = x < 410 ? 'prox' : x < 800 ? 'asa' : x < 1190 ? 'prin' : 'alfa';
        }
      }
      celDeId[id] = c;
    });
  }
  // Célula donde ocurre un paso: la que tiene más piezas resaltadas en ese paso
  function celulaDelPaso(p) {
    const votos = {};
    let primero = null;
    (p.resaltar || []).forEach(id => { const c = celDeId[id]; if (c) { votos[c] = (votos[c] || 0) + 1; primero = primero || c; } });
    let mejor = primero;
    for (const c in votos) if (votos[c] > votos[mejor]) mejor = c;
    return mejor;   // null = paso de resultado (solo sangre y orina)
  }

  function aplicarHalo() {
    const on = $('cmp-resaltar').checked;
    document.querySelectorAll('#cmp-etapas iframe').forEach(f => {
      try { f.contentDocument.body.classList.toggle('cmp-on', on); } catch (e) { /* cargando */ }
    });
  }
  function resaltarEn(f, ids) {
    const d = f.contentDocument;
    d.querySelectorAll('.cmp-cambia').forEach(n => n.classList.remove('cmp-cambia'));
    d.querySelectorAll('.cmp-anillo').forEach(n => n.remove());
    const sueltas = [];
    ids.forEach(id => {
      const n = d.getElementById(id); if (!n) return;
      n.classList.add('cmp-cambia');
      // Sin anillo propio (pilas, rótulos, depósito): se le pone uno alrededor
      if (!n.querySelector('.np-halo') && n.ownerSVGElement) {
        const r = d.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('class', 'cmp-anillo'); r.setAttribute('rx', 10);
        n.ownerSVGElement.appendChild(r);
        sueltas.push([n, r]);
      }
    });
    f._anillos = sueltas;
    ajustarAnillos(f);
  }
  // Los anillos sueltos siguen a su pieza (una pila crece mientras se llena)
  function ajustarAnillos(f) {
    (f._anillos || []).forEach(([n, r]) => {
      let b = null;
      try { if (n.style.display !== 'none') b = n.getBBox(); } catch (e) { /* no se puede medir */ }
      const vb = n.ownerSVGElement.viewBox.baseVal;
      const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(n.getAttribute('transform') || '');
      const x = b ? b.x + (m ? +m[1] : 0) : 0, y = b ? b.y + (m ? +m[2] : 0) : 0;
      const cx = b ? x + b.width / 2 : 0;
      // sin anillo: lo que no se ve, lo que cae fuera del recorte y los caminos largos (p. ej. el de la aldosterona)
      if (!b || !b.width || !b.height || b.width > 180 || b.height > 130 || cx < vb.x || cx > vb.x + vb.width) { r.style.display = 'none'; return; }
      r.style.display = '';
      r.setAttribute('x', (x - 7).toFixed(1)); r.setAttribute('y', (y - 6).toFixed(1));
      r.setAttribute('width', (b.width + 14).toFixed(1)); r.setAttribute('height', (b.height + 12).toFixed(1));
    });
  }
  function marcarBotones(id) {
    document.querySelectorAll('.atr-btn').forEach(b => b.classList.toggle('activo', b.dataset.atr === id));
  }
  function ponerURL(atr) {
    try {
      const u = new URL(location.href);
      if (atr) u.searchParams.set('atr', atr); else u.searchParams.delete('atr');
      history.replaceState(null, '', u);
    } catch (e) { /* file:// u otro: sin enlace */ }
  }

  /* ---------- Tarjeta «¿por qué?» (la pide la célula al tocar un canal) ---------- */
  function cerrarTarjeta() { const c = $('cmp-tarjeta'); c.hidden = true; c.innerHTML = ''; }
  function porque(clave) {
    const info = NI.porque && NI.porque[clave]; if (!info) return;
    const c = $('cmp-tarjeta');
    c.innerHTML = `<button class="tarjeta-cerrar" aria-label="${t('cmp.cerrar')}">✕</button>` +
      `<div class="tarjeta-titulo">${info.titulo}</div><p class="tarjeta-texto">${info.texto}</p>` +
      `<div class="tarjeta-refs">${t('ac.refTarjeta')} ${info.refs.map(n => `<a href="#ref-${n}" title="${(NI.referencias[n - 1] || {}).cita || ''}">[${n}]</a>`).join(' ')}</div>`;
    c.hidden = false; c.scrollTop = 0;
    c.querySelector('.tarjeta-cerrar').addEventListener('click', cerrarTarjeta);
    // al ir a una referencia se abre la lista del pie
    c.querySelectorAll('.tarjeta-refs a').forEach(a => a.addEventListener('click', () => { const d = document.querySelector('details.refs'); if (d) d.open = true; }));
    if (NI.analitica) NI.analitica.evento('why_card_opened', { tarjeta: clave, vista: 'comparar' });
  }

  /* ---------- Abrir la vista con una enfermedad ---------- */
  function abrir(atr) {
    const ATR = api().ATR, a = ATR[atr];
    if (!a || atr === 'normal') return cerrar();
    medirCelulas();
    // la fila de arriba se queda en «normal» y en pausa mientras no se ve
    if (api().id() !== 'normal') api().elegir('normal');
    NI.pausa = true;
    actual = atr; const g = ++gen;
    document.body.classList.add('cmp-abierta');
    marcarBotones(atr);
    ponerURL(atr);
    cerrarTarjeta();
    if (obs) obs.disconnect();
    // Las células que no están a la vista se pausan (cada una lleva su propio motor)
    obs = 'IntersectionObserver' in global ? new IntersectionObserver(es => es.forEach(e => {
      try { e.target.contentWindow.NI.pausa = !e.isIntersecting; } catch (err) { /* cargando */ }
    }), { rootMargin: '150px' }) : null;

    // Carga por tandas: solo se arma lo que está a la vista o por entrar; lo demás, al bajar.
    // (Cada célula es una página entera: cargarlas todas de golpe congelaba la vista varios segundos.)
    if (obsCarga) obsCarga.disconnect();
    obsCarga = 'IntersectionObserver' in global ? new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      obsCarga.unobserve(e.target);
      const f = e.target._cargar; e.target._cargar = null;
      if (f) f();
    }), { rootMargin: '500px' }) : null;
    const alAcercarse = (nodo, f) => { if (obsCarga) { nodo._cargar = f; obsCarga.observe(nodo); } else f(); };

    $('cmp-nombre').textContent = a.nombre;
    $('cmp-causas').textContent = a.causas || '';
    // Etapas: pasos seguidos que ocurren en la misma célula, en el orden en que ocurren.
    // Un paso sin célula propia (solo sangre u orina) se queda en la célula del paso anterior;
    // solo los del final forman la etapa «Resultado».
    const cels = a.pasos.map(celulaDelPaso);
    let ultCel = -1; cels.forEach((c, i) => { if (c) ultCel = i; });
    for (let i = 0; i <= ultCel; i++) if (!cels[i]) cels[i] = i > 0 ? cels[i - 1] : cels.find(Boolean);
    const etapas = [];
    a.pasos.forEach((p, i) => {
      const ult = etapas[etapas.length - 1];
      if (ult && ult.cel === cels[i]) ult.pasos.push(i); else etapas.push({ cel: cels[i], pasos: [i] });
    });
    // Piezas involucradas en esta enfermedad: las demás se quitan del dibujo.
    // Cada pieza trae las que necesita para que se vea completo lo que produce y por dónde sale.
    const piezas = new Set(a.pasos.flatMap(p => p.resaltar || []));
    for (let n = 0; n < 3; n++) [...piezas].forEach(id => (APOYO[id] || []).forEach(x => piezas.add(x)));
    const ver = '&ver=' + encodeURIComponent([...piezas].join(','));
    const corto = t('cmp.corto.' + atr);
    const orden = k => NI.i18n.lang === 'en' ? String(k) : k + '.º';

    const cont = $('cmp-etapas'); cont.innerHTML = '';
    $('cmp-sondas').innerHTML = '';
    etapas.forEach((e, k) => {
      const sec = document.createElement('section');
      const lista = e.pasos.map(i => `<li data-i="${i}"><b><i>${i + 1}.</i>${a.pasos[i].titulo}</b><span>${a.pasos[i].texto}</span></li>`).join('');
      if (!e.cel) {
        // Resultado: sin célula; la explicación y el laboratorio normal frente a la enfermedad
        const franja = (s, o) => `<div class="lab-franja">
              <div class="lab-fila"><span class="lab-titulo">${t('ac.sangre')}</span><div class="lab-celdas" data-lab="${s}"></div></div>
              <div class="lab-fila"><span class="lab-titulo">${t('ac.orina')}</span><div class="lab-celdas" data-lab="${o}"></div></div></div>`;
        sec.className = 'card cmp-etapa cmp-final';
        sec.innerHTML = `<h2><span class="cmp-orden">${orden(k + 1)}</span>${t('cmp.resultado')}</h2>
          <div class="cmp-exp"><ol>${lista}</ol></div>
          <div class="cmp-labs">
            <div><span class="cmp-etq">${t('cmp.normal')}</span>${franja('sn', 'on')}</div>
            <div class="fx"><span class="cmp-etq">${corto}</span>${franja('sx', 'ox')}</div>
          </div>`;
        cont.appendChild(sec);
        sec.querySelectorAll('li').forEach(li => li.classList.add('activo'));
        const q = s => sec.querySelector(`[data-lab="${s}"]`);
        // laboratorio normal: el de la fila de arriba, que está en «normal»
        try { Object.assign(api().estado(), api().objetivo()); NI.np.render(api().estado()); } catch (err) { /* se copia lo que haya */ }
        q('sn').innerHTML = $('lab-sangre').innerHTML;
        q('on').innerHTML = $('lab-orina').innerHTML;
        // laboratorio de la enfermedad: una fila oculta llevada al último paso
        alAcercarse(sec, () => {
          if (g !== gen) return;
          const sx = document.createElement('iframe');
          sx.className = 'cmp-sonda'; sx.src = url(atr, 'prox'); sx.setAttribute('aria-hidden', 'true'); sx.tabIndex = -1;
          $('cmp-sondas').appendChild(sx);
          cuandoCargue(sx).then(() => {
            if (g !== gen) return;
            q('sx').innerHTML = sx.contentDocument.getElementById('lab-sangre').innerHTML;
            q('ox').innerHTML = sx.contentDocument.getElementById('lab-orina').innerHTML;
            sx.remove();
          });
        });
        return;
      }
      const ini = e.pasos[0], nom = t('cmp.cel.' + e.cel);
      sec.className = 'card cmp-etapa';
      sec.innerHTML = `<h2><span class="cmp-orden">${orden(k + 1)}</span>${nom}</h2>
        <div class="cmp-lado" data-cargando="${t('cmp.cargando')}"><span class="cmp-etq">${t('cmp.normal')}</span>
          <iframe title="${nom} · ${t('cmp.normal')}" data-src="${url('normal', e.cel, ver)}"></iframe></div>
        <div class="cmp-lado fx" data-cargando="${t('cmp.cargando')}"><span class="cmp-etq">${corto}</span>
          <iframe title="${nom} · ${corto}" data-src="${url(atr, e.cel, '&paso=' + ini + ver)}"></iframe></div>
        <div class="cmp-exp">${e.pasos.length > 1 ? `<p class="cmp-pista">${t('cmp.pista')}</p>` : ''}<ol>${lista}</ol></div>`;
      cont.appendChild(sec);
      const [fN, fX] = sec.querySelectorAll('iframe');
      sec.classList.add('cmp-espera');
      alAcercarse(sec, () => { if (g !== gen) return; fN.src = fN.dataset.src; fX.src = fX.dataset.src; });
      const lis = [...sec.querySelectorAll('li')];
      const irPaso = (i, mover) => {
        lis.forEach(li => {
          const n = +li.dataset.i;
          li.classList.toggle('activo', n === i);
          li.classList.toggle('toca', lis.length > 1 && n !== i);
          li.classList.toggle('sigue', lis.length > 1 && n === i + 1);
        });
        const ids = a.pasos[i].resaltar || [];
        resaltarEn(fN, ids); resaltarEn(fX, ids);
        if (mover) fX.contentWindow.NI.atrAPI.irA(i);
        fX.contentWindow.NI.np.resaltar([]);
        aplicarHalo();
      };
      Promise.all([cuandoCargue(fN), cuandoCargue(fX)]).then(() => {
        if (g !== gen) return;
        sec.classList.remove('cmp-espera');
        irPaso(ini, false);
        lis.forEach(li => li.addEventListener('click', () => {
          irPaso(+li.dataset.i, true);
          if (NI.analitica) NI.analitica.evento('atr_step_clicked', { opcion: atr, paso: +li.dataset.i + 1, vista: 'comparar' });
        }));
        if (obs) { obs.observe(fN); obs.observe(fX); }
      });
    });
    global.scrollTo(0, 0);
  }

  /* ---------- Volver a la fila normal ---------- */
  function cerrar() {
    if (!actual && !document.body.classList.contains('cmp-abierta')) return;
    actual = null; gen++;
    if (obs) { obs.disconnect(); obs = null; }
    if (obsCarga) { obsCarga.disconnect(); obsCarga = null; }
    $('cmp-etapas').innerHTML = ''; $('cmp-sondas').innerHTML = '';
    cerrarTarjeta();
    document.body.classList.remove('cmp-abierta');
    NI.pausa = false;
    ponerURL(null);
    global.scrollTo(0, 0);
  }

  function init() {
    if (!api()) { setTimeout(init, 60); return; }
    if (!$('cmp-vista')) return;
    $('cmp-resaltar').addEventListener('change', aplicarHalo);
    setInterval(() => { if (actual) document.querySelectorAll('#cmp-etapas iframe').forEach(f => { try { ajustarAnillos(f); } catch (e) { /* cargando */ } }); }, 500);
    // Al cambiar de idioma se vuelve a armar la vista (este oyente corre después del de acidosis-i18n.js)
    NI.i18n.alCambiar(() => { if (actual) abrir(actual); });
    let q = null;
    try { q = new URLSearchParams(location.search).get('atr'); } catch (e) { /* nada */ }
    if (q && q !== 'normal' && api().ATR[q]) abrir(q);
  }

  NI.comparar = { abrir, cerrar, porque, get actual() { return actual; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);

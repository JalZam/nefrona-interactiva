/* ============================================================
   Dibujo de las cuatro células al estilo de los esquemas clásicos de
   fisiología renal (Palmer / Comprehensive Clinical Nephrology):
   célula color arena en el centro, luz a la izquierda, intersticio a la
   derecha, transportadores como círculos (azul = pasivo, verde = activo/ATP),
   canales como rayitas en la membrana, flechas negras finas con el ion.
   Las flechas son a la vez los caminos de las partículas (id = g-...).
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';
  const AP = 200, BL = 760;   // x de la membrana apical y basolateral

  function el(tag, attrs, children) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (children || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }
  const txt = (x, y, t, cls, extra) => el('text', Object.assign({ x, y, class: cls }, extra || {}), [t]);

  function marco(svg, spec) {
    svg.appendChild(el('rect', { class: 'zona-luz', x: 0, y: 0, width: AP, height: 560 }));
    svg.appendChild(el('rect', { class: 'zona-inter', x: BL, y: 0, width: 960 - BL, height: 560 }));
    svg.appendChild(el('path', { class: 'celula-cuerpo', d: `M${AP} 80 H700 Q${BL} 80 ${BL} 140 V460 Q${BL} 520 700 520 H${AP} Z` }));
    svg.appendChild(txt(480, 42, spec.titulo, 'celula-titulo'));
    svg.appendChild(txt(spec.luzX || 100, spec.luzY || 68, 'Luz tubular', 'zona-titulo', spec.luzX ? { style: 'text-anchor:start' } : null));
    svg.appendChild(txt(860, 68, spec.tituloDerecha || 'Intersticio · sangre', 'zona-titulo'));
    svg.appendChild(txt(AP + 6, 98, 'apical', 'membrana-label'));
    svg.appendChild(txt(BL - 6, 98, 'basolateral', 'membrana-label', { 'text-anchor': 'end' }));
  }

  // círculo transportador sobre la membrana
  function circulo(svg, c) {
    const g = el('g', { class: `glifo bomba ${c.clase} ok ${c.estatico ? 'estatico' : ''}`, id: c.id, 'data-porque': c.porque, transform: `translate(${c.x},${c.y})` });
    const r = c.r || 30;
    g.appendChild(el('rect', { class: 'hit', x: -r - 12, y: -r - 12, width: 2 * r + 24, height: 2 * r + 44 }));
    g.appendChild(el('circle', { class: 'sub', r }));
    const lineas = Array.isArray(c.etiqueta) ? c.etiqueta : [c.etiqueta];
    lineas.forEach((l, i) => g.appendChild(txt(0, (i - (lineas.length - 1) / 2) * 12 + 4, l, 'glifo-txt')));
    if (c.clase === 'activo') g.appendChild(txt(0, r - 4, 'ATP', 'glifo-atp'));
    if (c.nombre) g.appendChild(txt(0, r + 16, c.nombre, 'glifo-nombre'));
    svg.appendChild(g);
  }
  // canal: dos rayitas que interrumpen la membrana
  function canal(svg, c) {
    const g = el('g', { class: `glifo canal ok ${c.estatico ? 'estatico' : ''}`, id: c.id, 'data-porque': c.porque, transform: `translate(${c.x},${c.y})` });
    g.appendChild(el('rect', { class: 'hit', x: -30, y: -26, width: 60, height: 52 }));
    g.appendChild(el('rect', { class: 'canal-hueco', x: -4, y: -9, width: 8, height: 18 }));
    g.appendChild(el('line', { class: 'sub', x1: -11, y1: -8, x2: 11, y2: -8 }));
    g.appendChild(el('line', { class: 'sub', x1: -11, y1: 8, x2: 11, y2: 8 }));
    g.appendChild(txt(0, 5, '✕', 'x'));
    const lado = c.lado === 'baso' ? 1 : -1;      // etiqueta hacia dentro de la célula
    g.appendChild(txt(-lado * 16, -14, c.nombre, 'glifo-nombre', { 'text-anchor': lado === 1 ? 'end' : 'start' }));
    svg.appendChild(g);
  }
  function caja(svg, c) {
    const g = el('g', { class: `caja ${c.clase || ''}`, id: c.id, 'data-porque': c.porque });
    g.appendChild(el('rect', { class: 'hit', x: c.x - 6, y: c.y - 6, width: c.w + 12, height: c.h + 12 }));
    g.appendChild(el('rect', { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8 }));
    const n = c.lineas.length;
    c.lineas.forEach((l, i) => {
      const t = txt(c.x + c.w / 2, c.y + c.h / 2 + (i - (n - 1) / 2) * 15 + 5, l.t || l, l.cls || (i === 0 ? '' : 'caja-sub'), l.id ? { id: l.id } : null);
      g.appendChild(t);
    });
    svg.appendChild(g);
  }
  function flecha(svg, f) {
    svg.appendChild(el('path', { id: f.id, class: `flecha ${f.clase || ''}`, d: f.d, 'marker-end': f.sinPunta ? null : 'url(#punta)' }));
  }
  function voltimetro(svg, ids) {
    const g = el('g', { class: 'voltimetro', 'data-porque': 'voltaje', transform: 'translate(-432,310) scale(0.5)' });
    g.innerHTML = `<rect class="hit" x="846" y="104" width="110" height="352"/><text class="volt-titulo" x="866" y="124" style="text-anchor:start">Voltaje luminal</text><rect class="volt-marco" x="884" y="136" width="32" height="270" rx="6"/><rect id="${ids[0]}" class="volt-barra" x="884" y="136" width="32" height="270" rx="6"/><text class="volt-tick" x="878" y="142">0</text><text class="volt-tick" x="878" y="274">−25</text><text class="volt-tick" x="878" y="406">−50 mV</text><text id="${ids[1]}" class="volt-val" x="900" y="440">−40 mV</text>`;
    svg.appendChild(g);
  }

  function construir(svg, spec) {
    svg.innerHTML = '<defs><marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/></marker><marker id="punta-inhib" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M5 1 L5 9" stroke="#dc2626" stroke-width="2.5"/></marker></defs>';
    marco(svg, spec);
    (spec.flechas || []).forEach(f => flecha(svg, f));
    (spec.textos || []).forEach(t => {
      const n = txt(t.x, t.y, '', t.cls || 'ion-txt', t.id ? { id: t.id } : null);
      n.innerHTML = t.t; svg.appendChild(n);
    });
    (spec.cajas || []).forEach(c => caja(svg, c));
    (spec.elipses || []).forEach(e => {
      const g = el('g', { class: 'nucleo', 'data-porque': e.porque });
      g.appendChild(el('ellipse', { cx: e.x, cy: e.y, rx: e.rx, ry: e.ry }));
      g.appendChild(txt(e.x, e.y - 4, e.t, ''));
      g.appendChild(txt(e.x, e.y + 14, e.sub, 'nucleo-sub'));
      svg.appendChild(g);
    });
    (spec.circulos || []).forEach(c => circulo(svg, c));
    (spec.canales || []).forEach(c => canal(svg, c));
    (spec.extras || []).forEach(h => { const g = el('g', {}); g.innerHTML = h; while (g.firstChild) svg.appendChild(g.firstChild); });
    if (spec.voltimetro) voltimetro(svg, spec.voltimetro);
  }

  // ───────────── Especificaciones ─────────────
  const V = {};

  V.principal = {
    titulo: 'Célula principal · túbulo colector cortical',
    flechas: [
      { id: 'g-na-ap', d: `M100 160 L300 160` },
      { id: 'g-na-bl', d: `M300 168 C500 168 640 172 ${BL - 30} 172 L900 172` },
      { id: 'g-k-in', d: `M900 200 L${BL} 200 C600 200 420 262 300 262` },
      { id: 'g-k-romk', d: `M300 262 L100 262` },
      { id: 'g-k-bk', d: `M300 268 C260 268 250 332 ${AP} 332 L100 332` },
      { id: 'g-k-kir', d: `M300 274 C520 274 700 318 ${BL} 318 L900 318` },
      { id: 'g-cl-para', d: `M100 540 L900 540` },
      { id: 'g-h2o', d: `M100 430 L300 430`, clase: 'tenue' },
      { id: 'g-aldo', d: `M900 416 L${BL} 416 L728 416`, clase: 'via' },
      { id: 'fl-mr-nuc', d: `M640 410 L612 362`, clase: 'via' },
      { id: 'fl-nuc-sgk', d: `M520 300 L500 262`, clase: 'via' },
      { id: 'fl-sgk-nedd', d: `M420 246 L380 232`, clase: 'via inhib' },
      { id: 'fl-nedd-enac', d: `M284 216 L224 176`, clase: 'via inhib' },
      { id: 'fl-nuc-romk', d: `M480 330 C400 330 300 300 232 270`, clase: 'via tenue' },
      { id: 'fl-nuc-nak', d: `M640 330 C700 330 730 250 748 200`, clase: 'via tenue' }
    ],
    textos: [
      { x: 20, y: 96, t: 'Na⁺ <tspan id="l-na">100</tspan> mEq/L', cls: 'valor' },
      { x: 20, y: 114, t: 'K⁺ <tspan id="l-k">48</tspan> mEq/L · pH <tspan id="l-ph">5,1</tspan>', cls: 'valor' },
      { x: 780, y: 96, t: 'K⁺ <tspan id="s-k">4,0</tspan> · HCO₃⁻ <tspan id="s-hco3">24</tspan> mEq/L', cls: 'valor' },
      { x: 780, y: 114, t: 'Aldosterona <tspan id="s-aldo">10</tspan> ng/dL', cls: 'valor' },
      { x: 104, y: 152, t: 'Na⁺', cls: 'ion-txt na' }, { x: 104, y: 254, t: 'K⁺', cls: 'ion-txt k' }, { x: 104, y: 324, t: 'K⁺', cls: 'ion-txt k' }, { x: 104, y: 422, t: 'H₂O', cls: 'ion-txt agua' },
      { x: 800, y: 164, t: '3 Na⁺', cls: 'ion-txt na' }, { x: 800, y: 214, t: '2 K⁺', cls: 'ion-txt k' }, { x: 800, y: 310, t: 'K⁺ de vuelta', cls: 'ion-txt k' },
      { x: 480, y: 512, t: 'Cl⁻ sigue al Na⁺ por la vía paracelular (unión estrecha), empujado por el voltaje ↓', cls: 'ion-txt cl', id: 'txt-para' },
      { x: 786, y: 408, t: 'aldosterona', cls: 'via-label' }, { x: 786, y: 440, t: '11β-HSD2 inactiva al cortisol', cls: 'via-nota' },
      { x: 286, y: 268, t: 'retira ENaC (inhibida)', cls: 'via-label', id: 'nedd-estado' },
      { x: 470, y: 486, t: '↑ ROMK y ↑ Na⁺/K⁺-ATPasa (horas–días)', cls: 'via-nota' }
    ],
    cajas: [
      { id: 'box-nedd', x: 284, y: 216, w: 96, h: 32, lineas: ['Nedd4-2'], porque: 'nedd' },
      { id: 'box-sgk1', x: 420, y: 230, w: 80, h: 32, lineas: ['SGK1'], porque: 'sgk1' },
      { id: 'box-mr', x: 640, y: 400, w: 84, h: 32, lineas: ['MR'], porque: 'mr' }
    ],
    elipses: [{ x: 560, y: 330, rx: 80, ry: 44, t: 'Núcleo', sub: 'transcripción · días', porque: 'nucleo' }],
    circulos: [{ id: 'ch-nak', x: BL, y: 185, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak' }],
    canales: [
      { id: 'ch-enac', x: AP, y: 160, nombre: 'ENaC', porque: 'enac' },
      { id: 'ch-romk', x: AP, y: 262, nombre: 'ROMK', porque: 'romk' },
      { id: 'ch-bk', x: AP, y: 332, nombre: 'BK', porque: 'bk' },
      { id: 'ch-aqp2', x: AP, y: 430, nombre: 'AQP2', porque: 'aqp2', estatico: true },
      { id: 'ch-kir', x: BL, y: 318, nombre: 'Kir4.1/5.1', porque: 'kir41', lado: 'baso', estatico: true }
    ],
    extras: ['<g class="union" data-porque="paracelular"><rect class="hit" x="200" y="524" width="560" height="30"/><line x1="200" y1="528" x2="760" y2="528"/><line x1="200" y1="552" x2="760" y2="552"/></g>'],
    voltimetro: ['volt-barra', 'volt-val']
  };

  V.alfa = {
    titulo: 'Célula intercalada α · túbulo colector (cortical y medular)',
    tituloDerecha: 'Intersticio medular · sangre',
    flechas: [
      { id: 'g-co2', d: `M900 130 L${BL} 130 C700 130 640 178 584 178` },
      { id: 'g-h-ap', d: `M440 126 C360 126 300 170 232 170 L80 170` },
      { id: 'g-h-fade', d: `M80 176 L80 236`, clase: 'tenue', sinPunta: true },
      { id: 'g-hco3-bl', d: `M580 194 C680 194 700 230 ${BL} 230 L900 230` },
      { id: 'g-cl-ae1', d: `M900 252 L${BL} 252 C690 252 690 320 ${BL} 320 L900 320` },
      { id: 'g-nh3', d: `M900 400 L${BL} 400 C600 400 400 410 232 410 L80 410` },
      { id: 'g-nh4-orina', d: `M80 418 L80 545` },
      { id: 'g-nh3-escapa', d: `M80 402 L80 300`, clase: 'tenue', sinPunta: true },
      { id: 'g-k-hk', d: `M80 312 L230 312 C400 312 600 450 ${BL} 450 L900 450` },
      { id: 'g-h-hk', d: `M232 292 L80 292` }
    ],
    textos: [
      { x: 20, y: 96, t: 'pH <tspan id="a-ph">5,1</tspan> · NH₄⁺ <tspan id="a-nh4">40</tspan> mEq/día', cls: 'valor' },
      { x: 20, y: 114, t: 'NH₃ que llega: <tspan id="a-nh3">100</tspan> %', cls: 'valor' },
      { x: 780, y: 96, t: 'HCO₃⁻ <tspan id="a-hco3">24</tspan> · K⁺ <tspan id="a-k">4,0</tspan>', cls: 'valor' },
      { x: 780, y: 114, t: 'NH₃ medular <tspan id="a-pool">100</tspan> %', cls: 'valor' },
      { x: 96, y: 162, t: 'H⁺', cls: 'ion-txt h' }, { x: 96, y: 284, t: 'H⁺', cls: 'ion-txt h' }, { x: 96, y: 326, t: 'K⁺', cls: 'ion-txt k' },
      { x: 96, y: 446, t: 'NH₃ + H⁺ → NH₄⁺', cls: 'ion-txt nh4' }, { x: 96, y: 462, t: 'queda atrapado y', cls: 'ion-txt nh4' }, { x: 96, y: 478, t: 'sale en la orina ↓', cls: 'ion-txt nh4' },
      { x: 800, y: 122, t: 'CO₂', cls: 'ion-txt co2' }, { x: 800, y: 222, t: 'HCO₃⁻ nuevo', cls: 'ion-txt hco3' }, { x: 800, y: 264, t: 'Cl⁻', cls: 'ion-txt cl' }, { x: 800, y: 312, t: 'Cl⁻', cls: 'ion-txt cl' }, { x: 800, y: 392, t: 'NH₃', cls: 'ion-txt nh3' }, { x: 800, y: 442, t: 'K⁺', cls: 'ion-txt k' },
      { x: 440, y: 112, t: 'H₂O → H⁺ + OH⁻', cls: 'reaccion' },
      { x: 300, y: 300, t: 'El H⁺ sale por la H⁺-ATPasa, ayudado por el voltaje luminal negativo', cls: 'via-nota' },
      { x: 300, y: 316, t: 'El HCO₃⁻ nuevo sale a la sangre por AE1 a cambio de Cl⁻', cls: 'via-nota' }
    ],
    cajas: [{ id: 'box-ca', x: 380, y: 150, w: 200, h: 56, lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'], clase: 'ca', porque: 'ca2' }],
    circulos: [
      { id: 'ch-hatp', x: AP, y: 170, clase: 'activo', etiqueta: ['vH⁺-', 'ATPasa'], porque: 'hatpasa' },
      { id: 'ch-hk', x: AP, y: 302, clase: 'activo', etiqueta: ['H⁺/K⁺', 'ATPasa'], porque: 'hkatpasa', estatico: true },
      { id: 'ch-ae1', x: BL, y: 230, clase: 'pasivo', etiqueta: ['AE1'], porque: 'ae1' }
    ],
    canales: [
      { id: 'ch-rhcg-ap', x: AP, y: 410, nombre: 'Rhcg', porque: 'rhcg' },
      { id: 'ch-clc', x: BL, y: 320, nombre: 'ClC', porque: 'clc', lado: 'baso', estatico: true },
      { id: 'ch-rhcg-bl', x: BL, y: 400, nombre: 'Rhbg / Rhcg', porque: 'rhcg', lado: 'baso' },
      { id: 'ch-k-bl', x: BL, y: 450, nombre: 'K⁺', porque: 'kir41', lado: 'baso', estatico: true }
    ],
    voltimetro: ['volt-barra-a', 'volt-val-a']
  };

  V.proximal = {
    titulo: 'Célula del túbulo proximal · amoniogénesis',
    tituloDerecha: 'Capilar peritubular · sangre',
    flechas: [
      { id: 'g-gln', d: `M900 400 L${BL} 400 C700 400 690 420 662 420` },
      { id: 'g-nh4-ap', d: `M330 400 C280 400 262 166 232 166 L60 166` },
      { id: 'g-nh4-lumen', d: `M60 172 L60 545` },
      { id: 'g-na-nhe3', d: `M60 140 L232 140 C300 140 330 150 360 150` },
      { id: 'g-na-nak', d: `M360 150 C600 150 700 160 ${BL} 160 L900 160` },
      { id: 'g-hco3-nbc', d: `M662 462 C720 462 736 300 ${BL} 300 L900 300` },
      { id: 'g-k-prox', d: `M900 455 L${BL} 455 C700 455 650 440 600 440`, clase: 'tenue' }
    ],
    textos: [
      { x: 20, y: 96, t: 'NH₄⁺ producido: <tspan id="p-prod">50</tspan> mEq/día', cls: 'valor' },
      { x: 20, y: 114, t: '(<tspan id="p-pct">100</tspan> % de lo normal)', cls: 'valor' },
      { x: 780, y: 96, t: 'K⁺ <tspan id="p-k">4,0</tspan> · HCO₃⁻ <tspan id="p-hco3">24</tspan>', cls: 'valor' },
      { x: 780, y: 114, t: 'glutamina ⇢ 2 NH₄⁺ + 2 HCO₃⁻', cls: 'valor' },
      { x: 104, y: 132, t: 'Na⁺', cls: 'ion-txt na' }, { x: 76, y: 190, t: 'NH₄⁺ sale en el', cls: 'ion-txt nh4' }, { x: 76, y: 204, t: 'sitio del H⁺ ↓', cls: 'ion-txt nh4' },
      { x: 800, y: 152, t: '3 Na⁺', cls: 'ion-txt na' }, { x: 800, y: 292, t: 'HCO₃⁻ nuevo', cls: 'ion-txt hco3' }, { x: 800, y: 392, t: 'glutamina', cls: 'ion-txt gln' }, { x: 800, y: 447, t: 'K⁺', cls: 'ion-txt k' },
      { x: 76, y: 470, t: 'CA-IV (luz):', cls: 'via-nota' }, { x: 76, y: 484, t: 'HCO₃⁻ + H⁺ → CO₂ + H₂O', cls: 'via-nota' },
      { x: 330, y: 505, t: 'K⁺ alto entra, alcaliniza la célula y frena la glutaminasa', cls: 'via-label alerta oculta', id: 'p-nota-k' }
    ],
    cajas: [
      { id: 'box-mito', x: 330, y: 360, w: 332, h: 120, clase: 'mito', porque: 'glutaminasa', lineas: ['Glutamina → glutaminasa (PDG) → GDH', '→ α-cetoglutarato → PEPCK → glucosa', '= 2 NH₄⁺ + 2 HCO₃⁻ por glutamina', { t: 'actividad 100 %', cls: 'caja-estado', id: 'mito-estado' }] },
      { id: 'box-ca4', x: 420, y: 200, w: 200, h: 44, clase: 'ca', porque: 'ca2', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'CA-II · reabsorbe el HCO₃⁻ filtrado'] }
    ],
    circulos: [
      { id: 'ch-nhe3', x: AP, y: 160, clase: 'pasivo', etiqueta: ['NHE3'], porque: 'nhe3' },
      { id: 'ch-hatp-p', x: AP, y: 290, clase: 'activo', etiqueta: ['H⁺-', 'ATPasa'], porque: 'hatpasa', estatico: true, r: 26 },
      { id: 'ch-nak-p', x: BL, y: 170, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true },
      { id: 'ch-nbc', x: BL, y: 300, clase: 'pasivo', etiqueta: ['NBCe1'], porque: 'nbce1' }
    ],
    canales: [
      { id: 'ch-snat3', x: BL, y: 400, nombre: 'SNAT3', porque: 'snat3', lado: 'baso' },
      { id: 'ch-k-p', x: BL, y: 455, nombre: 'K⁺', porque: 'glutaminasa', lado: 'baso', estatico: true }
    ]
  };

  V.asa = {
    titulo: 'Célula del asa gruesa ascendente · reciclaje de NH₄⁺',
    luzX: 20, luzY: 330,
    tituloDerecha: 'Intersticio medular',
    flechas: [
      { id: 'g-nh4-llega', d: `M100 22 L100 160 L${AP - 34} 160` },
      { id: 'g-nh4-cell', d: `M${AP + 32} 160 C420 160 600 400 ${BL} 400 L870 452` },
      { id: 'g-nh4-sigue', d: `M100 166 L100 545`, clase: 'tenue' },
      { id: 'g-k-llega', d: `M146 22 L146 176 L${AP - 34} 176` },
      { id: 'g-k-cell', d: `M${AP + 32} 176 L300 200` },
      { id: 'g-k-recicla', d: `M300 206 C300 270 270 270 ${AP} 270 L100 270` },
      { id: 'g-na-asa', d: `M100 146 L${AP - 34} 146 M${AP + 32} 146 C600 146 700 160 ${BL} 160 L900 160`, sinPunta: true },
      { id: 'g-cl-asa', d: `M100 190 L${AP - 34} 190 M${AP + 32} 190 C600 190 700 290 ${BL} 290 L900 290`, sinPunta: true }
    ],
    textos: [
      { x: 20, y: 500, t: 'NH₄⁺ que llega: <tspan id="t-llega">50</tspan> mEq/día', cls: 'valor' },
      { x: 20, y: 518, t: 'reabsorbido en NKCC2: <tspan id="t-pct">75</tspan> %', cls: 'valor' },
      { x: 780, y: 96, t: 'NH₃ medular <tspan id="t-pool">100</tspan> %', cls: 'valor' },
      { x: 780, y: 114, t: 'K⁺ plasma <tspan id="t-k">4,0</tspan> mEq/L', cls: 'valor' },
      { x: 60, y: 40, t: 'NH₄⁺', cls: 'ion-txt nh4' }, { x: 152, y: 40, t: 'K⁺', cls: 'ion-txt k' },
      { x: 104, y: 262, t: 'K⁺ reciclado', cls: 'ion-txt k' },
      { x: 800, y: 152, t: 'Na⁺', cls: 'ion-txt na' }, { x: 800, y: 282, t: 'Cl⁻', cls: 'ion-txt cl' }, { x: 800, y: 392, t: 'NH₄⁺', cls: 'ion-txt nh4' },
      { x: 300, y: 118, t: 'El NH₄⁺ ocupa el sitio del K⁺ en NKCC2', cls: 'reaccion' },
      { x: 300, y: 330, t: 'K⁺ luminal alto compite con el NH₄⁺ por NKCC2', cls: 'via-label alerta oculta', id: 't-nota-k' },
      { x: 300, y: 350, t: 'Lo que no se reabsorbe sigue por la luz sin construir el gradiente medular', cls: 'via-nota' },
      { x: 865, y: 500, t: 'NH₃ / NH₄⁺', cls: 'deposito-txt' }, { x: 865, y: 516, t: 'depósito medular', cls: 'deposito-sub' }
    ],
    circulos: [
      { id: 'ch-nkcc2', x: AP, y: 165, clase: 'pasivo', etiqueta: ['NKCC2'], porque: 'nkcc2', r: 32 },
      { id: 'ch-nak-t', x: BL, y: 160, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true },
      { id: 'ch-nh4-salida', x: BL, y: 400, clase: 'pasivo', etiqueta: ['NHE4', 'KCC4'], porque: 'nh4_salida' }
    ],
    canales: [
      { id: 'ch-romk-t', x: AP, y: 270, nombre: 'ROMK', porque: 'romk_tal' },
      { id: 'ch-clckb', x: BL, y: 290, nombre: 'ClC-Kb', porque: 'clc', lado: 'baso', estatico: true }
    ],
    extras: ['<rect id="t-deposito" class="deposito" x="790" y="440" width="150" height="90" rx="10"/>']
  };

  NI.celulas = {
    construirTodas() {
      for (const k in V) { const svg = document.getElementById('svg-' + k); if (svg) construir(svg, V[k]); }
    },
    especificaciones: V
  };
  NI.celulas.construirTodas();
})(window);

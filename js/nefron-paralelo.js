/* ============================================================
   Nefrón en paralelo: las 4 células en fila, conectadas por la luz
   tubular (arriba, fluye de izquierda a derecha hacia la orina) y por la
   sangre / intersticio (abajo). Mismo estilo de los esquemas clásicos:
   célula arena, círculos azul (pasivo) / verde (activo), canales como
   rayitas, flechas negras con el ion. Las flechas son los caminos de las
   partículas. Expone NI.np = { construir, render, escena }.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';
  const AP = 130, BL = 560;                       // y de las membranas apical y basolateral
  const CEL = { prox: [40, 390], asa: [430, 780], prin: [820, 1170], alfa: [1210, 1560] };

  function el(tag, attrs, children) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (children || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }
  const txt = (x, y, t, cls, extra) => { const n = el('text', Object.assign({ x, y, class: cls }, extra || {})); n.innerHTML = t; return n; };

  function celula(svg, x0, x1, titulo) {
    svg.appendChild(el('path', { class: 'np-celula', d: `M${x0} ${AP} H${x1} V${BL - 60} Q${x1} ${BL} ${x1 - 60} ${BL} H${x0 + 60} Q${x0} ${BL} ${x0} ${BL - 60} Z` }));
    svg.appendChild(txt((x0 + x1) / 2, AP + 62, titulo, 'np-celula-titulo'));
  }
  function circulo(svg, c) {
    const g = el('g', { class: `glifo bomba ${c.clase} ok ${c.estatico ? 'estatico' : ''}`, id: c.id, 'data-porque': c.porque, transform: `translate(${c.x},${c.y})` });
    const r = c.r || 34;
    g.appendChild(el('rect', { class: 'hit', x: -r - 10, y: -r - 10, width: 2 * r + 20, height: 2 * r + 20 }));
    g.appendChild(el('circle', { class: 'np-halo', r: r + 10 }));
    g.appendChild(el('circle', { class: 'sub', r }));
    const lineas = Array.isArray(c.etiqueta) ? c.etiqueta : [c.etiqueta];
    lineas.forEach((l, i) => g.appendChild(txt(0, (i - (lineas.length - 1) / 2) * 15 + 5, l, 'glifo-txt')));
    if (c.clase === 'activo') g.appendChild(txt(0, r - 6, 'ATP', 'glifo-atp'));
    const ly = c.y === AP ? r + 22 : -r - 12;        // nombre hacia dentro de la célula
    if (c.nombre) g.appendChild(txt(0, ly, c.nombre, 'glifo-nombre'));
    svg.appendChild(g);
  }
  function canal(svg, c) {
    const g = el('g', { class: `glifo canal ok ${c.estatico ? 'estatico' : ''}`, id: c.id, 'data-porque': c.porque, transform: `translate(${c.x},${c.y})` });
    g.appendChild(el('rect', { class: 'hit', x: -30, y: -30, width: 60, height: 60 }));
    g.appendChild(el('circle', { class: 'np-halo', r: 26 }));
    g.appendChild(el('rect', { class: 'canal-hueco', x: -10, y: -5, width: 20, height: 10 }));
    g.appendChild(el('line', { class: 'sub', x1: -9, y1: -13, x2: -9, y2: 13 }));
    g.appendChild(el('line', { class: 'sub', x1: 9, y1: -13, x2: 9, y2: 13 }));
    g.appendChild(txt(0, 6, '✕', 'x'));
    const ly = c.y === AP ? 36 : -24;
    g.appendChild(txt(0, ly, c.nombre, 'glifo-nombre'));
    svg.appendChild(g);
  }
  function caja(svg, c) {
    const g = el('g', { class: `caja ${c.clase || ''}`, id: c.id, 'data-porque': c.porque });
    g.appendChild(el('rect', { class: 'hit', x: c.x - 6, y: c.y - 6, width: c.w + 12, height: c.h + 12 }));
    g.appendChild(el('rect', { class: 'np-halo', x: c.x - 5, y: c.y - 5, width: c.w + 10, height: c.h + 10, rx: 12 }));
    g.appendChild(el('rect', { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8 }));
    const n = c.lineas.length;
    c.lineas.forEach((l, i) => g.appendChild(txt(c.x + c.w / 2, c.y + c.h / 2 + (i - (n - 1) / 2) * 17 + 6, l.t || l, l.cls || (i === 0 ? '' : 'caja-sub'), l.id ? { id: l.id } : null)));
    svg.appendChild(g);
  }
  function flecha(svg, id, d, cls, sinPunta) {
    svg.appendChild(el('path', { id, class: `np-flecha ${cls || ''}`, d, 'marker-end': sinPunta ? null : 'url(#np-punta)' }));
  }
  function pila(svg, id, cx, cy, etiquetaId, etiqueta) {
    svg.appendChild(el('g', { id, class: 'np-pila', transform: `translate(${cx},${cy})` }));
    svg.appendChild(txt(cx, cy + (cx > 1500 && cy < 200 ? -30 : 46), etiqueta, 'np-pila-txt', { id: etiquetaId, style: cx > 1500 ? 'text-anchor:end' : 'text-anchor:middle' }));
  }

  function construir(svg) {
    svg.innerHTML = '<defs><marker id="np-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/></marker><marker id="np-inhib" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M5 1 L5 9" stroke="#dc2626" stroke-width="2.5"/></marker></defs>';
    svg.appendChild(el('rect', { class: 'np-luz', x: 0, y: 0, width: 1600, height: 120 }));
    svg.appendChild(el('rect', { class: 'np-sangre', x: 0, y: 580, width: 1600, height: 140 }));
    svg.appendChild(txt(16, 24, 'LUZ TUBULAR → hacia la orina', 'np-banda-titulo'));
    svg.appendChild(txt(16, 606, 'SANGRE · INTERSTICIO', 'np-banda-titulo sangre'));
    svg.appendChild(txt(1548, 24, 'ORINA', 'np-banda-titulo', { 'text-anchor': 'end' }));
    // uniones estrechas entre células
    [[390, 430], [780, 820], [1170, 1210]].forEach(([a, b]) => {
      svg.appendChild(el('line', { class: 'np-union', x1: (a + b) / 2, y1: AP, x2: (a + b) / 2, y2: BL }));
    });
    celula(svg, ...CEL.prox, 'Túbulo proximal');
    celula(svg, ...CEL.asa, 'Asa gruesa ascendente');
    celula(svg, ...CEL.prin, 'Célula principal (colector)');
    celula(svg, ...CEL.alfa, 'Célula intercalada α (colector)');

    // ── caminos (flechas = guías de partículas) ──
    // luz: Na⁺ baja por la luz y entra a cada célula según su canal
    flecha(svg, 'g-na0', 'M0 68 L120 68', '', true);
    flecha(svg, 'g-na-nhe3', 'M120 68 L120 240', '');
    flecha(svg, 'g-na1', 'M120 68 L520 68', '', true);
    flecha(svg, 'g-na-nkcc', `M520 68 L520 ${AP + 30} C520 300 520 420 520 ${BL} L520 612`, '');
    flecha(svg, 'g-na2', 'M520 68 L870 68', '', true);
    flecha(svg, 'g-na-enac', `M870 68 L870 ${AP + 30} C870 320 900 420 900 ${BL} L900 612`, '');
    flecha(svg, 'g-na3', 'M870 68 L1548 68', '');
    // K⁺ en la célula principal: entra por la bomba, sale por ROMK o vuelve por Kir4.1
    flecha(svg, 'g-k-in', `M930 612 L930 ${BL} C930 430 990 300 990 200`, '');
    flecha(svg, 'g-k-romk', `M990 200 L990 ${AP} L990 94`, '');
    flecha(svg, 'g-k-luz', 'M990 94 L1548 94', '');
    flecha(svg, 'g-k-kir', `M990 200 C990 360 1080 440 1080 ${BL} L1080 612`, '');
    // K⁺ filtrado llega al asa: entra por NKCC2 y ROMK lo recicla
    flecha(svg, 'g-k-luz0', 'M0 94 L520 94', '', true);
    flecha(svg, 'g-k-nkcc', `M520 94 L520 ${AP + 30} L560 200`, '', true);
    flecha(svg, 'g-k-recicla', `M560 200 C560 260 620 260 620 ${AP} L620 94`, '');
    flecha(svg, 'g-k-luz1', 'M620 94 L990 94', '', true);
    // amonio: glutamina → mitocondria → NH₄⁺ a la luz (NHE3), HCO₃⁻ a la sangre (NBCe1)
    flecha(svg, 'g-gln', `M300 612 L300 ${BL} L300 440`, '');
    flecha(svg, 'g-nh4-ap', `M160 380 C120 380 108 250 120 ${AP + 30} L120 42`, '');
    flecha(svg, 'g-nh4-luz0', 'M120 42 L520 42', '', true);
    flecha(svg, 'g-nh4-tal', `M520 42 L520 ${AP + 30} C520 300 700 400 700 ${BL} L700 612`, '');
    flecha(svg, 'g-nh4-dep', 'M700 640 L700 664 L1236 664', '');
    flecha(svg, 'g-nh4-sigue', 'M520 42 L1548 42', 'tenue');
    flecha(svg, 'g-hco3-p', `M150 420 C120 420 120 500 120 ${BL} L120 612`, '');
    flecha(svg, 'g-k-prox', `M350 612 L350 ${BL} L350 440`, 'tenue');
    // célula α
    flecha(svg, 'g-co2', `M1270 612 L1270 ${BL} L1270 352`, '');
    flecha(svg, 'g-h-ap', `M1262 296 C1270 240 1270 200 1270 ${AP + 30} L1270 86`, '');
    flecha(svg, 'g-h-luz', 'M1270 82 L1420 82', 'tenue', true);
    flecha(svg, 'g-hco3-a', `M1300 352 L1300 ${BL} L1300 612`, '');
    flecha(svg, 'g-cl-a', `M1340 612 L1340 ${BL} L1340 420`, '');
    flecha(svg, 'g-nh3', `M1480 612 L1480 ${BL} L1480 ${AP + 30} L1480 50`, '');
    flecha(svg, 'g-nh4-orina', 'M1480 42 L1548 42', '');
    flecha(svg, 'g-nh3-escapa', 'M1480 42 L1420 42', 'tenue', true);
    // RAAS en la banda de sangre
    flecha(svg, 'g-renina', 'M212 700 L288 700', 'via');
    flecha(svg, 'g-angii', 'M442 700 L838 700', 'via');
    flecha(svg, 'g-aldo', `M985 682 L985 600 C985 560 1040 530 1060 492`, 'via');
    // vía dentro de la célula principal
    flecha(svg, 'fl-mr-nuc', 'M1060 470 L1030 420', 'via');
    flecha(svg, 'fl-nuc-sgk', 'M960 338 L950 318', 'via');
    flecha(svg, 'fl-sgk-nedd', 'M905 292 L905 262', 'via inhib');
    flecha(svg, 'fl-nedd-enac', 'M880 220 L872 172', 'via inhib');
    document.getElementById('fl-sgk-nedd').setAttribute('marker-end', 'url(#np-inhib)');
    document.getElementById('fl-nedd-enac').setAttribute('marker-end', 'url(#np-inhib)');

    // ── rótulos de iones ──
    const iones = [
      [14, 60, 'Na⁺', 'na'], [14, 110, 'K⁺', 'k'], [130, 36, 'NH₄⁺', 'nh4'], [1000, 110, 'K⁺', 'k'], [1282, 76, 'H⁺', 'h'], [1486, 36, 'NH₄⁺', 'nh4'],
      [132, 240, 'Na⁺', 'na'], [600, 236, 'Na⁺ · K⁺/NH₄⁺ · 2Cl⁻', 'nh4'], [1000, 216, 'K⁺', 'k'],
      [128, 632, 'HCO₃⁻ nuevo', 'hco3'], [222, 632, 'glutamina', 'gln'], [360, 632, 'K⁺', 'k'], [540, 632, 'Na⁺', 'na'], [708, 632, 'NH₄⁺', 'nh4'],
      [908, 632, '3 Na⁺', 'na'], [938, 632, '2 K⁺', 'k'], [1086, 632, 'K⁺ de vuelta', 'k'], [1278, 632, 'CO₂', 'co2'], [1306, 632, 'HCO₃⁻', 'hco3'], [1346, 632, 'Cl⁻', 'cl'], [1488, 632, 'NH₃', 'nh4']
    ];
    iones.forEach(([x, y, t, c]) => svg.appendChild(txt(x, y, t, 'np-ion ' + c)));
    svg.appendChild(txt(1255, 282, 'H₂O → H⁺ + OH⁻', 'np-reaccion'));
    svg.appendChild(txt(630, 300, 'El NH₄⁺ ocupa el sitio del K⁺', 'np-nota'));
    svg.appendChild(txt(630, 320, 'y pasa al intersticio', 'np-nota'));
    svg.appendChild(txt(846, 278, 'retira ENaC', 'np-nota', { id: 'nedd-estado' }));

    // ── cajas ──
    caja(svg, { id: 'box-mito', x: 150, y: 330, w: 220, h: 110, clase: 'mito', porque: 'glutaminasa', lineas: ['Glutamina → PDG → GDH', '→ α-KG → PEPCK', '= 2 NH₄⁺ + 2 HCO₃⁻', { t: 'glutaminasa 100 %', cls: 'caja-estado', id: 'mito-estado' }] });
    caja(svg, { id: 'box-ca', x: 1240, y: 300, w: 240, h: 52, clase: 'ca', porque: 'ca2', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-nedd', x: 840, y: 222, w: 110, h: 34, lineas: ['Nedd4-2'], porque: 'nedd' });
    caja(svg, { id: 'box-sgk1', x: 862, y: 292, w: 86, h: 34, lineas: ['SGK1'], porque: 'sgk1' });
    caja(svg, { id: 'box-mr', x: 1030, y: 470, w: 100, h: 36, lineas: ['MR'], porque: 'mr' });
    caja(svg, { id: 'box-renina', x: 60, y: 681, w: 152, h: 36, clase: 'raas', porque: 'renina', lineas: ['Riñón · renina'] });
    caja(svg, { id: 'box-angii', x: 290, y: 681, w: 152, h: 36, clase: 'raas', porque: 'angii', lineas: ['Angiotensina II'] });
    caja(svg, { id: 'box-suprarrenal', x: 840, y: 681, w: 200, h: 36, clase: 'raas', porque: 'suprarrenal', lineas: ['Suprarrenal → aldosterona'] });
    const nuc = el('g', { class: 'nucleo', 'data-porque': 'nucleo' });
    nuc.appendChild(el('ellipse', { cx: 1000, cy: 380, rx: 76, ry: 42 }));
    nuc.appendChild(txt(1000, 376, 'Núcleo', ''));
    nuc.appendChild(txt(1000, 394, 'transcripción · días', 'nucleo-sub'));
    svg.appendChild(nuc);

    // ── transportadores ──
    circulo(svg, { id: 'ch-nhe3', x: 120, y: AP, clase: 'pasivo', etiqueta: ['NHE3'], porque: 'nhe3', r: 32 });
    circulo(svg, { id: 'ch-nbc', x: 120, y: BL, clase: 'pasivo', etiqueta: ['NBCe1'], porque: 'nbce1', r: 32 });
    canal(svg, { id: 'ch-snat3', x: 300, y: BL, nombre: 'SNAT3', porque: 'snat3' });
    canal(svg, { id: 'ch-k-p', x: 350, y: BL, nombre: '', porque: 'glutaminasa', estatico: true });
    circulo(svg, { id: 'ch-nkcc2', x: 520, y: AP, clase: 'pasivo', etiqueta: ['NKCC2'], porque: 'nkcc2', r: 36 });
    canal(svg, { id: 'ch-romk-t', x: 620, y: AP, nombre: 'ROMK', porque: 'romk_tal' });
    circulo(svg, { id: 'ch-nak-t', x: 520, y: BL, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true, r: 32 });
    circulo(svg, { id: 'ch-nh4-salida', x: 700, y: BL, clase: 'pasivo', etiqueta: ['NHE4', 'KCC4'], porque: 'nh4_salida', r: 30 });
    canal(svg, { id: 'ch-enac', x: 870, y: AP, nombre: 'ENaC', porque: 'enac' });
    canal(svg, { id: 'ch-romk', x: 990, y: AP, nombre: 'ROMK', porque: 'romk' });
    circulo(svg, { id: 'ch-nak', x: 915, y: BL, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', r: 34 });
    canal(svg, { id: 'ch-kir', x: 1080, y: BL, nombre: 'Kir4.1', porque: 'kir41', estatico: true });
    circulo(svg, { id: 'ch-hatp', x: 1270, y: AP, clase: 'activo', etiqueta: ['vH⁺-', 'ATPasa'], porque: 'hatpasa', r: 34 });
    canal(svg, { id: 'ch-rhcg-ap', x: 1480, y: AP, nombre: 'Rhcg', porque: 'rhcg' });
    circulo(svg, { id: 'ch-ae1', x: 1318, y: BL, clase: 'pasivo', etiqueta: ['AE1'], porque: 'ae1', r: 32 });
    canal(svg, { id: 'ch-rhcg-bl', x: 1480, y: BL, nombre: 'Rhbg/Rhcg', porque: 'rhcg' });

    // ── carga luminal, pilas y depósito ──
    svg.appendChild(txt(1000, 20, '− − − − −', 'np-carga', { id: 'np-carga', 'text-anchor': 'middle' }));
    svg.appendChild(txt(1000, 118, 'luz negativa −40 mV', 'np-carga-txt', { id: 'np-carga-txt', 'text-anchor': 'middle' }));
    pila(svg, 'pila-k', 1130, 652, 'pila-k-txt', 'K⁺ en sangre 4,0');
    pila(svg, 'pila-na', 1578, 70, 'pila-na-txt', 'Na⁺');
    svg.appendChild(el('rect', { id: 'np-deposito', class: 'np-deposito', x: 1236, y: 640, width: 150, height: 70, rx: 10, opacity: 0.6 }));
    svg.appendChild(txt(1311, 672, 'NH₃ / NH₄⁺', 'np-deposito-txt'));
    svg.appendChild(txt(1311, 692, 'depósito medular', 'np-deposito-txt', { style: 'font-size:12px;font-weight:600' }));
    pila(svg, 'pila-h', 1480, 652, 'pila-h-txt', 'HCO₃⁻ 24');
  }

  // ───────── Escena de partículas (dependencias encadenadas) ─────────
  let E = null;   // estado actual (lo fija pasos.js)
  const azar = Math.random;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function crearEscena(svg) {
    const P = NI.particulas;
    const e = P.crearEscena(svg, { radio: 16, fuente: 12, maxParticulas: 220 });
    const reb = (x, y, ion) => e.rebote(x, y, ion);
    // Na⁺ por la luz
    e.agregar('na0', { path: 'g-na0', ion: 'na', tasa: 2.6, velocidad: 120, alLlegar: () => { if (azar() < 0.55 * E.glut) e.emitir('na_nhe3'); else e.emitir('na1'); } });
    e.agregar('na_nhe3', { path: 'g-na-nhe3', ion: 'na', modo: 'cadena', desvanecer: 60 });
    e.agregar('na1', { path: 'g-na1', ion: 'na', modo: 'cadena', velocidad: 120, alLlegar: () => { if (azar() < 0.6) e.emitir('na_nkcc'); else e.emitir('na2'); } });
    e.agregar('na_nkcc', { path: 'g-na-nkcc', ion: 'na', modo: 'cadena', desvanecer: 40 });
    e.agregar('na2', { path: 'g-na2', ion: 'na', modo: 'cadena', velocidad: 120, alLlegar: () => {
      if (azar() < 0.85 * E.enac) e.emitir('na_enac'); else { if (E.enac < 0.5) reb(870, 100, 'na'); e.emitir('na3'); }
    }});
    e.agregar('na_enac', { path: 'g-na-enac', ion: 'na', modo: 'cadena', desvanecer: 30, alLlegar: () => { if (azar() < E.nak) e.emitir('k_in'); } });
    e.agregar('na3', { path: 'g-na3', ion: 'na', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    // K⁺ en la célula principal
    e.agregar('k_in', { path: 'g-k-in', ion: 'k', modo: 'cadena', alLlegar: () => { if (azar() < E.romk * E.volt) e.emitir('k_romk'); else { if (E.volt < 0.5) reb(990, 170, 'k'); e.emitir('k_kir'); } } });
    e.agregar('k_romk', { path: 'g-k-romk', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_luz') });
    e.agregar('k_luz', { path: 'g-k-luz', ion: 'k', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    e.agregar('k_kir', { path: 'g-k-kir', ion: 'k', modo: 'cadena', desvanecer: 30 });
    // K⁺ filtrado y reciclaje en el asa
    e.agregar('k_luz0', { path: 'g-k-luz0', ion: 'k', tasa: 0.8, velocidad: 120, alLlegar: () => e.emitir('k_nkcc') });
    e.agregar('k_nkcc', { path: 'g-k-nkcc', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_recicla') });
    e.agregar('k_recicla', { path: 'g-k-recicla', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_luz1') });
    e.agregar('k_luz1', { path: 'g-k-luz1', ion: 'k', modo: 'cadena', velocidad: 120, desvanecer: 60 });
    // amonio
    e.agregar('gln', { path: 'g-gln', ion: 'gln', tasa: 1.3, alLlegar: () => { e.emitir('nh4_ap'); setTimeout(() => e.emitir('nh4_ap'), 300); e.emitir('hco3_p'); setTimeout(() => e.emitir('hco3_p'), 300); } });
    e.agregar('nh4_ap', { path: 'g-nh4-ap', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_luz0') });
    e.agregar('nh4_luz0', { path: 'g-nh4-luz0', ion: 'nh4', modo: 'cadena', velocidad: 120, alLlegar: () => { if (azar() < E.pK) e.emitir('nh4_tal'); else { if (E.pK < 0.6) reb(520, 100, 'nh4'); e.emitir('nh4_sigue'); } } });
    e.agregar('nh4_tal', { path: 'g-nh4-tal', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_dep') });
    e.agregar('nh4_dep', { path: 'g-nh4-dep', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 60 });
    e.agregar('nh4_sigue', { path: 'g-nh4-sigue', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 300 });
    e.agregar('hco3_p', { path: 'g-hco3-p', ion: 'hco3', modo: 'cadena', desvanecer: 40 });
    e.agregar('k_prox', { path: 'g-k-prox', ion: 'k', tasa: 1.4, desvanecer: 60, flujo: 0 });
    // célula α
    e.agregar('co2', { path: 'g-co2', ion: 'co2', tasa: 1.8, pequeno: true, alLlegar: () => { e.emitir('h_ap'); e.emitir('hco3_a'); e.emitir('cl_a'); } });
    e.agregar('h_ap', { path: 'g-h-ap', ion: 'h', modo: 'cadena', alLlegar: () => e.emitir('h_luz') });
    e.agregar('h_luz', { path: 'g-h-luz', ion: 'h', modo: 'cadena', desvanecer: 70 });
    e.agregar('hco3_a', { path: 'g-hco3-a', ion: 'hco3', modo: 'cadena', desvanecer: 40 });
    e.agregar('cl_a', { path: 'g-cl-a', ion: 'cl', modo: 'cadena', pequeno: true, desvanecer: 40 });
    e.agregar('nh3', { path: 'g-nh3', ion: 'nh3', tasa: 1.8, alLlegar: () => { if (azar() < E.trap) e.emitir('nh4_orina'); else e.emitir('nh3_escapa'); } });
    e.agregar('nh4_orina', { path: 'g-nh4-orina', ion: 'nh4', modo: 'cadena', desvanecer: 30 });
    e.agregar('nh3_escapa', { path: 'g-nh3-escapa', ion: 'nh3', modo: 'cadena', desvanecer: 50 });
    // RAAS
    e.agregar('renina', { path: 'g-renina', ion: 'renina', tasa: 1.0, velocidad: 110, alLlegar: () => e.emitir('angii') });
    e.agregar('angii', { path: 'g-angii', ion: 'angii', modo: 'cadena', velocidad: 160, alLlegar: () => { if (E.angiiBlock > 0.5) reb(838, 652, 'angii'); else if (azar() < E.aldo) e.emitir('aldo'); } });
    e.agregar('aldo', { path: 'g-aldo', ion: 'aldo', modo: 'cadena', alLlegar: () => { if (E.mrBlock > 0.5) reb(1062, 486, 'aldo'); } });
    e.agregar('aldo_k', { path: 'g-aldo', ion: 'aldo', tasa: 1.0, flujo: 0, alLlegar: () => { if (E.mrBlock > 0.5) reb(1062, 486, 'aldo'); } });
    e.actualizar = () => {
      e.setFlujo('na0', 1);
      e.setFlujo('k_luz0', 0.8);
      e.setFlujo('gln', E.glut);
      e.setFlujo('k_prox', clamp((E.K - 4.5) / 1.5, 0, 1.2));
      e.setFlujo('co2', E.hatp);
      e.setFlujo('nh3', E.nh3);
      e.setFlujo('renina', E.renina);
      e.setFlujo('aldo_k', E.aldoK || 0);
    };
    return e;
  }

  // ───────── Pintado según el estado ─────────
  const $ = (id) => document.getElementById(id);
  function claseEstado(id, a) {
    const g = $(id); if (!g) return;
    g.classList.remove('ok', 'parcial', 'off');
    g.classList.add(a >= 0.75 ? 'ok' : a >= 0.35 ? 'parcial' : 'off');
  }
  function pintarPila(id, ion, n, cols) {
    const g = $(id); g.innerHTML = '';
    const col = NI.iones[ion];
    for (let i = 0; i < n; i++) {
      const x = (i % cols) * 24 - (cols - 1) * 12, y = (cols === 1 ? 1 : -1) * Math.floor(i / cols) * 22;
      g.appendChild(el('circle', { cx: x, cy: y, r: 11, fill: col.color }));
      g.appendChild(txt(x, y + 4, col.etiqueta, ''));
    }
  }
  const fmt = (x, d = 1) => (+x).toFixed(d).replace('.', ',');
  function render(E) {
    claseEstado('ch-enac', E.enac); claseEstado('ch-nak', E.nak); claseEstado('ch-romk', E.romk * E.volt);
    claseEstado('ch-hatp', E.hatp); claseEstado('ch-ae1', E.hatp);
    claseEstado('ch-nhe3', E.glut); claseEstado('ch-nbc', E.glut); claseEstado('ch-snat3', E.glut);
    claseEstado('ch-nkcc2', E.pK / 0.75); claseEstado('ch-nh4-salida', E.pK / 0.75);
    claseEstado('ch-rhcg-ap', E.nh3); claseEstado('ch-rhcg-bl', E.nh3);
    const mito = $('box-mito'); mito.classList.remove('parcial', 'off');
    if (E.glut < 0.35) mito.classList.add('off'); else if (E.glut < 0.75) mito.classList.add('parcial');
    $('mito-estado').textContent = `glutaminasa ${Math.round(E.glut * 100)} %`;
    const mrOn = E.aldo * (1 - E.mrBlock) > 0.4;
    $('box-mr').classList.toggle('apagada', !mrOn); $('box-sgk1').classList.toggle('apagada', !mrOn);
    $('box-nedd').classList.toggle('apagada', mrOn);
    $('nedd-estado').textContent = mrOn ? 'retira ENaC (inhibida)' : 'retira ENaC (ACTIVA)';
    $('nedd-estado').style.fill = mrOn ? '#57534e' : '#dc2626';
    ['fl-mr-nuc', 'fl-nuc-sgk', 'fl-sgk-nedd'].forEach(id => { $(id).style.opacity = mrOn ? 1 : 0.25; });
    $('fl-nedd-enac').style.opacity = mrOn ? 0.25 : 1;
    $('g-aldo').style.opacity = 0.3 + 0.7 * clamp(E.aldo, 0, 1);
    $('box-suprarrenal').classList.toggle('apagada', E.aldo < 0.35);
    $('box-angii').classList.toggle('apagada', E.angiiBlock > 0.5);
    // carga luminal
    const v = E.voltaje;
    const n = clamp(Math.round(Math.abs(v) / 8), 0, 5);
    $('np-carga').textContent = '− '.repeat(n).trim() + (n < 5 ? ' ' + '· '.repeat(5 - n).trim() : '');
    $('np-carga').classList.toggle('perdida', Math.abs(v) < 20);
    $('np-carga-txt').textContent = Math.abs(v) >= 20 ? `luz negativa ${fmt(v, 0)} mV` : `luz casi neutra ${fmt(v, 0)} mV`;
    // pilas
    pintarPila('pila-k', 'k', Math.round(clamp((E.K - 4) / 2.5, 0, 1) * 12), 4);
    $('pila-k-txt').textContent = `K⁺ en sangre ${fmt(E.K)} mEq/L`;
    pintarPila('pila-na', 'na', Math.round(E.naOrina * 6), 1);
    $('pila-na-txt').textContent = E.naOrina > 0.4 ? 'Na⁺ se pierde en la orina' : '';
    pintarPila('pila-h', 'h', Math.round(E.acido * 8), 4);
    $('pila-h-txt').textContent = E.acido > 0.2 ? `ácido retenido · HCO₃⁻ ${fmt(E.hco3, 0)}` : `HCO₃⁻ ${fmt(E.hco3, 0)} mEq/L`;
    $('np-deposito').setAttribute('opacity', (0.15 + 0.55 * clamp(E.nh3, 0, 1)).toFixed(2));
  }
  function resaltar(ids) {
    document.querySelectorAll('#svg-nefron-paralelo .np-halo.visible').forEach(h => h.classList.remove('visible'));
    document.querySelectorAll('#svg-nefron-paralelo .resalte').forEach(h => h.classList.remove('resalte'));
    (ids || []).forEach(id => {
      const g = $(id); if (!g) return;
      const halo = g.querySelector('.np-halo');
      if (halo) halo.classList.add('visible'); else g.classList.add('resalte');
    });
  }

  NI.np = { construir, crearEscena, render, resaltar, setEstado: (x) => { E = x; } };
})(window);

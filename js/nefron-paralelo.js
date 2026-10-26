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

  function celula(svg, x0, x1, titulo, tx, ty) {
    svg.appendChild(el('path', { class: 'np-celula', d: `M${x0} ${AP} H${x1} V${BL - 60} Q${x1} ${BL} ${x1 - 60} ${BL} H${x0 + 60} Q${x0} ${BL} ${x0} ${BL - 60} Z` }));
    const lineas = Array.isArray(titulo) ? titulo : [titulo];
    lineas.forEach((l, i) => svg.appendChild(txt(tx != null ? tx : (x0 + x1) / 2, (ty != null ? ty : AP + 62) + i * 20, l, 'np-celula-titulo')));
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
    const ly = c.ny != null ? c.ny : (c.y === AP ? 36 : -24);
    const lado = c.lado || 'der';
    const lx = c.nx != null ? c.nx : (lado === 'der' ? 20 : -20);
    if (c.nombre) g.appendChild(txt(lx, ly, c.nombre, 'glifo-nombre', { style: `text-anchor:${lado === 'der' ? 'start' : 'end'}` }));
    svg.appendChild(g);
  }
  function caja(svg, c) {
    const g = el('g', { class: `caja ${c.clase || ''}`, id: c.id, 'data-porque': c.porque });
    g.appendChild(el('rect', { class: 'hit', x: c.x - 6, y: c.y - 6, width: c.w + 12, height: c.h + 12 }));
    g.appendChild(el('rect', { class: 'np-halo', x: c.x - 5, y: c.y - 5, width: c.w + 10, height: c.h + 10, rx: 12 }));
    g.appendChild(el('rect', { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8 }));
    const n = c.lineas.length;
    const esp = c.esp || 17;
    c.lineas.forEach((l, i) => g.appendChild(txt(c.x + c.w / 2, c.y + c.h / 2 + (i - (n - 1) / 2) * esp + 6, l.t || l, l.cls || (i === 0 ? '' : 'caja-sub'), l.id ? { id: l.id } : null)));
    svg.appendChild(g);
  }
  function flecha(svg, id, d, cls, sinPunta) {
    svg.appendChild(el('path', { id, class: `np-flecha ${cls || ''}`, d, 'marker-end': sinPunta ? null : 'url(#np-punta)' }));
  }
  function pila(svg, id, cx, cy, etiquetaId, etiqueta, ty) {
    svg.appendChild(el('g', { id, class: 'np-pila', transform: `translate(${cx},${cy})` }));
    svg.appendChild(txt(cx, ty != null ? ty : cy + (cx > 1500 && cy < 200 ? -30 : 46), etiqueta, 'np-pila-txt', { id: etiquetaId, style: cx > 1500 ? 'text-anchor:end' : 'text-anchor:middle' }));
  }

  function construir(svg) {
    svg.innerHTML = '<defs><marker id="np-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/></marker><marker id="np-inhib" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M5 1 L5 9" stroke="#dc2626" stroke-width="2.5"/></marker></defs>';
    svg.appendChild(el('rect', { class: 'np-luz', x: 0, y: 0, width: 1600, height: 120 }));
    svg.appendChild(el('rect', { class: 'np-sangre', x: 0, y: 580, width: 1600, height: 140 }));
    svg.appendChild(txt(16, 24, 'LUZ TUBULAR → hacia la orina', 'np-banda-titulo'));
    svg.appendChild(txt(1420, 716, 'SANGRE · INTERSTICIO', 'np-banda-titulo sangre', { style: 'text-anchor:end' }));
    svg.appendChild(txt(1456, 24, 'ORINA', 'np-banda-titulo', { style: 'text-anchor:end' }));
    // uniones estrechas entre células
    [[390, 430], [780, 820], [1170, 1210]].forEach(([a, b]) => {
      svg.appendChild(el('line', { class: 'np-union', x1: (a + b) / 2, y1: AP, x2: (a + b) / 2, y2: BL }));
    });
    celula(svg, ...CEL.prox, 'Túbulo proximal', 262);
    celula(svg, ...CEL.asa, ['Asa gruesa', 'ascendente'], 700, 190);
    celula(svg, ...CEL.prin, ['Célula principal', '(colector)'], 1100, 190);
    celula(svg, ...CEL.alfa, ['Célula intercalada α', '(colector)'], 1380, 190);

    // ── caminos (flechas = guías de partículas) ──
    // luz: Na⁺ baja por la luz y entra a cada célula según su canal
    flecha(svg, 'g-na0', 'M48 74 L120 74', '', true);
    flecha(svg, 'g-na-nhe3', 'M120 74 L120 240', '', true);
    flecha(svg, 'g-na-nbc', `M120 240 L120 300 C120 420 100 440 100 490`, '', true);
    flecha(svg, 'g-na-bomba-p', `M120 240 L120 310 C120 480 170 500 222 500`, '', true);
    flecha(svg, 'g-nbc-out', `M120 540 L120 614`, '');
    flecha(svg, 'g-na-out-p', `M198 530 L198 614`, '');
    flecha(svg, 'g-k-sangre-p', 'M226 692 L262 692 L262 616', '', true);
    flecha(svg, 'g-k-in-p', `M262 612 C262 590 215 600 215 ${BL} C215 536 240 552 300 552 L356 552 L356 612`, '');
    flecha(svg, 'g-h-nhe3', `M120 ${AP} L120 96`, 'tenue', true);
    flecha(svg, 'g-na1', 'M120 74 L520 74', '', true);
    flecha(svg, 'g-na-dock-t', `M520 74 L520 ${AP} L478 222`, '', true);
    flecha(svg, 'g-na-nkcc', `M478 222 C490 320 548 420 548 496`, '', true);
    flecha(svg, 'g-na-out-t', `M500 528 L500 614`, '');
    flecha(svg, 'g-k-sangre-t', 'M470 716 L470 616', '', true);
    flecha(svg, 'g-k-in-t', `M470 612 C470 585 505 592 520 ${BL} C535 525 590 520 590 ${BL} L590 612`, '');
    flecha(svg, 'g-cl-tal', `M520 ${AP + 30} C530 300 656 380 656 ${BL} L656 612`, '');
    flecha(svg, 'g-na2', 'M520 74 L850 74', '', true);
    flecha(svg, 'g-na-enac', `M850 74 L850 ${AP + 30} L850 400 C850 470 848 480 848 492`, '');
    flecha(svg, 'g-na-out', `M905 528 L905 614`, '');
    flecha(svg, 'g-na3', 'M850 74 L1548 74', '');
    // K⁺ en la célula principal: entra por la bomba, sale por ROMK o vuelve por Kir4.1
    flecha(svg, 'g-k-sangre', 'M760 680 L845 680 L845 620', '', true);
    flecha(svg, 'g-k-in', `M845 616 C845 585 900 592 915 560 C935 500 1040 470 1040 380 C1040 300 1010 240 1010 200`, '');
    flecha(svg, 'g-k-romk', `M1010 200 L1010 ${AP} L1010 100`, '');
    flecha(svg, 'g-k-luz', 'M1010 100 L1548 100', '');
    flecha(svg, 'g-k-kir', `M1010 200 C1010 340 1140 400 1140 ${BL} L1140 612`, '');
    // K⁺ filtrado llega al asa: entra por NKCC2 y ROMK lo recicla
    flecha(svg, 'g-k-luz0', 'M48 100 L520 100', '', true);
    flecha(svg, 'g-k-dock-t', `M520 100 L520 ${AP} L562 222`, '', true);
    flecha(svg, 'g-nh4-dock-t', `M520 48 L520 ${AP} L562 222`, '', true);
    flecha(svg, 'g-k-nkcc', `M562 222 C562 270 620 260 620 ${AP} L620 100`, '');
    flecha(svg, 'g-k-luz1', 'M620 100 L1010 100', '', true);
    // amonio: glutamina → mitocondria → NH₄⁺ a la luz (NHE3), HCO₃⁻ a la sangre (NBCe1)
    flecha(svg, 'g-gln', `M300 612 L300 ${BL} L300 440`, '');
    flecha(svg, 'g-nh4-ap', `M150 372 C120 372 160 300 186 232`, '', true);
    flecha(svg, 'g-nh4-out', `M186 232 L120 ${AP + 30} L120 48`, '');
    flecha(svg, 'g-nh4-luz0', 'M120 48 L520 48', '', true);
    flecha(svg, 'g-nh4-tal', `M562 222 C562 330 748 360 748 ${BL} L748 612`, '');
    flecha(svg, 'g-nh4-dep', 'M748 640 L748 672 L1214 672', '');
    flecha(svg, 'g-nh4-sigue', 'M520 48 L1548 48', 'tenue');
    flecha(svg, 'g-hco3-p', `M150 420 C110 420 70 450 66 490`, '', true);
    flecha(svg, 'g-k-prox', `M356 612 L356 ${BL} L356 440`, 'tenue');
    // célula α
    flecha(svg, 'g-co2', `M1270 612 L1270 ${BL} L1270 352`, '');
    flecha(svg, 'g-h-ap1', `M1262 296 C1270 240 1270 200 1270 ${AP + 36}`, '', true);
    flecha(svg, 'g-h-ap2', `M1270 ${AP + 30} L1270 92`, '');
    flecha(svg, 'g-h-vuelve', `M1250 ${AP + 40} C1225 300 1225 450 1236 ${BL} L1236 612`, 'tenue');
    flecha(svg, 'g-h-luz', 'M1270 88 L1420 88', 'tenue', true);
    flecha(svg, 'g-hco3-a', `M1300 352 L1292 506`, '', true);
    flecha(svg, 'g-hco3-out', `M1288 540 L1288 614`, '');
    flecha(svg, 'g-cl-sangre', 'M1440 688 L1440 622', '', true);
    flecha(svg, 'g-cl-in', `M1306 528 C1306 460 1412 460 1412 ${BL} L1412 612`, '');
    flecha(svg, 'g-nh3', `M1480 612 L1480 ${BL} L1480 ${AP + 30} L1480 56`, '');
    flecha(svg, 'g-nh4-orina', 'M1480 48 L1548 48', '');
    flecha(svg, 'g-nh3-escapa', 'M1480 48 L1420 48', 'tenue', true);
    // RAAS en la banda de sangre
    flecha(svg, 'g-renina', 'M212 700 L288 700', 'via');
    flecha(svg, 'g-angii', 'M442 700 L838 700', 'via');
    flecha(svg, 'g-aldo', `M985 682 L985 600 C985 560 1060 540 1075 510`, 'via');
    // vía dentro de la célula principal
    flecha(svg, 'fl-mr-nuc', 'M1040 476 L982 428', 'via');
    flecha(svg, 'fl-nuc-sgk', 'M930 358 L930 330', 'via');
    flecha(svg, 'fl-sgk-nedd', 'M935 292 L935 260', 'via inhib');
    flecha(svg, 'fl-nedd-enac', 'M872 224 L856 174', 'via inhib');
    document.getElementById('fl-sgk-nedd').setAttribute('marker-end', 'url(#np-inhib)');
    document.getElementById('fl-nedd-enac').setAttribute('marker-end', 'url(#np-inhib)');

    // ── rótulos de iones ──
    const iones = [
      [10, 80, 'Na⁺', 'na'], [10, 106, 'K⁺', 'k'], [66, 54, 'NH₄⁺', 'nh4'],
      [68, 230, 'Na⁺', 'na'], [600, 268, 'Na⁺ · K⁺/NH₄⁺ · 2Cl⁻', 'nh4'],
      [62, 648, 'Na⁺·3HCO₃⁻', 'hco3'], [186, 648, '3 Na⁺', 'na'], [282, 660, '2 K⁺', 'k'], [310, 636, 'glutamina', 'gln'], [376, 664, 'K⁺', 'k'],
      [492, 644, '3 Na⁺', 'na'], [420, 668, '2 K⁺', 'k'], [604, 644, 'K⁺', 'k'], [670, 644, '2 Cl⁻', 'cl'], [768, 636, 'NH₄⁺', 'nh4'],
      [905, 640, '3 Na⁺', 'na'], [866, 658, '2 K⁺', 'k'], [1120, 640, 'K⁺ vuelve', 'k'], [1216, 632, 'CO₂', 'co2'], [1262, 640, 'HCO₃⁻', 'hco3'], [1420, 662, 'Cl⁻ entra', 'cl', 'end'], [1392, 640, 'Cl⁻ sale', 'cl', 'end'], [1496, 622, 'NH₃', 'nh4']
    ];
    iones.forEach(([x, y, t, c, a]) => svg.appendChild(txt(x, y, t, 'np-ion ' + c, a ? { style: `text-anchor:${a}` } : null)));
    svg.appendChild(txt(1292, 276, 'H₂O → H⁺ + OH⁻', 'np-reaccion'));
    svg.appendChild(txt(654, 304, 'El NH₄⁺ ocupa el sitio', 'np-nota'));
    svg.appendChild(txt(654, 322, 'del K⁺ y pasa al', 'np-nota'));
    svg.appendChild(txt(654, 340, 'intersticio medular', 'np-nota'));
    svg.appendChild(txt(874, 206, 'inhibida por SGK1', 'np-nota', { id: 'nedd-estado' }));
    // contadores de las colas de espera (estequiometría)
    svg.appendChild(txt(1400, 440, '', 'np-cola-txt', { id: 'cola-ae1-txt', style: 'text-anchor:middle' }));

    // ── cajas ──
    caja(svg, { id: 'box-mito', x: 150, y: 330, w: 220, h: 118, esp: 19, clase: 'mito', porque: 'glutaminasa', lineas: ['Glutamina → PDG → GDH', '→ α-KG → PEPCK', '= 2 NH₄⁺ + 2 HCO₃⁻', { t: 'glutaminasa 100 %', cls: 'caja-estado', id: 'mito-estado' }] });
    caja(svg, { id: 'box-ca', x: 1240, y: 300, w: 240, h: 52, clase: 'ca', porque: 'ca2', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-nedd', x: 870, y: 222, w: 110, h: 34, lineas: ['Nedd4-2'], porque: 'nedd' });
    caja(svg, { id: 'box-sgk1', x: 892, y: 292, w: 86, h: 34, lineas: ['SGK1'], porque: 'sgk1' });
    caja(svg, { id: 'box-mr', x: 1040, y: 470, w: 80, h: 36, lineas: ['MR'], porque: 'mr' });
    caja(svg, { id: 'box-renina', x: 60, y: 681, w: 152, h: 36, clase: 'raas', porque: 'renina', lineas: ['Riñón · renina'] });
    caja(svg, { id: 'box-angii', x: 290, y: 681, w: 152, h: 36, clase: 'raas', porque: 'angii', lineas: ['Angiotensina II'] });
    caja(svg, { id: 'box-suprarrenal', x: 840, y: 681, w: 200, h: 36, clase: 'raas', porque: 'suprarrenal', lineas: ['Suprarrenal → aldosterona'] });
    const nuc = el('g', { class: 'nucleo', 'data-porque': 'nucleo' });
    nuc.appendChild(el('ellipse', { cx: 930, cy: 400, rx: 60, ry: 40 }));
    nuc.appendChild(txt(930, 396, 'Núcleo', ''));
    nuc.appendChild(txt(930, 414, 'transcripción · días', 'nucleo-sub'));
    svg.appendChild(nuc);

    // ── transportadores ──
    circulo(svg, { id: 'ch-nhe3', x: 120, y: AP, clase: 'pasivo', etiqueta: ['NHE3'], porque: 'nhe3', r: 32 });
    circulo(svg, { id: 'ch-nbc', x: 120, y: BL, clase: 'pasivo', etiqueta: ['NBCe1'], porque: 'nbce1', r: 32 });
    circulo(svg, { id: 'ch-nak-p', x: 215, y: BL, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true, r: 30 });
    canal(svg, { id: 'ch-snat3', x: 300, y: BL, nombre: 'SNAT3', porque: 'snat3', lado: 'izq', ny: -30 });
    canal(svg, { id: 'ch-k-p', x: 356, y: BL, nombre: 'K⁺', porque: 'glutaminasa', estatico: true });
    circulo(svg, { id: 'ch-nkcc2', x: 520, y: AP, clase: 'pasivo', etiqueta: ['NKCC2'], porque: 'nkcc2', r: 36 });
    canal(svg, { id: 'ch-romk-t', x: 620, y: AP, nombre: 'ROMK', porque: 'romk_tal' });
    circulo(svg, { id: 'ch-nak-t', x: 520, y: BL, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true, r: 32 });
    canal(svg, { id: 'ch-kir-t', x: 590, y: BL, nombre: 'Kir4.1', porque: 'kir41', estatico: true, lado: 'izq', nx: -24, ny: 40 });
    canal(svg, { id: 'ch-clc', x: 656, y: BL, nombre: 'ClC-Kb', porque: 'clc', estatico: true, nx: 16, ny: 40 });
    circulo(svg, { id: 'ch-nh4-salida', x: 748, y: BL, clase: 'pasivo', etiqueta: ['NHE4', 'KCC4'], porque: 'nh4_salida', r: 30 });
    canal(svg, { id: 'ch-enac', x: 850, y: AP, nombre: 'ENaC', porque: 'enac' });
    canal(svg, { id: 'ch-romk', x: 1010, y: AP, nombre: 'ROMK', porque: 'romk' });
    circulo(svg, { id: 'ch-nak', x: 915, y: BL, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', r: 34 });
    canal(svg, { id: 'ch-kir', x: 1140, y: BL, nombre: 'Kir4.1', porque: 'kir41', estatico: true, lado: 'izq' });
    circulo(svg, { id: 'ch-hatp', x: 1270, y: AP, clase: 'activo', etiqueta: ['vH⁺-', 'ATPasa'], porque: 'hatpasa', r: 34 });
    canal(svg, { id: 'ch-rhcg-ap', x: 1480, y: AP, nombre: 'Rhcg', porque: 'rhcg' });
    circulo(svg, { id: 'ch-ae1', x: 1306, y: BL, clase: 'pasivo', etiqueta: ['AE1'], porque: 'ae1', r: 32 });
    canal(svg, { id: 'ch-clc-a', x: 1412, y: BL, nombre: 'ClC-Kb', porque: 'clc', estatico: true, lado: 'izq', nx: -24 });
    canal(svg, { id: 'ch-rhcg-bl', x: 1480, y: BL, nombre: 'Rhbg', porque: 'rhcg' });

    // ── carga luminal, pilas y depósito ──
    svg.appendChild(txt(1000, 18, '− − − − −', 'np-carga', { id: 'np-carga', style: 'text-anchor:middle' }));
    svg.appendChild(txt(1070, 24, 'luz negativa −40 mV', 'np-carga-txt', { id: 'np-carga-txt' }));
    pila(svg, 'pila-k', 1132, 676, 'pila-k-txt', 'K⁺ sangre 4,0 mEq/L', 706);
    pila(svg, 'pila-na', 1578, 56, 'pila-na-txt', '', 24);
    svg.appendChild(el('rect', { id: 'np-deposito', class: 'np-deposito', x: 1214, y: 648, width: 126, height: 60, rx: 10, opacity: 0.6 }));
    svg.appendChild(txt(1277, 673, 'NH₃ / NH₄⁺', 'np-deposito-txt'));
    svg.appendChild(txt(1277, 693, 'depósito medular', 'np-deposito-txt', { style: 'font-size:12px;font-weight:600' }));
    pila(svg, 'pila-h', 1500, 690, 'pila-h-txt', 'HCO₃⁻ 24 mEq/L', 716);
  }

  // ───────── Escena de partículas (dependencias encadenadas + colas con estequiometría) ─────────
  let E = null;   // estado actual (lo fija pasos.js)
  let escActiva = null;
  const azar = Math.random;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const luego = (ms, f) => setTimeout(f, ms);
  function crearEscena(svg) {
    const P = NI.particulas;
    const e = P.crearEscena(svg, { radio: 16, fuente: 12, maxParticulas: 240 });
    escActiva = e;
    const reb = (x, y, ion) => e.rebote(x, y, ion);

    // Voltaje luminal medido: depende de cuántos Na⁺ entran de verdad por ENaC
    // (entrada de catión sin anión) frente a los que siguen de largo a la orina.
    const med = { entra: 6, sigue: 1 };
    e.voltaje = () => -40 * clamp((med.entra / Math.max(1e-6, med.entra + med.sigue)) / 0.85, 0, 1);
    const voltF = () => clamp(-e.voltaje() / 40, 0, 1);

    // ── colas de espera ──
    // Bomba Na⁺/K⁺-ATPasa de la célula principal: 3 Na⁺ adentro + 2 K⁺ afuera por ciclo
    e.cola('nak', {
      slots: { na: { x: 900, y: 508, dx: -26, dy: -26, cols: 3, n: 3, tope: 6 }, k: { x: 845, y: 616, dx: -28, dy: 24, cols: 3, n: 2, tope: 6 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in'))); }
    });
    // NKCC2 del asa gruesa: 1 Na⁺ + 1 K⁺ (o NH₄⁺, que ocupa el mismo sitio) + 2 Cl⁻
    e.cola('nkcc2', {
      slots: { na: { x: 478, y: 222, dx: -28, dy: 24, cols: 2, n: 1, tope: 2 }, kx: { x: 562, y: 222, dx: 28, dy: 24, cols: 2, n: 1, tope: 2 } },
      alCompletar: (esc, c) => {
        e.emitir('na_nkcc');
        if (c.kx[0] === 'nh4') e.emitir('nh4_tal'); else e.emitir('k_nkcc');
        e.emitir('cl_tal'); luego(140, () => e.emitir('cl_tal'));
      }
    });
    // AE1 de la célula α: 1 HCO₃⁻ sale a la sangre a cambio de 1 Cl⁻ que entra
    e.cola('ae1', {
      slots: { hco3: { x: 1290, y: 522, dx: -28, dy: -26, cols: 3, n: 1, tope: 3 }, cl: { x: 1440, y: 614, dx: 0, dy: 24, cols: 1, n: 1, tope: 2 } },
      alCompletar: () => { e.emitir('hco3_out'); e.emitir('cl_in'); }
    });
    // Bomba Na⁺/K⁺-ATPasa del asa gruesa: misma cuenta 3 Na⁺ : 2 K⁺; el K⁺ que entra se recicla por Kir4.1
    e.cola('nakt', {
      slots: { na: { x: 548, y: 496, dx: 26, dy: -26, cols: 3, n: 3, tope: 3 }, k: { x: 470, y: 612, dx: -28, dy: 24, cols: 2, n: 2, tope: 4 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out_t'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in_t'))); }
    });
    // Bomba Na⁺/K⁺-ATPasa del túbulo proximal: 3 Na⁺ : 2 K⁺; el K⁺ se recicla por el canal K⁺ basolateral
    e.cola('nakp', {
      slots: { na: { x: 222, y: 506, dx: 28, dy: -26, cols: 3, n: 3, tope: 6 }, k: { x: 262, y: 612, dx: -24, dy: 24, cols: 2, n: 2, tope: 4 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out_p'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in_p'))); }
    });
    // NBCe1: 1 Na⁺ sale junto con 3 HCO₃⁻
    e.cola('nbc', {
      slots: { na: { x: 100, y: 506, dx: 0, dy: -26, cols: 1, n: 1, tope: 2 }, hco3: { x: 66, y: 506, dx: 0, dy: -26, cols: 1, n: 3, tope: 5 } },
      alCompletar: () => { e.emitir('nbc_out', null, 'na'); [80, 180, 280].forEach(ms => luego(ms, () => e.emitir('nbc_out'))); }
    });
    // NHE3 del proximal: 1 Na⁺ entra a cambio de 1 NH₄⁺ (si hay uno esperando) o de 1 H⁺
    e.cola('nhe3', { slots: { nh4: { x: 186, y: 232, dx: 28, dy: 24, cols: 2, n: 99, tope: 4 } } });

    // ── Na⁺ por la luz ──
    e.agregar('na0', { path: 'g-na0', ion: 'na', tasa: 3.4, velocidad: 125, alLlegar: () => {
      if (azar() < 0.4) {
        e.emitir('na_nhe3');
        const q = e.colas.nhe3.slots.nh4;
        if (q.aparcadas.length) { const a = q.aparcadas.shift(); a.el.remove(); e.emitir('nh4_out'); e.colas.nhe3.slots.nh4.aparcadas.forEach((b, i) => b.el.setAttribute('transform', `translate(${186 + (i % 2) * 28},${232 + Math.floor(i / 2) * 24})`)); }
        else e.emitir('h_nhe3');
      } else e.emitir('na1');
    }});
    e.agregar('na_nhe3', { path: 'g-na-nhe3', ion: 'na', modo: 'cadena', alLlegar: () => {
      if (e.hayCupo('nbc', 'na') && azar() < 0.5) { e.reservar('nbc', 'na'); e.emitir('na_nbc'); } else e.emitir('na_bomba_p');
    }});
    e.agregar('na_nbc', { path: 'g-na-nbc', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nbc', 'na', 'na', true) });
    e.agregar('na_bomba_p', { path: 'g-na-bomba-p', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nakp', 'na', 'na') });
    e.agregar('nbc_out', { path: 'g-nbc-out', ion: 'hco3', modo: 'cadena', desvanecer: 30 });
    e.agregar('na_out_p', { path: 'g-na-out-p', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('k_sangre_p', { path: 'g-k-sangre-p', ion: 'k', tasa: 0.6, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakp', 'k', 'k')) reb(262, 596, 'k'); } });
    e.agregar('k_in_p', { path: 'g-k-in-p', ion: 'k', modo: 'cadena', desvanecer: 30 });
    e.agregar('h_nhe3', { path: 'g-h-nhe3', ion: 'h', modo: 'cadena', desvanecer: 24 });
    e.agregar('na1', { path: 'g-na1', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.5 && e.hayCupo('nkcc2', 'na')) { e.reservar('nkcc2', 'na'); e.emitir('na_dock_t'); } else e.emitir('na2');
    }});
    e.agregar('na_dock_t', { path: 'g-na-dock-t', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'na', 'na', true) });
    e.agregar('na_nkcc', { path: 'g-na-nkcc', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nakt', 'na', 'na') });
    e.agregar('na_out_t', { path: 'g-na-out-t', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('k_sangre_t', { path: 'g-k-sangre-t', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakt', 'k', 'k')) reb(470, 596, 'k'); } });
    e.agregar('k_in_t', { path: 'g-k-in-t', ion: 'k', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_tal', { path: 'g-cl-tal', ion: 'cl', modo: 'cadena', desvanecer: 40 });
    e.agregar('na2', { path: 'g-na2', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.85 * E.enac) { med.entra += 1; e.emitir('na_enac'); }
      else { med.sigue += 1; if (E.enac < 0.5) reb(850, 106, 'na'); e.emitir('na3'); }
    }});
    e.agregar('na_enac', { path: 'g-na-enac', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nak', 'na', 'na') });
    e.agregar('na_out', { path: 'g-na-out', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('na3', { path: 'g-na3', ion: 'na', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    // ── K⁺ en la célula principal ──
    // llega desde la sangre a la bomba y espera; solo entra cuando la bomba completa 3 Na⁺ + 2 K⁺
    e.agregar('k_sangre', { path: 'g-k-sangre', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nak', 'k', 'k')) reb(845, 600, 'k'); } });
    e.agregar('k_in', { path: 'g-k-in', ion: 'k', modo: 'cadena', alLlegar: () => {
      const v = voltF();
      if (azar() < E.romk * v) e.emitir('k_romk'); else { if (v < 0.5) reb(1010, 170, 'k'); e.emitir('k_kir'); }
    }});
    e.agregar('k_romk', { path: 'g-k-romk', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_luz') });
    e.agregar('k_luz', { path: 'g-k-luz', ion: 'k', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    e.agregar('k_kir', { path: 'g-k-kir', ion: 'k', modo: 'cadena', desvanecer: 30 });
    // ── K⁺ filtrado y reciclaje en el asa ──
    e.agregar('k_luz0', { path: 'g-k-luz0', ion: 'k', tasa: 0.8, velocidad: 120, alLlegar: () => {
      if (e.hayCupo('nkcc2', 'kx')) { e.reservar('nkcc2', 'kx'); e.emitir('k_dock_t'); } else e.emitir('k_luz1');
    }});
    e.agregar('k_dock_t', { path: 'g-k-dock-t', ion: 'k', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'kx', 'k', true) });
    e.agregar('k_nkcc', { path: 'g-k-nkcc', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_luz1') });
    e.agregar('k_luz1', { path: 'g-k-luz1', ion: 'k', modo: 'cadena', velocidad: 120, desvanecer: 60 });
    // ── amonio ──
    e.agregar('gln', { path: 'g-gln', ion: 'gln', tasa: 1.0, alLlegar: () => {
      if (azar() < E.glut) { e.emitir('nh4_ap'); luego(300, () => e.emitir('nh4_ap')); e.emitir('hco3_p'); luego(300, () => e.emitir('hco3_p')); }
      else reb(300, 436, 'gln');
    }});
    e.agregar('nh4_ap', { path: 'g-nh4-ap', ion: 'nh4', modo: 'cadena', alLlegar: () => { if (!e.aparcar('nhe3', 'nh4', 'nh4')) e.emitir('nh4_out'); } });
    e.agregar('nh4_out', { path: 'g-nh4-out', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_luz0') });
    e.agregar('nh4_luz0', { path: 'g-nh4-luz0', ion: 'nh4', modo: 'cadena', velocidad: 120, alLlegar: () => {
      if (azar() < E.pK && e.hayCupo('nkcc2', 'kx')) { e.reservar('nkcc2', 'kx'); e.emitir('nh4_dock_t'); }
      else { if (E.pK < 0.6) reb(520, 106, 'nh4'); e.emitir('nh4_sigue'); }
    }});
    e.agregar('nh4_dock_t', { path: 'g-nh4-dock-t', ion: 'nh4', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'kx', 'nh4', true) });
    e.agregar('nh4_tal', { path: 'g-nh4-tal', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_dep') });
    e.agregar('nh4_dep', { path: 'g-nh4-dep', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 60 });
    e.agregar('nh4_sigue', { path: 'g-nh4-sigue', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 300 });
    e.agregar('hco3_p', { path: 'g-hco3-p', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('nbc', 'hco3', 'hco3') });
    e.agregar('k_prox', { path: 'g-k-prox', ion: 'k', tasa: 1.4, desvanecer: 60, flujo: 0 });
    // ── célula α ──
    e.agregar('co2', { path: 'g-co2', ion: 'co2', tasa: 1.6, alLlegar: () => e.emitir('h_ap1') });
    e.agregar('h_ap1', { path: 'g-h-ap1', ion: 'h', modo: 'cadena', alLlegar: () => {
      if (azar() < E.hatp * (0.5 + 0.5 * voltF())) { e.emitir('h_ap2'); e.emitir('hco3_a'); }
      else { reb(1270, 172, 'h'); e.emitir('h_vuelve'); }
    }});
    e.agregar('h_ap2', { path: 'g-h-ap2', ion: 'h', modo: 'cadena', alLlegar: () => e.emitir('h_luz') });
    e.agregar('h_vuelve', { path: 'g-h-vuelve', ion: 'h', modo: 'cadena', desvanecer: 40 });
    e.agregar('h_luz', { path: 'g-h-luz', ion: 'h', modo: 'cadena', desvanecer: 70 });
    e.agregar('hco3_a', { path: 'g-hco3-a', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('ae1', 'hco3', 'hco3') });
    e.agregar('hco3_out', { path: 'g-hco3-out', ion: 'hco3', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_sangre', { path: 'g-cl-sangre', ion: 'cl', tasa: 1.9, velocidad: 90, alLlegar: () => { if (!e.aparcar('ae1', 'cl', 'cl')) reb(1440, 598, 'cl'); } });
    e.agregar('cl_in', { path: 'g-cl-in', ion: 'cl', modo: 'cadena', desvanecer: 40 });
    e.agregar('nh3', { path: 'g-nh3', ion: 'nh3', tasa: 1.8, alLlegar: () => { if (azar() < E.trap) e.emitir('nh4_orina'); else e.emitir('nh3_escapa'); } });
    e.agregar('nh4_orina', { path: 'g-nh4-orina', ion: 'nh4', modo: 'cadena', desvanecer: 30 });
    e.agregar('nh3_escapa', { path: 'g-nh3-escapa', ion: 'nh3', modo: 'cadena', desvanecer: 50 });
    // ── RAAS ──
    e.agregar('renina', { path: 'g-renina', ion: 'renina', tasa: 1.0, velocidad: 110, alLlegar: () => e.emitir('angii') });
    e.agregar('angii', { path: 'g-angii', ion: 'angii', modo: 'cadena', velocidad: 160, alLlegar: () => { if (E.angiiBlock > 0.5) reb(838, 652, 'angii'); else if (azar() < E.aldo) e.emitir('aldo'); } });
    e.agregar('aldo', { path: 'g-aldo', ion: 'aldo', modo: 'cadena', alLlegar: () => { if (E.mrBlock > 0.5) reb(1062, 486, 'aldo'); } });
    e.agregar('aldo_k', { path: 'g-aldo', ion: 'aldo', tasa: 1.0, flujo: 0, alLlegar: () => { if (E.mrBlock > 0.5) reb(1062, 486, 'aldo'); } });

    e.actualizar = (dt) => {
      // la medida del voltaje olvida lo viejo (constante de tiempo ~8 s)
      const f = Math.exp(-(dt || 0.016) / 8); med.entra *= f; med.sigue *= f;
      e.setFlujo('na0', 1);
      e.setFlujo('k_luz0', 0.8 + 1.6 * clamp((E.K - 4) / 2, 0, 1));
      e.setFlujo('gln', 1);
      e.setFlujo('k_sangre', 1 + 0.8 * clamp((E.K - 4) / 2, 0, 1));
      e.setFlujo('k_sangre_t', 1 + 0.6 * clamp((E.K - 4) / 2, 0, 1));
      e.setFlujo('k_sangre_p', 1 + 0.6 * clamp((E.K - 4) / 2, 0, 1));
      e.setFlujo('k_prox', clamp((E.K - 4.5) / 1.5, 0, 1.2));
      e.setFlujo('co2', 1);
      e.setFlujo('cl_sangre', 1);
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
    const v = escActiva ? escActiva.voltaje() : E.voltaje;
    const vf = clamp(-v / 40, 0, 1);
    claseEstado('ch-enac', E.enac); claseEstado('ch-nak', E.nak); claseEstado('ch-romk', E.romk * vf);
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
    $('nedd-estado').textContent = mrOn ? 'inhibida por SGK1' : 'ACTIVA: quita ENaC';
    $('nedd-estado').style.fill = mrOn ? '#57534e' : '#dc2626';
    ['fl-mr-nuc', 'fl-nuc-sgk', 'fl-sgk-nedd'].forEach(id => { $(id).style.opacity = mrOn ? 1 : 0.25; });
    $('fl-nedd-enac').style.opacity = mrOn ? 0.25 : 1;
    $('g-aldo').style.opacity = 0.3 + 0.7 * clamp(E.aldo, 0, 1);
    $('box-suprarrenal').classList.toggle('apagada', E.aldo < 0.35);
    $('box-angii').classList.toggle('apagada', E.angiiBlock > 0.5);
    // carga luminal (medida a partir del Na⁺ que entra por ENaC)
    const n = clamp(Math.round(Math.abs(v) / 8), 0, 5);
    $('np-carga').textContent = '− '.repeat(n).trim() + (n < 5 ? ' ' + '· '.repeat(5 - n).trim() : '');
    $('np-carga').classList.toggle('perdida', Math.abs(v) < 20);
    $('np-carga-txt').textContent = Math.abs(v) >= 20 ? `luz negativa ${fmt(v, 0)} mV` : `luz casi neutra ${fmt(v, 0)} mV`;
    // contadores de las colas
    if (escActiva) {
      const c = (q, s) => escActiva.cuenta(q, s);
      $('cola-ae1-txt').textContent = `HCO₃⁻ ${c('ae1', 'hco3')}/1 · Cl⁻ ${c('ae1', 'cl')}/1`;
    }
    // pilas
    pintarPila('pila-k', 'k', Math.round(clamp((E.K - 4) / 2.5, 0, 1) * 12), 6);
    $('pila-k-txt').textContent = `K⁺ sangre ${fmt(E.K)} mEq/L`;
    pintarPila('pila-na', 'na', Math.min(3, Math.round(E.naOrina * 4)), 1);
    $('pila-na-txt').textContent = E.naOrina > 0.4 ? 'Na⁺ a la orina' : '';
    pintarPila('pila-h', 'h', Math.round(E.acido * 8), 4);
    $('pila-h-txt').textContent = E.acido > 0.2 ? `HCO₃⁻ ${fmt(E.hco3, 0)} · ácido ↑` : `HCO₃⁻ ${fmt(E.hco3, 0)} mEq/L`;
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

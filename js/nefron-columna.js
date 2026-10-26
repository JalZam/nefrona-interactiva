/* ============================================================
   Nefrón en columna: las 4 células apiladas de proximal (arriba) a
   distal (abajo), unidas por la luz tubular (columna izquierda, fluye
   hacia abajo, hacia la orina) y por la sangre / intersticio (columna
   derecha). Mismo estilo de los esquemas clásicos: luz a la izquierda,
   célula arena, intersticio a la derecha; círculos azul (pasivo) / verde
   (activo), canales como rayitas, flechas negras con el ion. Las flechas
   son los caminos de las partículas. Expone NI.np = { construir, crearEscena,
   render, resaltar, setEstado }.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';
  const W = 920, H = 1720;
  const LUZ = 190, AP = 200, BL = 630, SAN = 650;      // x de la luz, membranas apical / basolateral, sangre
  const LN = { nh4: 44, na: 78, k: 112, hco3: 146 };  // carriles de la luz
  const CEL = { prox: [80, 430], asa: [470, 820], prin: [860, 1210], alfa: [1250, 1600] };
  const ORINA = 1612;

  function el(tag, attrs, children) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (children || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }
  const txt = (x, y, t, cls, extra) => { const n = el('text', Object.assign({ x, y, class: cls }, extra || {})); n.innerHTML = t; return n; };

  function celula(svg, y0, y1, titulo, tx, ty, ancla) {
    svg.appendChild(el('path', { class: 'np-celula', d: `M${AP} ${y0} V${y1} H${BL - 40} Q${BL} ${y1} ${BL} ${y1 - 40} V${y0 + 40} Q${BL} ${y0} ${BL - 40} ${y0} Z` }));
    const lineas = Array.isArray(titulo) ? titulo : [titulo];
    lineas.forEach((l, i) => svg.appendChild(txt(tx, ty + i * 21, l, 'np-celula-titulo', ancla ? { style: `text-anchor:${ancla}` } : null)));
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
    if (c.nombre) {
      const apical = c.x === AP;
      const lx = c.nx != null ? c.nx : (apical ? r + 12 : -r - 12);
      const ly = c.ny != null ? c.ny : -22;
      g.appendChild(txt(lx, ly, c.nombre, 'glifo-nombre', { style: `text-anchor:${c.ancla || (apical ? 'start' : 'end')}` }));
    }
    svg.appendChild(g);
  }
  function canal(svg, c) {
    const g = el('g', { class: `glifo canal ok ${c.estatico ? 'estatico' : ''}`, id: c.id, 'data-porque': c.porque, transform: `translate(${c.x},${c.y})` });
    g.appendChild(el('rect', { class: 'hit', x: -30, y: -30, width: 60, height: 60 }));
    g.appendChild(el('circle', { class: 'np-halo', r: 26 }));
    g.appendChild(el('rect', { class: 'canal-hueco', x: -5, y: -10, width: 10, height: 20 }));
    g.appendChild(el('line', { class: 'sub', x1: -13, y1: -9, x2: 13, y2: -9 }));
    g.appendChild(el('line', { class: 'sub', x1: -13, y1: 9, x2: 13, y2: 9 }));
    g.appendChild(txt(0, 6, '✕', 'x'));
    const apical = c.x === AP;
    const lx = c.nx != null ? c.nx : (apical ? 30 : -30);
    const ly = c.ny != null ? c.ny : -22;
    if (c.nombre) g.appendChild(txt(lx, ly, c.nombre, 'glifo-nombre', { style: `text-anchor:${c.ancla || (apical ? 'start' : 'end')}` }));
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
  function pila(svg, id, cx, cy, etiquetaId, etiqueta, ty, ancla) {
    svg.appendChild(el('g', { id, class: 'np-pila', transform: `translate(${cx},${cy})` }));
    svg.appendChild(txt(ancla === 'end' ? cx + 55 : cx, ty, etiqueta, 'np-pila-txt', { id: etiquetaId, style: `text-anchor:${ancla || 'middle'}` }));
  }

  function construir(svg) {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '<defs><marker id="np-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/></marker><marker id="np-inhib" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M5 1 L5 9" stroke="#dc2626" stroke-width="2.5"/></marker></defs>';
    svg.appendChild(el('rect', { class: 'np-luz', x: 0, y: 0, width: LUZ, height: ORINA }));
    svg.appendChild(el('rect', { class: 'np-sangre', x: SAN, y: 0, width: W - SAN, height: ORINA }));
    svg.appendChild(el('rect', { class: 'np-orina', x: 0, y: ORINA, width: W, height: H - ORINA }));
    svg.appendChild(txt(16, 30, 'LUZ TUBULAR ↓', 'np-banda-titulo'));
    svg.appendChild(txt((AP + BL) / 2, 30, 'CÉLULAS · de proximal a distal', 'np-banda-titulo celulas', { style: 'text-anchor:middle' }));
    svg.appendChild(txt(W - 16, 30, 'SANGRE · INTERSTICIO', 'np-banda-titulo sangre', { style: 'text-anchor:end' }));
    // carriles de la luz
    [[LN.na, 58, 'Na⁺', 'na'], [LN.k, 80, 'K⁺', 'k'], [LN.hco3, 58, 'HCO₃⁻', 'hco3']].forEach(([x, y, t, c]) => svg.appendChild(txt(x, y, t, 'np-ion ' + c, { style: 'text-anchor:middle;font-size:15px' })));
    // uniones estrechas entre células
    [[CEL.prox[1], CEL.asa[0]], [CEL.asa[1], CEL.prin[0]], [CEL.prin[1], CEL.alfa[0]]].forEach(([a, b]) => {
      svg.appendChild(el('line', { class: 'np-union', x1: AP, y1: (a + b) / 2, x2: BL, y2: (a + b) / 2 }));
    });
    celula(svg, ...CEL.prox, ['Túbulo', 'proximal'], 212, 318, 'start');
    celula(svg, ...CEL.asa, 'Asa gruesa ascendente', 470, 500, 'middle');
    celula(svg, ...CEL.prin, 'Célula principal (colector)', 330, 1196, 'middle');
    celula(svg, ...CEL.alfa, 'Célula intercalada α (colector)', 330, 1590, 'middle');

    // ── caminos (flechas = guías de partículas) ──
    // túbulo proximal
    flecha(svg, 'g-na0', `M${LN.na} 96 L${LN.na} 190`, '', true);
    flecha(svg, 'g-na-nhe3', `M${LN.na} 190 L300 190`, '', true);
    flecha(svg, 'g-na-nbc', 'M300 190 L380 190 C470 190 540 176 580 176', '', true);
    flecha(svg, 'g-na-bomba-p', 'M300 190 L340 190 C520 190 560 250 576 296', '', true);
    flecha(svg, 'g-nbc-out', 'M650 200 L724 200', '');
    flecha(svg, 'g-na-out-p', 'M650 278 L724 278', '');
    flecha(svg, 'g-k-sangre-p', 'M762 322 L680 322', '', true);
    flecha(svg, 'g-k-in-p', 'M672 322 C620 322 580 300 575 330 C572 352 600 350 672 350', '');
    flecha(svg, 'g-k-prox', 'M724 350 L630 350 L512 340', 'tenue');
    flecha(svg, 'g-h-nhe3', `M${AP} 190 L162 190`, 'tenue', true);
    flecha(svg, 'g-h-pierde', 'M162 190 C140 230 130 260 130 300', 'tenue', true);
    flecha(svg, 'g-hco3-luz0', `M${LN.hco3} 96 L${LN.hco3} 174`, '', true);
    flecha(svg, 'g-hco3-luz1', `M${LN.hco3} 174 C176 190 176 260 ${LN.hco3} 276 L${LN.hco3} 1588`, 'tenue');
    flecha(svg, 'g-co2-p', `M${LN.hco3} 190 C150 140 180 100 240 100 L400 100`, '');
    flecha(svg, 'g-hco3-ca', 'M520 134 C520 170 540 210 554 226', '', true);
    flecha(svg, 'g-gln', 'M724 395 L630 395 L510 395', '');
    flecha(svg, 'g-nh4-ap', 'M340 292 C340 276 330 262 316 256', '', true);
    flecha(svg, 'g-nh4-out', `M296 254 C240 240 220 210 ${AP} 190 L${LN.nh4} 190`, '');
    flecha(svg, 'g-nh4-luz0', `M${LN.nh4} 190 L${LN.nh4} 560`, '', true);
    flecha(svg, 'g-hco3-p', 'M470 292 C470 262 500 240 540 232', '', true);
    // asa gruesa
    flecha(svg, 'g-na1', `M${LN.na} 190 L${LN.na} 560`, '', true);
    flecha(svg, 'g-na-dock-t', `M${LN.na} 560 L${AP} 560 L282 518`, '', true);
    flecha(svg, 'g-na-nkcc', 'M282 518 C380 530 480 588 556 588', '', true);
    flecha(svg, 'g-na-out-t', 'M650 540 L724 540', '');
    flecha(svg, 'g-k-sangre-t', 'M740 440 L740 510 L680 510', '', true);
    flecha(svg, 'g-k-in-t', 'M672 510 C645 510 652 545 620 560 C585 575 580 630 620 630 L672 630', '');
    flecha(svg, 'g-cl-tal', 'M220 560 C360 570 440 696 620 696 L672 696', '');
    flecha(svg, 'g-k-luz0', `M${LN.k} 96 L${LN.k} 560`, '', true);
    flecha(svg, 'g-k-dock-t', `M${LN.k} 560 L${AP} 560 L282 602`, '', true);
    flecha(svg, 'g-nh4-dock-t', `M${LN.nh4} 560 L${AP} 560 L282 602`, '', true);
    flecha(svg, 'g-k-nkcc', `M282 602 C330 602 320 660 ${AP} 660 L${LN.k} 660`, '');
    flecha(svg, 'g-k-luz1', `M${LN.k} 660 L${LN.k} 1055`, '', true);
    flecha(svg, 'g-nh4-tal', 'M282 602 C390 602 420 760 620 760 L672 760', '');
    flecha(svg, 'g-nh4-dep', 'M672 760 L758 760 L758 1270 L770 1270', '');
    flecha(svg, 'g-nh4-sigue', `M${LN.nh4} 560 L${LN.nh4} 1588`, 'tenue');
    // célula principal
    flecha(svg, 'g-na2', `M${LN.na} 560 L${LN.na} 900`, '', true);
    flecha(svg, 'g-na-enac', `M${LN.na} 900 L240 900 L480 900 C540 900 560 920 568 936`, '');
    flecha(svg, 'g-na-out', 'M650 950 L724 950', '');
    flecha(svg, 'g-na3', `M${LN.na} 900 L${LN.na} 1588`, '');
    flecha(svg, 'g-k-sangre', 'M740 790 L740 890 L690 890', '', true);
    flecha(svg, 'g-k-in', 'M676 890 C645 890 652 945 620 960 C560 990 550 1100 440 1100 C360 1100 300 1060 260 1055', '');
    flecha(svg, 'g-k-romk', `M260 1055 L${AP} 1055 L${LN.k} 1055`, '');
    flecha(svg, 'g-k-luz', `M${LN.k} 1055 L${LN.k} 1588`, '');
    flecha(svg, 'g-k-kir', 'M260 1055 C400 1055 460 1160 620 1160 L672 1160', '');
    // célula α
    flecha(svg, 'g-co2', 'M724 1310 L630 1310 L602 1310', '');
    flecha(svg, 'g-h-ap1', 'M410 1298 C340 1298 270 1310 236 1310', '', true);
    flecha(svg, 'g-h-ap2', `M${AP} 1310 L176 1310`, '');
    flecha(svg, 'g-h-luz', 'M168 1310 L168 1470', 'tenue', true);
    flecha(svg, 'g-h-vuelve', 'M236 1330 C320 1416 500 1416 620 1416 L672 1416', 'tenue');
    flecha(svg, 'g-hco3-a', 'M480 1332 C520 1350 550 1356 566 1356', '', true);
    flecha(svg, 'g-hco3-out', 'M650 1366 L724 1366', '');
    flecha(svg, 'g-cl-sangre', 'M790 1480 L690 1480', '', true);
    flecha(svg, 'g-cl-in', 'M588 1372 C520 1372 520 1452 620 1452 L672 1452', '');
    flecha(svg, 'g-nh3', `M724 1520 L630 1520 L${AP} 1520 L52 1520`, '');
    flecha(svg, 'g-nh4-orina', `M${LN.nh4} 1520 L${LN.nh4} 1588`, '');
    flecha(svg, 'g-nh3-escapa', `M${LN.nh4} 1520 L${LN.nh4} 1460`, 'tenue', true);
    // RAAS en la columna de sangre
    flecha(svg, 'g-renina', 'M835 174 L835 520', 'via');
    flecha(svg, 'g-angii', 'M835 564 L835 950', 'via');
    flecha(svg, 'g-aldo', 'M835 994 L835 1040 L670 1040 C610 1040 590 1090 572 1112', 'via');
    // vía dentro de la célula principal
    flecha(svg, 'fl-mr-nuc', 'M548 1112 L520 1058', 'via');
    flecha(svg, 'fl-nuc-sgk', 'M410 1030 L390 1016', 'via');
    flecha(svg, 'fl-sgk-nedd', 'M343 996 L343 958', 'via inhib');
    flecha(svg, 'fl-nedd-enac', 'M300 925 L232 906', 'via inhib');
    document.getElementById('fl-sgk-nedd').setAttribute('marker-end', 'url(#np-inhib)');
    document.getElementById('fl-nedd-enac').setAttribute('marker-end', 'url(#np-inhib)');

    // ── rótulos de iones y notas ──
    const iones = [
      [676, 180, 'Na⁺ · 3 HCO₃⁻', 'hco3'], [676, 258, '3 Na⁺', 'na'], [726, 308, '2 K⁺', 'k'], [656, 380, 'K⁺', 'k'], [676, 422, 'glutamina', 'gln'],
      [676, 568, '3 Na⁺', 'na'], [676, 460, '2 K⁺', 'k'], [700, 658, 'K⁺', 'k'], [676, 724, '2 Cl⁻', 'cl'], [676, 786, 'NH₄⁺', 'nh4'],
      [676, 980, '3 Na⁺', 'na'], [676, 840, '2 K⁺', 'k'], [750, 1140, 'K⁺ vuelve', 'k', 'end'],
      [676, 1290, 'CO₂', 'co2'], [676, 1346, 'HCO₃⁻', 'hco3'], [700, 1434, 'Cl⁻ sale', 'cl'], [745, 1454, 'Cl⁻ entra', 'cl'], [700, 1548, 'NH₃', 'nh4']
    ];
    iones.forEach(([x, y, t, c, a]) => svg.appendChild(txt(x, y, t, 'np-ion ' + c, a ? { style: `text-anchor:${a}` } : null)));
    svg.appendChild(txt(214, 128, 'H⁺ + HCO₃⁻ → CO₂ + H₂O', 'np-nota'));
    svg.appendChild(txt(214, 145, 'en la luz: anhidrasa carbónica IV', 'np-nota'));
    svg.appendChild(txt(250, 1276, 'H₂O → H⁺ + OH⁻', 'np-reaccion'));
    svg.appendChild(txt(214, 724, 'NKCC2: 1 Na⁺ · 1 K⁺/NH₄⁺ · 2 Cl⁻', 'np-nota'));
    svg.appendChild(txt(214, 742, 'El NH₄⁺ ocupa el sitio del K⁺ y pasa', 'np-nota'));
    svg.appendChild(txt(214, 760, 'al intersticio medular por NHE4/KCC4', 'np-nota'));
    svg.appendChild(txt(362, 976, 'inhibida por SGK1', 'np-nota', { id: 'nedd-estado' }));
    svg.appendChild(txt(300, 1470, '', 'np-cola-txt', { id: 'cola-ae1-txt', style: 'text-anchor:middle' }));

    // ── cajas ──
    caja(svg, { id: 'box-ca-p', x: 400, y: 84, w: 190, h: 50, clase: 'ca', porque: 'ca2p', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-mito', x: 290, y: 292, w: 220, h: 118, esp: 19, clase: 'mito', porque: 'glutaminasa', lineas: ['Glutamina → PDG → GDH', '→ α-KG → PEPCK', '= 2 NH₄⁺ + 2 HCO₃⁻', { t: 'glutaminasa 100 %', cls: 'caja-estado', id: 'mito-estado' }] });
    caja(svg, { id: 'box-ca', x: 410, y: 1280, w: 190, h: 52, clase: 'ca', porque: 'ca2', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-nedd', x: 300, y: 920, w: 110, h: 34, lineas: ['Nedd4-2'], porque: 'nedd' });
    caja(svg, { id: 'box-sgk1', x: 300, y: 996, w: 86, h: 34, lineas: ['SGK1'], porque: 'sgk1' });
    caja(svg, { id: 'box-mr', x: 540, y: 1110, w: 80, h: 36, lineas: ['MR'], porque: 'mr' });
    caja(svg, { id: 'box-renina', x: 770, y: 130, w: 130, h: 44, clase: 'raas', porque: 'renina', lineas: ['Riñón', 'renina'] });
    caja(svg, { id: 'box-angii', x: 770, y: 520, w: 130, h: 44, clase: 'raas', porque: 'angii', lineas: ['Angiotensina', 'II'] });
    caja(svg, { id: 'box-suprarrenal', x: 770, y: 950, w: 130, h: 44, clase: 'raas', porque: 'suprarrenal', lineas: ['Suprarrenal', '→ aldosterona'] });
    const nuc = el('g', { class: 'nucleo', 'data-porque': 'nucleo' });
    nuc.appendChild(el('ellipse', { cx: 470, cy: 1030, rx: 60, ry: 40 }));
    nuc.appendChild(txt(470, 1026, 'Núcleo', ''));
    nuc.appendChild(txt(470, 1044, 'transcripción · días', 'nucleo-sub'));
    svg.appendChild(nuc);

    // ── transportadores ──
    circulo(svg, { id: 'ch-nhe3', x: AP, y: 190, clase: 'pasivo', etiqueta: ['NHE3'], porque: 'nhe3', r: 32, nombre: 'NHE3' });
    circulo(svg, { id: 'ch-nbc', x: BL, y: 200, clase: 'pasivo', etiqueta: ['NBCe1'], porque: 'nbce1', r: 32, nombre: 'NBCe1', nx: 46, ny: 32, ancla: 'start' });
    circulo(svg, { id: 'ch-nak-p', x: BL, y: 290, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true, r: 30 });
    canal(svg, { id: 'ch-k-p', x: BL, y: 350, porque: 'glutaminasa', estatico: true });
    canal(svg, { id: 'ch-snat3', x: BL, y: 395, nombre: 'SNAT3', porque: 'snat3', ny: -22 });
    circulo(svg, { id: 'ch-nkcc2', x: AP, y: 560, clase: 'pasivo', etiqueta: ['NKCC2'], porque: 'nkcc2', r: 36 });
    canal(svg, { id: 'ch-romk-t', x: AP, y: 660, nombre: 'ROMK', porque: 'romk_tal', ny: 26 });
    circulo(svg, { id: 'ch-nak-t', x: BL, y: 560, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', estatico: true, r: 32 });
    canal(svg, { id: 'ch-kir-t', x: BL, y: 630, nombre: 'Kir4.1', porque: 'kir41', estatico: true, ny: 28 });
    canal(svg, { id: 'ch-clc', x: BL, y: 696, nombre: 'ClC-Kb', porque: 'clc', estatico: true, ny: 28 });
    circulo(svg, { id: 'ch-nh4-salida', x: BL, y: 760, clase: 'pasivo', etiqueta: ['NHE4', 'KCC4'], porque: 'nh4_salida', r: 30 });
    canal(svg, { id: 'ch-enac', x: AP, y: 900, nombre: 'ENaC', porque: 'enac' });
    canal(svg, { id: 'ch-romk', x: AP, y: 1055, nombre: 'ROMK', porque: 'romk', ny: 30 });
    circulo(svg, { id: 'ch-nak', x: BL, y: 960, clase: 'activo', etiqueta: ['Na⁺/K⁺', 'ATPasa'], porque: 'nak', r: 34 });
    canal(svg, { id: 'ch-kir', x: BL, y: 1160, nombre: 'Kir4.1', porque: 'kir41', estatico: true, ny: 28 });
    circulo(svg, { id: 'ch-hatp', x: AP, y: 1310, clase: 'activo', etiqueta: ['vH⁺-', 'ATPasa'], porque: 'hatpasa', r: 34 });
    canal(svg, { id: 'ch-rhcg-ap', x: AP, y: 1520, nombre: 'Rhcg', porque: 'rhcg', ny: 30 });
    circulo(svg, { id: 'ch-ae1', x: BL, y: 1370, clase: 'pasivo', etiqueta: ['AE1'], porque: 'ae1', r: 32 });
    canal(svg, { id: 'ch-clc-a', x: BL, y: 1452, nombre: 'ClC-Kb', porque: 'clc', estatico: true, ny: 28 });
    canal(svg, { id: 'ch-rhcg-bl', x: BL, y: 1520, nombre: 'Rhbg', porque: 'rhcg', ny: 30 });

    // ── carga luminal, pilas, depósito y orina ──
    svg.appendChild(txt(178, 975, '− − − − −', 'np-carga', { id: 'np-carga', style: 'text-anchor:middle', transform: 'rotate(90 178 975)' }));
    svg.appendChild(txt(230, 1140, 'luz negativa −40 mV', 'np-carga-txt', { id: 'np-carga-txt' }));
    svg.appendChild(el('rect', { id: 'np-deposito', class: 'np-deposito', x: 770, y: 1240, width: 120, height: 60, rx: 10, opacity: 0.6 }));
    svg.appendChild(txt(830, 1264, 'NH₃ / NH₄⁺', 'np-deposito-txt'));
    svg.appendChild(txt(830, 1284, 'depósito medular', 'np-deposito-txt', { style: 'font-size:12px;font-weight:600' }));
    pila(svg, 'pila-k', 830, 1380, 'pila-k-txt', 'K⁺ sangre 4,0 mEq/L', 1412);
    pila(svg, 'pila-h', 850, 1562, 'pila-h-txt', 'HCO₃⁻ 24 mEq/L', 1594, 'end');
    svg.appendChild(txt(16, 1644, 'ORINA', 'np-banda-titulo'));
    svg.appendChild(txt(16, 1672, 'pH 5,8', 'np-pila-txt', { id: 'orina-ph', style: 'font-size:17px' }));
    svg.appendChild(txt(16, 1698, 'NH₄⁺ urinario normal', 'np-nota', { id: 'orina-nh4' }));
    pila(svg, 'pila-na', 430, 1652, 'pila-na-txt', '', 1696);
    pila(svg, 'pila-hco3o', 590, 1652, 'pila-hco3o-txt', '', 1696);
    pila(svg, 'pila-ko', 750, 1652, 'pila-ko-txt', '', 1696);
  }

  // ───────── Escena de partículas (dependencias encadenadas + colas con estequiometría) ─────────
  let E = null;   // estado actual (lo fija atr.js)
  let escActiva = null;
  const azar = Math.random;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const luego = (ms, f) => setTimeout(f, ms);
  function crearEscena(svg) {
    const P = NI.particulas;
    const e = P.crearEscena(svg, { radio: 16, fuente: 12, maxParticulas: 260 });
    escActiva = e;
    const reb = (x, y, ion) => e.rebote(x, y, ion);

    // Voltaje luminal medido: depende de cuántos Na⁺ entran de verdad por ENaC
    // (entrada de catión sin anión) frente a los que siguen de largo a la orina.
    const med = { entra: 6, sigue: 1 };
    e.voltaje = () => -40 * clamp((med.entra / Math.max(1e-6, med.entra + med.sigue)) / 0.85, 0, 1);
    const voltF = () => clamp(-e.voltaje() / 40, 0, 1);
    // vuelve a cero la medida del voltaje (al cambiar de enfermedad)
    e.reiniciarVoltaje = () => { med.entra = 6; med.sigue = 1; };

    // ── colas de espera ──
    // Bomba Na⁺/K⁺-ATPasa de la célula principal: 3 Na⁺ adentro + 2 K⁺ afuera por ciclo
    e.cola('nak', {
      slots: { na: { x: 568, y: 944, dx: -26, dy: -26, cols: 3, n: 3, tope: 6 }, k: { x: 676, y: 890, dx: 24, dy: -28, cols: 3, n: 2, tope: 6 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in'))); }
    });
    // NKCC2 del asa gruesa: 1 Na⁺ + 1 K⁺ (o NH₄⁺, que ocupa el mismo sitio) + 2 Cl⁻
    e.cola('nkcc2', {
      slots: { na: { x: 282, y: 518, dx: 24, dy: -28, cols: 2, n: 1, tope: 2 }, kx: { x: 282, y: 602, dx: 24, dy: 28, cols: 2, n: 1, tope: 2 } },
      alCompletar: (esc, c) => {
        e.emitir('na_nkcc');
        if (c.kx[0] === 'nh4') e.emitir('nh4_tal'); else e.emitir('k_nkcc');
        e.emitir('cl_tal'); luego(140, () => e.emitir('cl_tal'));
      }
    });
    // AE1 de la célula α: 1 HCO₃⁻ sale a la sangre a cambio de 1 Cl⁻ que entra
    e.cola('ae1', {
      slots: { hco3: { x: 582, y: 1354, dx: -26, dy: -28, cols: 3, n: 1, tope: 3 }, cl: { x: 676, y: 1480, dx: 24, dy: 24, cols: 2, n: 1, tope: 2 } },
      alCompletar: () => { e.emitir('hco3_out'); e.emitir('cl_in'); }
    });
    // Bomba Na⁺/K⁺-ATPasa del asa gruesa: misma cuenta 3 Na⁺ : 2 K⁺; el K⁺ que entra se recicla por Kir4.1
    e.cola('nakt', {
      slots: { na: { x: 556, y: 588, dx: -26, dy: 26, cols: 3, n: 3, tope: 3 }, k: { x: 672, y: 510, dx: 24, dy: -28, cols: 2, n: 2, tope: 4 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out_t'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in_t'))); }
    });
    // Bomba Na⁺/K⁺-ATPasa del túbulo proximal: 3 Na⁺ : 2 K⁺; el K⁺ se recicla por el canal K⁺ basolateral
    e.cola('nakp', {
      slots: { na: { x: 576, y: 300, dx: -26, dy: 28, cols: 3, n: 3, tope: 6 }, k: { x: 672, y: 322, dx: 24, dy: 24, cols: 2, n: 2, tope: 4 } },
      alCompletar: () => { [0, 110, 220].forEach(ms => luego(ms, () => e.emitir('na_out_p'))); [60, 260].forEach(ms => luego(ms, () => e.emitir('k_in_p'))); }
    });
    // NBCe1: 1 Na⁺ sale junto con 3 HCO₃⁻ (del HCO₃⁻ filtrado recuperado y de la glutamina)
    e.cola('nbc', {
      slots: { na: { x: 580, y: 176, dx: 0, dy: -26, cols: 1, n: 1, tope: 2 }, hco3: { x: 580, y: 230, dx: -26, dy: 26, cols: 3, n: 3, tope: 5 } },
      alCompletar: () => { e.emitir('nbc_out', null, 'na'); [80, 180, 280].forEach(ms => luego(ms, () => e.emitir('nbc_out'))); }
    });
    // NHE3 del proximal: 1 Na⁺ entra a cambio de 1 NH₄⁺ (si hay uno esperando) o de 1 H⁺
    e.cola('nhe3', { slots: { nh4: { x: 296, y: 254, dx: 24, dy: -28, cols: 2, n: 99, tope: 4 } } });
    // Anhidrasa carbónica IV (luz del proximal): el HCO₃⁻ filtrado espera a que llegue un H⁺ de NHE3
    e.cola('ca4', { slots: { hco3: { x: LN.hco3, y: 190, dx: 0, dy: 30, cols: 1, n: 99, tope: 3 } } });
    const tomar = (colaId, slot) => { const q = e.colas[colaId].slots[slot]; const a = q.aparcadas.shift(); a.el.remove(); q.aparcadas.forEach((b, i) => b.el.setAttribute('transform', `translate(${q.x + (i % q.cols) * q.dx},${q.y + Math.floor(i / q.cols) * q.dy})`)); return a; };

    // ── túbulo proximal: Na⁺ por la luz y NHE3 ──
    e.agregar('na0', { path: 'g-na0', ion: 'na', tasa: 3.8, velocidad: 125, alLlegar: () => {
      if (azar() < 0.5 * E.nhe3) {
        e.emitir('na_nhe3');
        // NHE3 saca un NH₄⁺ (si hay uno esperando) o un H⁺; en la vida real el H⁺ es mucho más frecuente
        if (e.cuenta('nhe3', 'nh4') && azar() < 0.5) { tomar('nhe3', 'nh4'); e.emitir('nh4_out'); }
        else e.emitir('h_nhe3');
      } else e.emitir('na1');
    }});
    e.agregar('na_nhe3', { path: 'g-na-nhe3', ion: 'na', modo: 'cadena', alLlegar: () => {
      if (azar() < 0.7 * E.nbc && e.hayCupo('nbc', 'na')) { e.reservar('nbc', 'na'); e.emitir('na_nbc'); } else e.emitir('na_bomba_p');
    }});
    e.agregar('na_nbc', { path: 'g-na-nbc', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nbc', 'na', 'na', true) });
    e.agregar('na_bomba_p', { path: 'g-na-bomba-p', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nakp', 'na', 'na') });
    e.agregar('nbc_out', { path: 'g-nbc-out', ion: 'hco3', modo: 'cadena', desvanecer: 30 });
    e.agregar('na_out_p', { path: 'g-na-out-p', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('k_sangre_p', { path: 'g-k-sangre-p', ion: 'k', tasa: 0.6, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakp', 'k', 'k')) reb(740, 346, 'k'); } });
    e.agregar('k_in_p', { path: 'g-k-in-p', ion: 'k', modo: 'cadena', desvanecer: 30 });
    // H⁺ de NHE3 → se une al HCO₃⁻ filtrado que espera (anhidrasa IV) → CO₂ entra → anhidrasa II → HCO₃⁻ a NBCe1
    e.agregar('h_nhe3', { path: 'g-h-nhe3', ion: 'h', modo: 'cadena', alLlegar: () => {
      if (e.cuenta('ca4', 'hco3') && azar() < E.ca4 && e.hayCupo('nbc', 'hco3')) { tomar('ca4', 'hco3'); e.reservar('nbc', 'hco3'); e.emitir('co2_p'); }
      else e.emitir('h_pierde');
    }});
    e.agregar('h_pierde', { path: 'g-h-pierde', ion: 'h', modo: 'cadena', desvanecer: 60 });
    e.agregar('hco3_luz0', { path: 'g-hco3-luz0', ion: 'hco3', tasa: 0.75, velocidad: 110, alLlegar: () => {
      if (e.hayCupo('ca4', 'hco3')) e.aparcar('ca4', 'hco3', 'hco3'); else e.emitir('hco3_luz1');
    }});
    e.agregar('hco3_luz1', { path: 'g-hco3-luz1', ion: 'hco3', modo: 'cadena', velocidad: 130, desvanecer: 40 });
    e.agregar('co2_p', { path: 'g-co2-p', ion: 'co2', modo: 'cadena', alLlegar: () => {
      if (azar() < E.ca2p) e.emitir('hco3_ca'); else { reb(400, 160, 'co2'); e.colas.nbc.slots.hco3.reservas = Math.max(0, e.colas.nbc.slots.hco3.reservas - 1); }
    }});
    e.agregar('hco3_ca', { path: 'g-hco3-ca', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('nbc', 'hco3', 'hco3', true) });
    // ── asa gruesa ──
    e.agregar('na1', { path: 'g-na1', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.5 && e.hayCupo('nkcc2', 'na')) { e.reservar('nkcc2', 'na'); e.emitir('na_dock_t'); } else e.emitir('na2');
    }});
    e.agregar('na_dock_t', { path: 'g-na-dock-t', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'na', 'na', true) });
    e.agregar('na_nkcc', { path: 'g-na-nkcc', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nakt', 'na', 'na') });
    e.agregar('na_out_t', { path: 'g-na-out-t', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('k_sangre_t', { path: 'g-k-sangre-t', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakt', 'k', 'k')) reb(730, 530, 'k'); } });
    e.agregar('k_in_t', { path: 'g-k-in-t', ion: 'k', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_tal', { path: 'g-cl-tal', ion: 'cl', modo: 'cadena', desvanecer: 40 });
    // ── célula principal ──
    e.agregar('na2', { path: 'g-na2', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.85 * E.enac) { med.entra += 1; e.emitir('na_enac'); }
      else { med.sigue += 1; if (E.enac < 0.5) reb(176, 900, 'na'); e.emitir('na3'); }
    }});
    e.agregar('na_enac', { path: 'g-na-enac', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nak', 'na', 'na') });
    e.agregar('na_out', { path: 'g-na-out', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('na3', { path: 'g-na3', ion: 'na', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    // K⁺: llega desde la sangre a la bomba y espera; solo entra cuando la bomba completa 3 Na⁺ + 2 K⁺
    e.agregar('k_sangre', { path: 'g-k-sangre', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nak', 'k', 'k')) reb(745, 920, 'k'); } });
    e.agregar('k_in', { path: 'g-k-in', ion: 'k', modo: 'cadena', alLlegar: () => {
      const v = voltF();
      if (azar() < E.romk * v) e.emitir('k_romk'); else { if (v < 0.5) reb(250, 1032, 'k'); e.emitir('k_kir'); }
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
    e.agregar('gln', { path: 'g-gln', ion: 'gln', tasa: 0.8, alLlegar: () => {
      if (azar() < E.glut) { e.emitir('nh4_ap'); luego(300, () => e.emitir('nh4_ap')); e.emitir('hco3_p'); luego(300, () => e.emitir('hco3_p')); }
      else reb(548, 372, 'gln');
    }});
    e.agregar('nh4_ap', { path: 'g-nh4-ap', ion: 'nh4', modo: 'cadena', alLlegar: () => { if (!e.aparcar('nhe3', 'nh4', 'nh4')) e.emitir('nh4_out'); } });
    e.agregar('nh4_out', { path: 'g-nh4-out', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_luz0') });
    e.agregar('nh4_luz0', { path: 'g-nh4-luz0', ion: 'nh4', modo: 'cadena', velocidad: 120, alLlegar: () => {
      if (azar() < E.pK && e.hayCupo('nkcc2', 'kx')) { e.reservar('nkcc2', 'kx'); e.emitir('nh4_dock_t'); }
      else { if (E.pK < 0.6) reb(176, 600, 'nh4'); e.emitir('nh4_sigue'); }
    }});
    e.agregar('nh4_dock_t', { path: 'g-nh4-dock-t', ion: 'nh4', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'kx', 'nh4', true) });
    e.agregar('nh4_tal', { path: 'g-nh4-tal', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_dep') });
    e.agregar('nh4_dep', { path: 'g-nh4-dep', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 60 });
    e.agregar('nh4_sigue', { path: 'g-nh4-sigue', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 300 });
    e.agregar('hco3_p', { path: 'g-hco3-p', ion: 'hco3', modo: 'cadena', alLlegar: () => { if (!e.aparcar('nbc', 'hco3', 'hco3')) reb(500, 262, 'hco3'); } });
    e.agregar('k_prox', { path: 'g-k-prox', ion: 'k', tasa: 1.4, desvanecer: 60, flujo: 0 });
    // ── célula α ──
    e.agregar('co2', { path: 'g-co2', ion: 'co2', tasa: 1.6, alLlegar: () => { if (azar() < E.ca2a) e.emitir('h_ap1'); else reb(560, 1260, 'co2'); } });
    e.agregar('h_ap1', { path: 'g-h-ap1', ion: 'h', modo: 'cadena', alLlegar: () => {
      if (azar() < E.hatp * (0.5 + 0.5 * voltF()) && e.hayCupo('ae1', 'hco3')) { e.emitir('h_ap2'); e.emitir('hco3_a'); }
      else { reb(250, 1342, 'h'); e.emitir('h_vuelve'); }
    }});
    e.agregar('h_ap2', { path: 'g-h-ap2', ion: 'h', modo: 'cadena', alLlegar: () => e.emitir('h_luz') });
    e.agregar('h_vuelve', { path: 'g-h-vuelve', ion: 'h', modo: 'cadena', desvanecer: 40 });
    e.agregar('h_luz', { path: 'g-h-luz', ion: 'h', modo: 'cadena', desvanecer: 70 });
    e.agregar('hco3_a', { path: 'g-hco3-a', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('ae1', 'hco3', 'hco3') });
    e.agregar('hco3_out', { path: 'g-hco3-out', ion: 'hco3', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_sangre', { path: 'g-cl-sangre', ion: 'cl', tasa: 1.9, velocidad: 90, alLlegar: () => { if (azar() > E.ae1 || !e.aparcar('ae1', 'cl', 'cl')) reb(770, 1480, 'cl'); } });
    e.agregar('cl_in', { path: 'g-cl-in', ion: 'cl', modo: 'cadena', desvanecer: 40 });
    e.agregar('nh3', { path: 'g-nh3', ion: 'nh3', tasa: 1.8, alLlegar: () => { if (azar() < E.trap) e.emitir('nh4_orina'); else e.emitir('nh3_escapa'); } });
    e.agregar('nh4_orina', { path: 'g-nh4-orina', ion: 'nh4', modo: 'cadena', desvanecer: 30 });
    e.agregar('nh3_escapa', { path: 'g-nh3-escapa', ion: 'nh3', modo: 'cadena', desvanecer: 50 });
    // ── RAAS ──
    e.agregar('renina', { path: 'g-renina', ion: 'renina', tasa: 1.0, velocidad: 110, alLlegar: () => e.emitir('angii') });
    e.agregar('angii', { path: 'g-angii', ion: 'angii', modo: 'cadena', velocidad: 160, alLlegar: () => { if (E.angiiBlock > 0.5) reb(835, 926, 'angii'); else if (azar() < E.aldo) e.emitir('aldo'); } });
    e.agregar('aldo', { path: 'g-aldo', ion: 'aldo', modo: 'cadena', alLlegar: () => { if (E.mrBlock > 0.5) reb(600, 1092, 'aldo'); } });
    e.agregar('aldo_k', { path: 'g-aldo', ion: 'aldo', tasa: 1.0, flujo: 0, alLlegar: () => { if (E.mrBlock > 0.5) reb(600, 1092, 'aldo'); } });

    e.actualizar = (dt) => {
      // la medida del voltaje olvida lo viejo (constante de tiempo ~8 s)
      const f = Math.exp(-(dt || 0.016) / 8); med.entra *= f; med.sigue *= f;
      const kAlto = clamp((E.K - 4) / 2, 0, 1);
      e.setFlujo('na0', 1);
      e.setFlujo('hco3_luz0', E.hco3Filt == null ? 1 : E.hco3Filt);
      e.setFlujo('k_luz0', 0.8 + 1.6 * kAlto);
      e.setFlujo('gln', 1);
      e.setFlujo('k_sangre', 1 + 0.8 * kAlto);
      e.setFlujo('k_sangre_t', 1 + 0.6 * kAlto);
      e.setFlujo('k_sangre_p', 1 + 0.6 * kAlto);
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
      const x = (i % cols) * 24 - (cols - 1) * 12, y = -Math.floor(i / cols) * 22;
      g.appendChild(el('circle', { cx: x, cy: y, r: 11, fill: col.color }));
      g.appendChild(txt(x, y + 4, col.etiqueta, ''));
    }
  }
  const fmt = (x, d = 1) => (+x).toFixed(d).replace('.', ',');
  function render(E) {
    const v = escActiva ? escActiva.voltaje() : E.voltaje;
    const vf = clamp(-v / 40, 0, 1);
    claseEstado('ch-enac', E.enac); claseEstado('ch-nak', E.nak); claseEstado('ch-romk', Math.min(1, E.romk) * vf);
    claseEstado('ch-hatp', E.hatp * E.ca2a); claseEstado('ch-ae1', E.ae1 * Math.min(1, 0.4 + E.hatp * E.ca2a));
    claseEstado('ch-nhe3', E.nhe3); claseEstado('ch-nbc', E.nbc); claseEstado('ch-snat3', E.glut);
    claseEstado('ch-nkcc2', E.pK / 0.75); claseEstado('ch-nh4-salida', E.pK / 0.75);
    claseEstado('ch-rhcg-ap', E.nh3); claseEstado('ch-rhcg-bl', E.nh3);
    const cajaEstado = (id, a) => { const b = $(id); b.classList.remove('parcial', 'off'); if (a < 0.35) b.classList.add('off'); else if (a < 0.75) b.classList.add('parcial'); };
    cajaEstado('box-mito', E.glut); cajaEstado('box-ca-p', Math.min(E.ca2p, E.ca4)); cajaEstado('box-ca', E.ca2a);
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
    if (escActiva) {
      const c = (q, s) => escActiva.cuenta(q, s);
      $('cola-ae1-txt').textContent = `AE1 espera: HCO₃⁻ ${c('ae1', 'hco3')}/1 · Cl⁻ ${c('ae1', 'cl')}/1`;
    }
    // sangre
    pintarPila('pila-k', 'k', Math.round(clamp((E.K - 4) / 2.5, 0, 1) * 12), 3);
    $('pila-k-txt').textContent = `K⁺ sangre ${fmt(E.K)} mEq/L` + (E.K < 3.5 ? ' ↓' : E.K > 5.2 ? ' ↑' : '');
    $('pila-k-txt').style.fill = E.K < 3.5 || E.K > 5.2 ? '#dc2626' : '#1f2937';
    pintarPila('pila-h', 'h', Math.round(E.acido * 8), 4);
    $('pila-h-txt').textContent = E.acido > 0.2 ? `HCO₃⁻ ${fmt(E.hco3, 0)} · ácido ↑` : `HCO₃⁻ ${fmt(E.hco3, 0)} mEq/L`;
    $('pila-h-txt').style.fill = E.hco3 < 20 ? '#dc2626' : '#1f2937';
    $('np-deposito').setAttribute('opacity', (0.15 + 0.55 * clamp(E.nh3, 0, 1)).toFixed(2));
    // orina
    const ph = E.phOrina == null ? 5.8 : E.phOrina;
    $('orina-ph').textContent = `pH ${fmt(ph, 1)}` + (ph > 5.5 && E.acido > 0.2 ? ' (no baja de 5,5)' : '');
    $('orina-ph').style.fill = ph > 5.5 && E.acido > 0.2 ? '#dc2626' : '#1f2937';
    const nh4u = E.trap * E.nh3;
    $('orina-nh4').textContent = nh4u < 0.4 ? 'NH₄⁺ urinario BAJO · brecha aniónica urinaria +' : nh4u < 0.75 ? 'NH₄⁺ urinario reducido' : 'NH₄⁺ urinario normal';
    $('orina-nh4').style.fill = nh4u < 0.75 ? '#dc2626' : '#57534e';
    pintarPila('pila-na', 'na', E.naOrina > 0.4 ? Math.min(3, Math.round(E.naOrina * 4)) : 0, 3);
    $('pila-na-txt').textContent = E.naOrina > 0.4 ? 'Na⁺ a la orina' : '';
    pintarPila('pila-hco3o', 'hco3', Math.min(4, Math.round((E.hco3Orina || 0) * 4)), 4);
    $('pila-hco3o-txt').textContent = (E.hco3Orina || 0) > 0.2 ? 'HCO₃⁻ a la orina' : '';
    pintarPila('pila-ko', 'k', Math.min(3, Math.round((E.kOrina || 0) * 3)), 3);
    $('pila-ko-txt').textContent = (E.kOrina || 0) > 0.3 ? 'K⁺ a la orina' : '';
  }
  function resaltar(ids) {
    document.querySelectorAll('#svg-nefron .np-halo.visible').forEach(h => h.classList.remove('visible'));
    document.querySelectorAll('#svg-nefron .resalte').forEach(h => h.classList.remove('resalte'));
    (ids || []).forEach(id => {
      const g = $(id); if (!g) return;
      const halo = g.querySelector('.np-halo');
      if (halo) halo.classList.add('visible'); else g.classList.add('resalte');
    });
  }

  NI.np = { construir, crearEscena, render, resaltar, setEstado: (x) => { E = x; } };
})(window);

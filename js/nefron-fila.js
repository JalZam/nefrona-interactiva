/* ============================================================
   Nefrón en fila: las 4 células una al lado de otra, de proximal (izquierda)
   a distal (derecha), conectadas por la luz tubular (arriba, fluye de
   izquierda a derecha hacia la orina, que se recoge en el cajón de la
   derecha) y por la sangre / intersticio (abajo). Mismo estilo de los
   esquemas clásicos: célula arena, círculos azul (pasivo) / verde (activo),
   canales como rayitas, flechas negras con el ion. Las flechas son los
   caminos de las partículas. Expone NI.np = { construir, crearEscena, render,
   resaltar, setEstado }.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1720, H = 720;
  const AP = 130, BL = 560;                       // y de las membranas apical y basolateral
  const CEL = { prox: [40, 390], asa: [430, 780], prin: [820, 1170], alfa: [1210, 1560] };
  const LN = { hco3: 36, nh4: 60, na: 84, k: 108 }; // carriles de la luz (y)
  const ORX = 1612;                                // x donde empieza el cajón de orina

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
  function pila(svg, id, cx, cy, etiquetaId, etiqueta, ty, ancla, extra) {
    svg.appendChild(el('g', { id, class: 'np-pila', transform: `translate(${cx},${cy})` }));
    svg.appendChild(txt(cx, ty, etiqueta, 'np-pila-txt', Object.assign({ id: etiquetaId, style: `text-anchor:${ancla || 'middle'}` }, extra || {})));
  }

  function construir(svg) {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '<defs><marker id="np-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/></marker><marker id="np-inhib" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M5 1 L5 9" stroke="#dc2626" stroke-width="2.5"/></marker></defs>';
    svg.appendChild(el('rect', { class: 'np-luz', x: 0, y: 0, width: ORX, height: 120 }));
    svg.appendChild(el('rect', { class: 'np-sangre', x: 0, y: 580, width: ORX, height: 140 }));
    svg.appendChild(el('rect', { class: 'np-orina', x: ORX, y: 0, width: W - ORX, height: 560 }));
    svg.appendChild(el('rect', { class: 'np-heces', x: ORX, y: 560, width: W - ORX, height: H - 560 }));
    svg.appendChild(txt(560, 20, 'LUZ TUBULAR → hacia la orina', 'np-banda-titulo'));
    svg.appendChild(txt(1390, 716, 'SANGRE · INTERSTICIO', 'np-banda-titulo sangre', { style: 'text-anchor:end' }));
    // uniones estrechas entre células
    [[390, 430], [780, 820], [1170, 1210]].forEach(([a, b]) => {
      svg.appendChild(el('line', { class: 'np-union', x1: (a + b) / 2, y1: AP, x2: (a + b) / 2, y2: BL }));
    });
    celula(svg, ...CEL.prox, 'Túbulo proximal', 262, 166);
    celula(svg, ...CEL.asa, ['Asa gruesa', 'ascendente'], 700, 190);
    celula(svg, ...CEL.prin, ['Célula principal', '(colector)'], 1100, 190);
    celula(svg, ...CEL.alfa, 'Intercalada α', 1392, 195);

    // ── caminos (flechas = guías de partículas) ──
    // luz: Na⁺ baja por la luz y entra a cada célula según su canal
    flecha(svg, 'g-na0', `M68 ${LN.na} L120 ${LN.na}`, '', true);
    flecha(svg, 'g-na-nhe3', `M120 ${LN.na} L120 240`, '', true);
    flecha(svg, 'g-na-nbc', `M120 240 L120 300 C120 420 100 440 100 490`, '', true);
    flecha(svg, 'g-na-bomba-p', `M120 240 L120 310 C120 480 170 500 222 500`, '', true);
    flecha(svg, 'g-nbc-out', `M120 540 L120 614`, '');
    flecha(svg, 'g-na-out-p', `M198 530 L198 614`, '');
    flecha(svg, 'g-k-sangre-p', 'M226 692 L262 692 L262 616', '', true);
    flecha(svg, 'g-k-in-p', `M262 612 C262 590 215 600 215 ${BL} C215 536 240 552 300 552 L356 552 L356 612`, '');
    // HCO₃⁻ filtrado: espera en la luz (anhidrasa IV) al H⁺ de NHE3; el CO₂ entra y la anhidrasa II lo rehace
    flecha(svg, 'g-hco3-luz0', `M68 ${LN.hco3} L84 ${LN.hco3}`, '', true);
    flecha(svg, 'g-hco3-luz1', `M84 ${LN.hco3} C100 14 170 14 190 ${LN.hco3} L1600 ${LN.hco3}`, 'tenue');
    flecha(svg, 'g-h-nhe3', `M120 ${AP} C120 104 110 70 104 52`, 'tenue', true);
    flecha(svg, 'g-h-pierde', 'M104 48 L220 48', 'tenue', true);
    flecha(svg, 'g-co2-p', `M100 ${LN.hco3} C72 60 56 110 56 170 C56 200 140 207 216 207`, '');
    flecha(svg, 'g-hco3-ca', 'M216 214 C150 214 70 250 64 416', '', true);
    flecha(svg, 'g-na1', `M120 ${LN.na} L520 ${LN.na}`, '', true);
    flecha(svg, 'g-na-dock-t', `M520 ${LN.na} L520 ${AP} L478 222`, '', true);
    flecha(svg, 'g-na-nkcc', `M478 222 C490 320 548 420 548 496`, '', true);
    flecha(svg, 'g-na-out-t', `M500 528 L500 614`, '');
    flecha(svg, 'g-k-sangre-t', 'M470 716 L470 616', '', true);
    flecha(svg, 'g-k-in-t', `M470 612 C470 585 505 592 520 ${BL} C535 525 590 520 590 ${BL} L590 612`, '');
    flecha(svg, 'g-cl-tal', `M520 ${AP + 30} C530 300 656 380 656 ${BL} L656 612`, '');
    flecha(svg, 'g-na2', `M520 ${LN.na} L850 ${LN.na}`, '', true);
    flecha(svg, 'g-na-enac', `M850 ${LN.na} L850 ${AP + 30} L850 400 C850 470 848 480 848 492`, '');
    flecha(svg, 'g-na-out', `M905 528 L905 614`, '');
    flecha(svg, 'g-na3', `M850 ${LN.na} L1600 ${LN.na}`, '');
    // K⁺ en la célula principal: entra por la bomba, sale por ROMK o vuelve por Kir4.1
    flecha(svg, 'g-k-sangre', 'M760 680 L845 680 L845 620', '', true);
    flecha(svg, 'g-k-in', `M845 616 C845 585 900 592 915 560 C935 500 1040 470 1040 380 C1040 300 1010 240 1010 200`, '');
    flecha(svg, 'g-k-romk', `M1010 200 L1010 ${AP} L1010 ${LN.k}`, '');
    flecha(svg, 'g-k-luz', `M1010 ${LN.k} L1530 ${LN.k}`, '', true);
    flecha(svg, 'g-k-luz2', `M1530 ${LN.k} L1600 ${LN.k}`, '');
    flecha(svg, 'g-k-hk', `M1540 ${LN.k} L1540 260 L1540 440`, 'tenue');
    flecha(svg, 'g-h-hk', `M1520 260 L1520 ${AP} L1520 92`, '');
    flecha(svg, 'g-k-kir', `M1010 200 C1010 340 1140 400 1140 ${BL} L1140 612`, '');
    // K⁺ filtrado llega al asa: entra por NKCC2 y ROMK lo recicla
    flecha(svg, 'g-k-luz0', `M68 ${LN.k} L520 ${LN.k}`, '', true);
    flecha(svg, 'g-k-dock-t', `M520 ${LN.k} L520 ${AP} L562 222`, '', true);
    flecha(svg, 'g-nh4-dock-t', `M520 ${LN.nh4} L520 ${AP} L562 222`, '', true);
    flecha(svg, 'g-k-nkcc', `M562 222 C562 270 620 260 620 ${AP} L620 ${LN.k}`, '');
    flecha(svg, 'g-k-luz1', `M620 ${LN.k} L1010 ${LN.k}`, '', true);
    // amonio: glutamina → mitocondria → NH₄⁺ a la luz (NHE3), HCO₃⁻ a la sangre (NBCe1)
    flecha(svg, 'g-gln', `M300 612 L300 ${BL} L300 440`, '');
    flecha(svg, 'g-nh4-ap', `M150 372 C120 372 160 300 176 250`, '', true);
    flecha(svg, 'g-nh4-out', `M170 240 L120 ${AP + 30} L120 ${LN.nh4}`, '');
    flecha(svg, 'g-nh4-luz0', `M120 ${LN.nh4} L520 ${LN.nh4}`, '', true);
    flecha(svg, 'g-nh4-tal', `M562 222 C562 330 748 360 748 ${BL} L748 612`, '');
    flecha(svg, 'g-nh4-dep', 'M748 640 L748 672 L1214 672', '');
    flecha(svg, 'g-nh4-sigue', `M520 ${LN.nh4} L1600 ${LN.nh4}`, 'tenue');
    flecha(svg, 'g-hco3-p', `M150 420 C110 420 70 450 66 490`, '', true);
    flecha(svg, 'g-k-prox', `M356 612 L356 ${BL} L356 440`, 'tenue');
    // célula α
    flecha(svg, 'g-co2', `M1270 612 L1270 ${BL} L1270 352`, '');
    flecha(svg, 'g-h-ap1', `M1262 296 C1270 240 1270 200 1270 ${AP + 36}`, '', true);
    flecha(svg, 'g-h-ap2', `M1270 ${AP + 30} L1270 100`, '');
    flecha(svg, 'g-h-vuelve', `M1250 ${AP + 40} C1225 300 1225 450 1236 ${BL} L1236 612`, 'tenue');
    flecha(svg, 'g-h-luz', 'M1270 96 L1420 96 L1440 52', 'tenue', true);
    flecha(svg, 'g-hpo4', `M400 ${LN.hco3} L1370 ${LN.hco3}`, 'tenue', true);
    flecha(svg, 'g-hpo4-sigue', `M1370 ${LN.hco3} L1600 ${LN.hco3}`, 'tenue');
    flecha(svg, 'g-h2po4', `M1440 ${LN.hco3} L1600 ${LN.hco3}`, '');
    flecha(svg, 'g-hco3-a', `M1300 352 L1292 506`, '', true);
    flecha(svg, 'g-hco3-out', `M1288 540 L1288 614`, '');
    flecha(svg, 'g-cl-sangre', 'M1440 688 L1440 622', '', true);
    flecha(svg, 'g-cl-in', `M1306 528 C1306 460 1412 460 1412 ${BL} L1412 612`, '');
    flecha(svg, 'g-nh3', `M1480 612 L1480 ${BL} L1480 ${AP + 30} L1480 ${LN.nh4 + 8}`, '');
    flecha(svg, 'g-nh4-orina', `M1480 ${LN.nh4} L1600 ${LN.nh4}`, '');
    flecha(svg, 'g-nh3-escapa', `M1480 ${LN.nh4} L1420 ${LN.nh4}`, 'tenue', true);
    flecha(svg, 'g-hco3-heces', 'M1540 596 L1690 596 L1690 630', '');
    // RAAS en la banda de sangre
    flecha(svg, 'g-renina', 'M212 700 L288 700', 'via');
    flecha(svg, 'g-angii', 'M442 700 L838 700', 'via');
    flecha(svg, 'g-aldo', `M985 682 L985 600 C985 560 1060 540 1075 510`, 'via');
    // vía dentro de la célula principal
    flecha(svg, 'fl-mr-nuc', 'M1040 476 L982 428', 'via');
    flecha(svg, 'fl-nuc-sgk', 'M930 358 L930 330', 'via');
    flecha(svg, 'fl-sgk-nedd', 'M935 292 L935 260', 'via inhib');
    flecha(svg, 'fl-nedd-enac', 'M872 224 L856 174', 'via inhib');
    flecha(svg, 'fl-aldo-hatp', 'M1306 216 L1292 162', 'via');
    document.getElementById('fl-sgk-nedd').setAttribute('marker-end', 'url(#np-inhib)');
    document.getElementById('fl-nedd-enac').setAttribute('marker-end', 'url(#np-inhib)');

    // ── rótulos de iones ──
    const iones = [
      [10, 42, 'HCO₃⁻', 'hco3'], [10, 90, 'Na⁺', 'na'], [10, 114, 'K⁺', 'k'],
      [600, 268, 'Na⁺ · K⁺/NH₄⁺ · 2Cl⁻', 'nh4'],
      [62, 648, 'Na⁺·3HCO₃⁻', 'hco3'], [186, 648, '3 Na⁺', 'na'], [282, 660, '2 K⁺', 'k'], [310, 636, 'glutamina', 'gln'], [376, 664, 'K⁺', 'k'],
      [492, 644, '3 Na⁺', 'na'], [420, 668, '2 K⁺', 'k'], [604, 644, 'K⁺', 'k'], [670, 644, '2 Cl⁻', 'cl'], [768, 636, 'NH₄⁺', 'nh4'],
      [905, 640, '3 Na⁺', 'na'], [866, 658, '2 K⁺', 'k'], [1120, 640, 'K⁺ vuelve', 'k'], [1216, 632, 'CO₂', 'co2'], [1262, 640, 'HCO₃⁻', 'hco3'], [1420, 662, 'Cl⁻ entra', 'cl', 'end'], [1392, 640, 'Cl⁻ sale', 'cl', 'end'], [1496, 622, 'NH₃', 'nh4']
    ];
    iones.forEach(([x, y, t, c, a]) => svg.appendChild(txt(x, y, t, 'np-ion ' + c, a ? { style: `text-anchor:${a}` } : null)));
    svg.appendChild(txt(1292, 276, 'H₂O → H⁺ + OH⁻', 'np-reaccion'));
    svg.appendChild(txt(222, 252, 'H⁺ + HCO₃⁻ → CO₂ + H₂O', 'np-nota', { style: 'font-size:12.5px' }));
    svg.appendChild(txt(222, 268, 'en la luz: anhidrasa carbónica IV', 'np-nota', { style: 'font-size:12.5px' }));
    svg.appendChild(txt(654, 304, 'El NH₄⁺ ocupa el sitio', 'np-nota'));
    svg.appendChild(txt(654, 322, 'del K⁺ y pasa al', 'np-nota'));
    svg.appendChild(txt(654, 340, 'intersticio medular', 'np-nota'));
    svg.appendChild(txt(874, 206, 'inhibida por SGK1', 'np-nota', { id: 'nedd-estado' }));
    svg.appendChild(txt(1452, 440, '', 'np-cola-txt', { id: 'cola-ae1-txt', style: 'text-anchor:end' }));

    // ── cajas ──
    caja(svg, { id: 'box-ca-p', x: 216, y: 182, w: 172, h: 50, clase: 'ca', porque: 'ca2p', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-mito', x: 150, y: 330, w: 220, h: 118, esp: 19, clase: 'mito', porque: 'glutaminasa', lineas: ['Glutamina → PDG → GDH', '→ α-KG → PEPCK', '= 2 NH₄⁺ + 2 HCO₃⁻', { t: 'glutaminasa 100 %', cls: 'caja-estado', id: 'mito-estado' }] });
    caja(svg, { id: 'box-ca', x: 1240, y: 300, w: 240, h: 52, clase: 'ca', porque: 'ca2', lineas: ['CO₂ + OH⁻ → HCO₃⁻', 'anhidrasa carbónica II'] });
    caja(svg, { id: 'box-aldo-a', x: 1300, y: 206, w: 172, h: 42, esp: 18, porque: 'estimulo_hatp', lineas: ['Aldo · acidosis', { t: '→ más bombas H⁺', cls: 'caja-sub', id: 'aldo-a-estado' }] });
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
    canal(svg, { id: 'ch-rhcg-ap', x: 1480, y: AP, nombre: 'Rhcg', porque: 'rhcg', lado: 'izq', ny: 36 });
    circulo(svg, { id: 'ch-hk', x: 1530, y: AP, clase: 'activo', etiqueta: ['H⁺/K⁺'], porque: 'hkatpasa', r: 28 });
    circulo(svg, { id: 'ch-ae1', x: 1306, y: BL, clase: 'pasivo', etiqueta: ['AE1'], porque: 'ae1', r: 32 });
    canal(svg, { id: 'ch-clc-a', x: 1412, y: BL, nombre: 'ClC-Kb', porque: 'clc', estatico: true, lado: 'izq', nx: -24 });
    canal(svg, { id: 'ch-rhcg-bl', x: 1480, y: BL, nombre: 'Rhbg', porque: 'rhcg' });

    // ── carga luminal, pilas, depósito y cajón de orina ──
    svg.appendChild(txt(1108, 242, 'luz negativa −40 mV', 'np-carga-txt', { id: 'np-carga-txt', style: 'text-anchor:middle' }));
    svg.appendChild(txt(1108, 266, '− − − − −', 'np-carga', { id: 'np-carga', style: 'text-anchor:middle' }));
    pila(svg, 'pila-k', 1132, 676, 'pila-k-txt', 'K⁺ sangre 4,0 mEq/L', 706);
    svg.appendChild(el('rect', { id: 'np-deposito', class: 'np-deposito', x: 1214, y: 648, width: 126, height: 60, rx: 10, opacity: 0.6 }));
    svg.appendChild(txt(1277, 673, 'NH₃ / NH₄⁺', 'np-deposito-txt'));
    svg.appendChild(txt(1277, 693, 'depósito medular', 'np-deposito-txt', { style: 'font-size:12px;font-weight:600' }));
    pila(svg, 'pila-h', 1500, 690, 'pila-h-txt', 'HCO₃⁻ 24 mEq/L', 716, 'end', { x: 1600 });
    const OX = ORX + (W - ORX) / 2;
    svg.appendChild(txt(OX, 26, 'ORINA', 'np-banda-titulo', { style: 'text-anchor:middle' }));
    svg.appendChild(txt(OX, 52, 'pH 5,8', 'np-pila-txt', { id: 'orina-ph', style: 'text-anchor:middle;font-size:17px' }));
    svg.appendChild(txt(OX, 74, 'NH₄⁺ normal', 'np-nota', { id: 'orina-nh4', style: 'text-anchor:middle;font-size:12px' }));
    svg.appendChild(txt(OX, 90, '', 'np-nota', { id: 'orina-nh4b', style: 'text-anchor:middle;font-size:11px' }));
    const sub = { style: 'text-anchor:middle;font-size:12px' };
    pila(svg, 'pila-nh4o', OX, 150, 'pila-nh4o-txt', 'NH₄⁺', 174, 'middle', Object.assign({ 'data-porque': 'rhcg' }, sub));
    pila(svg, 'pila-ato', OX, 232, 'pila-ato-txt', 'acidez titulable', 256, 'middle', Object.assign({ 'data-porque': 'fosfato' }, sub));
    svg.appendChild(txt(OX, 189, '40 mEq/día', 'np-nota', { id: 'nh4o-val', style: 'text-anchor:middle;font-size:12px;font-weight:700' }));
    svg.appendChild(txt(OX, 271, '30 mEq/día', 'np-nota', { id: 'ato-val', style: 'text-anchor:middle;font-size:12px;font-weight:700' }));
    svg.appendChild(txt(OX, 298, 'ENA normal', 'np-pila-txt', { id: 'orina-ena', 'data-porque': 'fosfato', style: 'text-anchor:middle;font-size:13px' }));
    pila(svg, 'pila-hco3o', OX, 340, 'pila-hco3o-txt', '', 364, 'middle', sub);
    pila(svg, 'pila-na', OX, 420, 'pila-na-txt', '', 444, 'middle', sub);
    pila(svg, 'pila-ko', OX, 500, 'pila-ko-txt', '', 524, 'middle', sub);
    svg.appendChild(txt(OX, 580, 'HECES', 'np-banda-titulo heces', { style: 'text-anchor:middle', 'data-porque': 'diarrea' }));
    pila(svg, 'pila-heces', OX, 680, 'pila-heces-txt', '', 706, 'middle', sub);
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
    // NBCe1: 1 Na⁺ sale junto con 3 HCO₃⁻ (del HCO₃⁻ filtrado recuperado y de la glutamina)
    e.cola('nbc', {
      slots: { na: { x: 100, y: 506, dx: 0, dy: -26, cols: 1, n: 1, tope: 2 }, hco3: { x: 66, y: 506, dx: 0, dy: -26, cols: 1, n: 3, tope: 5 } },
      alCompletar: () => { e.emitir('nbc_out', null, 'na'); [80, 180, 280].forEach(ms => luego(ms, () => e.emitir('nbc_out'))); }
    });
    // NHE3 del proximal: 1 Na⁺ entra a cambio de 1 NH₄⁺ (si hay uno esperando) o de 1 H⁺
    e.cola('nhe3', { slots: { nh4: { x: 170, y: 240, dx: 28, dy: 24, cols: 2, n: 99, tope: 4 } } });
    // Anhidrasa carbónica IV (luz del proximal): el HCO₃⁻ filtrado espera a que llegue un H⁺ de NHE3
    // Fosfato filtrado (HPO₄²⁻) espera en la luz del colector a un H⁺: acidez titulable
    e.cola('fosf', { slots: { hpo4: { x: 1440, y: LN.hco3, dx: -26, dy: 0, cols: 3, n: 99, tope: 3 } } });
    e.cola('ca4', { slots: { hco3: { x: 100, y: LN.hco3, dx: 30, dy: 0, cols: 3, n: 99, tope: 3 } } });
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
    e.agregar('k_sangre_p', { path: 'g-k-sangre-p', ion: 'k', tasa: 0.6, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakp', 'k', 'k')) reb(262, 596, 'k'); } });
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
      if (azar() < E.ca2p) e.emitir('hco3_ca'); else { reb(200, 170, 'co2'); e.colas.nbc.slots.hco3.reservas = Math.max(0, e.colas.nbc.slots.hco3.reservas - 1); }
    }});
    e.agregar('hco3_ca', { path: 'g-hco3-ca', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('nbc', 'hco3', 'hco3', true) });
    // ── asa gruesa ──
    e.agregar('na1', { path: 'g-na1', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.5 && e.hayCupo('nkcc2', 'na')) { e.reservar('nkcc2', 'na'); e.emitir('na_dock_t'); } else e.emitir('na2');
    }});
    e.agregar('na_dock_t', { path: 'g-na-dock-t', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'na', 'na', true) });
    e.agregar('na_nkcc', { path: 'g-na-nkcc', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nakt', 'na', 'na') });
    e.agregar('na_out_t', { path: 'g-na-out-t', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('k_sangre_t', { path: 'g-k-sangre-t', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nakt', 'k', 'k')) reb(470, 596, 'k'); } });
    e.agregar('k_in_t', { path: 'g-k-in-t', ion: 'k', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_tal', { path: 'g-cl-tal', ion: 'cl', modo: 'cadena', desvanecer: 40 });
    // ── célula principal ──
    e.agregar('na2', { path: 'g-na2', ion: 'na', modo: 'cadena', velocidad: 125, alLlegar: () => {
      if (azar() < 0.85 * E.enac) { med.entra += 1; e.emitir('na_enac'); }
      else { med.sigue += 1; if (E.enac < 0.5) reb(850, 118, 'na'); e.emitir('na3'); }
    }});
    e.agregar('na_enac', { path: 'g-na-enac', ion: 'na', modo: 'cadena', alLlegar: () => e.aparcar('nak', 'na', 'na') });
    e.agregar('na_out', { path: 'g-na-out', ion: 'na', modo: 'cadena', desvanecer: 30 });
    e.agregar('na3', { path: 'g-na3', ion: 'na', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    // K⁺: llega desde la sangre a la bomba y espera; solo entra cuando la bomba completa 3 Na⁺ + 2 K⁺
    e.agregar('k_sangre', { path: 'g-k-sangre', ion: 'k', tasa: 0.7, velocidad: 100, alLlegar: () => { if (!e.aparcar('nak', 'k', 'k')) reb(845, 600, 'k'); } });
    e.agregar('k_in', { path: 'g-k-in', ion: 'k', modo: 'cadena', alLlegar: () => {
      const v = voltF();
      if (azar() < E.romk * v) e.emitir('k_romk'); else { if (v < 0.5) reb(1010, 170, 'k'); e.emitir('k_kir'); }
    }});
    e.agregar('k_romk', { path: 'g-k-romk', ion: 'k', modo: 'cadena', alLlegar: () => e.emitir('k_luz') });
    e.agregar('k_luz', { path: 'g-k-luz', ion: 'k', modo: 'cadena', velocidad: 140, alLlegar: () => {
      // H⁺/K⁺-ATPasa: 1 K⁺ de la luz entra a la célula α a cambio de 1 H⁺ que sale
      if (azar() < 0.4 * E.hk) { e.emitir('k_hk'); e.emitir('h_hk'); } else e.emitir('k_luz2');
    }});
    e.agregar('k_luz2', { path: 'g-k-luz2', ion: 'k', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    e.agregar('k_hk', { path: 'g-k-hk', ion: 'k', modo: 'cadena', desvanecer: 60 });
    e.agregar('h_hk', { path: 'g-h-hk', ion: 'h', modo: 'cadena', desvanecer: 30 });
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
      else reb(300, 436, 'gln');
    }});
    e.agregar('nh4_ap', { path: 'g-nh4-ap', ion: 'nh4', modo: 'cadena', alLlegar: () => { if (!e.aparcar('nhe3', 'nh4', 'nh4')) e.emitir('nh4_out'); } });
    e.agregar('nh4_out', { path: 'g-nh4-out', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_luz0') });
    e.agregar('nh4_luz0', { path: 'g-nh4-luz0', ion: 'nh4', modo: 'cadena', velocidad: 120, alLlegar: () => {
      if (azar() < E.pK && e.hayCupo('nkcc2', 'kx')) { e.reservar('nkcc2', 'kx'); e.emitir('nh4_dock_t'); }
      else { if (E.pK < 0.6) reb(520, 118, 'nh4'); e.emitir('nh4_sigue'); }
    }});
    e.agregar('nh4_dock_t', { path: 'g-nh4-dock-t', ion: 'nh4', modo: 'cadena', alLlegar: () => e.aparcar('nkcc2', 'kx', 'nh4', true) });
    e.agregar('nh4_tal', { path: 'g-nh4-tal', ion: 'nh4', modo: 'cadena', alLlegar: () => e.emitir('nh4_dep') });
    e.agregar('nh4_dep', { path: 'g-nh4-dep', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 60 });
    e.agregar('nh4_sigue', { path: 'g-nh4-sigue', ion: 'nh4', modo: 'cadena', velocidad: 150, desvanecer: 300 });
    e.agregar('hco3_p', { path: 'g-hco3-p', ion: 'hco3', modo: 'cadena', alLlegar: () => { if (!e.aparcar('nbc', 'hco3', 'hco3')) reb(100, 440, 'hco3'); } });
    e.agregar('k_prox', { path: 'g-k-prox', ion: 'k', tasa: 1.4, desvanecer: 60, flujo: 0 });
    // ── célula α ──
    e.agregar('co2', { path: 'g-co2', ion: 'co2', tasa: 1.6, alLlegar: () => { if (azar() < E.ca2a) e.emitir('h_ap1'); else reb(1216, 330, 'co2'); } });
    e.agregar('h_ap1', { path: 'g-h-ap1', ion: 'h', modo: 'cadena', alLlegar: () => {
      if (azar() < E.hatp * (0.5 + 0.5 * voltF()) && e.hayCupo('ae1', 'hco3')) { e.emitir('h_ap2'); e.emitir('hco3_a'); }
      else { reb(1270, 172, 'h'); e.emitir('h_vuelve'); }
    }});
    e.agregar('h_ap2', { path: 'g-h-ap2', ion: 'h', modo: 'cadena', alLlegar: () => e.emitir('h_luz') });
    e.agregar('h_vuelve', { path: 'g-h-vuelve', ion: 'h', modo: 'cadena', desvanecer: 40 });
    e.agregar('h_luz', { path: 'g-h-luz', ion: 'h', modo: 'cadena', alLlegar: () => {
      // el H⁺ libre se une a un HPO₄²⁻ que espera (acidez titulable) o queda libre y baja el pH
      if (e.cuenta('fosf', 'hpo4')) { tomar('fosf', 'hpo4'); e.emitir('h2po4'); }
    }});
    e.agregar('hpo4', { path: 'g-hpo4', ion: 'hpo4', tasa: 0.55, velocidad: 140, alLlegar: () => { if (!e.aparcar('fosf', 'hpo4', 'hpo4')) e.emitir('hpo4_sigue'); } });
    e.agregar('hpo4_sigue', { path: 'g-hpo4-sigue', ion: 'hpo4', modo: 'cadena', velocidad: 140, desvanecer: 40 });
    e.agregar('h2po4', { path: 'g-h2po4', ion: 'h2po4', modo: 'cadena', velocidad: 120, desvanecer: 40 });
    e.agregar('hco3_heces', { path: 'g-hco3-heces', ion: 'hco3', tasa: 1.4, flujo: 0, desvanecer: 30 });
    e.agregar('hco3_a', { path: 'g-hco3-a', ion: 'hco3', modo: 'cadena', alLlegar: () => e.aparcar('ae1', 'hco3', 'hco3') });
    e.agregar('hco3_out', { path: 'g-hco3-out', ion: 'hco3', modo: 'cadena', desvanecer: 30 });
    e.agregar('cl_sangre', { path: 'g-cl-sangre', ion: 'cl', tasa: 1.9, velocidad: 90, alLlegar: () => { if (azar() > E.ae1 || !e.aparcar('ae1', 'cl', 'cl')) reb(1440, 598, 'cl'); } });
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
      const kAlto = clamp((E.K - 4) / 2, 0, 1);
      e.setFlujo('na0', 1);
      e.setFlujo('hco3_luz0', E.hco3Filt == null ? 1 : E.hco3Filt);
      e.setFlujo('k_luz0', 0.8 + 1.6 * kAlto);
      e.setFlujo('gln', Math.max(1, E.glut));
      e.setFlujo('hco3_heces', E.diarrea || 0);
      e.setFlujo('k_sangre', 1 + 0.8 * kAlto);
      e.setFlujo('k_sangre_t', 1 + 0.6 * kAlto);
      e.setFlujo('k_sangre_p', 1 + 0.6 * kAlto);
      e.setFlujo('k_prox', clamp((E.K - 4.5) / 1.5, 0, 1.2));
      e.setFlujo('co2', Math.max(1, E.hatp));
      e.setFlujo('cl_sangre', Math.max(1, E.hatp));
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
      g.appendChild(txt(x, y + 4, col.corta || col.etiqueta, ''));
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
    $('nedd-estado').textContent = mrOn ? 'inhibida por SGK1' : 'ACTIVA';
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
    $('np-carga-txt').textContent = Math.abs(v) >= 20 ? `luz negativa ${fmt(v, 0)} mV` : `luz neutra ${fmt(v, 0)} mV`;
    if (escActiva) {
      const c = (q, s) => escActiva.cuenta(q, s);
      $('cola-ae1-txt').textContent = `AE1: HCO₃⁻ ${c('ae1', 'hco3')}/1 · Cl⁻ ${c('ae1', 'cl')}/1`;
    }
    // sangre
    pintarPila('pila-k', 'k', Math.round(clamp((E.K - 4) / 2.5, 0, 1) * 12), 6);
    $('pila-k-txt').textContent = `K⁺ ${fmt(E.K)} mEq/L` + (E.K < 3.5 ? ' ↓' : E.K > 5.2 ? ' ↑' : '');
    $('pila-k-txt').style.fill = E.K < 3.5 || E.K > 5.2 ? '#dc2626' : '#1f2937';
    pintarPila('pila-h', 'h', Math.round(E.acido * 8), 4);
    // Cl⁻ plasmático: con anion gap normal (≈ 12) sube lo mismo que baja el HCO₃⁻
    const cl = Math.round(140 - 12 - E.hco3);
    $('pila-h-txt').textContent = `HCO₃⁻ ${fmt(E.hco3, 0)}${E.hco3 < 22 ? ' ↓' : ''} · Cl⁻ ${cl}${cl > 107 ? ' ↑' : ''}`;
    $('pila-h-txt').style.fill = E.hco3 < 20 ? '#dc2626' : '#1f2937';
    // estímulo directo de la H⁺-ATPasa: aldosterona (vía rápida, PKC) y acidosis (inserta bombas)
    const acidosis = E.hco3 < 21, estim = E.aldo > 0.4 || acidosis;
    $('box-aldo-a').classList.toggle('apagada', !estim);
    $('aldo-a-estado').textContent = !estim ? 'sin estímulo' : acidosis && E.hatp > 1.2 ? '→ bombas ×1,6' : '→ más bombas H⁺';
    $('fl-aldo-hatp').style.opacity = estim ? 1 : 0.2;
    const hk = $('ch-hk'); hk.classList.remove('ok', 'parcial', 'off'); hk.classList.add(E.hk >= 0.6 ? 'ok' : 'parcial');
    $('np-deposito').setAttribute('opacity', (0.15 + 0.55 * clamp(E.nh3, 0, 1)).toFixed(2));
    // orina
    const ph = E.phOrina == null ? 5.8 : E.phOrina;
    const phAlto = ph > 5.5 && E.acido > 0.2;
    $('orina-ph').textContent = `pH ${fmt(ph, 1)}` + (phAlto ? ' ↑' : '');
    $('orina-ph').style.fill = phAlto ? '#dc2626' : '#1f2937';
    const nh4u = E.trap * E.nh3;
    $('orina-nh4').textContent = nh4u > 1.3 ? 'NH₄⁺ ALTO' : nh4u < 0.4 ? 'NH₄⁺ BAJO' : nh4u < 0.75 ? 'NH₄⁺ reducido' : 'NH₄⁺ normal';
    $('orina-nh4').style.fill = nh4u > 1.3 ? '#15803d' : nh4u < 0.75 ? '#dc2626' : '#57534e';
    $('orina-nh4b').textContent = nh4u > 1.3 ? 'brecha urinaria −' : nh4u < 0.4 ? 'brecha urinaria +' : phAlto ? 'no baja de 5,5' : '';
    $('orina-nh4b').style.fill = nh4u > 1.3 ? '#15803d' : '#dc2626';
    // excreción neta de ácido = NH₄⁺ + acidez titulable − HCO₃⁻ urinario
    const at = clamp(E.hatp * E.ca2a, 0, 1.5);
    pintarPila('pila-nh4o', 'nh4', Math.round(clamp(nh4u, 0, 2.5) * 2), 3);
    pintarPila('pila-ato', 'h2po4', Math.round(at * 2), 3);
    const ena = 0.6 * nh4u + 0.4 * at - 0.8 * (E.hco3Orina || 0);
    // valores aproximados en mEq/día (normal: NH₄⁺ ≈ 40, acidez titulable ≈ 30)
    // NH₄⁺: ≈ 40 normal, < 30 en las ATR, 100–200 cuando un riñón sano responde a la acidosis
    const vNh4 = Math.round((nh4u >= 1 ? 40 + (nh4u - 1) * 120 : 40 * (0.3 + 0.7 * nh4u)) / 5) * 5, vAt = Math.round(30 * at / 5) * 5;
    $('nh4o-val').textContent = `${vNh4} mEq/día`;
    $('nh4o-val').style.fill = nh4u > 1.3 ? '#15803d' : nh4u < 0.75 ? '#dc2626' : '#1f2937';
    $('ato-val').textContent = `${vAt} mEq/día`;
    $('ato-val').style.fill = at < 0.6 ? '#dc2626' : '#1f2937';
    $('orina-ena').textContent = ena > 1.25 ? 'ENA ALTA' : ena > 0.7 ? 'ENA normal' : ena > 0.35 ? 'ENA baja' : 'ENA MUY BAJA';
    $('orina-ena').style.fill = ena > 1.25 ? '#15803d' : ena > 0.7 ? '#1f2937' : '#dc2626';
    pintarPila('pila-heces', 'hco3', Math.round((E.diarrea || 0) * 4), 2);
    $('pila-heces-txt').textContent = (E.diarrea || 0) > 0.3 ? 'HCO₃⁻ perdido' : '';
    pintarPila('pila-na', 'na', E.naOrina > 0.4 ? Math.min(3, Math.round(E.naOrina * 4)) : 0, 3);
    $('pila-na-txt').textContent = E.naOrina > 0.4 ? 'Na⁺ perdido' : '';
    pintarPila('pila-hco3o', 'hco3', Math.min(4, Math.round((E.hco3Orina || 0) * 4)), 2);
    $('pila-hco3o-txt').textContent = (E.hco3Orina || 0) > 0.2 ? 'HCO₃⁻ perdido' : '';
    pintarPila('pila-ko', 'k', Math.min(3, Math.round((E.kOrina || 0) * 3)), 3);
    $('pila-ko-txt').textContent = (E.kOrina || 0) > 0.3 ? 'K⁺ perdido' : '';
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

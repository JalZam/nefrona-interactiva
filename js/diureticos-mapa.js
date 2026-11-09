/* ============================================================
   DIURÉTICOS EN LA NEFRONA — mapa general
   Dibujo propio (SVG) de la nefrona con la sangre entrando,
   el filtrado recorriendo el túbulo y la orina saliendo.
   Sin dependencias. Objeto global NI.diu
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const t = k => (NI.i18n ? NI.i18n.t(k) : k);
  const el = (t, a, p) => {
    const n = document.createElementNS(NS, t);
    for (const k in a) n.setAttribute(k, a[k]);
    if (p) p.appendChild(n);
    return n;
  };

  /* ---------- Geometría del dibujo ---------- */

  // Vasos (sangre). El capilar peritubular se mantiene a la izquierda,
  // delgado y claro, para que no se confunda con el asa de Henle.
  const AFERENTE = 'M 18 236 C 90 240, 150 262, 212 286';
  // Recorrido invisible de la sangre dentro del ovillo (el dibujo son las asas de abajo)
  const OVILLO   = 'M 212 286 C 244 266, 286 280, 282 300 C 278 318, 234 302, 224 314 ' +
                   'C 216 324, 230 336, 252 334 C 266 332, 248 324, 238 320';
  // Asas capilares del ovillo: cx, cy, rx, ry, giro
  const ASAS     = [[248, 284, 36, 15, -14], [254, 303, 33, 13, 6], [244, 320, 27, 11, -8]];
  const EFERENTE = 'M 238 320 C 244 346, 242 356, 236 372';
  const CAPILAR  = 'M 236 372 C 250 410, 210 432, 202 472 C 194 512, 224 536, 216 574 ' +
                   'C 208 612, 176 632, 168 668';
  const VENA     = 'M 168 668 C 138 702, 88 718, 18 726';

  // Túbulo (filtrado → orina)
  const SEGS = [
    { id: 'prox', clase: 1,
      d: 'M 306 316 C 350 352, 362 266, 406 300 C 442 328, 458 250, 502 286 C 530 309, 546 278, 566 298',
      nombre: 'Túbulo contorneado proximal', ancho: 30, reab: 0.58 },
    { id: 'desc', clase: 2,
      d: 'M 566 298 L 566 580',
      nombre: 'Rama descendente del asa', ancho: 22, reab: 0.18 },
    { id: 'asaU', clase: 2,
      d: 'M 566 580 C 566 652, 658 652, 658 580',
      nombre: 'Vértice del asa de Henle', ancho: 22, reab: 0.02 },
    { id: 'asc', clase: 3,
      d: 'M 658 580 L 658 266',
      nombre: 'Rama ascendente gruesa', ancho: 30, reab: 0.55 },
    { id: 'dist', clase: 4,
      d: 'M 658 266 C 696 228, 722 306, 758 268 C 790 234, 818 308, 854 270 C 867 256, 878 260, 886 268',
      nombre: 'Túbulo contorneado distal', ancho: 28, reab: 0.42 },
    { id: 'colCort', clase: 5,
      d: 'M 886 268 C 920 272, 938 296, 938 334 L 938 520',
      nombre: 'Túbulo colector cortical', ancho: 32, reab: 0.40 },
    { id: 'colMed', clase: 6,
      d: 'M 938 520 L 938 730',
      nombre: 'Túbulo colector medular', ancho: 32, reab: 0.35 }
  ];

  /* ---------- Las seis clases de diurético ---------- */

  // lista: true = clase construida (mapa animado + acercamiento a la célula).
  // lista: false = en construcción: en vez del riñón se ve la animación de obra.
  // Al terminar una clase solo hay que cambiar su marca a true.
  const CLASES = [
    { n: 1, id: 'iac', lista: true, color: '#0ea5e9', seg: ['prox'], badge: { seg: 'prox', t: 0.5 } },
    // El osmótico actúa en el proximal y en el asa; el efecto mayor está en el asa: la insignia va ahí
    { n: 2, id: 'osm', lista: true, color: '#8b5cf6', seg: ['prox', 'desc', 'asaU'], badge: { seg: 'desc', t: 0.34 } },
    { n: 3, id: 'asa', lista: false, color: '#dc2626', seg: ['asc'], badge: { seg: 'asc', t: 0.5 } },
    { n: 4, id: 'tia', lista: false, color: '#16a34a', seg: ['dist'], badge: { seg: 'dist', t: 0.5 } },
    { n: 5, id: 'ahk', lista: false, color: '#d97706', seg: ['colCort'], badge: { seg: 'colCort', t: 0.62 } },
    { n: 6, id: 'acu', lista: false, color: '#2563eb', seg: ['colMed'], badge: { seg: 'colMed', t: 0.5 } }
  ];
  // Textos de cada clase, siempre en el idioma activo
  const C = (c, campo) => t('cls.' + c.id + '.' + campo);
  // Solo las clases listas abren el acercamiento
  const tieneZoom = c => !!c && c.lista && !!NI.diuZoom && NI.diuZoom.hay(c.id);

  /* ---------- Estado ---------- */

  const E = {
    svg: null, capaParticulas: null,
    rutaSangre: [], rutaTubulo: [],
    paths: {},
    particulas: [],
    sel: null, zoom: null, bloqueo: false,
    cuenta: { filtrado: 0, reab: 0, orina: 0 },
    ultimo: 0, acumSangre: 0,
    gotas: []
  };

  /* ---------- Dibujo ---------- */

  function dibujar(svg) {
    E.svg = svg;
    svg.innerHTML = '';

    const defs = el('defs', {}, svg);
    // Punta de flecha para las etiquetas de entrada/salida
    const m = el('marker', { id: 'dm-flecha', viewBox: '0 0 10 10', refX: '8', refY: '5',
      markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#64748b' }, m);

    const gFondo   = el('g', { id: 'dm-fondo' }, svg);
    const gVasos   = el('g', { id: 'dm-vasos' }, svg);
    const gTubulo  = el('g', { id: 'dm-tubulo' }, svg);
    E.capaParticulas = el('g', { id: 'dm-particulas', 'pointer-events': 'none' }, svg);
    const gRotulos = el('g', { id: 'dm-rotulos' }, svg);

    /* --- Franjas corteza / médula --- */
    el('rect', { x: 0, y: 0, width: 1240, height: 470, fill: '#fdfcfb' }, gFondo);
    el('rect', { x: 0, y: 470, width: 1240, height: 350, fill: '#f6f3ef' }, gFondo);
    el('line', { x1: 0, y1: 470, x2: 1240, y2: 470, stroke: '#e7e0d6',
      'stroke-width': 2, 'stroke-dasharray': '8 6' }, gFondo);
    el('text', { x: 1216, y: 452, class: 'dm-zona', 'text-anchor': 'end' }, gFondo)
      .textContent = t('map.corteza');
    el('text', { x: 1216, y: 498, class: 'dm-zona', 'text-anchor': 'end' }, gFondo)
      .textContent = t('map.medula');

    /* --- Vasos sanguíneos --- */
    const vaso = (id, d, color, ancho) => {
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': ancho + 6,
        'stroke-linecap': 'round', opacity: '.28' }, gVasos);
      const p = el('path', { id: 'dm-' + id, d, fill: 'none', stroke: color,
        'stroke-width': ancho, 'stroke-linecap': 'round' }, gVasos);
      E.paths[id] = p;
      return p;
    };
    vaso('aferente', AFERENTE, '#dc2626', 13);
    vaso('ovillo',   OVILLO,   'transparent', 1);
    ASAS.forEach(a => el('ellipse', { cx: a[0], cy: a[1], rx: a[2], ry: a[3],
      transform: 'rotate(' + a[4] + ' ' + a[0] + ' ' + a[1] + ')',
      fill: 'none', stroke: '#dc2626', 'stroke-width': 8 }, gVasos));
    vaso('eferente', EFERENTE, '#dc2626', 11);
    vaso('capilar',  CAPILAR,  '#e58a8a', 9);
    vaso('vena',     VENA,     '#3b6fd4', 15);

    // Cápsula de Bowman (espacio urinario + pared, abierta en el polo urinario)
    el('circle', { cx: 250, cy: 300, r: 58, fill: '#f4f7fb' }, gFondo);
    el('path', { d: 'M 294 263 A 58 58 0 1 0 294 337', fill: 'none',
      stroke: '#c2cedd', 'stroke-width': 7, 'stroke-linecap': 'round' }, gVasos);

    /* --- Túbulo --- */
    SEGS.forEach(s => {
      el('path', { d: s.d, fill: 'none', stroke: '#d9a93f', 'stroke-width': s.ancho + 7,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTubulo);
      const luz = el('path', {
        d: s.d, fill: 'none', stroke: '#fdf0c4', 'stroke-width': s.ancho,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        id: 'dm-' + s.id, class: 'dm-seg', 'data-seg': s.id
      }, gTubulo);
      E.paths[s.id] = luz;
      // zona de clic generosa, invisible
      const hit = el('path', { d: s.d, fill: 'none', stroke: 'transparent',
        'stroke-width': s.ancho + 26, 'stroke-linecap': 'round',
        class: 'dm-hit', 'data-seg': s.id }, gTubulo);
      hit.addEventListener('click', () => {
        const c = CLASES.find(c => c.seg.includes(s.id));
        if (c) seleccionar(c.id);
      });
    });

    /* --- Rótulos de segmento --- */
    const rot = (x, y, lineas, anchor) => {
      lineas.forEach((t, i) => {
        const n = el('text', { x, y: y + i * 18, class: 'dm-rot',
          'text-anchor': anchor || 'start' }, gRotulos);
        n.textContent = t;
      });
    };
    rot(336, 212, [t('map.prox1'), t('map.prox2')]);
    rot(538, 496, [t('map.desc1'), t('map.desc2')], 'end');
    rot(690, 496, [t('map.asc1'), t('map.asc2')]);
    rot(676, 176, [t('map.dist')]);
    rot(982, 330, [t('map.colCort1'), t('map.colCort2')]);
    rot(982, 596, [t('map.colMed1'), t('map.colMed2')]);
    rot(610, 704, [t('map.asa')], 'middle');
    el('text', { x: 104, y: 398, class: 'dm-rot' }, gRotulos).textContent = t('map.glomerulo');
    el('text', { x: 244, y: 436, class: 'dm-rot-chico' }, gRotulos)
      .textContent = t('map.capilares');

    /* --- Entrada de sangre y salida de orina --- */
    el('text', { x: 22, y: 196, class: 'dm-io dm-io-rojo' }, gRotulos).textContent = t('map.entraSangre');
    el('text', { x: 22, y: 216, class: 'dm-io-sub' }, gRotulos).textContent = t('map.aferente');
    el('text', { x: 22, y: 602, class: 'dm-io dm-io-azul' }, gRotulos).textContent = t('map.vuelveSangre');
    el('text', { x: 22, y: 622, class: 'dm-io-sub' }, gRotulos).textContent = t('map.reabsorbido');

    el('text', { x: 1012, y: 742, class: 'dm-io dm-io-ambar' }, gRotulos).textContent = t('map.saleOrina');
    el('text', { x: 1012, y: 762, class: 'dm-io-sub' }, gRotulos).textContent = t('map.noReabsorbio');
    el('path', { d: 'M 958 748 L 1002 748', stroke: '#64748b', 'stroke-width': 2.5,
      fill: 'none', 'marker-end': 'url(#dm-flecha)' }, gRotulos);

    /* --- Insignias numeradas, puestas sobre el propio túbulo --- */
    CLASES.forEach(c => {
      const base = E.paths[c.badge.seg];
      const pt = base.getPointAtLength(base.getTotalLength() * c.badge.t);
      const g = el('g', { class: 'dm-badge', 'data-clase': c.id }, gRotulos);
      el('circle', { cx: pt.x.toFixed(1), cy: pt.y.toFixed(1), r: 16, fill: c.color,
        stroke: '#fff', 'stroke-width': 3 }, g);
      const t = el('text', { x: pt.x.toFixed(1), y: (pt.y + 6).toFixed(1),
        'text-anchor': 'middle', class: 'dm-badge-n' }, g);
      t.textContent = c.n;
      g.addEventListener('click', () => { seleccionar(c.id); if (tieneZoom(c)) abrirZoom(c); });
    });

    /* --- Medir las rutas --- */
    E.rutaSangre = ['aferente', 'ovillo', 'eferente', 'capilar', 'vena']
      .map(id => ({ id, path: E.paths[id], len: E.paths[id].getTotalLength() }));
    E.rutaTubulo = SEGS.map(s => ({
      id: s.id, path: E.paths[s.id], len: E.paths[s.id].getTotalLength(), reab: s.reab
    }));
  }

  /* ---------- Partículas ---------- */

  function nuevaSangre() {
    E.particulas.push({ tipo: 'sangre', i: 0, d: 0, vel: 150 + Math.random() * 40,
      r: 4.6, filtrada: false });
  }
  function nuevoFiltrado() {
    E.cuenta.filtrado++;
    E.particulas.push({ tipo: 'filtrado', i: 0, d: 0, vel: 110 + Math.random() * 35, r: 5 });
  }

  function paso(dt) {
    // Entra sangre a ritmo constante
    E.acumSangre += dt * 7.5;
    while (E.acumSangre >= 1) { E.acumSangre--; nuevaSangre(); }

    const vivas = [];
    for (const p of E.particulas) {
      const ruta = p.tipo === 'sangre' ? E.rutaSangre : E.rutaTubulo;
      p.d += p.vel * dt;

      while (p.i < ruta.length && p.d > ruta[p.i].len) {
        p.d -= ruta[p.i].len;
        p.i++;

        if (p.tipo === 'sangre') {
          // Al salir del ovillo, una parte se filtra hacia el túbulo
          if (ruta[p.i - 1].id === 'ovillo' && Math.random() < 0.34) nuevoFiltrado();
        } else if (p.i < ruta.length) {
          // Reabsorción al entrar en el siguiente segmento
          const seg = ruta[p.i];
          const f = factorReab(seg.id);
          if (Math.random() < seg.reab * f) {
            E.cuenta.reab++;
            p.muerta = true;
            E.gotas.push(gotaEn(ruta[p.i - 1], 1, '#e05252'));
            break;
          }
        }
      }

      if (p.muerta) continue;
      if (p.i >= ruta.length) {
        if (p.tipo === 'filtrado') {
          E.cuenta.orina++;
          E.gotas.push({ x: 938, y: 740, vy: 40, vida: 1, color: '#d9a93f' });
        }
        continue;
      }
      vivas.push(p);
    }
    E.particulas = vivas;

    // Gotas de aviso (reabsorbido / orina)
    E.gotas = E.gotas.filter(g => {
      g.vida -= dt * 1.6;
      g.y += (g.vy || 0) * dt;
      return g.vida > 0;
    });
  }

  // Deja preparado el gancho para cuando se apliquen los diuréticos
  function factorReab() { return 1; }

  function gotaEn(seg, vida, color) {
    const pt = seg.path.getPointAtLength(seg.len * (0.5 + Math.random() * 0.4));
    return { x: pt.x, y: pt.y, vida, color, vy: 0 };
  }

  function pintar() {
    const c = E.capaParticulas;
    c.innerHTML = '';
    for (const p of E.particulas) {
      const ruta = p.tipo === 'sangre' ? E.rutaSangre : E.rutaTubulo;
      const seg = ruta[p.i];
      if (!seg) continue;
      const pt = seg.path.getPointAtLength(Math.min(p.d, seg.len));
      const atenuar = E.sel && p.tipo === 'filtrado' &&
        !CLASES.find(x => x.id === E.sel).seg.includes(seg.id);
      el('circle', {
        cx: pt.x.toFixed(1), cy: pt.y.toFixed(1), r: p.r,
        fill: p.tipo === 'sangre' ? '#d93b3b' : '#c98a16',
        opacity: atenuar ? '.3' : (p.tipo === 'sangre' ? '.9' : '.95')
      }, c);
    }
    for (const g of E.gotas) {
      el('circle', { cx: g.x.toFixed(1), cy: g.y.toFixed(1),
        r: (3 + (1 - g.vida) * 4).toFixed(1), fill: 'none',
        stroke: g.color, 'stroke-width': 2, opacity: Math.max(0, g.vida).toFixed(2) }, c);
    }
  }

  function bucle(ts) {
    if (!E.ultimo) E.ultimo = ts;
    let dt = (ts - E.ultimo) / 1000;
    E.ultimo = ts;
    if (dt > 0.1) dt = 0.1;          // la pestaña estuvo oculta
    paso(dt);
    pintar();
    requestAnimationFrame(bucle);
  }

  /* ---------- Panel de clases ---------- */

  function panel() {
    const cont = document.getElementById('dm-lista');
    if (!cont) return;
    cont.innerHTML = '';
    CLASES.forEach(c => {
      const d = document.createElement('button');
      d.className = 'dm-clase';
      d.dataset.clase = c.id;
      d.innerHTML =
        '<span class="dm-clase-n" style="background:' + c.color + '">' + c.n + '</span>' +
        '<span class="dm-clase-txt">' +
          '<b>' + C(c, 'nombre') + '</b>' +
          '<i>' + C(c, 'seg') + '</i>' +
        '</span>' +
        '<span class="dm-estado ' + (c.lista ? 'lista' : 'obra') + '">' +
          t(c.lista ? 'est.lista' : 'est.obra') + '</span>';
      d.addEventListener('click', () => seleccionar(c.id));
      cont.appendChild(d);
    });
  }

  function seleccionar(id) {
    E.sel = (E.sel === id) ? null : id;
    const c = CLASES.find(x => x.id === E.sel);

    document.querySelectorAll('.dm-clase').forEach(n =>
      n.classList.toggle('activa', !!c && n.dataset.clase === c.id));
    document.querySelectorAll('.dm-badge').forEach(n =>
      n.classList.toggle('apagada', !!c && n.dataset.clase !== c.id));

    SEGS.forEach(s => {
      const n = E.paths[s.id];
      const dentro = c && c.seg.includes(s.id);
      n.classList.toggle('dm-seg-on', !!dentro);
      n.classList.toggle('dm-seg-off', !!c && !dentro);
      // Los segmentos donde actúa la clase se tiñen con su color, para que se vean todos
      n.style.stroke = dentro ? 'color-mix(in srgb, ' + c.color + ' 32%, #fff)' : '';
    });

    obra(c && !c.lista ? c : null);

    const caja = document.getElementById('dm-detalle');
    if (!caja) return;
    if (!c) {
      caja.innerHTML = '<p class="dm-vacio">' + t('panel.vacio') + '</p>';
      resumen(null);
      return;
    }
    const hayZoom = tieneZoom(c);
    caja.innerHTML =
      '<div class="dm-det-cab" style="border-color:' + c.color + '">' +
        '<span class="dm-clase-n" style="background:' + c.color + '">' + c.n + '</span>' +
        '<b>' + C(c, 'nombre') + '</b>' +
      '</div>' +
      '<p class="dm-det-seg">' + C(c, 'seg') + '</p>' +
      '<p class="dm-det-corto">' + C(c, 'corto') + '</p>' +
      '<dl class="dm-det-datos">' +
        '<dt>' + t('det.diana') + '</dt><dd>' + C(c, 'diana') + '</dd>' +
        '<dt>' + t('det.potencia') + '</dt><dd>' + C(c, 'pot') + '</dd>' +
        '<dt>' + t('det.farmacos') + '</dt><dd>' + C(c, 'farm') + '</dd>' +
      '</dl>' +
      (hayZoom
        ? '<button class="btn btn-primary btn-secondary" id="dm-ver-cerca">' + t('btn.verCerca') + '</button>'
        : '<p class="dm-pronto">' + t('det.pronto') + '</p>');
    resumen(c);
    const b = document.getElementById('dm-ver-cerca');
    if (b) b.addEventListener('click', () => abrirZoom(c));
  }

  /* ---------- Clases en construcción: la obra reemplaza al riñón ---------- */

  function obra(c) {
    const v = document.getElementById('dm-obra-vista');
    if (!v) return;
    const enObra = !!c;
    v.hidden = !enObra;
    E.svg.style.display = enObra ? 'none' : '';
    const nota = document.getElementById('dm-nota');
    if (nota) nota.hidden = enObra;
    const p = document.getElementById('dm-obra-pronto');
    if (p) p.innerHTML = enObra ? t('obraV.pronto') + ' ' + C(c, 'pronto') : '';
    if (enObra) { v.classList.remove('obra-entra'); void v.offsetWidth; v.classList.add('obra-entra'); }
  }

  /* ---------- Resumen del diurético (bajo el título) ---------- */

  function resumen(c) {
    const n = document.getElementById('dm-resumen');
    if (!n) return;
    if (!c) { n.hidden = true; n.innerHTML = ''; return; }
    n.hidden = false;
    n.style.borderColor = c.color;
    n.innerHTML =
      '<span class="dm-clase-n" style="background:' + c.color + '">' + c.n + '</span>' +
      '<span>' + C(c, 'resumen') + '</span>';
  }

  /* ---------- Referencias (las 26 de PubMed) ---------- */

  function pintarRefs() {
    const ol = document.getElementById('dm-lista-refs');
    const R = window.DIU_REFS;
    if (!ol || !R) return;
    ol.innerHTML = R.map(r =>
      '<li value="' + parseInt(r.n, 10) + '">' + r.cita +
      ' <a href="' + r.doi + '" target="_blank" rel="noopener">DOI</a></li>').join('');
  }

  /* ---------- Leyenda de colores ---------- */

  const LEYENDA = ['na', 'k', 'cl', 'h', 'hco3', 'co2', 'h2o', 'glu', 'man'];

  function leyenda() {
    if (!NI.leyenda) return;
    NI.leyenda.crear({
      iones: LEYENDA,
      extras: [
        { color: '#d93b3b', clave: 'leyenda.sangre', nombre: 'Sangre (en el mapa)' },
        { color: '#c98a16', clave: 'leyenda.filtrado', nombre: 'Filtrado / orina (en el mapa)' }
      ]
    });
  }

  /* ---------- Acercamiento a la célula ---------- */

  function abrirZoom(c) {
    if (!tieneZoom(c)) return;
    const svg = document.getElementById('dz-svg');
    if (!NI.diuZoom.construir(svg, c.id)) return;
    E.zoom = c.id;
    const info = NI.diuZoom.info(c.id);
    document.getElementById('dz-titulo').textContent = info.titulo;
    document.getElementById('dz-farmaco').textContent = info.farmaco + ' · ' + info.diana;
    resumen(c);
    document.getElementById('dm-vista-mapa').hidden = true;
    const v = document.getElementById('dm-vista-zoom');
    v.hidden = false;
    v.classList.remove('dz-entra'); void v.offsetWidth; v.classList.add('dz-entra');
    pintarPasos(false);
    botonToggle(false);
  }

  function cerrarZoom() {
    if (NI.diuZoom) NI.diuZoom.cerrar();
    E.zoom = null;
    document.getElementById('dm-vista-zoom').hidden = true;
    document.getElementById('dm-vista-mapa').hidden = false;
    document.getElementById('dz-pasos').hidden = true;
    document.getElementById('dm-detalle').hidden = false;
  }

  function botonToggle(b) {
    const n = document.getElementById('dz-toggle');
    n.textContent = b ? t('btn.normal') : t('btn.conDiuretico');
    n.classList.toggle('btn-rojo', !b);
    // Cada acercamiento puede traer su propio pie (el manitol no bloquea nada)
    const info = E.zoom && NI.diuZoom ? NI.diuZoom.info(E.zoom) : null;
    const pie = b ? (info && info.pieBloqueo) || t('pie.bloqueo') : (info && info.pieNormal) || t('pie.normal');
    document.getElementById('dz-pie').textContent = pie;
  }

  function pintarPasos(b) {
    const ol = document.getElementById('dz-pasos');
    const det = document.getElementById('dm-detalle');
    if (!E.zoom) return;
    ol.innerHTML = '';
    ol.className = 'dz-pasos' + (b ? ' bloqueo' : '');
    NI.diuZoom.pasos(E.zoom, b).forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = t;
      ol.appendChild(li);
    });
    ol.hidden = false;
    det.hidden = true;
  }

  /* ---------- Arranque ---------- */

  // Adelanta la simulación sin esperar (para revisar en pruebas automáticas,
  // donde el navegador sin ventana congela requestAnimationFrame).
  function avanzar(segundos) {
    const n = Math.round(segundos * 60);
    for (let i = 0; i < n; i++) paso(1 / 60);
    pintar();
  }

  function init() {
    const svg = document.getElementById('dm-svg');
    if (!svg) return;
    dibujar(svg);
    panel();
    seleccionar(null);

    leyenda();
    pintarRefs();
    if (NI.i18n) {
      NI.i18n.pintarHTML();
      NI.i18n.alCambiar(() => {
        const sel = E.sel, zm = E.zoom, bl = E.bloqueo;
        NI.i18n.pintarHTML();
        dibujar(document.getElementById('dm-svg'));
        panel();
        E.sel = null; seleccionar(sel);
        if (zm) {
          const c = CLASES.find(x => x.id === zm);
          if (c) {
            abrirZoom(c);
            if (bl) { E.bloqueo = true; NI.diuZoom.setBloqueo(true); botonToggle(true); pintarPasos(true); }
          }
        }
      });
      const sw = document.getElementById('dm-lang');
      if (sw) {
        const marcar = () => sw.querySelectorAll('button').forEach(b =>
          b.classList.toggle('activo', b.dataset.lang === NI.i18n.lang));
        sw.querySelectorAll('button').forEach(b =>
          b.addEventListener('click', () => NI.i18n.set(b.dataset.lang)));
        NI.i18n.alCambiar(marcar);
        marcar();
      }
    }

    const volver = document.getElementById('dz-volver');
    if (volver) volver.addEventListener('click', cerrarZoom);
    const tog = document.getElementById('dz-toggle');
    if (tog) tog.addEventListener('click', () => {
      E.bloqueo = !E.bloqueo;
      NI.diuZoom.setBloqueo(E.bloqueo);
      botonToggle(E.bloqueo);
      pintarPasos(E.bloqueo);
    });
    if (location.hash === '#prueba') avanzar(40);
    // Enlace directo a una clase: diureticos.html?clase=tia
    const par = new URLSearchParams(location.search);
    const q = par.get('clase');
    const c = CLASES.find(x => x.id === q);
    if (c) {
      seleccionar(c.id);
      // ...&zoom=1 abre el acercamiento; &bloqueo=1 lo abre ya con el diurético
      if (par.get('zoom') === '1' && tieneZoom(c)) {
        abrirZoom(c);
        if (location.hash === '#prueba' && NI.diuZoom.avanzar) NI.diuZoom.avanzar(30);
        if (par.get('bloqueo') === '1') {
          E.bloqueo = true;
          NI.diuZoom.setBloqueo(true);
          botonToggle(true);
          pintarPasos(true);
          if (location.hash === '#prueba' && NI.diuZoom.avanzar) NI.diuZoom.avanzar(30);
        }
      }
    }
    requestAnimationFrame(bucle);
  }

  window.NI = window.NI || {};
  window.NI.diu = { init, avanzar, CLASES, SEGS, E };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

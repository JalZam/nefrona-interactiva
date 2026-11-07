/* ============================================================
   DIURÉTICOS — acercamiento a la célula de cada segmento.
   Mismo estilo que la página de la acidosis: luz arriba, célula arena,
   sangre abajo, círculos azules (pasivo) / verdes con ATP (activo),
   flechas negras con el ion, partículas que rebotan con ✕ al bloquearse.

   REGLA DE ORO: nada se mueve "por su cuenta". Cada transportador y cada
   enzima tiene su cuenta (estequiometría) y NO funciona hasta tenerla
   completa: la bomba espera 3 Na⁺ y 2 K⁺, el NBCe1 espera 1 Na⁺ y 3 HCO₃⁻,
   el NHE3 espera 1 Na⁺ y 1 H⁺, la AC II espera 1 CO₂ y 1 H₂O y entonces
   produce 1 H⁺ Y 1 HCO₃⁻ a la vez. Si falta un sustrato no pasa nada:
   por eso, al bloquear las anhidrasas, la cadena entera se detiene sola.

   Usa el motor NI.particulas (colas de espera). Expone NI.diuZoom.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';
  const t = k => (NI.i18n ? NI.i18n.t(k) : k);

  const W = 1260, H = 720;
  const AP = 170, BL = 520;              // membranas apical y basolateral

  const el = (tag, a, hijos) => {
    const n = document.createElementNS(NS, tag);
    for (const k in a) if (a[k] != null) n.setAttribute(k, a[k]);
    (hijos || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  };
  const txt = (x, y, s, cls, extra) => {
    const n = el('text', Object.assign({ x, y, class: cls }, extra || {}));
    n.innerHTML = s; return n;
  };

  /* ---------- Piezas del dibujo ---------- */

  function banda(svg, y, h, cls, titulo, tcls) {
    svg.appendChild(el('rect', { x: 0, y, width: W, height: h, class: cls }));
    if (titulo) svg.appendChild(txt(22, y + 30, titulo, 'np-banda-titulo ' + (tcls || '')));
  }
  function celula(svg, x0, x1, titulo, tx, ty) {
    svg.appendChild(el('path', { class: 'np-celula',
      d: `M${x0} ${AP} H${x1} V${BL - 55} Q${x1} ${BL} ${x1 - 55} ${BL} H${x0 + 55} Q${x0} ${BL} ${x0} ${BL - 55} Z` }));
    (Array.isArray(titulo) ? titulo : [titulo]).forEach((l, i) =>
      svg.appendChild(txt(tx != null ? tx : (x0 + x1) / 2, (ty != null ? ty : AP + 54) + i * 22, l, 'np-celula-titulo')));
  }
  function bomba(svg, c) {
    const r = c.r || 34;
    const g = el('g', { class: `glifo bomba ${c.clase}`, id: c.id });
    g.setAttribute('transform', `translate(${c.x},${c.y})`);
    g.appendChild(el('circle', { class: 'np-halo', r: r + 10 }));
    g.appendChild(el('circle', { class: 'sub', r }));
    (Array.isArray(c.etiqueta) ? c.etiqueta : [c.etiqueta]).forEach((l, i, a) =>
      g.appendChild(txt(0, (i - (a.length - 1) / 2) * 15 + 5, l, 'glifo-txt')));
    if (c.clase === 'activo') g.appendChild(txt(0, r - 6, 'ATP', 'glifo-atp'));
    g.appendChild(txt(0, c.y === AP ? r + 24 : -r - 14, c.nombre, 'glifo-nombre'));
    g.appendChild(txt(0, 6, '✕', 'x'));
    svg.appendChild(g);
  }
  function canal(svg, c) {
    const g = el('g', { class: 'glifo canal', id: c.id });
    g.setAttribute('transform', `translate(${c.x},${c.y})`);
    g.appendChild(el('rect', { class: 'canal-hueco', x: -11, y: -6, width: 22, height: 12 }));
    g.appendChild(el('line', { class: 'sub', x1: -10, y1: -15, x2: -10, y2: 15 }));
    g.appendChild(el('line', { class: 'sub', x1: 10, y1: -15, x2: 10, y2: 15 }));
    g.appendChild(txt(0, c.y === AP ? 36 : -24, c.nombre, 'glifo-nombre'));
    g.appendChild(txt(0, 6, '✕', 'x'));
    svg.appendChild(g);
  }
  function enzima(svg, c) {
    const g = el('g', { class: 'glifo enzima', id: c.id });
    g.setAttribute('transform', `translate(${c.x},${c.y})`);
    g.appendChild(el('rect', { class: 'np-halo', x: -72, y: -30, width: 144, height: 60, rx: 14 }));
    g.appendChild(el('rect', { class: 'sub', x: -66, y: -26, width: 132, height: 52, rx: 11 }));
    g.appendChild(txt(0, -4, c.nombre, 'enz-titulo'));
    g.appendChild(txt(0, 15, c.sub, 'enz-sub'));
    g.appendChild(txt(92, 10, '✕', 'x'));
    svg.appendChild(g);
  }
  function flecha(svg, id, d, cls) {
    svg.appendChild(el('path', { id, class: 'np-flecha ' + (cls || ''), d, 'marker-end': 'url(#dz-punta)' }));
  }
  function pila(svg, id, x, y, etiqueta) {
    const g = el('g', { id, class: 'np-pila vacia', transform: `translate(${x},${y})` });
    g.appendChild(txt(0, -26, etiqueta, 'np-pila-txt', { 'text-anchor': 'middle' }));
    svg.appendChild(g);
  }

  /* ============================================================
     Clase 1 — inhibidores de la anhidrasa carbónica (túbulo proximal)
     ============================================================ */

  const PROXIMAL = {
    id: 'iac',
    get titulo() { return t('z.iac.titulo'); },
    get farmaco() { return t('z.iac.farmaco'); },
    get diana() { return t('cls.iac.diana'); },
    get normal() { return [1, 2, 3, 4, 5, 6, 7, 8].map(i => t('z.iac.n' + i)); },
    get bloqueo() { return [1, 2, 3, 4, 5, 6, 7, 8].map(i => t('z.iac.b' + i)); },

    dibujar(svg) {
      banda(svg, 0, AP, 'np-luz', t('z.luz'));
      banda(svg, BL, H - BL, 'np-sangre', t('z.sangre'), 'sangre');
      celula(svg, 150, 1010, [t('z.celula1'), t('z.celula2')], 236, 252);

      /* --- Caminos (las partículas viajan por ellos) --- */
      flecha(svg, 'dz-luz-na',   'M 20 62 H 1046', 'tenue');
      flecha(svg, 'dz-luz-hco3', 'M 20 112 H 1046', 'tenue');

      // Entradas a las colas
      flecha(svg, 'p-naAlNhe3',  'M 300 66 V 100');
      flecha(svg, 'p-hco3AlAc4', 'M 470 112 H 556');
      flecha(svg, 'p-kAlBomba',  'M 420 668 V 606');

      // El NHE3 reparte: H⁺ a la luz (hacia la AC IV) y Na⁺ a la célula
      flecha(svg, 'p-hALuz',      'M 402 136 C 428 100, 540 104, 628 140');
      flecha(svg, 'p-naAlaBomba', 'M 348 206 C 330 290, 292 370, 278 430');
      flecha(svg, 'p-naAlNbc',    'M 386 210 C 520 300, 672 368, 734 430');

      // Lo que sale de la AC IV entra a la célula y espera a la AC II
      flecha(svg, 'p-co2Dentro', 'M 648 140 C 642 190, 634 216, 630 244');
      flecha(svg, 'p-h2oDentro', 'M 712 140 V 244');

      // Lo que produce la AC II: H⁺ al NHE3 y HCO₃⁻ al NBCe1 (siempre los dos)
      flecha(svg, 'p-hAlNhe3',   'M 614 296 C 540 290, 472 262, 432 230');
      flecha(svg, 'p-hco3AlNbc', 'M 744 314 C 802 350, 832 392, 838 430');

      // Salidas a la sangre
      flecha(svg, 'p-hco3ASangre', 'M 800 556 V 664');
      flecha(svg, 'p-naASangreN',  'M 762 556 V 664');
      flecha(svg, 'p-naASangreB',  'M 312 558 V 664');
      // El K⁺ que mete la bomba se recicla por el canal de K⁺
      flecha(svg, 'p-kAlaCelula',  'M 350 480 C 384 452, 446 452, 468 486');
      flecha(svg, 'p-kASangre',    'M 476 556 V 664');

      /* --- Ancla: lo que venga después tapa a las partículas --- */
      svg.appendChild(el('g', { id: 'capa-particulas-ancla' }));

      /* --- Canales, enzimas y rótulos --- */
      bomba(svg, { id: 'dz-nhe3', x: 370, y: AP, clase: 'pasivo', etiqueta: ['Na⁺', 'H⁺'], nombre: 'NHE3' });
      enzima(svg, { id: 'dz-ca4', x: 672, y: 108, nombre: 'AC IV', sub: t('z.ac4sub') });
      enzima(svg, { id: 'dz-ca2', x: 680, y: 300, nombre: 'AC II', sub: t('z.ac2sub') });
      bomba(svg, { id: 'dz-nbce1', x: 790, y: BL, clase: 'pasivo', r: 36,
        etiqueta: ['1 Na⁺', '3 HCO₃⁻'], nombre: 'NBCe1' });
      bomba(svg, { id: 'dz-nak', x: 330, y: BL, clase: 'activo', r: 38,
        etiqueta: ['3 Na⁺', '2 K⁺'], nombre: t('z.nak') });
      canal(svg, { id: 'dz-kcanal', x: 476, y: BL, nombre: t('z.kcanal') });

      // Cajón de orina
      svg.appendChild(el('rect', { x: 1072, y: 20, width: 172, height: 124, rx: 12, class: 'np-orina' }));
      svg.appendChild(txt(1158, 46, t('z.orina'), 'np-banda-titulo', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 76, t('z.uHco3') + ' <tspan id="dz-u-hco3"></tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 100, t('z.uPh') + ' <tspan id="dz-u-ph"></tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 124, t('z.uVol') + ' <tspan id="dz-u-vol"></tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));

      pila(svg, 'dz-pila-na', 930, 50, t('z.pilaNa'));
      pila(svg, 'dz-pila-hco3', 930, 136, t('z.pilaHco3'));
    },

    /* --- Las cuentas de cada transportador y enzima --- */
    colas(esc, api) {
      const varias = (id, n, s) => api.varias(id, n, s);

      // NHE3: 1 Na⁺ de la luz + 1 H⁺ de dentro → mete el Na⁺ y saca el H⁺
      esc.cola('nhe3', {
        slots: {
          na: { x: 300, y: 104, n: 1, tope: 2, cols: 1, dy: -26 },
          h:  { x: 432, y: 226, n: 1, tope: 2, cols: 1, dy: 26 }
        },
        alCompletar: () => { api.ocio = 0; esc.emitir('p-hALuz'); api.repartirNa(); }
      });

      // AC IV (luz): 1 H⁺ + 1 HCO₃⁻ → H₂CO₃ → 1 CO₂ + 1 H₂O
      esc.cola('ac4', {
        slots: {
          h:    { x: 636, y: 152, n: 1, tope: 2, cols: 1, dy: 24 },
          hco3: { x: 560, y: 112, n: 1, tope: 3, cols: 1, dy: -26 }
        },
        alCompletar: () => { esc.emitir('p-co2Dentro'); esc.emitir('p-h2oDentro'); }
      });

      // AC II (célula): 1 CO₂ + 1 H₂O → 1 H⁺ + 1 HCO₃⁻ (los dos, siempre juntos)
      esc.cola('ac2', {
        slots: {
          co2: { x: 628, y: 246, n: 1, tope: 2, cols: 1, dy: -24 },
          h2o: { x: 714, y: 246, n: 1, tope: 2, cols: 1, dy: -24 }
        },
        alCompletar: () => { esc.emitir('p-hAlNhe3'); esc.emitir('p-hco3AlNbc'); }
      });

      // NBCe1: 1 Na⁺ + 3 HCO₃⁻ → salen los cuatro juntos a la sangre
      esc.cola('nbce1', {
        slots: {
          na:   { x: 738, y: 432, n: 1, tope: 2, cols: 1, dy: -26 },
          hco3: { x: 842, y: 432, n: 3, tope: 4, cols: 1, dy: -26 }
        },
        alCompletar: () => { esc.emitir('p-naASangreN'); varias('p-hco3ASangre', 3, 0.16); }
      });

      // Bomba Na⁺/K⁺: 3 Na⁺ de dentro + 2 K⁺ de la sangre
      esc.cola('nak', {
        slots: {
          na: { x: 276, y: 428, n: 3, tope: 4, cols: 1, dy: -26 },
          k:  { x: 420, y: 600, n: 2, tope: 3, cols: 1, dy: 26 }
        },
        alCompletar: () => { varias('p-naASangreB', 3, 0.16); varias('p-kAlaCelula', 2, 0.2); }
      });
    },

    /* --- Caminos: cada uno deja su partícula aparcada donde corresponde --- */
    corrientes(esc, api) {
      const A = (cola, slot) => (e, p) => { e.aparcar(cola, slot, p.c.ion, true); };

      // La luz solo pasa de largo (filtrado que sigue hacia la orina)
      esc.agregar('luzNa',   { path: 'dz-luz-na',   ion: 'na',   tasa: 1.4, velocidad: 115 });
      esc.agregar('luzHco3', { path: 'dz-luz-hco3', ion: 'hco3', tasa: 1.3, velocidad: 115 });

      // Entradas (solo se emiten cuando hay sitio en la cola de destino)
      esc.agregar('p-naAlNhe3',  { path: 'p-naAlNhe3',  ion: 'na',   modo: 'cadena', velocidad: 80, alLlegar: A('nhe3', 'na') });
      esc.agregar('p-hco3AlAc4', { path: 'p-hco3AlAc4', ion: 'hco3', modo: 'cadena', velocidad: 90, alLlegar: A('ac4', 'hco3') });
      esc.agregar('p-kAlBomba',  { path: 'p-kAlBomba',  ion: 'k',    modo: 'cadena', velocidad: 85, alLlegar: A('nak', 'k') });

      // Salidas del NHE3
      esc.agregar('p-hALuz', { path: 'p-hALuz', ion: 'h', modo: 'cadena', velocidad: 95,
        alLlegar: (e) => { if (api.bloqueado()) e.rebote(636, 146, 'h'); else e.aparcar('ac4', 'h', 'h', true); } });
      esc.agregar('p-naAlaBomba', { path: 'p-naAlaBomba', ion: 'na', modo: 'cadena', velocidad: 85, alLlegar: A('nak', 'na') });
      esc.agregar('p-naAlNbc',    { path: 'p-naAlNbc',    ion: 'na', modo: 'cadena', velocidad: 85, alLlegar: A('nbce1', 'na') });

      // Salidas de la AC IV
      esc.agregar('p-co2Dentro', { path: 'p-co2Dentro', ion: 'co2', modo: 'cadena', velocidad: 80, alLlegar: A('ac2', 'co2') });
      esc.agregar('p-h2oDentro', { path: 'p-h2oDentro', ion: 'h2o', modo: 'cadena', velocidad: 80, alLlegar: A('ac2', 'h2o') });

      // Salidas de la AC II
      esc.agregar('p-hAlNhe3',   { path: 'p-hAlNhe3',   ion: 'h',    modo: 'cadena', velocidad: 95, alLlegar: A('nhe3', 'h') });
      esc.agregar('p-hco3AlNbc', { path: 'p-hco3AlNbc', ion: 'hco3', modo: 'cadena', velocidad: 90, alLlegar: A('nbce1', 'hco3') });

      // Salidas a la sangre y reciclaje del K⁺
      esc.agregar('p-hco3ASangre', { path: 'p-hco3ASangre', ion: 'hco3', modo: 'cadena', velocidad: 90 });
      esc.agregar('p-naASangreN',  { path: 'p-naASangreN',  ion: 'na',   modo: 'cadena', velocidad: 90 });
      esc.agregar('p-naASangreB',  { path: 'p-naASangreB',  ion: 'na',   modo: 'cadena', velocidad: 90 });
      esc.agregar('p-kAlaCelula',  { path: 'p-kAlaCelula',  ion: 'k',    modo: 'cadena', velocidad: 85,
        alLlegar: e => e.emitir('p-kASangre') });   // el canal de K⁺ es 1:1: no espera a nadie
      esc.agregar('p-kASangre',    { path: 'p-kASangre',    ion: 'k',    modo: 'cadena', velocidad: 90 });
    },

    /* --- Quién alimenta la cadena en cada tic --- */
    paso(esc, dt, bloqueo, api) {
      // La cadena es un círculo: el NHE3 necesita el H⁺ que fabrica la AC II,
      // y la AC II necesita el CO₂ que viene del H⁺ del NHE3. La célula siempre
      // tiene algo de H⁺ de su propio metabolismo: con eso arranca el ciclo.
      api.ocio = (api.ocio || 0) + dt;
      if (!bloqueo && api.ocio > 2 && esc.cuenta('nhe3', 'h') === 0) {
        esc.aparcar('nhe3', 'h', 'h');
        api.ocio = 0;
      }

      api.acum.na   = (api.acum.na   || 0) + dt * 1.9;
      api.acum.hco3 = (api.acum.hco3 || 0) + dt * 1.9;
      api.acum.k    = (api.acum.k    || 0) + dt * 1.3;

      while (api.acum.na >= 1) {
        api.acum.na -= 1;
        if (esc.hayCupo('nhe3', 'na')) { esc.reservar('nhe3', 'na'); esc.emitir('p-naAlNhe3'); }
        else if (bloqueo) api.pila('dz-pila-na', 'na');   // el NHE3 está parado: el Na⁺ sigue de largo
      }
      while (api.acum.hco3 >= 1) {
        api.acum.hco3 -= 1;
        if (!bloqueo && esc.hayCupo('ac4', 'hco3')) { esc.reservar('ac4', 'hco3'); esc.emitir('p-hco3AlAc4'); }
        else if (bloqueo) { esc.rebote(592, 112, 'hco3'); api.pila('dz-pila-hco3', 'hco3'); }
      }
      while (api.acum.k >= 1) {
        api.acum.k -= 1;
        if (esc.hayCupo('nak', 'k')) { esc.reservar('nak', 'k'); esc.emitir('p-kAlBomba'); }
      }
    },

    /* --- Estado de los glifos y del cajón de orina --- */
    estado(b) {
      return {
        glifos: {
          'dz-ca4': b ? 'off' : 'ok', 'dz-ca2': b ? 'off' : 'ok',
          'dz-nhe3': b ? 'parcial' : 'ok', 'dz-nbce1': b ? 'parcial' : 'ok',
          'dz-nak': 'ok', 'dz-kcanal': 'ok'
        },
        orina: b
          ? { hco3: t('z.v.mucho'), ph: t('z.v.alcalino'), vol: t('z.v.aumentado') }
          : { hco3: t('z.v.casiNada'), ph: t('z.v.acido'), vol: t('z.v.normal') }
      };
    }
  };

  const ZOOMS = { iac: PROXIMAL };

  /* ---------- Motor de la vista ---------- */

  const Z = { svg: null, esc: null, def: null, bloqueo: false, run: 0, acum: {}, turnoNa: 0, salidas: [] };

  const API = {
    acum: Z.acum,
    ocio: 0,
    bloqueado: () => Z.bloqueo,
    // Suelta n partículas por el mismo camino, separadas unos segundos.
    // No usa temporizadores: se vacía en el tic, así nada sale después de bloquear.
    varias: (id, n, seg) => {
      for (let i = 0; i < n; i++) Z.salidas.push({ id, t: i * (seg || 0.15) });
    },
    pila: (id, ionId) => sumarPila(id, ionId),
    // El Na⁺ que entró por el NHE3 va a la bomba (3 por ciclo) o al NBCe1 (1 por ciclo)
    repartirNa: () => {
      const e = Z.esc; if (!e) return;
      const tocaNbc = (Z.turnoNa++ % 4) === 3;
      const puedeNbc = e.hayCupo('nbce1', 'na');
      const puedeBomba = e.hayCupo('nak', 'na');
      if (tocaNbc && puedeNbc) { e.reservar('nbce1', 'na'); e.emitir('p-naAlNbc'); }
      else if (puedeBomba) { e.reservar('nak', 'na'); e.emitir('p-naAlaBomba'); }
      else if (puedeNbc) { e.reservar('nbce1', 'na'); e.emitir('p-naAlNbc'); }
    }
  };

  function construir(svg, claseId) {
    const def = ZOOMS[claseId];
    if (!def) return false;
    Z.def = def; Z.svg = svg; Z.bloqueo = false; Z.turnoNa = 0; Z.salidas = [];
    Z.acum = {}; API.acum = Z.acum; API.ocio = 2;
    const token = ++Z.run;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const defs = el('defs', {});
    const m = el('marker', { id: 'dz-punta', viewBox: '0 0 10 10', refX: '9', refY: '5',
      markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
    m.appendChild(el('path', { d: 'M 0 1 L 9 5 L 0 9 z', fill: '#1f2937' }));
    defs.appendChild(m); svg.appendChild(defs);

    def.dibujar(svg);
    Z.esc = NI.particulas.crearEscena(svg, { radio: 11, fuente: 9, maxParticulas: 170, escalaLarga: 1.38 });
    def.colas(Z.esc, API);
    def.corrientes(Z.esc, API);
    aplicar(false);

    let ult = 0;
    const bucle = (ts) => {
      if (Z.run !== token || !Z.svg) return;
      if (!ult) ult = ts;
      let dt = (ts - ult) / 1000; ult = ts;
      if (dt > 0.1) dt = 0.1;
      soltarPendientes(dt);
      Z.def.paso(Z.esc, dt, Z.bloqueo, API);
      Z.esc.tick(dt);
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
    return true;
  }

  // Adelanta la animación sin esperar (pruebas automáticas: el navegador sin
  // ventana congela requestAnimationFrame)
  function avanzar(segundos) {
    if (!Z.esc) return;
    const n = Math.round(segundos * 60);
    for (let i = 0; i < n; i++) { soltarPendientes(1 / 60); Z.def.paso(Z.esc, 1 / 60, Z.bloqueo, API); Z.esc.tick(1 / 60); }
  }

  function soltarPendientes(dt) {
    if (!Z.salidas.length || !Z.esc) return;
    const quedan = [];
    for (const s of Z.salidas) {
      s.t -= dt;
      if (s.t <= 0) Z.esc.emitir(s.id); else quedan.push(s);
    }
    Z.salidas = quedan;
  }

  function sumarPila(id, ionId) {
    if (!Z.svg) return;
    const g = Z.svg.querySelector('#' + id);
    if (!g) return;
    const hay = g.querySelectorAll('circle').length;
    if (hay >= 12) return;
    const ion = NI.iones[ionId];
    const cols = 6;
    g.appendChild(el('circle', { cx: (hay % cols) * 21 - 53, cy: Math.floor(hay / cols) * 21 - 4,
      r: 9, fill: ion.color }));
    g.classList.remove('vacia');
  }
  function vaciarPilas() {
    if (!Z.svg) return;
    ['dz-pila-na', 'dz-pila-hco3'].forEach(id => {
      const g = Z.svg.querySelector('#' + id);
      if (g) { g.querySelectorAll('circle').forEach(c => c.remove()); g.classList.add('vacia'); }
    });
  }

  function aplicar(b) {
    const e = Z.def.estado(b);
    for (const id in e.glifos) {
      const n = Z.svg.querySelector('#' + id);
      if (!n) continue;
      n.classList.remove('ok', 'parcial', 'off');
      n.classList.add(e.glifos[id]);
    }
    const set = (id, v) => { const n = Z.svg.querySelector('#' + id); if (n) n.textContent = v; };
    set('dz-u-hco3', e.orina.hco3); set('dz-u-ph', e.orina.ph); set('dz-u-vol', e.orina.vol);
  }

  function setBloqueo(b) {
    if (!Z.def || !Z.esc) return;
    Z.bloqueo = !!b;
    // Al cambiar de estado se vacía todo: nada se queda a medias de un ciclo anterior
    Z.esc.limpiar();
    Z.salidas = [];
    Z.turnoNa = 0;
    Z.acum = {}; API.acum = Z.acum; API.ocio = 2;
    vaciarPilas();
    aplicar(Z.bloqueo);
  }

  function cerrar() {
    Z.run++; Z.svg = null; Z.def = null; Z.esc = null;
  }

  NI.diuZoom = { construir, setBloqueo, cerrar, avanzar, ZOOMS,
    hay: id => !!ZOOMS[id],
    pasos: (id, b) => ZOOMS[id] ? (b ? ZOOMS[id].bloqueo : ZOOMS[id].normal) : [],
    info: id => ZOOMS[id] || null };

})(typeof window !== 'undefined' ? window : globalThis);

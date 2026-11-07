/* ============================================================
   DIURÉTICOS — acercamiento a la célula de cada segmento.
   Mismo estilo que la página de la acidosis: luz arriba, célula arena,
   sangre abajo, círculos azules (pasivo) / verdes con ATP (activo),
   flechas negras con el ion, partículas que rebotan con ✕ al bloquearse.
   Usa el motor NI.particulas. Expone NI.diuZoom.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const NS = 'http://www.w3.org/2000/svg';

  const W = 1260, H = 720;
  const AP = 170, BL = 520;              // membranas apical y basolateral

  const el = (t, a, hijos) => {
    const n = document.createElementNS(NS, t);
    for (const k in a) if (a[k] != null) n.setAttribute(k, a[k]);
    (hijos || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  };
  const txt = (x, y, t, cls, extra) => {
    const n = el('text', Object.assign({ x, y, class: cls }, extra || {}));
    n.innerHTML = t; return n;
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
    const g = el('g', { class: `glifo bomba ${c.clase} ${c.estatico ? 'estatico' : ''}`, id: c.id });
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

  /* ---------- Clase 1: inhibidores de la anhidrasa carbónica ---------- */

  const PROXIMAL = {
    id: 'iac',
    titulo: 'Túbulo contorneado proximal',
    farmaco: 'Acetazolamida',
    diana: 'Anhidrasa carbónica (IV en el borde en cepillo, II dentro de la célula)',

    normal: [
      'El filtrado trae Na⁺ y el HCO₃⁻ que se filtró en el glomérulo.',
      'El NHE3 mete Na⁺ a la célula y saca H⁺ a la luz.',
      'En la luz, ese H⁺ se une al HCO₃⁻ y forma H₂CO₃. La <b>anhidrasa carbónica IV</b> lo parte en CO₂ y H₂O.',
      'El CO₂ y el H₂O entran a la célula sin necesidad de transportador.',
      'Dentro, la <b>anhidrasa carbónica II</b> los vuelve a juntar: H⁺ y HCO₃⁻ otra vez.',
      'El H⁺ se recicla por el NHE3 y el HCO₃⁻ sale a la sangre por el NBCe1 (1 Na⁺ : 3 HCO₃⁻).',
      'La bomba Na⁺/K⁺ mantiene el Na⁺ bajo dentro de la célula: es la que hace posible todo lo anterior.',
      'Resultado: se recupera casi todo el HCO₃⁻ filtrado y la orina sale prácticamente sin bicarbonato.'
    ],
    bloqueo: [
      'La acetazolamida bloquea las dos anhidrasas carbónicas, la IV de la luz y la II de dentro.',
      'En la luz el H₂CO₃ ya no se parte: el <b>HCO₃⁻ se queda</b> y empieza a acumularse.',
      'Sin CO₂ ni H₂O entrando, dentro de la célula no se fabrica H⁺.',
      'Sin H⁺ que sacar, el <b>NHE3 se frena</b> y deja de meter Na⁺.',
      'El Na⁺ y el HCO₃⁻ siguen de largo por el túbulo, y el <b>agua va detrás</b>: el paciente orina más.',
      'Llega menos HCO₃⁻ a la sangre por el NBCe1.',
      'En la orina: más bicarbonato, pH alcalino. En la sangre: baja el HCO₃⁻ y sube el Cl⁻ → <b>acidosis metabólica hiperclorémica</b>.',
      'Es autolimitado: al bajar el HCO₃⁻ de la sangre se filtra menos, y el fármaco se queda sin sustrato.'
    ],

    dibujar(svg) {
      banda(svg, 0, AP, 'np-luz', 'LUZ DEL TÚBULO  →  hacia la orina');
      banda(svg, BL, H - BL, 'np-sangre', 'SANGRE / INTERSTICIO', 'sangre');
      celula(svg, 150, 1010, ['Célula del túbulo', 'contorneado proximal'], 248, 410);

      /* --- 1) Primero los caminos: las partículas viajan por ellos --- */

      // La luz, de izquierda a derecha (pasa por detrás de la AC IV)
      flecha(svg, 'dz-luz-na',   `M 20 62 H 1046`, 'tenue');
      flecha(svg, 'dz-luz-hco3', `M 20 112 H 1046`, 'tenue');

      // NHE3: Na⁺ entra, H⁺ sale
      flecha(svg, 'dz-na-in', `M 330 70 V ${AP - 36}`);
      flecha(svg, 'dz-h-out', `M 410 ${AP - 36} V 78`);

      // El HCO₃⁻ de la luz entra por detrás de la AC IV y allí desaparece
      flecha(svg, 'dz-hco3-ac4', `M 470 112 H 672`);

      // Lo que sale de la AC IV entra a la célula
      flecha(svg, 'dz-co2-in', `M 648 140 V 262`);
      flecha(svg, 'dz-h2o-in', `M 712 140 V 262`);

      // De la AC II: el H⁺ se recicla y el HCO₃⁻ se va a la sangre por el NBCe1
      flecha(svg, 'dz-h-recicla', `M 614 294 C 520 282, 430 268, 398 ${AP + 30}`);
      flecha(svg, 'dz-hco3-nbc',  `M 736 322 C 788 360, 806 430, 800 656`);
      // El NBCe1 lleva 1 Na⁺ junto con los 3 HCO₃⁻
      flecha(svg, 'dz-na-nbc', `M 762 392 V 656`);

      // Bomba Na⁺/K⁺: saca 3 Na⁺ y mete 2 K⁺ (los dos pasan por ella)
      flecha(svg, 'dz-na-bomba', `M 318 ${AP + 36} C 304 300, 302 430, 312 656`);
      flecha(svg, 'dz-k-bomba',  `M 350 656 V 430`);

      /* --- 2) El ancla: todo lo que venga después tapa a las partículas --- */
      svg.appendChild(el('g', { id: 'capa-particulas-ancla' }));

      /* --- 3) Canales, enzimas y rótulos: van por encima --- */
      bomba(svg, { id: 'dz-nhe3', x: 370, y: AP, clase: 'pasivo', etiqueta: ['Na⁺', 'H⁺'], nombre: 'NHE3' });
      enzima(svg, { id: 'dz-ca4', x: 672, y: 108, nombre: 'AC IV', sub: 'H₂CO₃ → CO₂ + H₂O' });
      enzima(svg, { id: 'dz-ca2', x: 680, y: 300, nombre: 'AC II', sub: 'CO₂ + H₂O → H⁺ + HCO₃⁻' });
      bomba(svg, { id: 'dz-nbce1', x: 790, y: BL, clase: 'pasivo', r: 36,
        etiqueta: ['1 Na⁺', '3 HCO₃⁻'], nombre: 'NBCe1' });
      bomba(svg, { id: 'dz-nak', x: 330, y: BL, clase: 'activo', r: 38,
        etiqueta: ['3 Na⁺', '2 K⁺'], nombre: 'Na⁺/K⁺-ATPasa' });

      // Cajón de orina
      svg.appendChild(el('rect', { x: 1072, y: 20, width: 172, height: 124, rx: 12, class: 'np-orina' }));
      svg.appendChild(txt(1158, 46, 'ORINA', 'np-banda-titulo', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 76, 'HCO₃⁻: <tspan id="dz-u-hco3">casi nada</tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 100, 'pH: <tspan id="dz-u-ph">ácido</tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));
      svg.appendChild(txt(1158, 124, 'Volumen: <tspan id="dz-u-vol">normal</tspan>', 'dz-orina-l', { 'text-anchor': 'middle' }));

      // Pilas de acumulación en la luz (solo se llenan con el bloqueo)
      pila(svg, 'dz-pila-na', 930, 50, 'Na⁺ que sigue de largo');
      pila(svg, 'dz-pila-hco3', 930, 134, 'HCO₃⁻ que se pierde');
    },

    corrientes(esc) {
      esc.agregar('luzNa',    { path: 'dz-luz-na',   ion: 'na',   tasa: 1.5, velocidad: 110 });
      esc.agregar('luzHco3',  { path: 'dz-luz-hco3', ion: 'hco3', tasa: 1.4, velocidad: 110 });
      esc.agregar('naIn',     { path: 'dz-na-in',    ion: 'na',   tasa: 1.3, velocidad: 85 });
      esc.agregar('hOut',     { path: 'dz-h-out',    ion: 'h',    tasa: 1.3, velocidad: 85 });
      esc.agregar('hco3Ac4',  { path: 'dz-hco3-ac4', ion: 'hco3', tasa: 1.3, velocidad: 90 });
      esc.agregar('co2In',    { path: 'dz-co2-in',   ion: 'co2',  tasa: 1.2, velocidad: 80 });
      esc.agregar('h2oIn',    { path: 'dz-h2o-in',   ion: 'h2o',  tasa: 1.2, velocidad: 80 });
      esc.agregar('hRecicla', { path: 'dz-h-recicla',ion: 'h',    tasa: 1.2, velocidad: 95 });
      // NBCe1: 3 HCO₃⁻ por cada 1 Na⁺
      esc.agregar('hco3Nbc',  { path: 'dz-hco3-nbc', ion: 'hco3', tasa: 1.5, velocidad: 90 });
      esc.agregar('naNbc',    { path: 'dz-na-nbc',   ion: 'na',   tasa: 0.5, velocidad: 90 });
      // Bomba: 3 Na⁺ afuera por cada 2 K⁺ adentro
      esc.agregar('naBomba',  { path: 'dz-na-bomba', ion: 'na',   tasa: 1.5, velocidad: 85 });
      esc.agregar('kBomba',   { path: 'dz-k-bomba',  ion: 'k',    tasa: 1.0, velocidad: 85 });
    },

    // Flujo de cada corriente y estado de cada glifo, en normal (0) y con fármaco (1)
    estado(b) {
      return {
        flujos: {
          luzNa: 1, luzHco3: 1,
          naIn: b ? 0.12 : 1, hOut: b ? 0.12 : 1,
          hco3Ac4: b ? 0 : 1, co2In: b ? 0 : 1, h2oIn: b ? 0 : 1,
          hRecicla: b ? 0 : 1,
          hco3Nbc: b ? 0.15 : 1, naNbc: b ? 0.15 : 1,
          naBomba: b ? 0.3 : 1, kBomba: b ? 0.3 : 1
        },
        glifos: {
          'dz-ca4': b ? 'off' : 'ok', 'dz-ca2': b ? 'off' : 'ok',
          'dz-nhe3': b ? 'parcial' : 'ok',
          'dz-nbce1': b ? 'parcial' : 'ok', 'dz-nak': 'ok'
        },
        orina: b
          ? { hco3: 'mucho', ph: 'alcalino (> 6,5)', vol: 'aumentado' }
          : { hco3: 'casi nada', ph: 'ácido', vol: 'normal' },
        rebotes: b ? [{ x: 620, y: 112, ion: 'hco3' }, { x: 410, y: 128, ion: 'h' }] : [],
        pilas: b ? { 'dz-pila-hco3': 'hco3', 'dz-pila-na': 'na' } : {}
      };
    }
  };

  const ZOOMS = { iac: PROXIMAL };

  /* ---------- Motor de la vista ---------- */

  const Z = { svg: null, esc: null, def: null, bloqueo: false, pilas: {}, temp: null, run: 0 };

  function construir(svg, claseId) {
    const def = ZOOMS[claseId];
    if (!def) return false;
    Z.def = def; Z.svg = svg; Z.bloqueo = false; Z.pilas = {};
    const token = ++Z.run;   // invalida cualquier bucle anterior
    if (Z.temp) { clearInterval(Z.temp); Z.temp = null; }

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const defs = el('defs', {}, []);
    const m = el('marker', { id: 'dz-punta', viewBox: '0 0 10 10', refX: '9', refY: '5',
      markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
    m.appendChild(el('path', { d: 'M 0 1 L 9 5 L 0 9 z', fill: '#1f2937' }));
    defs.appendChild(m); svg.appendChild(defs);

    def.dibujar(svg);
    Z.esc = NI.particulas.crearEscena(svg, { radio: 11, fuente: 9, maxParticulas: 150 });
    def.corrientes(Z.esc);
    aplicar(false);

    // bucle del motor de partículas
    let ult = 0;
    const bucle = (ts) => {
      if (Z.run !== token || !Z.svg) return;     // se cerró o se abrió otro acercamiento
      if (!ult) ult = ts;
      let dt = (ts - ult) / 1000; ult = ts;
      if (dt > 0.1) dt = 0.1;
      Z.esc.tick(dt);
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);

    // rebotes periódicos cuando hay bloqueo
    Z.temp = setInterval(() => {
      if (Z.run !== token || !Z.bloqueo || !Z.def) return;
      const e = Z.def.estado(true);
      e.rebotes.forEach(r => Z.esc.rebote(r.x, r.y, r.ion));
      for (const id in e.pilas) sumarPila(id, e.pilas[id]);
    }, 1100);

    return true;
  }

  function sumarPila(id, ionId) {
    const g = Z.svg.querySelector('#' + id);
    if (!g) return;
    const n = (Z.pilas[id] = Math.min((Z.pilas[id] || 0) + 1, 12));
    if (n > (g.querySelectorAll('circle').length)) {
      const ion = NI.iones[ionId];
      const i = n - 1, cols = 6;
      g.appendChild(el('circle', { cx: (i % cols) * 21 - 53, cy: Math.floor(i / cols) * 21 - 4,
        r: 9, fill: ion.color }));
    }
    g.classList.remove('vacia');
  }
  function vaciarPilas() {
    for (const id in Z.pilas) {
      const g = Z.svg.querySelector('#' + id);
      if (g) { g.querySelectorAll('circle').forEach(c => c.remove()); g.classList.add('vacia'); }
    }
    Z.pilas = {};
  }

  function aplicar(b) {
    const e = Z.def.estado(b);
    for (const id in e.flujos) Z.esc.setFlujo(id, e.flujos[id]);
    for (const id in e.glifos) {
      const n = Z.svg.querySelector('#' + id);
      if (!n) continue;
      n.classList.remove('ok', 'parcial', 'off');
      n.classList.add(e.glifos[id]);
    }
    const set = (id, v) => { const n = Z.svg.querySelector('#' + id); if (n) n.textContent = v; };
    set('dz-u-hco3', e.orina.hco3); set('dz-u-ph', e.orina.ph); set('dz-u-vol', e.orina.vol);
    if (!b) vaciarPilas();
  }

  function setBloqueo(b) {
    if (!Z.def) return;
    Z.bloqueo = !!b;
    aplicar(Z.bloqueo);
  }

  function cerrar() {
    if (Z.temp) { clearInterval(Z.temp); Z.temp = null; }
    Z.run++; Z.svg = null; Z.def = null; Z.esc = null; Z.pilas = {};
  }

  NI.diuZoom = { construir, setBloqueo, cerrar, ZOOMS,
    hay: id => !!ZOOMS[id],
    pasos: (id, b) => ZOOMS[id] ? (b ? ZOOMS[id].bloqueo : ZOOMS[id].normal) : [],
    info: id => ZOOMS[id] || null };

})(typeof window !== 'undefined' ? window : globalThis);

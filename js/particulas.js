/* ============================================================
   Motor de partículas: iones que viajan por caminos SVG.
   - Cada "corriente" tiene un camino (<path>), un ion y un flujo (1 = normal).
   - Modo 'tasa': emite partículas por segundo ∝ flujo.
   - Modo 'cadena': solo se emite cuando otra partícula llega y lo pide (dependencias).
   - alLlegar(escena, corriente) decide qué pasa al final del camino.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const SVGNS = 'http://www.w3.org/2000/svg';

  NI.iones = {
    na:   { color: '#2563eb', texto: '#fff', etiqueta: 'Na⁺' },
    k:    { color: '#16a34a', texto: '#fff', etiqueta: 'K⁺' },
    cl:   { color: '#6366f1', texto: '#fff', etiqueta: 'Cl⁻' },
    h:    { color: '#dc2626', texto: '#fff', etiqueta: 'H⁺' },
    hco3: { color: '#0d9488', texto: '#fff', etiqueta: 'HCO₃⁻' },
    nh4:  { color: '#ea580c', texto: '#fff', etiqueta: 'NH₄⁺' },
    nh3:  { color: '#f59e0b', texto: '#fff', etiqueta: 'NH₃' },
    gln:  { color: '#92400e', texto: '#fff', etiqueta: 'Gln' },
    co2:  { color: '#64748b', texto: '#fff', etiqueta: 'CO₂' },
    h2o:  { color: '#0ea5e9', texto: '#fff', etiqueta: 'H₂O' },
    aldo: { color: '#7c3aed', texto: '#fff', etiqueta: 'Aldo' },
    angii:{ color: '#9333ea', texto: '#fff', etiqueta: 'AngII' },
    renina:{ color: '#a21caf', texto: '#fff', etiqueta: 'Ren' }
  };

  function crearEscena(svg, opciones) {
    opciones = opciones || {};
    const capa = document.createElementNS(SVGNS, 'g');
    capa.setAttribute('class', 'capa-particulas');
    svg.appendChild(capa);
    const esc = {
      svg, capa, corrientes: {}, particulas: [], activa: true,
      maxParticulas: opciones.maxParticulas || 140,
      radio: opciones.radio || 9,
      fuente: opciones.fuente || 7.5
    };

    esc.agregar = function (id, def) {
      const path = typeof def.path === 'string' ? svg.querySelector('#' + def.path) : def.path;
      if (!path) { console.warn('camino no encontrado', id, def.path); return; }
      esc.corrientes[id] = {
        id, path, len: path.getTotalLength(), ion: def.ion,
        modo: def.modo || 'tasa', tasa: def.tasa || 2.2, velocidad: def.velocidad || 95,
        flujo: def.flujo == null ? 1 : def.flujo, acum: Math.random(),
        alLlegar: def.alLlegar || null, reverso: !!def.reverso, desvanecer: def.desvanecer || 0,
        etiqueta: def.etiqueta || null, pequeno: !!def.pequeno
      };
    };
    esc.setFlujo = function (id, f) { const c = esc.corrientes[id]; if (c) c.flujo = Math.max(0, f); };

    esc.emitir = function (id, extra) {
      const c = esc.corrientes[id]; if (!c) return null;
      if (esc.particulas.length >= esc.maxParticulas) return null;
      const ion = NI.iones[c.ion];
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'particula');
      const r = c.pequeno ? esc.radio * 0.7 : esc.radio;
      const circ = document.createElementNS(SVGNS, 'circle');
      circ.setAttribute('r', r); circ.setAttribute('fill', ion.color);
      g.appendChild(circ);
      if (!c.pequeno) {
        const t = document.createElementNS(SVGNS, 'text');
        t.setAttribute('font-size', esc.fuente); t.setAttribute('fill', ion.texto);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('dy', '2.6');
        t.setAttribute('font-weight', '800');
        t.textContent = c.etiqueta || ion.etiqueta;
        g.appendChild(t);
      }
      capa.appendChild(g);
      const p = { c, el: g, dist: 0, vel: c.velocidad * (0.85 + 0.3 * Math.random()), extra: extra || null };
      esc.particulas.push(p);
      posicionar(p);
      return p;
    };

    function posicionar(p) {
      const d = p.c.reverso ? p.c.len - p.dist : p.dist;
      const pt = p.c.path.getPointAtLength(Math.max(0, Math.min(p.c.len, d)));
      p.el.setAttribute('transform', `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
      if (p.c.desvanecer) {
        const resto = p.c.len - p.dist;
        if (resto < p.c.desvanecer) p.el.style.opacity = Math.max(0, resto / p.c.desvanecer).toFixed(2);
      }
    }

    esc.tick = function (dt) {
      if (!esc.activa) return;
      // emisión
      for (const id in esc.corrientes) {
        const c = esc.corrientes[id];
        if (c.modo !== 'tasa' || c.flujo <= 0.03) continue;
        c.acum += c.tasa * c.flujo * dt;
        while (c.acum >= 1) { c.acum -= 1; esc.emitir(id); }
      }
      // movimiento
      const vivas = [];
      for (const p of esc.particulas) {
        p.dist += p.vel * dt;
        if (p.dist >= p.c.len) {
          p.el.remove();
          if (p.c.alLlegar) p.c.alLlegar(esc, p);
        } else { posicionar(p); vivas.push(p); }
      }
      esc.particulas = vivas;
    };

    esc.limpiar = function () { esc.particulas.forEach(p => p.el.remove()); esc.particulas = []; };
    // Marca visual de "bloqueado": partícula que rebota (se dibuja en el inicio y se desvanece)
    esc.rebote = function (x, y, ionId, texto) {
      if (esc.particulas.length >= esc.maxParticulas) return;
      const ion = NI.iones[ionId];
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'particula rebote');
      g.setAttribute('transform', `translate(${x},${y})`);
      g.innerHTML = `<circle r="${esc.radio}" fill="${ion.color}"/><text font-size="${esc.fuente}" fill="#fff" text-anchor="middle" dy="2.6" font-weight="800">${ion.etiqueta}</text><text class="rebote-x" font-size="14" fill="#dc2626" text-anchor="middle" dy="-12" font-weight="900">✕</text>`;
      capa.appendChild(g);
      let t = 0;
      const anim = () => { t += 0.03; g.style.opacity = Math.max(0, 1 - t); if (t < 1) requestAnimationFrame(anim); else g.remove(); };
      requestAnimationFrame(anim);
    };
    return esc;
  }

  NI.particulas = { crearEscena };
})(typeof window !== 'undefined' ? window : globalThis);

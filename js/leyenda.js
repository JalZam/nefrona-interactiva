/* ============================================================
   LEYENDA FLOTANTE — "Referencias": qué es cada bolita.
   Se abre con un botón y se queda abierta mientras corre la animación,
   sin robarle espacio al dibujo. La usan las dos páginas.
   Expone NI.leyenda.crear({ iones, extras, titulo }).
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});

  // Nombres en español (si la página tiene i18n, manda i18n)
  const NOMBRES = {
    na: 'Sodio', k: 'Potasio', cl: 'Cloro', h: 'Hidrogenión (ácido)',
    hco3: 'Bicarbonato', nh4: 'Amonio', nh3: 'Amoniaco', gln: 'Glutamina',
    co2: 'Dióxido de carbono', h2o: 'Agua',
    hpo4: 'Fosfato', h2po4: 'Fosfato ácido (acidez titulable)',
    aldo: 'Aldosterona', angii: 'Angiotensina II', renina: 'Renina'
  };

  function t(clave, porDefecto) {
    if (NI.i18n) {
      const v = NI.i18n.t(clave);
      if (v !== clave) return v;
    }
    return porDefecto;
  }

  function crear(op) {
    op = op || {};
    const iones = op.iones || Object.keys(NI.iones || {});
    const extras = op.extras || [];
    if (document.getElementById('ley-flota')) return;

    const cont = document.createElement('div');
    cont.className = 'ley-flota';
    cont.id = 'ley-flota';
    cont.innerHTML =
      '<div class="ley-caja" id="ley-caja" hidden>' +
        '<div class="ley-cab"><b id="ley-titulo"></b>' +
          '<button type="button" class="ley-cerrar" id="ley-cerrar" aria-label="Cerrar">✕</button>' +
        '</div>' +
        '<ul class="ley-lista" id="ley-lista"></ul>' +
      '</div>' +
      '<button type="button" class="ley-btn" id="ley-btn" aria-expanded="false"></button>';
    document.body.appendChild(cont);

    const caja = document.getElementById('ley-caja');
    const btn = document.getElementById('ley-btn');

    function pintar() {
      document.getElementById('ley-titulo').textContent = t('leyenda.titulo', 'Referencias · qué es cada bolita');
      btn.innerHTML = '<span class="ley-btn-punto"></span>' + t('leyenda.boton', 'Referencias');
      const ul = document.getElementById('ley-lista');
      let h = '';
      const fila = (color, sigla, nombre) =>
        '<li><span class="ley-bolita' + (sigla.length >= 4 ? ' grande' : '') + '"' +
        ' style="background:' + color + '">' + sigla + '</span><span>' + nombre + '</span></li>';
      iones.forEach(id => {
        const ion = (NI.iones || {})[id];
        if (!ion) return;
        h += fila(ion.color, ion.etiqueta, t('leyenda.' + id, NOMBRES[id] || id));
      });
      extras.forEach(e => { h += fila(e.color, e.sigla || '', t(e.clave, e.nombre)); });
      ul.innerHTML = h;
    }

    function abrir(v) {
      caja.hidden = !v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      btn.classList.toggle('abierto', v);
      try { localStorage.setItem('ni-leyenda', v ? '1' : '0'); } catch (e) { /* nada */ }
    }

    btn.addEventListener('click', () => abrir(caja.hidden));
    document.getElementById('ley-cerrar').addEventListener('click', () => abrir(false));
    if (NI.i18n) NI.i18n.alCambiar(pintar);

    pintar();
    let guardado = null;
    try { guardado = localStorage.getItem('ni-leyenda'); } catch (e) { /* nada */ }
    abrir(guardado === null ? window.innerWidth >= 1100 : guardado === '1');
  }

  NI.leyenda = { crear };
})(typeof window !== 'undefined' ? window : globalThis);

/* ============================================================
   BUZÓN DE SUGERENCIAS — un cuadro con un campo de texto y un correo opcional.
   Lo que se escribe se envía a PostHog (servidor de Europa) como el evento
   `suggestion_sent` (propiedades: texto, contacto, ruta, pagina, idioma), el mismo
   sitio donde está la analítica; no hay otro servicio. Se lee desde el panel de
   PostHog o con una consulta: select timestamp, properties.texto … where event = 'suggestion_sent'.
   · Se abre con el botón «Sugerencias» de la cabecera y con cualquier [data-buzon].
   · Si PostHog no cargó (bloqueador), se avisa y no se pierde el texto.
   Debe cargarse DESPUÉS de js/i18n.js y js/analitica.js.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI;
  if (!NI || !NI.i18n) return;
  const t = k => NI.i18n.t(k);
  const MAX = 1000;

  NI.i18n.extender({
    'bz.boton': 'Sugerencias', 'bz.titulo': 'Buzón de sugerencias',
    'bz.intro': '¿Qué no se entiende, qué falta o qué mejorarías? Todo comentario sirve.',
    'bz.texto': 'Tu sugerencia', 'bz.textoPh': 'Escribe aquí…',
    'bz.contacto': 'Tu correo (opcional, solo si quieres respuesta)', 'bz.contactoPh': 'nombre@correo.com',
    'bz.nota': 'Se guarda junto con la estadística de la página.',
    'bz.enviar': 'Enviar', 'bz.cancelar': 'Cancelar', 'bz.cerrar': 'Cerrar',
    'bz.vacio': 'Escribe tu sugerencia antes de enviar.',
    'bz.gracias': '¡Gracias! Tu sugerencia quedó guardada.',
    'bz.fallo': 'No se pudo enviar (puede ser un bloqueador de anuncios). Escríbeme por Instagram @kidneyedu.'
  }, {
    'bz.boton': 'Feedback', 'bz.titulo': 'Suggestion box',
    'bz.intro': 'What is unclear, what is missing, what would you improve? Every comment helps.',
    'bz.texto': 'Your suggestion', 'bz.textoPh': 'Write here…',
    'bz.contacto': 'Your email (optional, only if you want a reply)', 'bz.contactoPh': 'name@email.com',
    'bz.nota': 'It is stored together with the site statistics.',
    'bz.enviar': 'Send', 'bz.cancelar': 'Cancel', 'bz.cerrar': 'Close',
    'bz.vacio': 'Write your suggestion before sending.',
    'bz.gracias': 'Thank you! Your suggestion has been saved.',
    'bz.fallo': 'It could not be sent (an ad blocker may be the cause). Message me on Instagram @kidneyedu.'
  });

  let fondo = null, boton = null, ultimoEnvio = 0;
  const q = s => fondo.querySelector(s);

  function pintar() {
    if (boton) { boton.querySelector('span').textContent = t('bz.boton'); boton.setAttribute('aria-label', t('bz.titulo')); }
    if (!fondo) return;
    q('#bz-titulo').textContent = t('bz.titulo');
    q('#bz-intro').textContent = t('bz.intro');
    q('#bz-l-texto').textContent = t('bz.texto');
    q('#bz-texto').placeholder = t('bz.textoPh');
    q('#bz-l-contacto').textContent = t('bz.contacto');
    q('#bz-contacto').placeholder = t('bz.contactoPh');
    q('#bz-nota').innerHTML = t('bz.nota') + ' <a href="privacidad.html">' + t('leg.privacidad') + '</a>';
    q('#bz-enviar').textContent = t('bz.enviar');
    q('#bz-cancelar').textContent = t('bz.cancelar');
    q('#bz-x').setAttribute('aria-label', t('bz.cerrar'));
    q('#bz-listo').textContent = t('bz.cerrar');
  }

  function crear() {
    fondo = document.createElement('div');
    fondo.className = 'bz-fondo'; fondo.hidden = true;
    fondo.innerHTML =
      '<div class="bz-caja" role="dialog" aria-modal="true" aria-labelledby="bz-titulo">' +
        '<button type="button" class="bz-x" id="bz-x">✕</button>' +
        '<h2 id="bz-titulo"></h2>' +
        '<form id="bz-form" novalidate>' +
          '<p id="bz-intro" class="bz-intro"></p>' +
          '<label id="bz-l-texto" for="bz-texto"></label>' +
          '<textarea id="bz-texto" rows="5" maxlength="' + MAX + '"></textarea>' +
          '<label id="bz-l-contacto" for="bz-contacto"></label>' +
          '<input id="bz-contacto" type="email" maxlength="120" autocomplete="email" />' +
          '<p id="bz-aviso" class="bz-aviso" role="alert" hidden></p>' +
          '<p id="bz-nota" class="bz-nota"></p>' +
          '<div class="bz-botones"><button type="button" class="bz-btn" id="bz-cancelar"></button>' +
          '<button type="submit" class="bz-btn bz-principal" id="bz-enviar"></button></div>' +
        '</form>' +
        '<div id="bz-fin" hidden><p class="bz-gracias" id="bz-gracias"></p>' +
          '<div class="bz-botones"><button type="button" class="bz-btn bz-principal" id="bz-listo"></button></div></div>' +
      '</div>';
    document.body.appendChild(fondo);
    fondo.addEventListener('click', ev => { if (ev.target === fondo) cerrar(); });
    q('#bz-x').addEventListener('click', cerrar);
    q('#bz-cancelar').addEventListener('click', cerrar);
    q('#bz-listo').addEventListener('click', cerrar);
    q('#bz-form').addEventListener('submit', enviar);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && fondo && !fondo.hidden) cerrar(); });
  }

  function aviso(clave) {
    const n = q('#bz-aviso');
    if (!clave) { n.hidden = true; return; }
    n.textContent = t(clave); n.hidden = false;
  }

  function abrir() {
    if (!fondo) crear();
    pintar();
    aviso(null);
    q('#bz-form').hidden = false; q('#bz-fin').hidden = true;
    fondo.hidden = false;
    document.body.classList.add('bz-abierto');
    setTimeout(() => { try { q('#bz-texto').focus(); } catch (e) { /* nada */ } }, 50);
    if (NI.analitica) NI.analitica.evento('suggestion_box_opened');
  }
  function cerrar() {
    if (!fondo) return;
    fondo.hidden = true;
    document.body.classList.remove('bz-abierto');
  }

  function enviar(ev) {
    ev.preventDefault();
    const texto = q('#bz-texto').value.trim().slice(0, MAX);
    const contacto = q('#bz-contacto').value.trim().slice(0, 120);
    if (!texto) { aviso('bz.vacio'); return; }
    const ph = global.posthog;
    // sin PostHog cargado no hay dónde guardarla: se avisa y el texto se queda en el cuadro
    if (!ph || !ph.__loaded || !NI.analitica) { aviso('bz.fallo'); return; }
    if (Date.now() - ultimoEnvio < 5000) return;   // doble toque
    ultimoEnvio = Date.now();
    NI.analitica.evento('suggestion_sent', {
      texto, contacto: contacto || null, ruta: location.pathname + location.search
    });
    q('#bz-texto').value = ''; q('#bz-contacto').value = '';
    q('#bz-gracias').textContent = t('bz.gracias');
    q('#bz-form').hidden = true; q('#bz-fin').hidden = false;
  }

  function init() {
    // Botón en la cabecera, antes del contador de visitas
    const nav = document.querySelector('.header-right');
    if (nav && !document.getElementById('bz-boton')) {
      boton = document.createElement('button');
      boton.type = 'button'; boton.className = 'bz-boton'; boton.id = 'bz-boton';
      boton.setAttribute('data-buzon', '');
      boton.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg><span></span>';
      const contador = nav.querySelector('.visit-counter');
      if (contador) nav.insertBefore(boton, contador); else nav.appendChild(boton);
    }
    pintar();
    document.addEventListener('click', ev => {
      const n = ev.target && ev.target.closest ? ev.target.closest('[data-buzon]') : null;
      if (n) { ev.preventDefault(); abrir(); }
    });
    NI.i18n.alCambiar(pintar);
    // Enlace directo para compartir: ?buzon=1 abre el cuadro
    // …y se quita de la dirección, para que al recargar no vuelva a abrirse
    try {
      const u = new URL(location.href);
      if (u.searchParams.has('buzon')) {
        abrir();
        u.searchParams.delete('buzon');
        history.replaceState(null, '', u);
      }
    } catch (e) { /* nada */ }
  }

  NI.buzon = { abrir, cerrar };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);

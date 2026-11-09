/* ============================================================
   ANALÍTICA — PostHog (servidor de Europa) con consentimiento.

   · Arranca SIN cookies: persistence 'memory' y sin grabación de sesión.
     Así se cuenta la visita aunque la persona no haya elegido o rechace.
   · Si acepta: persistence 'localStorage+cookie' (reconoce al que vuelve)
     y grabación de sesión con las entradas enmascaradas.
   · Si rechaza: sigue en memoria y se borra lo que PostHog hubiera guardado.
   · La elección se guarda en localStorage ('ni-cookies' = 'si' | 'no') y se
     cambia desde el enlace «Cookies» del pie.
   · Todos los eventos propios pasan por NI.analitica.evento(). Si PostHog no
     carga (bloqueador), la página funciona igual: nada aquí lanza errores.
   Debe cargarse DESPUÉS de js/i18n.js.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});
  const CLAVE = 'phc_qAq3VixFDjysd75E8RDH2gNZiKq4MFuawpykMzr6FPeh';   // pública
  const HOST = 'https://eu.i.posthog.com';
  const K = 'ni-cookies';
  const t = k => (NI.i18n ? NI.i18n.t(k) : k);

  function leer() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(K, v); } catch (e) { /* bloqueado */ } }
  const eleccion = leer();               // null = todavía no elige
  const acepto = eleccion === 'si';

  /* ---------- PostHog: snippet oficial (sin cambios) ---------- */
  try {
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    global.posthog.init(CLAVE, {
      api_host: HOST,
      defaults: '2026-08-30',
      persistence: acepto ? 'localStorage+cookie' : 'memory',
      disable_session_recording: !acepto,
      session_recording: { maskAllInputs: true },
      person_profiles: 'identified_only'
    });
  } catch (e) { /* sin analítica: la página sigue */ }

  const ph = () => (global.posthog && typeof global.posthog.capture === 'function') ? global.posthog : null;

  /* ---------- Eventos propios ---------- */
  const PAGINA = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  function evento(nombre, props) {
    try {
      const p = ph(); if (!p) return;
      p.capture(nombre, Object.assign({ pagina: PAGINA, idioma: NI.i18n ? NI.i18n.lang : 'es' }, props || {}));
    } catch (e) { /* nada */ }
  }

  /* ---------- Cambiar de opinión ---------- */
  function borrarRastros() {
    // Lo que PostHog hubiera guardado con cookies: cookie ph_* y claves ph_* / __ph*
    try {
      document.cookie.split(';').forEach(c => {
        const n = c.split('=')[0].trim();
        if (/^ph_|posthog/i.test(n)) {
          const host = location.hostname;
          [host, '.' + host, '.' + host.split('.').slice(-2).join('.'), ''].forEach(d => {
            document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
          });
        }
      });
    } catch (e) { /* nada */ }
    [global.localStorage, global.sessionStorage].forEach(s => {
      try { Object.keys(s).forEach(k => { if (/^ph_|^__ph|posthog/i.test(k)) s.removeItem(k); }); } catch (e) { /* nada */ }
    });
  }
  function aceptar() {
    guardar('si');
    try {
      const p = ph();
      if (p) {
        p.set_config({ persistence: 'localStorage+cookie', disable_session_recording: false });
        p.startSessionRecording();
      }
    } catch (e) { /* nada */ }
    evento('cookies_accepted');
    cerrarAviso();
  }
  function rechazar() {
    const antes = leer();
    guardar('no');
    try {
      const p = ph();
      if (p) {
        p.set_config({ persistence: 'memory', disable_session_recording: true });
        if (antes === 'si') p.stopSessionRecording();
      }
    } catch (e) { /* nada */ }
    borrarRastros();
    evento('cookies_rejected');
    cerrarAviso();
  }

  /* ---------- Aviso de cookies ---------- */
  let aviso = null;
  function pintarAviso() {
    if (!aviso) return;
    aviso.querySelector('.ck-texto').innerHTML = t('ck.texto') +
      ' <a href="privacidad.html" class="ck-mas">' + t('ck.mas') + '</a>';
    aviso.querySelector('#ck-aceptar').textContent = t('ck.aceptar');
    aviso.querySelector('#ck-rechazar').textContent = t('ck.rechazar');
    aviso.setAttribute('aria-label', t('ck.titulo'));
    medir();
  }
  function medir() {
    if (!aviso) return;
    document.body.style.setProperty('--aviso-h', aviso.hidden ? '0px' : aviso.offsetHeight + 'px');
    document.body.classList.toggle('con-aviso', !aviso.hidden);
  }
  function abrirAviso() {
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.className = 'ck-aviso';
      aviso.id = 'ck-aviso';
      aviso.setAttribute('role', 'region');
      aviso.innerHTML = '<p class="ck-texto"></p><div class="ck-botones">' +
        '<button type="button" class="ck-btn" id="ck-rechazar"></button>' +
        '<button type="button" class="ck-btn" id="ck-aceptar"></button></div>';
      document.body.appendChild(aviso);
      aviso.querySelector('#ck-aceptar').addEventListener('click', aceptar);
      aviso.querySelector('#ck-rechazar').addEventListener('click', rechazar);
      global.addEventListener('resize', medir);
    }
    aviso.hidden = false;
    pintarAviso();
  }
  function cerrarAviso() { if (aviso) { aviso.hidden = true; medir(); } }

  /* ---------- Correo de contacto armado aquí (contra robots) ---------- */
  function pintarCorreos() {
    const u = ['juan', 'jaller', 'ch'].join(''), d = ['cimedical', 'co'].join('.');
    const c = u + '@' + d;
    document.querySelectorAll('[data-correo]').forEach(n => {
      n.innerHTML = '<a href="mailto:' + c + '">' + c + '</a>';
    });
  }

  /* ---------- Escuchas: un solo lugar para todos los clics ---------- */
  const REDES = [['instagram.com', 'instagram'], ['x.com', 'x'], ['tiktok.com', 'tiktok']];
  function alClic(ev) {
    const el = ev.target && ev.target.closest ? ev.target : null;
    if (!el) return;
    let n;
    if ((n = el.closest('[data-cookies]'))) { ev.preventDefault(); abrirAviso(); return; }
    if ((n = el.closest('.atr-btn[data-atr]'))) return evento('atr_option_selected', { opcion: n.dataset.atr });
    if ((n = el.closest('#atr-pasos li'))) {
      const op = document.querySelector('.atr-btn.activo');
      return evento('atr_step_clicked', { opcion: op ? op.dataset.atr : null, paso: (+n.dataset.i || 0) + 1 });
    }
    if ((n = el.closest('[data-porque]'))) return evento('why_card_opened', { tarjeta: n.dataset.porque });
    if ((n = el.closest('#lista-refs a, #dm-lista-refs a'))) {
      const li = n.closest('li');
      return evento('reference_opened', { referencia: li ? (li.getAttribute('value') || String([...li.parentNode.children].indexOf(li) + 1)) : null });
    }
    if ((n = el.closest('#ley-btn'))) return evento('key_toggled', { abierta: n.getAttribute('aria-expanded') === 'true' });
    if ((n = el.closest('a[href]'))) {
      const r = REDES.find(x => n.href.indexOf(x[0]) !== -1);
      if (r) return evento('social_clicked', { red: r[1] });
    }
  }
  function alAbrirDetalles(ev) {
    const d = ev.target;
    if (d && d.matches && d.matches('details.refs') && d.open) evento('references_expanded');
  }

  function arrancar() {
    document.addEventListener('click', alClic, true);
    document.addEventListener('toggle', alAbrirDetalles, true);
    pintarCorreos();
    if (eleccion !== 'si' && eleccion !== 'no') abrirAviso();
    if (NI.i18n) NI.i18n.alCambiar(lang => { pintarAviso(); evento('language_changed', { idioma: lang }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  NI.analitica = { evento, abrirAviso, aceptar, rechazar, get eleccion() { return leer(); } };
})(typeof window !== 'undefined' ? window : globalThis);

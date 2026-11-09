/* ============================================================
   PRIVACIDAD — textos ES/EN de la política de tratamiento de datos.
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI;
  if (!NI || !NI.i18n) return;

  const ES = {
    'doc.titulo': 'Política de tratamiento de datos — Nefrona Interactiva',
    'pv.logosub': 'Política de tratamiento de datos',
    'pv.titulo': 'Política de tratamiento de datos',
    'pv.fecha': 'Vigente desde el 8 de noviembre de 2026.',
    'pv.h.marco': 'Marco legal',
    'pv.marco': 'Esta política sigue la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia (protección de datos personales) y, para quienes visitan desde la Unión Europea, el Reglamento General de Protección de Datos (RGPD).',
    'pv.h.resp': 'Responsable',
    'pv.resp': 'Juan José Jaller, persona natural, autor de Nefrona Interactiva (nefrona-interactiva.com).',
    'pv.contacto': 'Correo de contacto:',
    'pv.h.fin': 'Finalidad',
    'pv.fin': 'Estadística de uso y mejora educativa: saber cuántas personas entran, desde qué países, qué secciones revisan y dónde se quedan atascadas, para mejorar las animaciones y los textos. No se usan para publicidad ni se venden ni se ceden a terceros.',
    'pv.h.que': 'Qué se recoge',
    'pv.que.intro': 'Siempre, sin cookies (nada se guarda en su navegador):',
    'pv.que.1': 'Páginas vistas y de qué página o red social llega.',
    'pv.que.2': 'Clics dentro de la animación (opción elegida, pasos, tarjetas, referencias, idioma, botón «Guía», redes).',
    'pv.que.3': 'País y ciudad aproximados, calculados a partir de la dirección IP.',
    'pv.que.4': 'Tipo de dispositivo, navegador y tamaño de pantalla.',
    'pv.que.acepta': 'Solo si usted acepta en el aviso de cookies:',
    'pv.que.5': 'Una cookie de visitante que vuelve, para saber si es la misma persona en otra visita.',
    'pv.que.6': 'La grabación de la sesión (movimientos y clics en la página), con los campos de texto enmascarados. La página no tiene formularios ni pide datos personales.',
    'pv.h.donde': 'Dónde se guarda',
    'pv.donde': 'En PostHog, servicio de analítica, en sus servidores de la Unión Europea.',
    'pv.h.tiempo': 'Cuánto tiempo',
    'pv.tiempo': '12 meses. Después se borran.',
    'pv.h.der': 'Sus derechos',
    'pv.der': 'Usted puede conocer, actualizar, rectificar y pedir que se supriman sus datos, y revocar su autorización en cualquier momento. Para revocar las cookies basta con el enlace «Cookies» al pie de cada página; para lo demás, escriba al correo de contacto y se le responderá en los plazos de la ley (10 días hábiles para consultas y 15 para reclamos).',
    'pv.h.cambios': 'Cambios',
    'pv.cambios': 'Si esta política cambia, se publicará aquí con la nueva fecha.'
  };

  const EN = {
    'doc.titulo': 'Data processing policy — Nefrona Interactiva',
    'pv.logosub': 'Data processing policy',
    'pv.titulo': 'Data processing policy',
    'pv.fecha': 'In force since November 8, 2026.',
    'pv.h.marco': 'Legal framework',
    'pv.marco': 'This policy follows Colombian Law 1581 of 2012 and Decree 1377 of 2013 (personal data protection) and, for visitors from the European Union, the General Data Protection Regulation (GDPR).',
    'pv.h.resp': 'Data controller',
    'pv.resp': 'Juan José Jaller, as a private individual, author of Nefrona Interactiva (nefrona-interactiva.com).',
    'pv.contacto': 'Contact email:',
    'pv.h.fin': 'Purpose',
    'pv.fin': 'Usage statistics and educational improvement: knowing how many people visit, from which countries, which sections they look at and where they get stuck, in order to improve the animations and texts. The data are not used for advertising and are not sold or shared with third parties.',
    'pv.h.que': 'What is collected',
    'pv.que.intro': 'Always, without cookies (nothing is stored in your browser):',
    'pv.que.1': 'Pages viewed and the page or social network you came from.',
    'pv.que.2': 'Clicks inside the animation (chosen option, steps, cards, references, language, “Key” button, social links).',
    'pv.que.3': 'Approximate country and city, derived from the IP address.',
    'pv.que.4': 'Device type, browser and screen size.',
    'pv.que.acepta': 'Only if you accept in the cookie notice:',
    'pv.que.5': 'A returning-visitor cookie, to know whether it is the same person on another visit.',
    'pv.que.6': 'Session recording (movements and clicks on the page), with text fields masked. The site has no forms and does not ask for personal data.',
    'pv.h.donde': 'Where it is stored',
    'pv.donde': 'In PostHog, an analytics service, on its servers in the European Union.',
    'pv.h.tiempo': 'How long',
    'pv.tiempo': '12 months. After that it is deleted.',
    'pv.h.der': 'Your rights',
    'pv.der': 'You may access, update and correct your data, ask for it to be deleted, and withdraw your consent at any time. To withdraw cookie consent, use the “Cookies” link at the bottom of every page; for anything else, write to the contact email and you will receive an answer within the legal time limits (10 business days for queries and 15 for complaints).',
    'pv.h.cambios': 'Changes',
    'pv.cambios': 'If this policy changes, the new version will be published here with its date.'
  };

  NI.i18n.extender(ES, EN);

  function pintar() {
    NI.i18n.pintarHTML();
    document.querySelectorAll('#pv-lang button').forEach(b =>
      b.classList.toggle('activo', b.dataset.lang === NI.i18n.lang));
  }
  document.querySelectorAll('#pv-lang button').forEach(b =>
    b.addEventListener('click', () => NI.i18n.set(b.dataset.lang)));
  NI.i18n.alCambiar(pintar);
  pintar();
})(typeof window !== 'undefined' ? window : globalThis);

#!/usr/bin/env node
/* Genera las dos páginas de TEXTO de la sección de acidosis:
     acidosis-tubular-renal.html  (español)
     renal-tubular-acidosis.html  (inglés)
   Los buscadores y los asistentes de IA no «ven» la animación (los textos viven en
   js/atr.js y solo aparecen al tocar): estas páginas ponen esos mismos textos, tal cual,
   en HTML normal. NO se editan a mano: se corrige el texto en js/atr.js, js/refs.js o
   js/acidosis-en.js y se vuelve a correr:   node tools/generar-guia.js
*/
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const SITIO = 'https://nefrona-interactiva.com/';
const HOY = new Date().toISOString().slice(0, 10);
const PUBLICADA = '2026-11-24';
const V_CSS = (leer('index.html').match(/style\.css\?v=(\d+)/) || [])[1] || '1';
const ver = f => (leer('index.html').match(new RegExp(f.replace('.', '\\.') + '\\?v=(\\d+)')) || [])[1] || '1';

// ── datos ──
const NI = {};
vm.runInNewContext(leer('js/refs.js'), { window: { NI }, globalThis: { NI } });
let fuente = leer('js/atr.js');
const corte = fuente.indexOf('// ───────── Motor');
if (corte < 0) throw new Error('No encuentro el corte «Motor» en js/atr.js');
fuente = fuente.slice(0, corte) + '\n  global.__ATR = ATR;\n})(window);';
const win = { NI, document: { getElementById: () => null } };
vm.runInNewContext(fuente, { window: win, Object, Math });
const ATR = win.__ATR;
const w2 = {}; vm.runInNewContext(leer('js/acidosis-en.js'), { window: w2 });
const EN = w2.ACIDOSIS_EN;

const ORDEN = ['normal', 'diarrea', 'atr2', 'atr1', 'atr3', 'atr4h', 'atr4r', 'atr4v'];
for (const id of ORDEN) {
  if (!ATR[id] || !EN.atr[id]) throw new Error('Falta ' + id);
  if (ATR[id].pasos.length !== EN.atr[id].pasos.length)
    throw new Error(`«${id}»: ${ATR[id].pasos.length} pasos en español y ${EN.atr[id].pasos.length} en inglés`);
}
for (const k in NI.porque) if (!EN.porque[k]) throw new Error('Tarjeta sin traducción: ' + k);

// ── utilidades ──
const esc = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/<(?![a-zA-Z\/])/g, '&lt;');
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plano = s => String(s).replace(/<[^>]+>/g, '');

const L = {
  es: {
    archivo: 'acidosis-tubular-renal.html', otro: 'renal-tubular-acidosis.html', html: 'es', og: 'es_CO',
    titulo: 'Acidosis tubular renal tipos 1, 2, 3 y 4: mecanismo paso a paso',
    tituloDoc: 'Acidosis tubular renal tipos 1, 2, 3 y 4: mecanismo paso a paso — Nefrona Interactiva',
    desc: 'Explicación en texto, paso a paso, de la acidosis metabólica sin anion gap: cómo acidifica la orina la nefrona normal y qué se daña, y en qué orden, en la diarrea y en la acidosis tubular renal tipos 1, 2, 3 y 4. Con referencias.',
    logosub: 'Guía en texto · Acidosis metabólica sin anion gap',
    nav: ['Acidosis', 'Diuréticos', 'Explicación'], cred: 'médico nefrólogo',
    intro: 'Esta página tiene, en texto, la misma explicación que la <a href="index.html">animación interactiva de Nefrona Interactiva</a>: las células de la nefrona de proximal a distal, los iones que cruzan cada canal y qué se daña, y en qué orden, en cada acidosis metabólica sin anion gap. Los textos son los mismos que aparecen en la animación; frases como «mira» o «fíjate» se refieren a ella.',
    autor: 'Autor', fecha: 'Actualizada el', indice: 'Contenido',
    paso: 'Paso', pasos: 'pasos', verAnim: 'Verlo animado',
    hPiezas: 'Canales, bombas y transportadores',
    pPiezas: 'Qué hace cada pieza del esquema, qué la activa y qué la apaga. Los números entre corchetes llevan a las referencias.',
    hRefs: 'Referencias', refs: 'Referencias',
    aviso: 'Herramienta de aprendizaje. No es una guía de diagnóstico ni de tratamiento.',
    pie: ['Animación de acidosis', 'Diuréticos', 'Política de tratamiento de datos', 'Cookies', 'Sugerencias'],
    cambio: 'Read this page in English', lang: ''
  },
  en: {
    archivo: 'renal-tubular-acidosis.html', otro: 'acidosis-tubular-renal.html', html: 'en', og: 'en_US',
    titulo: 'Renal tubular acidosis types 1, 2, 3 and 4: step-by-step mechanism',
    tituloDoc: 'Renal tubular acidosis types 1, 2, 3 and 4: step-by-step mechanism — Nefrona Interactiva',
    desc: 'A step-by-step text explanation of normal anion gap metabolic acidosis: how the normal nephron acidifies the urine and what fails, and in what order, in diarrhea and in renal tubular acidosis types 1, 2, 3 and 4. With references.',
    logosub: 'Text guide · Normal anion gap metabolic acidosis',
    nav: ['Acidosis', 'Diuretics', 'Explanation'], cred: 'MD, nephrologist',
    intro: 'This page holds, as plain text, the same explanation as the <a href="index.html?lang=en">Nefrona Interactiva interactive animation</a>: the cells of the nephron from proximal to distal, the ions crossing each channel, and what fails, and in what order, in each normal anion gap metabolic acidosis. The wording is the one shown in the animation; phrases such as “watch” or “notice” refer to it.',
    autor: 'Author', fecha: 'Updated on', indice: 'Contents',
    paso: 'Step', pasos: 'steps', verAnim: 'Watch it animated',
    hPiezas: 'Channels, pumps and transporters',
    pPiezas: 'What each part of the diagram does, what turns it on and what turns it off. Numbers in brackets link to the references.',
    hRefs: 'References', refs: 'References',
    aviso: 'A learning tool. It is not a guide for diagnosis or treatment.',
    pie: ['Acidosis animation', 'Diuretics', 'Data processing policy', 'Cookies', 'Feedback'],
    cambio: 'Leer esta página en español', lang: '?lang=en'
  }
};

function pagina(l) {
  const T = L[l], url = SITIO + T.archivo;
  const A = id => l === 'es'
    ? { nombre: ATR[id].nombre, causas: ATR[id].causas, pasos: ATR[id].pasos.map(p => ({ t: p.titulo, x: p.texto })) }
    : EN.atr[id];
  const P = k => l === 'es' ? { t: NI.porque[k].titulo, x: NI.porque[k].texto } : EN.porque[k];
  const q = id => 'index.html?atr=' + id + (l === 'en' ? '&lang=en' : '');

  const indice = ORDEN.map(id => `<li><a href="#${id}">${esc(A(id).nombre)}</a></li>`).join('\n        ') +
    `\n        <li><a href="#piezas">${T.hPiezas}</a></li>\n        <li><a href="#referencias">${T.hRefs}</a></li>`;

  const secciones = ORDEN.map(id => {
    const a = A(id);
    return `    <section id="${id}">
      <h2>${esc(a.nombre)}</h2>
      <p class="gt-causas">${esc(a.causas)}</p>
      <ol class="gt-pasos">
${a.pasos.map(p => `        <li><h3>${esc(p.t)}</h3><p>${esc(p.x)}</p></li>`).join('\n')}
      </ol>
      <p class="gt-ver"><a href="${q(id)}">${T.verAnim} →</a></p>
    </section>`;
  }).join('\n\n');

  const piezas = Object.keys(NI.porque).map(k => {
    const p = P(k), r = NI.porque[k].refs || [];
    return `      <div class="gt-pieza" id="pieza-${k}"><h3>${esc(p.t)}</h3><p>${esc(p.x)}${r.length ? ' <span class="gt-cita">' + r.map(n => `<a href="#ref-${n}">[${n}]</a>`).join(' ') + '</span>' : ''}</p></div>`;
  }).join('\n');

  const refs = NI.referencias.map(r =>
    `        <li id="ref-${r.n}" value="${r.n}">${esc(r.cita)}${r.doi ? ` <a href="https://doi.org/${r.doi}" rel="noopener">doi:${r.doi}</a>` : ''}</li>`).join('\n');

  const fechaLarga = new Date(HOY + 'T12:00:00Z').toLocaleDateString(l === 'es' ? 'es-CO' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  const ld = {
    '@context': 'https://schema.org', '@type': ['MedicalWebPage', 'LearningResource'],
    '@id': url, url, name: T.titulo, headline: T.titulo, description: T.desc, inLanguage: l,
    datePublished: PUBLICADA, dateModified: HOY, isAccessibleForFree: true,
    learningResourceType: l === 'es' ? 'Explicación paso a paso' : 'Step-by-step explanation',
    educationalLevel: l === 'es' ? 'Estudiantes de medicina, residentes y médicos' : 'Medical students, residents and physicians',
    audience: { '@type': 'MedicalAudience', audienceType: 'Clinician' },
    about: [
      { '@type': 'MedicalCondition', name: l === 'es' ? 'Acidosis tubular renal' : 'Renal tubular acidosis' },
      { '@type': 'MedicalCondition', name: l === 'es' ? 'Acidosis metabólica sin anion gap' : 'Normal anion gap metabolic acidosis' }
    ],
    author: { '@type': 'Person', name: 'Juan José Jaller', jobTitle: l === 'es' ? 'Médico nefrólogo' : 'Nephrologist', medicalSpecialty: 'Nephrology', url: 'https://www.instagram.com/kidneyedu/' },
    publisher: { '@type': 'Organization', name: 'Nefrona Interactiva', url: SITIO },
    isPartOf: { '@type': 'WebSite', name: 'Nefrona Interactiva', url: SITIO },
    image: SITIO + 'img/og.png',
    hasPart: ORDEN.map(id => ({ '@type': 'WebPageElement', name: plano(A(id).nombre), url: url + '#' + id })),
    citation: NI.referencias.map(r => r.doi ? 'https://doi.org/' + r.doi : r.cita)
  };

  return `<!DOCTYPE html>
<html lang="${T.html}" data-lang-fijo="${T.html}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- GENERADA por tools/generar-guia.js a partir de js/atr.js, js/refs.js y js/acidosis-en.js. No editar a mano. -->
  <title>${esc(T.tituloDoc)}</title>
  <meta name="description" content="${attr(T.desc)}" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="es" href="${SITIO}${L.es.archivo}" />
  <link rel="alternate" hreflang="en" href="${SITIO}${L.en.archivo}" />
  <link rel="alternate" hreflang="x-default" href="${SITIO}${L.en.archivo}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Nefrona Interactiva" />
  <meta property="og:title" content="${attr(T.titulo)}" />
  <meta property="og:description" content="${attr(T.desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="${T.og}" />
  <meta property="og:image" content="${SITIO}img/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="img/icono.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css?v=${V_CSS}" />
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>

<header class="site-header">
  <div class="header-inner">
    <a class="logo" href="index.html${T.lang}">
      <svg class="logo-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 6 C8 6 8 34 20 34 C32 34 32 6 32 6" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="8" cy="6" r="3.5" fill="#2563eb"/><circle cx="32" cy="6" r="3.5" fill="#0ea5e9"/>
        <circle cx="20" cy="22" r="4" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      </svg>
      <div>
        <div class="logo-title">Nefrona Interactiva</div>
        <div class="logo-sub">${T.logosub}</div>
      </div>
    </a>
    <nav class="header-right nav">
      <a class="nav-link" href="index.html${T.lang}">${T.nav[0]}</a>
      <a class="nav-link" href="diureticos.html${T.lang}">${T.nav[1]}</a>
      <a class="nav-link nav-expl activo" href="${T.archivo}" aria-current="page">${T.nav[2]}</a>
      <div class="lang-switch" role="group" title="Idioma / Language">
        <a class="gt-lang${l === 'es' ? ' activo' : ''}" href="${L.es.archivo}" hreflang="es" lang="es">ES</a>
        <a class="gt-lang${l === 'en' ? ' activo' : ''}" href="${L.en.archivo}" hreflang="en" lang="en">EN</a>
      </div>
    </nav>
  </div>
</header>

<main class="pv-main gt-main">
  <article class="card pv-card gt">
    <h1 class="pv-titulo">${esc(T.titulo)}</h1>
    <p class="pv-fecha">${T.autor}: Juan José Jaller, ${T.cred} · ${T.fecha} <time datetime="${HOY}">${fechaLarga}</time> · <a href="${T.otro}" hreflang="${l === 'es' ? 'en' : 'es'}">${T.cambio}</a></p>
    <p>${T.intro}</p>
    <p class="gt-aviso">${T.aviso}</p>

    <nav class="gt-indice" aria-label="${T.indice}">
      <h2>${T.indice}</h2>
      <ol>
        ${indice}
      </ol>
    </nav>

${secciones}

    <section id="piezas">
      <h2>${T.hPiezas}</h2>
      <p>${T.pPiezas}</p>
${piezas}
    </section>

    <section id="referencias">
      <h2>${T.hRefs}</h2>
      <ol class="gt-refs">
${refs}
      </ol>
    </section>
  </article>
</main>

<footer class="pie">
  <p class="pie-legal"><a href="index.html${T.lang}">${T.pie[0]}</a>
    · <a href="diureticos.html${T.lang}">${T.pie[1]}</a>
    · <a href="privacidad.html${T.lang}">${T.pie[2]}</a>
    · <a href="#" data-cookies>${T.pie[3]}</a>
    · <a href="#" data-buzon>${T.pie[4]}</a></p>
</footer>

<script src="js/i18n.js?v=${ver('i18n.js')}"></script>
<script src="js/analitica.js?v=${ver('analitica.js')}"></script>
<script src="js/buzon.js?v=${ver('buzon.js')}"></script>
</body>
</html>
`;
}

for (const l of ['es', 'en']) {
  const html = pagina(l);
  fs.writeFileSync(path.join(RAIZ, L[l].archivo), html);
  const palabras = plano(html.slice(html.indexOf('<main'))).split(/\s+/).length;
  console.log(L[l].archivo, '·', palabras, 'palabras');
}

# CLAUDE.md — Nefrona Interactiva

<!-- managed-by: instructivo-creacion-proyecto -->
<!-- initialized: 2026-10-23 -->
<!-- version: 2.0 -->
<!-- status: active -->
<!-- last-completed-step: diureticos-osmoticos -->

## ¿Qué es este proyecto?
Sitio web estático (HTML + CSS + JS puro + SVG) para **aprender viendo** fisiología renal, con dos secciones:

1. **Acidosis** (`index.html`) — la **acidosis metabólica sin anion gap**: 4 células en fila (proximal, asa
   gruesa, principal, intercalada α) con sus canales y los iones como partículas, y 8 opciones (normal,
   diarrea con riñón sano, ATR 2, 1, 3 y tres formas de ATR 4) explicadas en una lista numerada; cada punto
   se aplica al tocarlo y cambia canales, sangre y orina. **Terminada.**
2. **Diuréticos** (`diureticos.html`) — mapa animado de la nefrona entera con las 6 clases de diurético, y
   acercamiento a la célula de cada segmento con el mecanismo normal y el bloqueo del fármaco.
   **EN CONSTRUCCIÓN:** hechos el túbulo proximal (acetazolamida) y los osmóticos (manitol).

Las dos están en **español e inglés**, con un interruptor ES|EN en la cabecera.

Dueño: Juan José Jaller (nefrólogo). Uso: herramienta de aprendizaje y, más adelante, docencia.

## Estado Actual
**Fase activa:** sección de diuréticos. **Proximal / acetazolamida** revisado y aprobado por Juanjo
(2026-11-08). **Osmóticos / manitol** construido 2026-11-08, **pendiente de su revisión**. Faltan cuatro
clases (de asa, tiazídicos, ahorradores de K⁺, acuaréticos). Juanjo revisa y corrige antes de pasar a la
siguiente.
**Acidosis:** terminada y revisada contra PubMed (2026-11-07).

## Stack Técnico
- HTML + CSS + JavaScript puro. SVG inline dibujado a mano. Sin framework, sin dependencias, sin compilación.
- Scripts clásicos (`<script src>`), **no ES modules**, para que abra desde `file://`. Un solo objeto global `NI`.
- Publicación: GitHub Pages desde `main` del repo `JalZam/nefrona-interactiva`, dominio propio
  **nefrona-interactiva.com** (GoDaddy DNS: 4 A @ → 185.199.108-111.153, CNAME www → jalzam.github.io;
  archivo `CNAME`; HTTPS forzado). **Commits y push los hace Claude** (decisión de Juanjo 2026-10-23).
- Los `<script>` y el CSS llevan `?v=N`. **Subir ese número al publicar un cambio**: si no, el navegador de
  Juanjo sirve la copia vieja y parece que el cambio "no funciona" (ya pasó con el botón de idioma).

## Arquitectura

**Acidosis.** `js/atr.js` define las 8 opciones con su lista numerada; cada punto trae un `estado`
(actividad de canales 0–1, valores ilustrativos de K⁺, HCO₃⁻, pH…) que `js/nefron-fila.js` dibuja: bloquea
canales, acumula sustancias en pilas y pinta la franja de laboratorio. `js/refs.js` tiene las 38 referencias
y las 33 tarjetas «¿por qué?».

**Diuréticos.** `js/diureticos-mapa.js` dibuja el mapa de la nefrona y las 6 clases; al tocar un segmento
abre `js/diu-zoom.js`, el acercamiento a la célula, con un botón que alterna normal ↔ bloqueo. Cada clase
es un objeto en `ZOOMS` (`iac`, `osm`) con `dibujar/colas/corrientes/paso/estado`; `estado()` devuelve los
glifos, las 3 filas del cajón de orina (`orina: [...]`) y textos sueltos (`textos: {id: valor}`). Una clase
puede traer su propio pie (`pieNormal/pieBloqueo`), como el manitol, que no bloquea ningún canal.
**Clases en construcción** (pedido de Juanjo 2026-11-08): cada clase de `CLASES` en `js/diureticos-mapa.js`
lleva `lista: true/false`. Con `false`, al elegirla se esconde el riñón y se ve `#dm-obra-vista` (nefrona que se
dibuja a trazos, conos y barra de avance; SVG y CSS propios en `diureticos.html` y `style.css`), con
«Pronto: …» (`cls.X.pronto` en `i18n.js`) y las redes; no abre acercamiento (ni con `?zoom=1`). La lista
muestra «Lista» / «En construcción». **Al terminar una clase: poner `lista: true` y añadir su zoom en `ZOOMS`.**

**Motor común.** `js/particulas.js` mueve los iones por caminos SVG con **colas de estequiometría**.

**Idioma.** `js/i18n.js` es el módulo común (claves + `tx()` para literales). La acidosis añade sus textos
con `js/acidosis-en.js` (traducción) y `js/acidosis-i18n.js` (los aplica en caliente).

## Estructura de Archivos Clave
```
index.html            ACIDOSIS: animación en fila, panel de ATR, laboratorio, referencias
privacidad.html       política de tratamiento de datos (ES/EN, textos en js/privacidad.js)
diureticos.html       DIURÉTICOS: mapa de la nefrona, panel de las 6 clases, acercamiento
style.css             estilos de las dos páginas (paleta y tipografías del Velocímetro Renal)

js/particulas.js      motor de partículas: caminos SVG, cadenas, COLAS con estequiometría
                      (cola/aparcar/hayCupo/reservar/intentarCompletar) y rebotes ✕
js/i18n.js            idioma común: t(), tx(), extender(), alCambiar(), pintarHTML()
js/leyenda.js         botón flotante «Guía» con el color y la sigla de cada bolita
js/analitica.js       PostHog UE con consentimiento, aviso de cookies y eventos propios

js/nefron-fila.js     acidosis: las 4 células, cajones de orina y heces, laboratorio, render(E)
js/atr.js             acidosis: las 8 opciones y sus listas numeradas
js/refs.js            acidosis: 38 referencias + 33 tarjetas «¿por qué?»
js/acidosis-en.js     acidosis: traducción al inglés (8 ATR, 64 pasos, 33 tarjetas, 70 rótulos)
js/acidosis-i18n.js   acidosis: aplica el idioma en caliente sin perder la opción elegida

js/diureticos-mapa.js diuréticos: mapa de la nefrona, 6 clases, resumen, enlace al acercamiento
js/diu-zoom.js        diuréticos: acercamiento a la célula (acetazolamida y manitol)
js/diu-refs.js        diuréticos: las 27 referencias de PubMed del pie (1–26 y la 14b)

INVESTIGATION.md          acidosis: fisiología, cascada, 38 referencias con su especie
INVESTIGACION_DIURETICOS.md  diuréticos: mecanismo por clase, resistencia, 27 referencias
PLAN.md               fases y estado
```

## Decisiones Técnicas Importantes

- **REGLA DE ORO — estequiometría estricta** (exigida por Juanjo 2026-11-06). Ningún transportador ni
  enzima funciona hasta completar su cuenta: la bomba espera 3 Na⁺ y 2 K⁺, el NBCe1 1 Na⁺ y 3 HCO₃⁻, el
  NHE3 1 Na⁺ y 1 H⁺, la AC II 1 CO₂ y 1 H₂O **y entonces produce H⁺ Y HCO₃⁻ a la vez**. Lo que llega sin
  pareja se queda aparcado a la vista. Consecuencia: al bloquear, la cadena se detiene **sola** y no debe
  escapar ni una partícula (verificado: 0 en la célula y 0 en la sangre).
  - Las salidas en ráfaga **no pueden usar `setTimeout`**: seguían disparando después de bloquear. Van por
    `Z.salidas`, que se vacía en el tic.
  - La cadena del proximal es un círculo (el NHE3 necesita el H⁺ que fabrica la AC II): hay que **sembrar**
    un H⁺ o no arranca nunca.
  - **Manitol:** el SGLT2 (1 Na⁺ : 1 glucosa) solo recibe Na⁺ si ya hay sitio reservado en la bomba, para
    que ningún Na⁺ desaparezca. El agua solo cruza la AQP1 cuando antes llegaron solutos a la sangre
    (2 solutos → 1 H₂O, proporción ilustrativa). Con manitol la mitad de esa agua se queda en la luz y
    2 de cada 5 Na⁺ siguen de largo (dilución del Na⁺ luminal; Seely & Dirks 1969). El SGLT2 se dibuja como
    ejemplo de entrada de Na⁺; el texto aclara que la vía principal es el NHE3.
  - **Mapa del manitol** (ajuste aprobado por Juanjo 2026-11-08, tras dos vueltas): actúa en el proximal
    (efecto real pero modesto) **y en el asa de Henle, donde está el efecto mayor** (menos extracción de agua
    en la rama descendente delgada + lavado medular por más flujo medular, que reduce la reabsorción de NaCl
    en el asa gruesa; Brenner & Rector, Goodman & Gilman, micropunción). La insignia 2 va en la **rama
    descendente** (t 0.34); al elegir una clase sus segmentos se tiñen con su color (proximal + rama
    descendente + vértice del asa). Los textos nunca deben dar a entender que actúa solo en uno de los dos.
- **No mencionar datos de animales en los textos visibles** (pedido de Juanjo 2026-11-08): nada de «en
  perros», «en ratas»… en pasos, pies o tarjetas. Las referencias del pie sí se quedan, y la especie se
  anota solo en los documentos de investigación.
- **Las partículas van DEBAJO** de canales, enzimas y rótulos: el ancla `#capa-particulas-ancla` se inserta
  en el SVG **antes** de dibujar los glifos. Si se dibuja después, las bolitas tapan los nombres.
- **Estilo visual de las células** (pedido de Juanjo 2026-10-23, referencia: Fig. 1 de Palmer 2021 /
  Comprehensive Clinical Nephrology): célula color arena, círculos azules = transporte pasivo, verdes con
  ATP = activo, rayitas = canal, flechas negras finas con el ion. En la fila la luz va arriba y la sangre
  abajo para que la luz sea un conducto continuo.
- **Las posiciones de los canales las mandan los libros**, no los artículos: Rose & Post, Brenner & Rector
  y Comprehensive Clinical Nephrology (refs. 34–36). Las 33 tarjetas citan al menos uno de los tres.
- La animación debe mostrar que con **bloqueo directo de ENaC (amilorida/trimetoprim) el pH urinario sube
  (> 5,5)** y con **deficiencia de aldosterona baja (< 5,5)**. Es el punto de enseñanza más delicado.
- Hiperkalemia → amoniogénesis: el K⁺ alto frena la producción proximal de NH₄⁺ (eje de las ATR 4).
- **Bilingüe**: todo texto visible pasa por `NI.i18n`. El separador decimal sigue al idioma (5,8 / 5.8).
  La terminología inglesa se toma de las referencias del proyecto (revistas estadounidenses): *type 1–4
  RTA, thick ascending limb, type A intercalated cell, lumen-negative voltage, ammoniagenesis, titratable
  acid, net acid excretion, urine anion gap*; grafía americana.
- **Analítica: PostHog (servidor de Europa) con consentimiento, sin publicidad** (aprobado por Juanjo
  2026-11-08; reemplaza la regla «sin rastreo, sin cookies»). Todo vive en `js/analitica.js` (carga después
  de `i18n.js` en cada página): arranca con `persistence: 'memory'` y sin grabación (cuenta la visita sin
  cookies); al **Aceptar** pasa a `'localStorage+cookie'` con `set_config` y `startSessionRecording()`
  (entradas enmascaradas); al **Rechazar** o revocar sigue en memoria y borra cookies/claves `ph_*`. La
  elección va en `localStorage['ni-cookies']` ('si'/'no'); el enlace «Cookies» del pie (`[data-cookies]`)
  reabre el aviso. Eventos propios en inglés snake_case por `NI.analitica.evento()`: `atr_option_selected`,
  `atr_step_clicked`, `why_card_opened`, `reference_opened`, `references_expanded`,
  `diuretic_class_selected`, `cell_zoom_opened`, `diuretic_toggled`, `language_changed`, `key_toggled`,
  `social_clicked`, `cookies_accepted`, `cookies_rejected` (todos llevan `pagina` e `idioma`). Si PostHog no
  carga, la página funciona igual. Política en `privacidad.html` (+ `js/privacidad.js`): responsable Juan
  José Jaller (persona natural), 12 meses, Ley 1581/2012, Decreto 1377/2013 y RGPD; el correo se arma con JS
  (`[data-correo]`). Clave pública `phc_qAq3…`, host `https://eu.i.posthog.com`. Pendiente: configurar en
  PostHog la retención de 12 meses. El contador hits.sh de la cabecera se queda por ahora.

## Cómo Correr y Probar
- Local: `python3 -m http.server 8080` en la carpeta (o doble clic en el HTML).
- Publicar: `git add -A && git commit -m "..." && git push`. Cada push actualiza el sitio en ~1 min; **no
  hay ambiente de pruebas**. Subir el `?v=N` de los scripts.
- **Enlaces de prueba** (sirven también para compartir):
  `?lang=en` · `?clase=iac&zoom=1` · `?clase=iac&zoom=1&bloqueo=1` · `?clase=osm&zoom=1&bloqueo=1` ·
  `#prueba` adelanta la animación.
- Si la extensión de Chrome no alcanza el servidor local (el sandbox lo aísla), probar con Chrome sin ventana:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --virtual-time-budget=4000
  --screenshot=<archivo>.png "http://127.0.0.1:8080/diureticos.html?clase=osm&zoom=1#prueba"`.
- Chrome sin ventana tiene **ancho mínimo de 500 px**: para ver el celular (390 px) meter la página en un
  `<iframe width=390>` servido desde el mismo origen. Para revisar cookies/eventos, una página de prueba en
  el mismo origen que carga la página en un iframe y lee `document.cookie` y `posthog.config`.
- Chrome sin ventana congela `requestAnimationFrame`: usar `#prueba` (llama a `avanzar()`) para que la
  captura muestre la animación en marcha.
- **Un iframe de prueba debe servirse del MISMO puerto** que la página, o no puede guiarla (mismo origen).

## Documentos del Proyecto
- `INVESTIGATION.md` — acidosis: fisiología y referencias, cada una **etiquetada con su especie**
  (revisión 2026-11-06: de 35 artículos, 3 sin tejido humano y 2 mixtos; ninguna afirmación de la página
  depende solo de animales).
- `INVESTIGACION_DIURETICOS.md` — diuréticos: documento independiente, 27 referencias de PubMed (las del
  manitol: 23 perro, 24 y 26 rata, 25 humana).
- `PLAN.md` — fases y estado. `CLAUDE.md` — este archivo.

## Deuda Técnica Activa
- **Diuréticos: faltan 4 de las 6 clases** (de asa, tiazídicos, ahorradores de K⁺, acuaréticos).
- **Manitol pendiente de revisión de Juanjo** (2026-11-08).
- **Tarjeta `paracelular`**: se queda corta. La vía paracelular explica (a) por qué la acidosis es
  hiperclorémica —el Cl⁻ sigue al HCO₃⁻ reabsorbido en el proximal— y (b) el **cortocircuito de cloro** que
  disipa el voltaje y produce ATR 4 sin fallo de aldosterona (síndrome de Gordon / PHA2, uropatía
  obstructiva; ref. 33). Juanjo lo dejó pendiente el 2026-11-07.
- **3 tarjetas huérfanas** que nadie puede abrir: `bk`, `aqp2`, `paracelular` (las de `voltaje` y `ca4` ya
  se conectaron). `bk` y `aqp2` son restos de canales que Juanjo descartó: borrar o conectar.
- `js/refs.js` conserva campos `estado` que leen `NI.sim` (restos del simulador; no se llaman).
- Fuera del alcance: volumen extracelular y Na⁺ dinámicos, insulina, pendrina/célula β, hiperkalemia aguda.
- Pendiente de Juanjo: revisar la traducción al inglés (es mía) y confirmar los usuarios de las redes.

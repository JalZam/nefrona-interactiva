# Nefrona Interactiva

**https://nefrona-interactiva.com/ (también https://jalzam.github.io/nefrona-interactiva/, que redirige)**

Sitio educativo de fisiología renal, en español e inglés, con dos secciones:

- **Acidosis** (`index.html`) — la **acidosis metabólica sin anion gap**. Cuatro células del nefrón en fila
  (proximal, asa gruesa, principal, intercalada α) con sus canales y los iones viajando como partículas, y
  ocho opciones: normal, diarrea con riñón sano, ATR 2, ATR 1, ATR 3 y las tres formas de ATR 4. Cada una
  trae una lista numerada de lo que se daña y en qué orden; cada punto se aplica al tocarlo.
- **Diuréticos** (`diureticos.html`) — mapa animado de la nefrona entera (la sangre entra, se filtra,
  recorre el túbulo y sale como orina) con las seis clases de diurético situadas en su segmento, y
  acercamiento a la célula con el mecanismo normal y el bloqueo del fármaco. **En construcción:** por ahora
  tienen acercamiento la acetazolamida y el manitol.

Además: dos **guías en texto** de la acidosis para leer, buscar y citar
([español](https://nefrona-interactiva.com/acidosis-tubular-renal.html),
[inglés](https://nefrona-interactiva.com/renal-tubular-acidosis.html)) y un buzón de sugerencias.

Herramienta de aprendizaje; no es una calculadora clínica. Responsable: **Juan José Jaller (CiMedical)**.

## La regla que gobierna las animaciones

Ningún transportador ni enzima funciona hasta **completar su cuenta**: la bomba espera 3 Na⁺ y 2 K⁺, el
NBCe1 1 Na⁺ y 3 HCO₃⁻, el NHE3 1 Na⁺ y 1 H⁺, la anhidrasa carbónica II 1 CO₂ y 1 H₂O y entonces produce
H⁺ **y** HCO₃⁻ a la vez. Lo que llega sin pareja se queda aparcado a la vista. Por eso, cuando un fármaco
bloquea una pieza, la cadena entera se detiene sola por falta de sustrato, sin tener que apagar nada a mano.

Punto de enseñanza clave de la acidosis: con deficiencia de aldosterona el pH urinario baja de 5,5 (falla
el amonio, no la bomba de H⁺); con bloqueo directo de ENaC no baja de 5,5 (falla el voltaje).

## Estructura

```
index.html            acidosis: animación, panel de ATR, laboratorio, referencias
celda.html            acidosis: una sola célula (para la vista «normal junto a la enferma»)
acidosis-tubular-renal.html / renal-tubular-acidosis.html
                      guías en texto ES / EN (generadas por tools/generar-guia.js; no editar a mano)
privacidad.html       política de tratamiento de datos
diureticos.html       diuréticos: mapa de la nefrona, las 6 clases, acercamiento
style.css             estilos de las dos páginas

js/particulas.js      motor de partículas: caminos SVG, cadenas y colas con estequiometría
js/i18n.js            idioma común (ES/EN)
js/leyenda.js         botón flotante «Guía»: color y sigla de cada bolita
js/analitica.js       estadística de uso (PostHog, Europa) con aviso de cookies
js/buzon.js           buzón de sugerencias

js/nefron-fila.js     acidosis: las 4 células, cajones de orina y heces, laboratorio
js/atr.js             acidosis: las 8 opciones y sus listas numeradas
js/refs.js            acidosis: 38 referencias y 33 tarjetas «¿por qué?»
js/acidosis-en.js     acidosis: traducción al inglés
js/acidosis-i18n.js   acidosis: aplica el idioma en caliente
js/acidosis-comparar.js acidosis: célula normal junto a la enferma

js/diureticos-mapa.js diuréticos: mapa, las 6 clases, resumen
js/diu-zoom.js        diuréticos: acercamiento a la célula (acetazolamida y manitol)
js/diu-refs.js        diuréticos: las 27 referencias de PubMed

INVESTIGATION.md              acidosis: fisiología y 38 referencias (con su especie)
INVESTIGACION_DIURETICOS.md   diuréticos: mecanismo por clase y 27 referencias
PLAN.md / CLAUDE.md           gestión del proyecto
robots.txt, sitemap.xml, llms.txt   para buscadores y asistentes de IA
```

Sin framework, sin dependencias ni compilación. Scripts clásicos (no ES modules) para que abra desde disco.

## Enlaces útiles

`?lang=en` abre en inglés · `?atr=atr1` abre una acidosis (`diarrea`, `atr2`, `atr1`, `atr3`, `atr4h`, `atr4r`, `atr4v`) · `?clase=iac&zoom=1` abre el acercamiento del proximal · `?clase=osm&zoom=1` el del manitol ·
añadir `&bloqueo=1` lo abre ya con el diurético puesto.

## Probar en local

- `python3 -m http.server 8080` en la carpeta y abrir http://localhost:8080 (la vista lado a lado necesita servidor).
- Tras cambiar textos de la acidosis: `node tools/generar-guia.js` rehace las dos guías en texto.
- El reloj usa `requestAnimationFrame`: el navegador lo pausa cuando la pestaña no está visible.

## Publicación

GitHub Pages desde la rama `main`. Cada push a `main` actualiza el sitio en ~1 minuto; no hay ambiente de
pruebas: revisar en local antes de subir. Commits y push los hace Claude Code (decisión del dueño).

## Privacidad

Sin publicidad. La estadística de uso va a PostHog (servidor en Europa): sin permiso se cuenta la visita sin
cookies; con permiso se usan cookies y se graba la sesión con los campos de texto enmascarados. Las sugerencias
del buzón se guardan en el mismo sitio. La cabecera lleva además el contador hits.sh (cuenta cargas de página)
y Google Fonts sirve las tipografías. Detalle en la
[política de tratamiento de datos](https://nefrona-interactiva.com/privacidad.html).

## Historial

- **2026-11-24** — Guías en texto de la acidosis (ES/EN) y botón «Explicación»; robots.txt, mapa del sitio,
  llms.txt, datos estructurados e imagen de vista previa, para buscadores y asistentes de IA.
- **2026-11-23** — Buzón de sugerencias; idioma inicial según el navegador; aviso de cookies más visible; la
  vista lado a lado carga mucho más rápido y el resaltado de lo afectado también se ve en Safari.
- **2026-11-17** — Acidosis: célula normal junto a la enferma, etapa por etapa.
- **2026-11-08 (noche)** — Estadística de uso con PostHog (Europa), aviso de cookies y política de datos.
- **2026-11-07** — Las dos páginas en inglés con interruptor ES|EN; botón flotante «Guía»; revisión de
  exactitud de las 33 tarjetas contra PubMed (2 errores corregidos); las 23 referencias al pie de diuréticos.
- **2026-11-08 (tarde)** — Diuréticos: las clases sin construir muestran una animación de obra en lugar del riñón
  (marca `lista` por clase); manitol ubicado en proximal + asa (efecto mayor en el asa); ref. 26 (Buerkert 1981).
- **2026-11-08** — Diuréticos: acercamiento de los osmóticos (manitol): SGLT2, GLUT2, bomba Na⁺/K⁺ y AQP1;
  el manitol retiene agua en la luz, diluye el Na⁺ y cae su reabsorción. 3 referencias nuevas (26 en total).
- **2026-11-06** — Sección de diuréticos: mapa de la nefrona con las 6 clases y acercamiento al túbulo
  proximal (acetazolamida), con estequiometría estricta en todos los canales y enzimas. Se quitan el
  simulador cuantitativo y la vista en columna.
- **2026-10-26** — Balance ácido-base completo: diarrea con riñón sano, H⁺/K⁺-ATPasa, estímulo de la aldosterona y la acidosis sobre la bomba de H⁺, acidez titulable con fosfato, Cl⁻ plasmático, cajón de heces y excreción neta de ácido en la orina.
- **2026-10-26** — Página principal con todas las ATR (1, 2, 3 y tres formas de 4) en lista numerada sin temporizador; células en fila con cajón de orina; recuperación proximal del HCO₃⁻ filtrado (CA IV, CA II, NBCe1); vista en columna aparte.
- **2026-10-26 (noche)** — Dominio propio nefrona-interactiva.com; reorganización de rótulos para que ningún texto quede bajo un camino de partículas (detector de solapamientos: 0 choques); H₂O visible junto a la anhidrasa carbónica.
- **2026-10-26 (tarde)** — Bombas Na⁺/K⁺ 3 : 2 también en asa y proximal, NBCe1 1 Na⁺ : 3 HCO₃⁻, ClC-Kb en la célula α, reciclaje de K⁺ por Kir4.1; diseño en dos columnas con el panel de paso y explicación fijo al lado de la animación.
- **2026-10-26** — Colas de espera con estequiometría en la animación (bomba 3 Na⁺ : 2 K⁺, NKCC2 con 2 Cl⁻ y ClC-Kb, AE1 1 : 1, NHE3), voltaje luminal medido a partir del Na⁺ que entra por ENaC, y etiquetas en todas las partículas (Cl⁻, CO₂) y canales.
- **2026-10-24** — Página principal de animación paso a paso (normal / antagonista MR / ARA2) con las 4 células en paralelo; el simulador pasa a `simulador.html`. Letras más grandes.

- **2026-10-23** — Kickoff, investigación (33 artículos de PubMed + 3 libros), plan, modelo calibrado,
  célula principal, animación de partículas, cuatro células, mapa del nefrón, eje RAAS, publicación.
  Rediseño de las células al estilo de los esquemas clásicos (luz izquierda, célula arena, intersticio
  derecha, círculos azul/verde, canales como rayitas).

## Pendiente / futuro

- Diuréticos: faltan de asa, tiazídicos, ahorradores de K⁺ y acuaréticos. Ver `PLAN.md`.
- Descartados por ahora: canal BK, pendrina/célula β, acuaporina-2.

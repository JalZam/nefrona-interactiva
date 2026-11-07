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
  solo el túbulo proximal.

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
diureticos.html       diuréticos: mapa de la nefrona, las 6 clases, acercamiento
style.css             estilos de las dos páginas

js/particulas.js      motor de partículas: caminos SVG, cadenas y colas con estequiometría
js/i18n.js            idioma común (ES/EN)
js/leyenda.js         botón flotante «Guía»: color y sigla de cada bolita

js/nefron-fila.js     acidosis: las 4 células, cajones de orina y heces, laboratorio
js/atr.js             acidosis: las 8 opciones y sus listas numeradas
js/refs.js            acidosis: 38 referencias y 33 tarjetas «¿por qué?»
js/acidosis-en.js     acidosis: traducción al inglés
js/acidosis-i18n.js   acidosis: aplica el idioma en caliente

js/diureticos-mapa.js diuréticos: mapa, las 6 clases, resumen
js/diu-zoom.js        diuréticos: acercamiento a la célula (hoy el proximal)
js/diu-refs.js        diuréticos: las 23 referencias de PubMed

INVESTIGATION.md              acidosis: fisiología y 38 referencias (con su especie)
INVESTIGACION_DIURETICOS.md   diuréticos: mecanismo por clase y 23 referencias
PLAN.md / CLAUDE.md           gestión del proyecto
```

Sin framework, sin dependencias ni compilación. Scripts clásicos (no ES modules) para que abra desde disco.

## Enlaces útiles

`?lang=en` abre en inglés · `?clase=iac&zoom=1` abre el acercamiento del proximal ·
añadir `&bloqueo=1` lo abre ya con el diurético puesto.

## Probar en local

- Doble clic en `index.html`, o `python3 -m http.server 8080` en la carpeta y abrir http://localhost:8080.
- El reloj usa `requestAnimationFrame`: el navegador lo pausa cuando la pestaña no está visible.

## Publicación

GitHub Pages desde la rama `main`. Cada push a `main` actualiza el sitio en ~1 minuto; no hay ambiente de
pruebas: revisar en local antes de subir. Commits y push los hace Claude Code (decisión del dueño).

## Privacidad

Todo ocurre en el navegador. No hay cookies, almacenamiento ni envío de datos. La única llamada externa es el contador de visitas de hits.sh (una imagen SVG en la cabecera, clave `nefrona-interactiva.com`): cuenta cargas de página, no identifica personas. Google Fonts
sirve las tipografías.

## Historial

- **2026-11-07** — Las dos páginas en inglés con interruptor ES|EN; botón flotante «Guía»; revisión de
  exactitud de las 33 tarjetas contra PubMed (2 errores corregidos); las 23 referencias al pie de diuréticos.
- **2026-11-06** — Sección de diuréticos: mapa de la nefrona con las 6 clases y acercamiento al túbulo
  proximal (acetazolamida), con estequiometría estricta en todos los canales y enzimas. Se quitan el
  simulador cuantitativo y la vista en columna.
- **2026-11-06** — Se quitan el simulador cuantitativo (`simulador.html`, con su modelo y pruebas) y la vista en columna; queda solo la animación de la acidosis sin anion gap. Recuperables desde el historial de git (commit 14605a3).
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

- Descartados por ahora: canal BK, pendrina/célula β, acuaporina-2.

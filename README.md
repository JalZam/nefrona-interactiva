# Nefrona Interactiva

**https://nefrona-interactiva.com/ (también https://jalzam.github.io/nefrona-interactiva/, que redirige)**

Animación educativa de la **acidosis metabólica sin anion gap**: cómo el riñón maneja el ácido y el
bicarbonato, y cómo falla en cada acidosis tubular renal. Muestra cuatro células (túbulo proximal, asa gruesa
ascendente, célula principal y célula intercalada α del túbulo colector) en fila, con sus canales y bombas y los
iones viajando como partículas.

Herramienta de aprendizaje; no es una calculadora clínica. Responsable: **Juan José Jaller (CiMedical)**.

## Qué muestra

Una sola página (`index.html`). Las cuatro células en fila, de proximal a distal, unidas por la luz tubular
(arriba, hacia la orina) y la sangre (abajo), con cajón de orina y cajón de heces. A la derecha, fijo: la
explicación del canal tocado y las ocho opciones (normal, acidosis por diarrea con riñón sano como control,
ATR 2, ATR 1, ATR 3, ATR 4 por hipoaldosteronismo, por antagonista del MR y por bloqueo de ENaC). Cada una
muestra la lista numerada de lo que se daña y en qué orden; cada punto se aplica al tocarlo. Debajo del
dibujo, una franja de laboratorio con valores ilustrativos: sangre (K⁺, Cl⁻, HCO₃⁻, anion gap) y orina (pH,
Na⁺, K⁺, Cl⁻, brecha aniónica urinaria, NH₄⁺, acidez titulable y excreción neta de ácido).

Punto de enseñanza clave: con deficiencia de aldosterona el pH urinario baja de 5,5 (falla el amonio, no la
bomba de H⁺); con bloqueo directo de ENaC (amilorida) no baja de 5,5 (falla el voltaje).

## Estructura

```
index.html          la página: cabecera, animación, panel de opciones, laboratorio, referencias
style.css           estilos (misma línea visual que Velocímetro Renal)
js/nefron-fila.js   las 4 células en fila, luz/sangre continuas, cajones de orina y heces, laboratorio
js/atr.js           las ocho opciones y sus listas numeradas
js/particulas.js    motor de partículas (caminos SVG, cadenas de dependencia, colas con estequiometría)
js/refs.js          referencias y tarjetas ¿por qué?
INVESTIGATION.md    fisiología, cascada, mapa de causas, referencias
PLAN.md / CLAUDE.md gestión del proyecto (instructivo-creacion-proyecto)
```

Sin framework, sin dependencias ni compilación. Scripts clásicos (no ES modules) para que `index.html`
abra directamente desde el disco.

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

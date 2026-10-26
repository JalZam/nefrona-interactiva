# CLAUDE.md — Nefrona Interactiva

<!-- managed-by: instructivo-creacion-proyecto -->
<!-- initialized: 2026-10-23 -->
<!-- version: 1.0 -->
<!-- status: active -->
<!-- last-completed-step: phase-5 -->

## ¿Qué es este proyecto?
Página web estática (HTML + CSS + JS puro + SVG) para **aprender viendo** la fisiología celular del nefrón y cómo se rompe en la **acidosis tubular renal tipo 4 (ATR4)**. Muestra el funcionamiento normal (canales, transportadores, qué los activa) y permite aplicar causas (medicamentos o enfermedades que bajan la aldosterona o bloquean su acción) y ver, **en tiempo real y con dinámica en días**, cómo cambian los canales de cada célula y los resultados de sangre y orina.

Dueño: Juan José Jaller (nefrólogo). Uso: herramienta personal de aprendizaje; más adelante docencia. Visión futura: ATR 1 y 2, y un "riñón continuo" simulable.

## Estado Actual
**Fase activa:** 2026-10-26: página principal rediseñada con todas las ATR (1, 2, 3 y tres formas de 4), células en fila y panel de lista numerada sin temporizador; publicada. Siguiente: canales que faltan para acidosis sin anion gap (ver PLAN).
**Progreso general:** 5 de 5 fases construidas

## Stack Técnico
- HTML + CSS + JavaScript puro. SVG inline dibujado a mano. Sin framework, sin dependencias, sin compilación.
- Scripts clásicos (`<script src>`), **no ES modules**, para que `index.html` abra desde `file://`. Un solo objeto global `NI`.
- Pruebas del modelo en Node (sin dependencias): `node test/model.test.js`.
- Publicación: GitHub Pages desde `main` del repo `JalZam/nefrona-interactiva`, dominio propio **nefrona-interactiva.com** (GoDaddy DNS: 4 A @ → 185.199.108-111.153, CNAME www → jalzam.github.io; archivo `CNAME`; HTTPS forzado; conectado 2026-10-26). **Commits y push los hace Claude** (decisión de Juanjo 2026-10-23).

## Arquitectura
`ui.js` lee deslizadores → `NI.model.step(dt)` en bucle `requestAnimationFrame` (dt = 0,05 días simulados por paso, velocidad ajustable) → `NI.svg.render(estado)` y `NI.ui.renderLabs(estado)`. El modelo es semi-mecanicista: actividades de canales 0–1 → flujos (mEq/día) → balance de masa de K⁺ y HCO₃⁻ → retroalimentación sobre canales y hormonas. Detalle de ecuaciones en `INVESTIGATION.md` Parte D y en comentarios de `js/model.js`.

## Estructura de Archivos Clave
```
index.html          PÁGINA PRINCIPAL: animación en fila; panel derecho fijo con tarjeta ¿por qué? arriba, botones de las ATR y lista numerada completa
simulador.html      simulador cuantitativo (causas con deslizadores, mapa, RAAS, 4 vistas, laboratorio)
js/nefron-fila.js   PRINCIPAL: 4 células en fila (proximal→distal), luz arriba, sangre abajo, cajón de orina a la derecha; partículas, colas, pilas, carga luminal; render(E)
js/nefron-columna.js  misma escena en columna (proximal arriba, distal abajo) para columna.html
js/atr.js           las 8 opciones (normal, diarrea con riñón sano, ATR 2, 1, 3, 4 hipoaldo, 4 antagonista MR, 4 bloqueo ENaC): lista numerada, cada punto se aplica al tocarlo (sin temporizador)
columna.html        vista secundaria en columna con selector de 2 / 3 / todas las células
style.css           estilos (paleta y tipografías del Velocímetro Renal), estados de canales
js/model.js         el modelo: estado, parámetros, causas, step(dt), reset(), historial 14 días
js/celulas.js       dibuja las 4 células (estilo esquema clásico: luz izq., célula arena, intersticio der.) desde especificaciones; las flechas son los caminos de partículas
js/particulas.js    motor de partículas (iones que viajan por caminos SVG; cadenas de dependencia; colas de espera con estequiometría: cola/aparcar/hayCupo/reservar)
js/escenas.js       corrientes de cada vista/mapa/RAAS acopladas al modelo
js/svg-nefrona.js   estados de canales, voltímetros y textos de los 6 SVG; render(d, s, e, vista)
js/ui.js            deslizadores, reloj de simulación, paneles de laboratorio, sparklines
js/refs.js          referencias numeradas y tarjetas "¿por qué?"
test/model.test.js  pruebas de calibración en Node
INVESTIGATION.md    fisiología, cascada, mapa de causas, modelo, 33 referencias
PLAN.md             fases y estado
```

## Decisiones Técnicas Importantes
- **Modelo cuantitativo en tiempo real** (no cualitativo por pasos), por decisión de Juanjo. Los números son plausibles y calibrados a rangos clínicos publicados, no predicciones para un paciente; se declara en pantalla.
- **Estilo visual de las células** (pedido de Juanjo 2026-10-23, referencia: Fig. 1 de Palmer 2021 / Comprehensive Clinical Nephrology): luz a la izquierda, célula color arena con borde derecho redondeado, intersticio a la derecha, círculos azules = transporte pasivo, verdes con ATP = activo, rayitas = canal, flechas negras finas con el ion. Todo en `js/celulas.js`.
- **4 células dibujadas en v1** (pedido de Juanjo 2026-10-23): túbulo proximal, asa gruesa, célula principal, célula intercalada α, cada una con partículas animadas y dependencias encadenadas. Mapa del nefrón y eje RAAS siempre animados.
- **8 causas → 5 entradas** del modelo (síntesis de aldosterona, renina, bloqueo MR, bloqueo ENaC, entrega distal de Na⁺) + TFG + dieta. Combinables.
- El modelo debe mostrar que con **bloqueo directo de ENaC (amilorida/trimetoprim) el pH urinario sube (>5,5)** y con **deficiencia de aldosterona baja (<5,5)**. Es el punto de enseñanza más delicado.
- Hiperkalemia → amoniogénesis: K⁺ 6,0 ≈ 50 % de producción. Calcineurina: NCC↑ + hiporreninismo parcial. Addison: solo aldosterona.
- **Estequiometría visible** (pedido de Juanjo 2026-10-26): los transportadores con cuenta fija esperan a tener todos sus sustratos aparcados (las tres bombas Na⁺/K⁺ 3 : 2 —proximal, asa, principal—, NKCC2, NBCe1 1 Na⁺ : 3 HCO₃⁻, AE1 1 : 1, NHE3) y el sobrante se acumula o rebota; el Cl⁻ sale por ClC-Kb en asa y célula α, el K⁺ de las bombas se recicla por Kir4.1 / canal K⁺. El voltaje luminal de la animación se mide con los Na⁺ que entran por ENaC frente a los que pasan de largo (no es un valor fijado por el paso).
- Sin publicidad, sin rastreo de valores, sin cookies. Contador de visitas hits.sh (imagen en la cabecera de ambas páginas, una sola cuenta `nefrona-interactiva.com`; cuenta cargas, no personas; añadido 2026-10-26 a pedido de Juanjo). Si algún día quiere visitantes únicos: GoatCounter como en el Velocímetro.

## Cómo Correr el Proyecto
- Ver en local: abrir `index.html` en el navegador (doble clic) o `python3 -m http.server 8080` en la carpeta.
- Pruebas del modelo: `node test/model.test.js`.
- Publicar: `git add -A && git commit -m "..." && git push` (cada push a `main` actualiza el sitio en ~1 min; no hay ambiente de pruebas).

## Documentos del Proyecto
- `INVESTIGATION.md` — Investigación (fisiología, modelo, referencias). Aprobada 2026-10-23.
- `PLAN.md` — Plan de fases y estado. Aprobado 2026-10-23.
- `CLAUDE.md` — Este archivo (contexto técnico).

## Deuda Técnica Activa
- Fuera de v1: volumen extracelular y Na⁺ dinámicos, insulina, célula β/pendrina, fosfato/citrato, hiperkalemia aguda.
- Añadidos 2026-10-26 (solo en la fila, no en columna.html): opción "diarrea con riñón sano", H⁺/K⁺-ATPasa, caja aldosterona/acidosis → H⁺-ATPasa, acidez titulable (fosfato en la luz del colector), Cl⁻ plasmático, cajón de heces, excreción neta de ácido en la orina, franja de laboratorio bajo el dibujo (sangre: Na⁺ fijo 140, K⁺, Cl⁻ = 128 − HCO₃⁻, HCO₃⁻, anion gap; orina: pH, Na⁺, K⁺, Cl⁻ por electroneutralidad, brecha aniónica urinaria, NH₄⁺, ENA; valores ilustrativos derivados del estado). Siguen fuera: BK, pendrina/célula β, acuaporina-2.

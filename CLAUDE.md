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
**Fase activa:** Fase 5 construida (animación paso a paso como página principal, 2026-10-24); 2026-10-26 se añadió estequiometría con colas de espera y voltaje luminal medido. Pendiente revisión de Juanjo.
**Progreso general:** 5 de 5 fases construidas

## Stack Técnico
- HTML + CSS + JavaScript puro. SVG inline dibujado a mano. Sin framework, sin dependencias, sin compilación.
- Scripts clásicos (`<script src>`), **no ES modules**, para que `index.html` abra desde `file://`. Un solo objeto global `NI`.
- Pruebas del modelo en Node (sin dependencias): `node test/model.test.js`.
- Publicación: GitHub Pages desde `main` del repo `JalZam/nefrona-interactiva`. **Commits y push los hace Claude** (decisión de Juanjo 2026-10-23).

## Arquitectura
`ui.js` lee deslizadores → `NI.model.step(dt)` en bucle `requestAnimationFrame` (dt = 0,05 días simulados por paso, velocidad ajustable) → `NI.svg.render(estado)` y `NI.ui.renderLabs(estado)`. El modelo es semi-mecanicista: actividades de canales 0–1 → flujos (mEq/día) → balance de masa de K⁺ y HCO₃⁻ → retroalimentación sobre canales y hormonas. Detalle de ecuaciones en `INVESTIGATION.md` Parte D y en comentarios de `js/model.js`.

## Estructura de Archivos Clave
```
index.html          PÁGINA PRINCIPAL: animación paso a paso; dos columnas (animación izq., panel fijo der. con mecanismo, paso y tarjeta ¿por qué?; en <1180 px la tarjeta es un cajón fijo abajo)
simulador.html      simulador cuantitativo (causas con deslizadores, mapa, RAAS, 4 vistas, laboratorio)
js/nefron-paralelo.js  4 células en fila + luz/sangre continuas, partículas encadenadas, pilas, carga luminal; render(E)
js/pasos.js         mecanismos y pasos (normal / antagonista MR / ARA2), motor de transición y resaltado
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
- Sin publicidad, sin rastreo de valores, sin cookies.

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

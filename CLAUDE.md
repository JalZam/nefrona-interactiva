# CLAUDE.md — Nefrona Interactiva

<!-- managed-by: instructivo-creacion-proyecto -->
<!-- initialized: 2026-10-23 -->
<!-- version: 1.0 -->
<!-- status: active -->
<!-- last-completed-step: phase-4 -->

## ¿Qué es este proyecto?
Página web estática (HTML + CSS + JS puro + SVG) para **aprender viendo** la fisiología celular del nefrón y cómo se rompe en la **acidosis tubular renal tipo 4 (ATR4)**. Muestra el funcionamiento normal (canales, transportadores, qué los activa) y permite aplicar causas (medicamentos o enfermedades que bajan la aldosterona o bloquean su acción) y ver, **en tiempo real y con dinámica en días**, cómo cambian los canales de cada célula y los resultados de sangre y orina.

Dueño: Juan José Jaller (nefrólogo). Uso: herramienta personal de aprendizaje; más adelante docencia. Visión futura: ATR 1 y 2, y un "riñón continuo" simulable.

## Estado Actual
**Fase activa:** v1 publicada en https://jalzam.github.io/nefrona-interactiva/ (2026-10-23). Pendiente revisión de Juanjo en pantalla grande y celular.
**Progreso general:** 4 de 4 fases completadas

## Stack Técnico
- HTML + CSS + JavaScript puro. SVG inline dibujado a mano. Sin framework, sin dependencias, sin compilación.
- Scripts clásicos (`<script src>`), **no ES modules**, para que `index.html` abra desde `file://`. Un solo objeto global `NI`.
- Pruebas del modelo en Node (sin dependencias): `node test/model.test.js`.
- Publicación: GitHub Pages desde `main` del repo `JalZam/nefrona-interactiva`. **Commits y push los hace Claude** (decisión de Juanjo 2026-10-23).

## Arquitectura
`ui.js` lee deslizadores → `NI.model.step(dt)` en bucle `requestAnimationFrame` (dt = 0,05 días simulados por paso, velocidad ajustable) → `NI.svg.render(estado)` y `NI.ui.renderLabs(estado)`. El modelo es semi-mecanicista: actividades de canales 0–1 → flujos (mEq/día) → balance de masa de K⁺ y HCO₃⁻ → retroalimentación sobre canales y hormonas. Detalle de ecuaciones en `INVESTIGATION.md` Parte D y en comentarios de `js/model.js`.

## Estructura de Archivos Clave
```
index.html          estructura: cabecera, panel de causas, nefrona SVG, paneles sangre/orina, referencias
style.css           estilos (paleta y tipografías del Velocímetro Renal), estados de canales
js/model.js         el modelo: estado, parámetros, causas, step(dt), reset(), historial 14 días
js/particulas.js    motor de partículas (iones que viajan por caminos SVG; cadenas de dependencia)
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
- **4 células dibujadas en v1** (pedido de Juanjo 2026-10-23): túbulo proximal, asa gruesa, célula principal, célula intercalada α, cada una con partículas animadas y dependencias encadenadas. Mapa del nefrón y eje RAAS siempre animados.
- **8 causas → 5 entradas** del modelo (síntesis de aldosterona, renina, bloqueo MR, bloqueo ENaC, entrega distal de Na⁺) + TFG + dieta. Combinables.
- El modelo debe mostrar que con **bloqueo directo de ENaC (amilorida/trimetoprim) el pH urinario sube (>5,5)** y con **deficiencia de aldosterona baja (<5,5)**. Es el punto de enseñanza más delicado.
- Hiperkalemia → amoniogénesis: K⁺ 6,0 ≈ 50 % de producción. Calcineurina: NCC↑ + hiporreninismo parcial. Addison: solo aldosterona.
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

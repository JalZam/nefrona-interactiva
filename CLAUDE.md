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
**Fase activa:** 2026-11-06: por decisión de Juanjo el sitio queda SOLO con la animación de la acidosis metabólica sin anion gap (index.html). Se quitaron el simulador cuantitativo y la vista en columna (recuperables desde git, commit 14605a3). Pendiente: revisión visual de Juanjo.
**Progreso general:** 5 de 5 fases construidas

## Stack Técnico
- HTML + CSS + JavaScript puro. SVG inline dibujado a mano. Sin framework, sin dependencias, sin compilación.
- Scripts clásicos (`<script src>`), **no ES modules**, para que `index.html` abra desde `file://`. Un solo objeto global `NI`.
- Publicación: GitHub Pages desde `main` del repo `JalZam/nefrona-interactiva`, dominio propio **nefrona-interactiva.com** (GoDaddy DNS: 4 A @ → 185.199.108-111.153, CNAME www → jalzam.github.io; archivo `CNAME`; HTTPS forzado; conectado 2026-10-26). **Commits y push los hace Claude** (decisión de Juanjo 2026-10-23).

## Arquitectura
Una sola página. `js/atr.js` define las 8 opciones con su lista numerada; cada punto trae un `estado` (actividad de canales 0–1, valores ilustrativos de K⁺, HCO₃⁻, pH, etc.) que `js/nefron-fila.js` dibuja: bloquea canales, acumula sustancias en pilas y pinta la franja de laboratorio. `js/particulas.js` mueve los iones por caminos SVG con colas de estequiometría. Ya no hay modelo cuantitativo (el simulador con `js/model.js` se quitó 2026-11-06).

## Estructura de Archivos Clave
```
index.html          LA PÁGINA: animación en fila; panel derecho fijo con tarjeta ¿por qué? arriba, botones de las ATR y lista numerada completa; franja de laboratorio
js/nefron-fila.js   4 células en fila (proximal→distal), luz arriba, sangre abajo, cajones de orina y heces; partículas, colas, pilas, carga luminal; laboratorio; render(E)
js/atr.js           las 8 opciones (normal, diarrea con riñón sano, ATR 2, 1, 3, 4 hipoaldo, 4 antagonista MR, 4 bloqueo ENaC): lista numerada, cada punto se aplica al tocarlo
js/particulas.js    motor de partículas (caminos SVG; cadenas de dependencia; colas de espera con estequiometría: cola/aparcar/hayCupo/reservar)
js/refs.js          referencias numeradas y tarjetas "¿por qué?" (los campos `estado` que leen NI.sim son restos del simulador, no se usan)
style.css           estilos (paleta y tipografías del Velocímetro Renal), estados de canales
INVESTIGATION.md    fisiología, cascada, mapa de causas, modelo, 33 referencias
PLAN.md             fases y estado
```

## Decisiones Técnicas Importantes
- **Solo la animación** (2026-11-06, decisión de Juanjo): se quitó el simulador cuantitativo en tiempo real y la vista en columna. Los valores de laboratorio de la página son ilustrativos, no predicciones para un paciente.
- **Estilo visual de las células** (pedido de Juanjo 2026-10-23, referencia: Fig. 1 de Palmer 2021 / Comprehensive Clinical Nephrology): luz a la izquierda, célula color arena con borde derecho redondeado, intersticio a la derecha, círculos azules = transporte pasivo, verdes con ATP = activo, rayitas = canal, flechas negras finas con el ion. Todo en `js/celulas.js`.
- **4 células dibujadas en v1** (pedido de Juanjo 2026-10-23): túbulo proximal, asa gruesa, célula principal, célula intercalada α, cada una con partículas animadas y dependencias encadenadas. Mapa del nefrón y eje RAAS siempre animados.
- **8 causas → 5 entradas** del modelo (síntesis de aldosterona, renina, bloqueo MR, bloqueo ENaC, entrega distal de Na⁺) + TFG + dieta. Combinables.
- El modelo debe mostrar que con **bloqueo directo de ENaC (amilorida/trimetoprim) el pH urinario sube (>5,5)** y con **deficiencia de aldosterona baja (<5,5)**. Es el punto de enseñanza más delicado.
- Hiperkalemia → amoniogénesis: K⁺ 6,0 ≈ 50 % de producción. Calcineurina: NCC↑ + hiporreninismo parcial. Addison: solo aldosterona.
- **Estequiometría visible** (pedido de Juanjo 2026-10-26): los transportadores con cuenta fija esperan a tener todos sus sustratos aparcados (las tres bombas Na⁺/K⁺ 3 : 2 —proximal, asa, principal—, NKCC2, NBCe1 1 Na⁺ : 3 HCO₃⁻, AE1 1 : 1, NHE3) y el sobrante se acumula o rebota; el Cl⁻ sale por ClC-Kb en asa y célula α, el K⁺ de las bombas se recicla por Kir4.1 / canal K⁺. El voltaje luminal de la animación se mide con los Na⁺ que entran por ENaC frente a los que pasan de largo (no es un valor fijado por el paso).
- Sin publicidad, sin rastreo de valores, sin cookies. Contador de visitas hits.sh (imagen en la cabecera, una sola cuenta `nefrona-interactiva.com`; cuenta cargas, no personas; añadido 2026-10-26 a pedido de Juanjo). Si algún día quiere visitantes únicos: GoatCounter como en el Velocímetro.

## Cómo Correr el Proyecto
- Ver en local: abrir `index.html` en el navegador (doble clic) o `python3 -m http.server 8080` en la carpeta.
- Publicar: `git add -A && git commit -m "..." && git push` (cada push a `main` actualiza el sitio en ~1 min; no hay ambiente de pruebas).

## Documentos del Proyecto
- `INVESTIGATION.md` — Investigación (fisiología, modelo, referencias). Aprobada 2026-10-23.
- `PLAN.md` — Plan de fases y estado. Aprobado 2026-10-23.
- `CLAUDE.md` — Este archivo (contexto técnico).

## Deuda Técnica Activa
- Fuera de v1: volumen extracelular y Na⁺ dinámicos, insulina, célula β/pendrina, fosfato/citrato, hiperkalemia aguda.
- Añadidos 2026-10-26 : opción "diarrea con riñón sano", H⁺/K⁺-ATPasa, caja aldosterona/acidosis → H⁺-ATPasa, acidez titulable (fosfato en la luz del colector), Cl⁻ plasmático, cajón de heces, excreción neta de ácido en la orina, franja de laboratorio bajo el dibujo (sangre: Na⁺ fijo 140, K⁺, Cl⁻ = 128 − HCO₃⁻, HCO₃⁻, anion gap; orina: pH, Na⁺, K⁺, Cl⁻ por electroneutralidad, brecha aniónica urinaria, NH₄⁺, ENA; valores ilustrativos derivados del estado). Siguen fuera: BK, pendrina/célula β, acuaporina-2.

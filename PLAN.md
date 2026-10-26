# Plan: Nefrona Interactiva (v1 — ATR tipo 4)
**Basado en:** INVESTIGATION.md (aprobado por Juanjo 2026-10-23)
**Última actualización:** 2026-10-23

## Objetivo General
Publicar en GitHub Pages una página que muestre la fisiología celular normal del nefrón (célula principal, célula intercalada α, túbulo proximal) y permita aplicar causas de ATR4 para ver, en tiempo real y con dinámica en días, cómo cambian los canales, la sangre y la orina. Fisiología validada, referencias visibles, sin dependencias ni compilación.

## Decisiones tomadas a criterio de Claude (Juanjo delegó 2026-10-23)
1. Hiperkalemia → amoniogénesis: curva suave con K⁺ 4,0 = 100 %, 5,0 ≈ 75 %, 6,0 ≈ 50 %, 7,0 ≈ 35 %. Se aplica también a la reabsorción de NH₄⁺ en TAL (más leve: 6,0 ≈ 70 %).
2. Inhibidores de calcineurina: activación de NCC (↓ entrega distal de Na⁺, hasta 50 % al 100 % del deslizador) + hiporreninismo parcial (↓ renina hasta 40 %) + ↓ Na⁺/K⁺-ATPasa leve. Se explica en la tarjeta "¿por qué?".
3. Addison: solo aldosterona (síntesis 0 %) con renina alta; nota en pantalla de que cortisol, volumen y Na⁺ quedan fuera de v1.

## Fases

### Fase 1: Modelo cuantitativo y pruebas
**Objetivo:** tener el motor (`js/model.js`) funcionando y calibrado antes de dibujar nada.
**Criterio de éxito:** un script de pruebas en Node (`test/model.test.js`) confirma que: (a) estado normal estable 30 días sin deriva (K⁺ 4,0 ± 0,1, HCO₃⁻ 24 ± 0,5); (b) cada causa al 100 % con TFG 50 cae dentro de los rangos de la tabla B de INVESTIGATION.md a los 14 días; (c) amilorida 100 % → pH urinario > 5,5 y Addison 100 % → pH urinario < 5,5; (d) espironolactona → aldosterona alta, nefropatía diabética → aldosterona y renina bajas; (e) sin oscilaciones (ninguna variable cambia de signo de pendiente más de 2 veces).
**Estado:** [x] Completada 2026-10-23
**Tareas:**
- [x] Estructura del estado, parámetros y entradas (causas, TFG, dieta) con nombres en español
- [x] Ecuaciones D3 (1–20) con constantes de tiempo
- [x] `avanzar(dias)` y `reset()`; historial de 14 días para las gráficas
- [x] Script de pruebas en Node (40 comprobaciones)
- [x] Calibración en 4 rondas. Ajustes respecto a INVESTIGATION.md: curva K⁺→amoniogénesis quedó K 5 ≈ 0,68 / 6 ≈ 0,44 / 7 ≈ 0,31; 20 % de la secreción de K⁺ va por BK (independiente del voltaje) para que amilorida no dispare el K⁺ al infinito; H⁺-ATPasa con mínimo 0,7 independiente de aldosterona; nefropatía diabética reduce 20 % la capacidad distal de secretar K⁺; escala de masa nefronal plana hasta TFG 60

### Fase 2: Célula principal + interfaz base
**Objetivo:** validar el estilo visual y la interacción con una sola célula antes de dibujar las demás.
**Criterio de éxito:** Juanjo abre `index.html`, mueve un deslizador y ve ENaC/ROMK/Na⁺/K⁺-ATPasa cambiar de color y grosor, el voltaje moverse, y K⁺ plasmático subir día a día en el panel de sangre y en su mini-gráfica.
**Estado:** [~] Construida 2026-10-23, pendiente de revisión visual por Juanjo
**Tareas:**
- [x] `index.html` + `style.css` con la paleta y tipografías del Velocímetro
- [x] Panel izquierdo: 8 causas (deslizadores 0–100 %), TFG, ingesta de K⁺, carga ácida, botón "Todo a normal"
- [x] Reloj de simulación: días simulados, velocidad (×1, ×5, ×20), pausa, "Día 0"
- [x] SVG de la célula principal: luz arriba, sangre abajo, ENaC, ROMK, BK, AQP2, Na⁺/K⁺-ATPasa, Kir4.1, MR→SGK1→Nedd4-2 dentro de la célula, voltímetro
- [x] Panel derecho: sangre y orina con flechas, colores por rango y nota interpretativa
- [x] Mini-gráficas de 14 días (K⁺, HCO₃⁻, NH₄⁺ urinario, pH urinario)
- [x] Tarjetas "¿por qué?" ya funcionando para los 10 elementos de la célula principal (adelantado de Fase 3)
- [x] Tira "La cascada" con 6 pasos que se iluminan (adelantado de Fase 3)
- [ ] Revisión visual con Juanjo (pantalla grande y celular)

Nota técnica: el reloj usa `requestAnimationFrame`, que el navegador pausa cuando la pestaña no está visible; por eso la simulación solo avanza con la página en primer plano (comportamiento esperado, no es un error).

### Fase 3: Célula α, túbulo proximal, TAL y RAAS — con animación de partículas
**Objetivo:** completar la cascada visual. **Cambio de alcance 2026-10-23 (pedido de Juanjo):** los iones se animan como partículas que viajan por los canales, con dependencias encadenadas (un movimiento dispara el siguiente y se detiene cuando falla el anterior). Afectó a la Fase 2 (la célula principal pasó de flechas estáticas a partículas) y a esta fase.
**Criterio de éxito:** al aplicar una causa se ve en orden: RAAS → célula principal → voltaje → célula α → K⁺ en sangre → túbulo proximal/TAL → NH₄⁺ en orina → HCO₃⁻ en sangre. Cada canal tiene su tarjeta "¿por qué?" con referencia numerada.
**Estado:** [x] Completada 2026-10-23
**Tareas:**
- [x] Motor de partículas (`js/particulas.js`): corrientes por tasa o por cadena, rebotes "✕" para bloqueos
- [x] Célula principal con partículas: Na⁺ → bomba → K⁺ → ROMK (si hay voltaje) o Kir4.1 (si no); Cl⁻ paracelular; aldosterona rebotando en MR con espironolactona
- [x] Célula intercalada α: H⁺-ATPasa, H⁺/K⁺-ATPasa, Rhcg apical y basolateral, AE1, ClC, anhidrasa carbónica II; NH₃ + H⁺ → NH₄⁺ solo si hay H⁺, si no el NH₃ escapa
- [x] Túbulo proximal: SNAT3, mitocondria (PDG/GDH/PEPCK), NHE3, NBCe1; glutamina → 2 NH₄⁺ + 2 HCO₃⁻; K⁺ alto entra y frena la vía; texto "produce X · sin el freno produciría Y"
- [x] Asa gruesa: NKCC2 con competencia K⁺/NH₄⁺ (rebote ✕), ROMK, Na⁺/K⁺-ATPasa, ClC-Kb, salida de NH₄⁺; depósito medular con opacidad ∝ NH₃
- [x] Mapa del nefrón siempre animado (segmentos coloreados por estado, clic para abrir la célula)
- [x] Eje RAAS con partículas renina → AngII → aldosterona y bloqueos por causa
- [x] 28 tarjetas "¿por qué?" (js/refs.js) con 36 referencias
- [x] Modelo: desplazamiento transcelular de K⁺ por acidosis (círculo vicioso del documento de Juanjo); recalibrado (gK 0,9; inducción de ENaC por K⁺ más leve para que el voltaje baje en Addison)

### Fase 4: Publicación
**Objetivo:** que Juanjo lo abra desde cualquier parte.
**Criterio de éxito:** `https://jalzam.github.io/nefrona-interactiva/` carga con HTTPS, funciona en celular y en proyector, README completo.
**Estado:** [x] Completada 2026-10-23 (falta solo la prueba en celular por Juanjo)
**Tareas:**
- [x] Sección de referencias y aviso de limitaciones del modelo (D4) al pie
- [x] README.md técnico (estructura, cómo probar, cómo publicar, historial)
- [x] Repo GitHub `JalZam/nefrona-interactiva` (público), rama main, Pages activado; verificado con curl: HTTP 200 en la página y los 7 archivos
- [x] Pruebas en Chrome de escritorio (las 4 vistas, Addison y amilorida a 14 días); celular pendiente de Juanjo
- [x] Actualizar `~/.claude/proyectos.json`, memoria y CLAUDE.md del proyecto

### Después de v1 (fuera de este plan)
- ATR tipo 1 (célula α: H⁺-ATPasa, AE1) y ATR tipo 2 (túbulo proximal: NHE3, NBCe1, anhidrasa carbónica).
- "Riñón continuo": un solo nefrón de glomérulo a colector con daños combinables.
- Dominio propio.

### Fase 5: Animación paso a paso (página principal)
**Objetivo (pedido de Juanjo 2026-10-24):** una página solo con la animación, sin deslizadores ni laboratorio, con las 4 células en paralelo conectadas por la luz (arriba, hacia la orina) y la sangre (abajo), y un recorrido paso a paso por mecanismo.
**Criterio de éxito:** elegir "Antagonista del receptor MR" o "ARA2", pulsar "Siguiente" y ver, paso por paso, cómo cada movimiento se detiene y qué se acumula (Na⁺ en la orina, K⁺ en la sangre, ácido retenido, depósito de NH₃ vacío, carga luminal perdida).
**Estado:** [x] Construida y publicada 2026-10-24; pendiente revisión de Juanjo
**Tareas:**
- [x] `index.html` nuevo (animación) y el simulador movido a `simulador.html`, con navegación entre ambos
- [x] `js/nefron-paralelo.js`: 4 células en fila, luz continua arriba (Na⁺ baja y entra por NHE3 / NKCC2 / ENaC según la célula, o sigue a la orina), sangre abajo con eje RAAS; partículas encadenadas; pilas de acumulación; indicador de carga luminal; depósito medular
- [x] `js/pasos.js`: mecanismos "Funcionamiento normal" (6 pasos), "Antagonista del receptor MR" (9) y "ARA2" (10) con estado objetivo por paso, transición suave, resaltado de los elementos del paso y texto explicativo; flechas del teclado
- [x] Letras más grandes en animación y simulador
- [ ] Revisión de Juanjo (pantalla grande); ajustar textos de los pasos si lo pide

## Decisiones Técnicas
- JS puro, scripts clásicos (no ES modules) para que abra desde `file://`; un solo objeto global `NI`.
- SVG inline dibujado a mano; sin D3.
- Integración Euler con dt = 0,05 días; repintado máximo 20 fps, desacoplado del paso del modelo.
- Pruebas del modelo en Node (ya instalado en el Mac mini) sin dependencias.
- Commits y push los hace Claude (decisión de Juanjo 2026-10-23).

## Deuda Técnica
- Volumen extracelular, Na⁺ plasmático, insulina, célula β/pendrina, fosfato/citrato: fuera de v1 (ver INVESTIGATION.md D4).

## Cambios al Plan
- 2026-10-23: plan inicial.
- 2026-10-23: Juanjo pide animación de partículas con dependencias encadenadas y las cuatro células con imagen; se amplía la Fase 3 y se rehace la célula principal con partículas. Las tarjetas y la cascada se habían adelantado en Fase 2.
- 2026-10-24: Juanjo pide una página principal solo de animación, con las 4 células en paralelo unidas por la luz y la sangre, acumulaciones visibles y recorrido paso a paso para 2 causas (antagonista MR y ARA2). Se agrega la Fase 5; para que la luz sea un conducto continuo las células quedan con la apical arriba y la basolateral abajo (se conserva el resto del estilo clásico).
- 2026-10-26: Juanjo pide que cada transportador respete su estequiometría (la bomba espera a tener 3 Na⁺ y 2 K⁺ y el resto se acumula), que la carga luminal cambie según el Na⁺ que de verdad entra por ENaC, y pregunta por unos círculos sin nombre (eran Cl⁻ y CO₂ dibujados sin etiqueta y un canal de K⁺ sin nombre). Se agregan colas de espera al motor de partículas (`esc.cola/aparcar/hayCupo`): bomba principal 3 Na⁺ : 2 K⁺, NKCC2 1 Na⁺ + 1 K⁺/NH₄⁺ + 2 Cl⁻ (con salida por ClC-Kb), AE1 1 HCO₃⁻ : 1 Cl⁻, NHE3 1 Na⁺ : 1 NH₄⁺/H⁺; el voltaje luminal ahora se mide con los Na⁺ que entran por ENaC frente a los que siguen a la orina, y gobierna ROMK y la H⁺-ATPasa.
- 2026-10-26 (tarde): Juanjo pide la misma cuenta 3 : 2 para la bomba del asa, revisar cada canal contra su descripción y ver la explicación sin desplazarse. Se agregan bombas Na⁺/K⁺ con cola en asa y proximal (K⁺ reciclado por Kir4.1 / canal K⁺), NBCe1 como cotransporte 1 Na⁺ : 3 HCO₃⁻, ClC-Kb en la célula α (el Cl⁻ de AE1 ya sale), y el diseño pasa a dos columnas con panel fijo (paso + ¿por qué?) y cajón inferior en pantallas angostas.
- 2026-10-26 (noche): dominio propio nefrona-interactiva.com conectado (GoDaddy DNS por Juanjo, CNAME + HTTPS por Claude).
- 2026-10-26 (noche 2): Juanjo señala textos tapados por partículas y pide revisar la fisiología. Se construye un detector de solapamientos en el navegador (caja de cada texto vs. puntos de todos los caminos y demás textos) y se reorganiza: nombres de canales a un lado de su camino, carriles de la luz a y = 48/74/100, títulos de células en zonas libres (dos líneas), célula principal reordenada (ENaC 850, ROMK 1010, Kir4.1 1140, núcleo 930/400, MR 1040/470), H₂O → H⁺ + OH⁻ al centro, contadores redundantes eliminados. Resultado: 0 solapamientos. Revisión fisiológica canal por canal sin hallazgos; H⁺-ATPasa frenada por voltaje suavizada (0,5 + 0,5·volt).
- 2026-10-26 (noche 3): contador de visitas (badge hits.sh) en la cabecera de index.html y simulador.html, misma clave para todo el sitio; nota en el pie y en README.
- 2026-10-23 (noche): Juanjo pide que las células se vean como la Fig. 1 de Palmer 2021 (Adv Ther; original de Comprehensive Clinical Nephrology): luz a la izquierda, célula color arena, intersticio a la derecha, transportadores como círculos (azul pasivo / verde activo con ATP), canales como rayitas, flechas negras finas. Se crea `js/celulas.js` que dibuja las 4 células desde una especificación con esa convención (dibujo propio, no se copia la figura); las flechas son los caminos de las partículas. Los 4 SVG de `index.html` quedan como cascarones.

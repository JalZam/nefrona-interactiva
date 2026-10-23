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
**Estado:** [ ] Pendiente
**Tareas:**
- [ ] Estructura del estado, parámetros y entradas (causas, TFG, dieta) con nombres en español
- [ ] Ecuaciones D3 (1–20) con constantes de tiempo
- [ ] Función `step(dt)` y `reset()`; historial de 14 días para las gráficas
- [ ] Script de pruebas en Node con los 5 criterios
- [ ] Calibración iterativa hasta pasar las pruebas; documentar constantes en el propio archivo

### Fase 2: Célula principal + interfaz base
**Objetivo:** validar el estilo visual y la interacción con una sola célula antes de dibujar las demás.
**Criterio de éxito:** Juanjo abre `index.html`, mueve un deslizador y ve ENaC/ROMK/Na⁺/K⁺-ATPasa cambiar de color y grosor, el voltaje moverse, y K⁺ plasmático subir día a día en el panel de sangre y en su mini-gráfica.
**Estado:** [ ] Pendiente
**Tareas:**
- [ ] `index.html` + `style.css` con la paleta y tipografías del Velocímetro
- [ ] Panel izquierdo: 8 causas (deslizadores 0–100 %), TFG, ingesta de K⁺, carga ácida, botón "Normal" (reinicia)
- [ ] Reloj de simulación: días simulados, velocidad (×1, ×5, ×20), pausa, reinicio
- [ ] SVG de la célula principal: luz arriba, sangre abajo, ENaC, ROMK, BK, AQP2, Na⁺/K⁺-ATPasa, Kir4.1, MR→SGK1→Nedd4-2 dentro de la célula, indicador de voltaje
- [ ] Panel derecho: sangre (Na⁺, K⁺, Cl⁻, HCO₃⁻, pH, pCO₂, anion gap, renina, aldosterona) y orina (pH, NH₄⁺, K⁺, TTKG, brecha aniónica urinaria) con flechas y colores por rango
- [ ] Mini-gráficas de 14 días (sparklines SVG) para K⁺, HCO₃⁻, NH₄⁺ urinario, pH urinario
- [ ] Revisión visual con Juanjo (pantalla grande y celular)

### Fase 3: Célula α, túbulo proximal, TAL y RAAS
**Objetivo:** completar la cascada visual.
**Criterio de éxito:** al aplicar una causa se ve en orden: RAAS → célula principal → voltaje → célula α → K⁺ en sangre → túbulo proximal/TAL → NH₄⁺ en orina → HCO₃⁻ en sangre. Cada canal tiene su tarjeta "¿por qué?" con referencia numerada.
**Estado:** [ ] Pendiente
**Tareas:**
- [ ] SVG célula intercalada α: H⁺-ATPasa, H⁺/K⁺-ATPasa, Rhcg, AE1, anhidrasa carbónica II; atrapamiento NH₃ + H⁺ → NH₄⁺ en la luz
- [ ] SVG túbulo proximal: glutamina → PDG → GDH → 2 NH₄⁺ + 2 HCO₃⁻; NHE3 apical; salida de HCO₃⁻ basolateral; indicador de pH intracelular (hiperkalemia → alcalinización)
- [ ] Bloque TAL: NKCC2 con competencia K⁺/NH₄⁺; "NH₃ medular" como depósito
- [ ] Bloque RAAS: renina → AngII → aldosterona, con los puntos donde actúan IECA/ARA2, AINE, heparina, Addison, calcineurina
- [ ] Flechas de flujo con grosor proporcional; estados apagado/parcial/normal
- [ ] Tarjetas "¿por qué?" (js/refs.js) con las 33 referencias numeradas
- [ ] Resaltado de la cascada: cada paso se ilumina cuando su variable cruza el umbral

### Fase 4: Publicación
**Objetivo:** que Juanjo lo abra desde cualquier parte.
**Criterio de éxito:** `https://jalzam.github.io/nefrona-interactiva/` carga con HTTPS, funciona en celular y en proyector, README completo.
**Estado:** [ ] Pendiente
**Tareas:**
- [ ] Sección de referencias y aviso de limitaciones del modelo (D4) al pie
- [ ] README.md técnico (estructura, cómo probar, cómo publicar, historial)
- [ ] Repo GitHub `JalZam/nefrona-interactiva` (gh), rama main, Pages activado
- [ ] Pruebas en Chrome de escritorio y celular (Claude in Chrome) y corrección de lo que falle
- [ ] Actualizar `~/.claude/proyectos.json`, memoria y CLAUDE.md del proyecto

### Después de v1 (fuera de este plan)
- ATR tipo 1 (célula α: H⁺-ATPasa, AE1) y ATR tipo 2 (túbulo proximal: NHE3, NBCe1, anhidrasa carbónica).
- "Riñón continuo": un solo nefrón de glomérulo a colector con daños combinables.
- Dominio propio.

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

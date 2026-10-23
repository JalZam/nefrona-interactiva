# Investigación: Nefrona Interactiva (v1 — ATR tipo 4)
**Fecha:** 2026-10-23
**Profundidad:** profunda
**Estado:** borrador para validación por Juanjo (nefrólogo). Nada de esto se programa hasta que la fisiología esté aprobada.

## Resumen Ejecutivo

1. La ATR4 es una **falla de la aldosterona** (deficiencia o resistencia) en el túbulo colector cortical. La lesión primaria está en la **célula principal**: menos ENaC → menos voltaje luminal negativo → menos secreción de K⁺ (ROMK) y menos secreción de H⁺ en la célula intercalada α vecina.
2. La **hiperkalemia es el motor de la acidosis**, no la falta de bomba de H⁺. El K⁺ alto frena la amoniogénesis proximal y la reabsorción de NH₄⁺ en el asa gruesa; sin NH₃ en el intersticio medular no hay amortiguador en el colector, cae la excreción de NH₄⁺ y con ella la excreción neta de ácido. El HCO₃⁻ plasmático baja hasta un nuevo equilibrio (típicamente 17–22 mEq/L).
3. Por eso el pH urinario **sí baja** (<5,5): la bomba de H⁺ funciona, pero hay poco NH₃ que la frene. Esto distingue la ATR4 de la ATR1. La excepción es el **bloqueo directo de ENaC** (amilorida, trimetoprim): el H⁺ queda sin voltaje que lo empuje y el pH urinario puede quedar >5,5 ("ATR hiperkalémica dependiente de voltaje", Batlle 2018).
4. El modelo cuantitativo propuesto tiene 3 módulos celulares + 1 módulo sistémico (RAAS, plasma, orina), con **dinámica en días**: el ENaC cae en horas, el K⁺ sube en 2–5 días, el HCO₃⁻ baja en 1–2 semanas. Así la "cascada" aparece sola al avanzar el tiempo simulado.
5. Las 8 causas pedidas se mapean a 5 entradas del modelo (síntesis de aldosterona, renina, bloqueo del receptor, bloqueo de ENaC, entrega distal de Na⁺) más TFG. Esto evita programar cada causa a mano y permite combinarlas (ej. diabético + IECA + AINE).
6. Stack confirmado: HTML + CSS + JavaScript puro con SVG inline. Sin framework, sin compilación. Funciona abriendo `index.html` desde el disco y en GitHub Pages.

---

## Parte A — Fisiología normal (lo que se va a dibujar)

### A1. Célula principal del túbulo colector cortical (CCD) y túbulo conector

**Membrana apical (luz):**
- **ENaC** (canal epitelial de Na⁺, subunidades α/β/γ). Entrada pasiva de Na⁺ desde la luz. Es el paso limitante del transporte de Na⁺ en este segmento (Verrey 2003, Pearce 2022).
- **ROMK** (Kir1.1). Secreción de K⁺ hacia la luz, impulsada por el gradiente químico (K⁺ intracelular alto) y por el **voltaje transepitelial luminal negativo** que genera ENaC (Palmer LG 1999).
- **BK (maxi-K)**. Secreción de K⁺ activada por flujo tubular alto. Secundario para v1 pero se dibuja.
- **Aquaporina-2** (vasopresina). Se dibuja sin función en v1.

**Membrana basolateral (sangre):**
- **Na⁺/K⁺-ATPasa**. Saca 3 Na⁺ y mete 2 K⁺. Mantiene el Na⁺ intracelular bajo (sostiene la entrada por ENaC) y el K⁺ intracelular alto (sostiene la salida por ROMK).
- **Kir4.1/Kir5.1** (reciclaje de K⁺ basolateral). Se dibuja; no se modela en v1.

**Qué activa cada canal — eje aldosterona:**
1. Aldosterona entra a la célula y se une al **receptor mineralocorticoide (MR)**. (El cortisol también se une al MR, pero la **11β-HSD2** lo inactiva en estas células; por eso el MR "ve" solo aldosterona. Importa para Addison y para regaliz, no para v1.)
2. MR-aldosterona va al núcleo e induce **SGK1** (serum- and glucocorticoid-regulated kinase 1) en 30–60 min.
3. SGK1 fosforila a **Nedd4-2** (ubiquitina-ligasa). Nedd4-2 fosforilada deja de marcar ENaC para retirarlo de la membrana → **más ENaC en superficie** (efecto rápido, horas) (Vallon 2005, Bens 2006).
4. A más largo plazo (6 h – días) aumenta la transcripción de **αENaC**, de la **subunidad α de la Na⁺/K⁺-ATPasa** y de **ROMK** (Verrey 2003).
5. Resultado: ↑ entrada de Na⁺ → voltaje luminal más negativo (de ≈ –10 mV a ≈ –40 mV o más) → ↑ secreción de K⁺ por ROMK y ↑ secreción de H⁺ en la célula α vecina.

**Otros reguladores (se mencionan en pantalla, se modelan parcialmente):**
- **K⁺ plasmático alto** estimula directamente la síntesis de aldosterona en la zona glomerulosa (independiente de angiotensina II) y estimula ROMK/ENaC por vía renal propia. Es la retroalimentación clave: si la glándula puede responder, la hiperkalemia sube la aldosterona.
- **Angiotensina II** estimula ENaC directamente además de estimular la aldosterona.
- **Flujo distal y entrega de Na⁺**: sin Na⁺ en la luz, ENaC no tiene sustrato y no hay voltaje (relevante para inhibidores de calcineurina vía NCC).

### A2. Célula intercalada α (secretora de ácido)

**Apical:**
- **H⁺-ATPasa vacuolar (V-ATPasa)**. Bomba electrogénica de H⁺ hacia la luz. Principal mecanismo de acidificación distal (Wagner 2009).
- **H⁺/K⁺-ATPasa**. Secreta H⁺ y **reabsorbe K⁺**. Se induce en depleción de K⁺; en hiperkalemia pierde relevancia. Se dibuja.
- **Rhcg** (glicoproteína Rh C). Transporta NH₃ hacia la luz, donde se une al H⁺ secretado y queda atrapado como NH₄⁺ (Weiner 2014, 2017).

**Basolateral:**
- **AE1** (intercambiador Cl⁻/HCO₃⁻, SLC4A1). Saca a la sangre el HCO₃⁻ "nuevo" que genera la anhidrasa carbónica II al formar el H⁺ secretado. Por cada H⁺ secretado y atrapado (como NH₄⁺ o acidez titulable) entra un HCO₃⁻ nuevo a la sangre.
- **Anhidrasa carbónica II** (citosólica): CO₂ + H₂O → H⁺ + HCO₃⁻.

**Qué activa la H⁺-ATPasa:**
1. **Acidosis sistémica** (el estímulo más fuerte: inserción de bombas en la membrana apical).
2. **Angiotensina II**.
3. **Aldosterona**, por dos vías: genómica vía MR (expresión de subunidades) y **no genómica**, rápida (15 min), vía proteína quinasa C y Ca²⁺ intracelular, independiente del MR (Winter 2004, 2011).
4. **Voltaje luminal negativo generado por ENaC** en la célula principal vecina: la bomba es electrogénica, así que un lumen más negativo le facilita el trabajo (Wagner 2009; Batlle 2018). Esta es la conexión célula principal → célula α que hace que un problema de Na⁺ se vuelva un problema de H⁺.

**Dato clave para la ATR4:** aunque la secreción de H⁺ baje un poco, el pH urinario depende de cuánto amortiguador hay. Con poco NH₃, los pocos H⁺ secretados bajan el pH muy rápido (<5,5). Con mucho NH₃ (acidosis normal con riñón sano) el pH urinario también baja, pero se excretan muchos más H⁺ como NH₄⁺. Por eso **pH urinario bajo ≠ excreción de ácido adecuada**; el indicador correcto es la **excreción de NH₄⁺** (Rehman 2023, Batlle 2018).

### A3. Túbulo proximal (amoniogénesis) y asa gruesa (reciclaje de NH₄⁺)

**Producción (túbulo proximal, segmentos S1–S3):**
- Glutamina entra por SNAT3 (basolateral) y por reabsorción apical.
- **Glutaminasa dependiente de fosfato (PDG)** → glutamato + NH₄⁺.
- **Glutamato deshidrogenasa (GDH)** → α-cetoglutarato + NH₄⁺.
- El α-cetoglutarato se metaboliza (vía **PEPCK**/gluconeogénesis) y rinde **2 HCO₃⁻** nuevos por cada glutamina. Ese HCO₃⁻ sale a la sangre; los 2 NH₄⁺ salen a la luz por **NHE3** (sustituyendo al H⁺ en el intercambiador Na⁺/H⁺) y como NH₃ por difusión (Weiner 2014, Hamm 2015).
- **Balance**: el NH₄⁺ excretado en la orina final es lo que "cuenta" como ácido excretado. Si el NH₄⁺ se reabsorbe y vuelve al hígado, se convierte en urea consumiendo el HCO₃⁻ ganado: ganancia neta cero.

**Qué activa la amoniogénesis:**
1. **Acidosis** (↑ PDG, GDH, PEPCK, SNAT3): la respuesta adaptativa puede multiplicar la excreción de NH₄⁺ por 5–10 en días.
2. **Hipokalemia** (↑).
3. **Angiotensina II** y **glucocorticoides** (↑).
4. **Hiperkalemia (↓)** — el eslabón central de la ATR4. Mecanismo aceptado: el K⁺ alto entra a la célula proximal a cambio de H⁺ → **alcalinización intracelular** → menos PDG/PEPCK → menos NH₄⁺ (DuBose 1997; Weiner 2019; Adomako 2022).

**Reciclaje (asa gruesa ascendente, TAL):**
- El NH₄⁺ luminal se reabsorbe por **NKCC2** ocupando el sitio del K⁺ (y por ROMK). Esto construye un **gradiente medular de NH₃/NH₄⁺** que luego alimenta el colector vía Rhcg.
- **Hiperkalemia**: el K⁺ compite con el NH₄⁺ por NKCC2 → menos NH₄⁺ reabsorbido → menos NH₃ medular → menos NH₄⁺ en orina final (DuBose 1997; Weiner 2017). Segundo golpe al mismo eslabón.

**Para v1 el TAL se dibuja como "pasador" del NH₄⁺ (un bloque intermedio), no como célula completa.**

### A4. Balance sistémico (lo que se ve en sangre)

- Producción diaria de ácido no volátil ≈ **1 mEq/kg/día (≈ 70 mEq/día)** con dieta occidental. El riñón debe excretar lo mismo (excreción neta de ácido, ENA = NH₄⁺ + acidez titulable − HCO₃⁻ urinario). Normalmente NH₄⁺ ≈ 2/3 de la ENA (≈ 40 mEq/día) y acidez titulable ≈ 1/3 (≈ 30 mEq/día, sobre todo fosfato) (Hamm 2015).
- Si la ENA cae por debajo de la producción, el HCO₃⁻ plasmático baja ≈ (déficit diario / espacio de HCO₃⁻ ≈ 50 % del peso en L). Con un déficit de 20 mEq/día en 70 kg: ≈ 0,6 mEq/L/día. La propia acidosis estimula la amoniogénesis residual y se alcanza un **nuevo estado estable** con HCO₃⁻ más bajo.
- Cl⁻ sube de forma recíproca (anion gap normal). Compensación respiratoria: pCO₂ ≈ 1,5 × HCO₃⁻ + 8 (Winter).
- Batlle 2018: **con TFG normal, la sola deficiencia de aldosterona produce apenas una caída modesta del HCO₃⁻**; la acidosis franca aparece cuando además hay ERC leve-moderada (menos nefronas amoniogénicas). Por eso el modelo necesita la TFG como entrada.
- Ingesta de K⁺ ≈ 80–100 mEq/día; el 90 % sale por orina (secreción en CCD/CNT), 10 % por colon. En ERC el colon compensa parcialmente (Palmer BF 2023).

---

## Parte B — La cascada de la ATR4 (lo que se va a animar)

Orden temporal cuando se aplica una causa en el tiempo 0:

| Paso | Tiempo aprox. | Qué pasa | Dónde se ve |
|---|---|---|---|
| 0 | 0 | Cae la aldosterona efectiva (deficiencia) o la ocupación del MR (resistencia) o ENaC directamente (bloqueo). | Panel RAAS / glándula |
| 1 | 1–6 h | ↓ SGK1 → Nedd4-2 activa retira ENaC. ↓ ENaC en superficie. Después ↓ Na⁺/K⁺-ATPasa y ↓ ROMK (días). | Célula principal |
| 2 | inmediato tras 1 | Voltaje luminal menos negativo (–40 → –10 mV). | Indicador de voltaje |
| 3 | horas | ↓ secreción de K⁺ (menos fuerza eléctrica + menos ROMK). ↓ secreción de H⁺ en célula α (menos voltaje, menos estímulo directo de aldosterona). Natriuresis leve. | Célula principal, célula α, orina |
| 4 | 2–5 días | K⁺ plasmático sube hasta que el K⁺ alto estimula lo suficiente la secreción residual para igualar la ingesta. Si la glándula responde (resistencia), la aldosterona sube; si no (deficiencia), no. | Sangre |
| 5 | días | Hiperkalemia → ↓ amoniogénesis proximal y ↓ reabsorción de NH₄⁺ en TAL → ↓ NH₃ medular → ↓ NH₄⁺ urinario. | Túbulo proximal, TAL, orina |
| 6 | 1–2 semanas | ↓ ENA < producción de ácido → HCO₃⁻ baja, Cl⁻ sube; la acidosis estimula la amoniogénesis residual → nuevo equilibrio con HCO₃⁻ 17–22. | Sangre |
| 7 | estado estable | Orina: pH < 5,5, NH₄⁺ bajo, brecha aniónica urinaria positiva, TTKG < 5–7. (Si la causa es bloqueo de ENaC: pH urinario puede ser > 5,5.) | Orina |

**Valores objetivo para calibrar el modelo (ATR4 típica, TFG 40–60):** K⁺ 5,5–6,5; HCO₃⁻ 17–22; Cl⁻ 108–114; Na⁺ 136–140; pH urinario 5,0–5,5; NH₄⁺ urinario < 30–40 mEq/día (normal ante acidosis: > 100); brecha aniónica urinaria positiva (+10 a +40); TTKG < 5 (esperado en hiperkalemia con aldosterona normal: > 10); aldosterona baja (deficiencia) o alta (resistencia); renina baja (hiporreninémico) o alta (Addison, resistencia).

---

## Parte C — Mapa de causas → entradas del modelo

| Causa | Entrada principal | Entradas secundarias | Renina | Aldosterona plasm. | Fuente |
|---|---|---|---|---|---|
| Espironolactona / eplerenona | Bloqueo del MR (0–100 %) | — | ↑ | ↑ (retroalimentación por K⁺ y volumen) | Palmer 2020 |
| Amilorida / triamtereno / trimetoprim / pentamidina | Bloqueo directo de ENaC (0–100 %) | Voltaje cae aunque el MR esté intacto → H⁺-ATPasa pierde empuje → pH urinario puede subir | ↑ | ↑ | Velázquez 1993; Batlle 2018 |
| IECA / ARA2 | ↓ angiotensina II efectiva (0–100 %) → ↓ síntesis de aldosterona | ↓ estímulo directo de AngII sobre ENaC, H⁺-ATPasa y amoniogénesis | ↑ | ↓ | Palmer 2020 |
| AINES | ↓ prostaglandinas → ↓ renina (0–100 %) | ↓ TFG leve | ↓ | ↓ | Sousa 2016 |
| Heparina | ↓ síntesis de aldosterona en zona glomerulosa (↓ receptores AT1, atrofia) | cortisol normal | ↑ o normal | ↓ | Oster 1995 |
| Nefropatía diabética | ↓ renina (hipoaldosteronismo hiporreninémico) | ↓ TFG; ↓ insulina → menos captación celular de K⁺ | ↓ | ↓ | Sousa 2016; Wilczynski 2015 |
| Addison (insuficiencia suprarrenal primaria) | ↓ síntesis de aldosterona (0–100 %) | ↓ cortisol (hiponatremia, hipovolemia; fuera del alcance de v1 salvo nota) | ↑↑ | ↓↓ | Wilczynski 2015 |
| Inhibidores de calcineurina (tacrolimus, ciclosporina) | ↑ NCC → ↓ entrega distal de Na⁺ (0–100 %) | ↓ renina/aldosterona (hiporreninémico en parte), ↓ Na⁺/K⁺-ATPasa y ↓ ROMK, resistencia parcial al MR | ↓ o normal | ↓ o normal | Hoorn 2011; Unsal 2024 |

El usuario podrá mover cada causa de 0 a 100 % y combinarlas. Además: **TFG** (15–120 mL/min), **ingesta de K⁺** (40–150 mEq/día) y **carga ácida** (40–100 mEq/día).

---

## Parte D — Modelo cuantitativo propuesto

### D1. Principios
- **Semi-mecanicista**: cada canal tiene una "actividad" de 0 a 1 (1 = normal). Las actividades se combinan en flujos (mEq/día). Los flujos cambian las concentraciones plasmáticas por balance de masa. Las concentraciones retroalimentan a los canales.
- **Dinámico en días**: integración simple (Euler) con paso de 0,05 días. El usuario ve un reloj de "días simulados" y puede acelerar, pausar o reiniciar. Al mover un deslizador, el modelo sigue integrando desde el estado actual (no salta): así se ve la cascada.
- **Honestidad**: los números son plausibles y calibrados a los rangos clínicos de la tabla B, no predicciones para un paciente. Se dirá en pantalla.

### D2. Variables de estado (lo que cambia con el tiempo)
Plasma: K⁺, HCO₃⁻ (Cl⁻ y pH derivados). Hormonas: renina, angiotensina II, aldosterona. Expresión genómica (lenta, τ ≈ 1–2 días): ENaC, Na⁺/K⁺-ATPasa, ROMK, H⁺-ATPasa. Enzimas proximales (τ ≈ 2–3 días): amoniogénesis adaptativa. Intersticio medular: NH₃ (τ ≈ 1 día).

### D3. Ecuaciones (forma, no números finales; se calibran en Fase 2)
1. **Renina** = base × f(AINE↓, diabetes↓, calcineurina↓) × g(volumen) — v1: volumen constante salvo nota.
2. **AngII efectiva** = renina × (1 − IECA/ARA2).
3. **Aldosterona** = capacidad de síntesis (Addison↓, heparina↓) × [a·AngII + b·(K⁺ − 4,0)⁺ + c]. El término de K⁺ es la retroalimentación directa.
4. **Ocupación del MR** = aldosterona × (1 − bloqueo MR). Normalizada: 1 = normal.
5. **Expresiones genómicas** (ENaC, NaK, ROMK, H⁺-ATPasa): dX/dt = (X_objetivo(MR) − X)/τ, con X_objetivo = mín + (1 − mín)·Hill(MR). "mín" ≈ 0,3–0,4 porque la expresión basal no depende solo de aldosterona.
6. **Actividad ENaC** = expresión × (1 − bloqueo directo) × entrega distal de Na⁺ (calcineurina↓) × (1 + d·AngII).
7. **Voltaje luminal** V = −V_max × ENaC/(K_½ + ENaC). Normal ≈ −35 mV; sin ENaC ≈ −5 mV.
8. **Secreción de K⁺** (mEq/día) = ROMK × NaK × h(V) × (1 + e·(K⁺ − 4,0)) × flujo. h(V) crece con el voltaje negativo.
9. **Balance de K⁺**: dK⁺/dt = (ingesta − secreción − colon)/espacio aparente (con amortiguación celular: el 98 % del K⁺ es intracelular, por eso el espacio aparente es grande y el ascenso es lento).
10. **Secreción de H⁺ en célula α** = H⁺-ATPasa × h'(V) × (1 + i·acidosis) × (1 + j·aldosterona no genómica) × (1 + k·AngII).
11. **Amoniogénesis proximal** = base × adaptación(acidosis, τ 2–3 d) × m(K⁺), con m decreciente: m(4,0) = 1; m(6,0) ≈ 0,5. × (1 + n·AngII).
12. **Reabsorción en TAL** = fracción × p(K⁺), p decreciente con K⁺. → **NH₃ medular**.
13. **NH₄⁺ urinario** = mín(NH₃ disponible en colector, capacidad de atrapamiento ∝ secreción de H⁺).
14. **Acidez titulable** ≈ 30 mEq/día × (TFG/100) × factor de pH urinario.
15. **ENA** = NH₄⁺ + AT − HCO₃⁻ urinario (≈ 0 si pH < 6,2).
16. **Balance de HCO₃⁻**: dHCO₃⁻/dt = (ENA − carga ácida)/espacio de HCO₃⁻ (≈ 0,5 × peso).
17. **Cl⁻** = Na⁺ − HCO₃⁻ − anion gap (12). **pCO₂** = 1,5·HCO₃⁻ + 8. **pH** por Henderson-Hasselbalch.
18. **pH urinario** = función de (H⁺ secretado − amortiguador disponible): mucho H⁺ y poco NH₃ → 4,8–5,3; poco H⁺ (ENaC bloqueado) → 5,8–6,5.
19. **Orina**: K⁺ urinario = secreción/volumen; **TTKG** = (K⁺u/K⁺p)/(Osm u/Osm p) con Osm u ≈ 500; **brecha aniónica urinaria** = Na⁺u + K⁺u − Cl⁻u, modelada como 20 − 0,8·NH₄⁺u (mEq/L) para que sea negativa con NH₄⁺ alto y positiva con NH₄⁺ bajo.
20. **Efecto TFG**: escala la amoniogénesis total, la acidez titulable, la secreción máxima de K⁺ y añade la carga de K⁺ y ácido retenida en ERC.

### D4. Lo que el modelo NO hace en v1 (se declara en pantalla)
- Volumen extracelular y Na⁺ plasmático dinámicos (Addison, hipovolemia).
- Insulina/catecolaminas (desplazamiento transcelular de K⁺).
- Célula intercalada β / pendrina (se dibuja, no se modela).
- Fosfato y citrato urinarios.
- Hiperkalemia aguda (arritmias): solo el estado crónico.

---

## Parte E — Tecnologías y arquitectura

### Tecnologías evaluadas
| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| HTML + CSS + JS puro, SVG inline | Igual que Velocímetro y Taper; sin compilación; abre desde disco; GitHub Pages directo; fácil de mantener | Sin componentes reutilizables "gratis" | **Elegida** |
| React/Vue + bundler | Componentes | Compilación, dependencias, Juanjo no puede tocarlo | Descartada |
| D3.js para SVG | Animaciones potentes | Dependencia externa grande; lo que se necesita (mover atributos de SVG) se hace a mano | Descartada |
| Canvas | Rápido | No se puede inspeccionar ni estilizar como SVG; peor para proyector/impresión | Descartada (SVG) |
| ES modules (`import`) | Código ordenado | No funcionan desde `file://` (CORS) | Descartada: varios `<script>` clásicos con un solo objeto global `NI` |

### Arquitectura propuesta
```
index.html         estructura: cabecera, panel de causas, nefrona SVG, paneles sangre/orina, referencias
style.css          estilos, estados visuales de canales (activo/parcial/apagado), tema claro
js/model.js        el modelo (D3): estado, parámetros, paso de integración, causas
js/svg-nefrona.js  dibujo SVG de las 3 células + RAAS + TAL; funciones que reciben el estado y actualizan colores, grosores, flechas
js/ui.js           deslizadores de causas, reloj de simulación, paneles de laboratorio, gráficas de tendencia (sparklines SVG)
js/refs.js         referencias numeradas y los tooltips "¿por qué?" de cada canal
README.md          doc técnica (como en Velocímetro)
```
Flujo: `ui` lee deslizadores → `model.step(dt)` en un bucle `requestAnimationFrame` → `svg.render(estado)` y `ui.renderLabs(estado)`.

### Diseño visual (línea)
- Misma familia tipográfica y paleta clara del Velocímetro (Inter/Outfit, azules), para que las herramientas de Juanjo se vean de la misma casa.
- Tres células grandes en fila (proximal → TAL como bloque pequeño → célula principal + célula α pegadas), luz arriba, sangre abajo, con flechas cuyo grosor es proporcional al flujo. Canal apagado = gris y tachado; parcial = ámbar; normal = azul/verde.
- Panel izquierdo: causas (deslizadores 0–100 %) + TFG + dieta. Panel derecho: sangre y orina con flechas ↑↓ y color según rango, y mini-gráficas de 14 días.
- Botón "¿por qué?" en cada canal abre una tarjeta de 3–5 líneas con la referencia.

---

## Riesgos Identificados
1. **Sobre-simplificación**: un modelo de 20 ecuaciones no es un nefrón. Mitigación: declararlo, calibrar contra rangos publicados, validación de Juanjo.
2. **Calibración inestable**: con retroalimentaciones (K⁺→aldosterona, acidosis→amoniogénesis) puede oscilar. Mitigación: constantes de tiempo largas, paso pequeño, pruebas automáticas de estado estable para cada causa al 0 % y 100 %.
3. **Confusión ATR4 vs ATR hiperkalémica por voltaje**: el modelo debe mostrar explícitamente que con amilorida el pH urinario sube. Si no se calibra bien, la herramienta enseña algo falso.
4. **Carga de dibujo SVG**: 3 células con ~15 transportadores es trabajo manual grande. Mitigación: construir primero la célula principal completa y validar el estilo antes de dibujar las otras dos.
5. **Rendimiento en celular**: bucle de animación + SVG grande. Mitigación: paso de integración desacoplado del repintado (repintar a 20 fps máximo).

---

## Fuentes y Referencias

Libros:
- Rose BD, Post TW. *Clinical Physiology of Acid-Base and Electrolyte Disorders.* 5.ª ed. McGraw-Hill; 2001. (Capítulos de regulación renal del K⁺ y acidosis metabólica.)
- Yu ASL, Chertow GM, Luyckx VA, Marsden PA, Skorecki K, Taal MW (eds). *Brenner & Rector's The Kidney.* 11.ª ed. Elsevier; 2020. (Transporte de K⁺; regulación ácido-base.)
- Johnson RJ, Floege J, Tonelli M (eds). *Comprehensive Clinical Nephrology.* 7.ª ed. Elsevier; 2024. (Capítulos de trastornos del K⁺ y acidosis metabólica.)

Artículos (recuperados de PubMed, 2026-10-23):
1. Palmer BF, Kelepouris E, Clegg DJ. Renal Tubular Acidosis and Management Strategies: A Narrative Review. *Adv Ther.* 2021;38(2):949-968. https://doi.org/10.1007/s12325-020-01587-5
2. Batlle D, Arruda J. Hyperkalemic Forms of Renal Tubular Acidosis: Clinical and Pathophysiological Aspects. *Adv Chronic Kidney Dis.* 2018;25(4):321-333. https://doi.org/10.1053/j.ackd.2018.05.004
3. DuBose TD Jr. Hyperkalemic hyperchloremic metabolic acidosis: pathophysiologic insights. *Kidney Int.* 1997;51(2):591-602. https://doi.org/10.1038/ki.1997.85
4. Hamm LL, Nakhoul N, Hering-Smith KS. Acid-Base Homeostasis. *Clin J Am Soc Nephrol.* 2015;10(12):2232-2242. https://doi.org/10.2215/CJN.07400715
5. Weiner ID, Verlander JW. Ammonia Transporters and Their Role in Acid-Base Balance. *Physiol Rev.* 2017;97(2):465-494. https://doi.org/10.1152/physrev.00011.2016
6. Weiner ID, Mitch WE, Sands JM. Urea and Ammonia Metabolism and the Control of Renal Nitrogen Excretion. *Clin J Am Soc Nephrol.* 2015;10(8):1444-1458. https://doi.org/10.2215/CJN.10311013
7. Weiner ID, Verlander JW. Ammonia transport in the kidney by Rhesus glycoproteins. *Am J Physiol Renal Physiol.* 2014;306(10):F1107-F1120. https://doi.org/10.1152/ajprenal.00013.2014
8. Weiner ID, Verlander JW. Emerging Features of Ammonia Metabolism and Transport in Acid-Base Balance. *Semin Nephrol.* 2019;39(4):394-405. https://doi.org/10.1016/j.semnephrol.2019.04.008
9. Wagner CA, Devuyst O, Bourgeois S, Mohebbi N. Regulated acid-base transport in the collecting duct. *Pflugers Arch.* 2009;458(1):137-156. https://doi.org/10.1007/s00424-009-0657-z
10. Winter C, Schulz N, Giebisch G, Geibel JP, Wagner CA. Nongenomic stimulation of vacuolar H+-ATPases in intercalated renal tubule cells by aldosterone. *Proc Natl Acad Sci U S A.* 2004;101(8):2636-2641. https://doi.org/10.1073/pnas.0307321101
11. Winter C, Kampik NB, Vedovelli L, et al. Aldosterone stimulates vacuolar H+-ATPase activity in renal acid-secretory intercalated cells mainly via a protein kinase C-dependent pathway. *Am J Physiol Cell Physiol.* 2011;301(5):C1251-C1261. https://doi.org/10.1152/ajpcell.00076.2011
12. Pearce D, Manis AD, Nesterov V, Korbmacher C. Regulation of distal tubule sodium transport: mechanisms and roles in homeostasis and pathophysiology. *Pflugers Arch.* 2022;474(8):869-884. https://doi.org/10.1007/s00424-022-02732-5
13. Verrey F, Summa V, Heitzmann D, et al. Short-term aldosterone action on Na,K-ATPase surface expression: role of aldosterone-induced SGK1? *Ann N Y Acad Sci.* 2003;986:554-561. https://doi.org/10.1111/j.1749-6632.2003.tb07253.x
14. Vallon V, Lang F. New insights into the role of serum- and glucocorticoid-inducible kinase SGK1 in the regulation of renal function and blood pressure. *Curr Opin Nephrol Hypertens.* 2005;14(1):59-66. https://doi.org/10.1097/00041552-200501000-00010
15. Bens M, Chassin C, Vandewalle A. Regulation of NaCl transport in the renal collecting duct: lessons from cultured cells. *Pflugers Arch.* 2006;453(2):133-146. https://doi.org/10.1007/s00424-006-0123-0
16. Palmer LG. Potassium secretion and the regulation of distal nephron K channels. *Am J Physiol.* 1999;277(6):F821-F825. https://doi.org/10.1152/ajprenal.1999.277.6.F821
17. Palmer LG, Schnermann J. Integrated control of Na transport along the nephron. *Clin J Am Soc Nephrol.* 2015;10(4):676-687. https://doi.org/10.2215/CJN.12391213
18. Palmer BF, Clegg DJ. Pathophysiology and clinical management of hyperkalemia in chronic kidney disease. *Minerva Med.* 2023;114(5):719-735. https://doi.org/10.23736/S0026-4806.23.08465-3
19. Palmer BF, Clegg DJ. Extrarenal Effects of Aldosterone on Potassium Homeostasis. *Kidney360.* 2022;3(3):561-568. https://doi.org/10.34067/KID.0006762021
20. Eladari D, Chambrey R, Peti-Peterdi J. A new look at electrolyte transport in the distal tubule. *Annu Rev Physiol.* 2012;74:325-349. https://doi.org/10.1146/annurev-physiol-020911-153225
21. Edwards A, Crambert G. Versatility of NaCl transport mechanisms in the cortical collecting duct. *Am J Physiol Renal Physiol.* 2017;313(6):F1254-F1263. https://doi.org/10.1152/ajprenal.00369.2017
22. Wall SM. Regulation of Blood Pressure and Salt Balance By Pendrin-Positive Intercalated Cells. *Hypertension.* 2022;79(4):706-716. https://doi.org/10.1161/HYPERTENSIONAHA.121.16492
23. Batlle D, Ba Aqeel SH, Marquez A. The Urine Anion Gap in Context. *Clin J Am Soc Nephrol.* 2018;13(2):195-197. https://doi.org/10.2215/CJN.13791217
24. Rehman MZ, et al. Urinary Ammonium in Clinical Medicine: Direct Measurement and the Urine Anion Gap as a Surrogate Marker During Metabolic Acidosis. *Adv Kidney Dis Health.* 2023;30(2):197-206. https://doi.org/10.1053/j.akdh.2022.12.006
25. Berend K. Review of the Diagnostic Evaluation of Normal Anion Gap Metabolic Acidosis. *Kidney Dis (Basel).* 2017;3(4):149-159. https://doi.org/10.1159/000479279
26. Adomako EA, Maalouf NM. Type 4 renal tubular acidosis and uric acid nephrolithiasis: two faces of the same coin? *Curr Opin Nephrol Hypertens.* 2023;32(2):145-152. https://doi.org/10.1097/MNH.0000000000000859
27. Velázquez H, Perazella MA, Wright FS, Ellison DH. Renal mechanism of trimethoprim-induced hyperkalemia. *Ann Intern Med.* 1993;119(4):296-301. https://doi.org/10.7326/0003-4819-119-4-199308150-00008
28. Hoorn EJ, Walsh SB, McCormick JA, et al. The calcineurin inhibitor tacrolimus activates the renal sodium chloride cotransporter to cause hypertension. *Nat Med.* 2011;17(10):1304-1309. https://doi.org/10.1038/nm.2497
29. Unsal Y, et al. Calcineurin inhibitor-related hyperkalemia is caused by hyporeninemic hypoaldosteronism and fludrocortisone is an effective treatment. *Pediatr Transplant.* 2024;28(4):e14778. https://doi.org/10.1111/petr.14778
30. Oster JR, Singer I, Fishman LM. Heparin-induced aldosterone suppression and hyperkalemia. *Am J Med.* 1995;98(6):575-586. https://doi.org/10.1016/s0002-9343(99)80017-5
31. Sousa AG, et al. Hyporeninemic hypoaldosteronism and diabetes mellitus: Pathophysiology assumptions, clinical aspects and implications for management. *World J Diabetes.* 2016;7(5):101-111. https://doi.org/10.4239/wjd.v7.i5.101
32. Wilczynski C, Shaw C, Alimohammadi M. Selective hypoaldosteronism: a review. *Endocr Pract.* 2015;21(8):957-965. https://doi.org/10.4158/EP14551.RA
33. Adachi M, et al. Classification of pseudohypoaldosteronism type II as type IV renal tubular acidosis. *Endocr J.* 2023;70(7):723-729. https://doi.org/10.1507/endocrj.EJ22-0607

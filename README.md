# Nefrona Interactiva

**https://jalzam.github.io/nefrona-interactiva/**

Simulador educativo de la fisiología celular del nefrón y de la **acidosis tubular renal tipo 4 (ATR4)**.
Muestra cuatro células (túbulo proximal, asa gruesa ascendente, célula principal y célula intercalada α
del túbulo colector) con sus canales y bombas, los iones viajando como partículas, el eje
renina–angiotensina–aldosterona y un mapa del nefrón. El usuario aplica causas de ATR4 (medicamentos o
enfermedades) y ve, con dinámica en días simulados, cómo cambia cada canal y cómo se alteran la sangre y la
orina.

Herramienta de aprendizaje; no es una calculadora clínica. Responsable: **Juan José Jaller (CiMedical)**.

## Qué hace

- **8 causas combinables** (0–100 %): espironolactona/eplerenona, amilorida/trimetoprim, IECA/ARA2, AINES,
  heparina, nefropatía diabética, Addison, inhibidores de calcineurina. Más TFG, ingesta de K⁺ y carga ácida.
- **Modelo cuantitativo semi-mecanicista** (`js/model.js`): actividades de canales → flujos (mEq/día) →
  balance de K⁺ y HCO₃⁻ → retroalimentación a hormonas y canales. Integración de Euler (0,05 días por paso).
  Incluye el desplazamiento transcelular de K⁺ por acidosis.
- **Animación de partículas** (`js/particulas.js`, `js/escenas.js`): cada ion es una bolita que viaja por un
  camino SVG; la cantidad por segundo es proporcional al flujo del modelo. Las dependencias se encadenan:
  un Na⁺ que entra por ENaC dispara la entrada de un K⁺ por la Na⁺/K⁺-ATPasa, que sale por ROMK solo si hay
  voltaje luminal (si no, vuelve a la sangre por Kir4.1); el NH₃ queda atrapado como NH₄⁺ solo si hay H⁺; el
  NH₄⁺ compite con el K⁺ por NKCC2.
- **Laboratorio** con sangre (Na⁺, K⁺, Cl⁻, HCO₃⁻, pH, pCO₂, anion gap, aldosterona, renina) y orina (pH,
  NH₄⁺, K⁺, TTKG, brecha aniónica urinaria, Na⁺), colores por rango, nota interpretativa y gráficas de 14 días.
- **Tarjetas "¿por qué?"** en cada canal, bomba y caja, con el estado actual y referencias numeradas (36).
- **Punto de enseñanza clave**: con deficiencia de aldosterona el pH urinario baja de 5,5 (falla el amonio,
  no la bomba de H⁺); con bloqueo directo de ENaC (amilorida) el pH urinario no baja de 5,5 (falla el voltaje).

## Estructura

```
index.html          cabecera, panel de causas, reloj, mapa del nefrón, eje RAAS, pestañas, 4 SVG de células,
                    tarjeta ¿por qué?, cascada, laboratorio, referencias
style.css           estilos (misma línea visual que Velocímetro Renal)
js/model.js         modelo: parámetros, derivar(), paso(), crearSimulador(); ecuaciones numeradas según
                    INVESTIGATION.md Parte D
js/particulas.js    motor de partículas (corrientes por tasa o por cadena, rebotes "✕")
js/escenas.js       corrientes de cada vista y del mapa; actualizar(d) las acopla al modelo
js/svg-nefrona.js   estados de canales, voltímetros, textos y colores de cada SVG
js/ui.js            deslizadores, reloj (×1/×5/×20), pestañas, laboratorio, sparklines, tarjetas, cascada
js/refs.js          referencias y tarjetas ¿por qué?
test/model.test.js  pruebas de calibración (node test/model.test.js)
INVESTIGATION.md    fisiología, cascada, mapa de causas, diseño del modelo, referencias
PLAN.md / CLAUDE.md gestión del proyecto (instructivo-creacion-proyecto)
```

Sin framework, sin dependencias ni compilación. Scripts clásicos (no ES modules) para que `index.html`
abra directamente desde el disco.

## Probar en local

- Doble clic en `index.html`, o `python3 -m http.server 8080` en la carpeta y abrir http://localhost:8080.
- Pruebas del modelo: `node test/model.test.js` (40 comprobaciones: estado normal estable, cada causa en
  rango clínico a 14 días, pH urinario según el tipo de causa, hormonas, ausencia de oscilaciones).
- El reloj usa `requestAnimationFrame`: el navegador lo pausa cuando la pestaña no está visible.

## Publicación

GitHub Pages desde la rama `main`. Cada push a `main` actualiza el sitio en ~1 minuto; no hay ambiente de
pruebas: revisar en local antes de subir. Commits y push los hace Claude Code (decisión del dueño).

## Privacidad

Todo ocurre en el navegador. No hay cookies, almacenamiento, analítica ni envío de datos. Google Fonts
sirve las tipografías.

## Historial

- **2026-10-23** — Kickoff, investigación (33 artículos de PubMed + 3 libros), plan, modelo calibrado,
  célula principal, animación de partículas, cuatro células, mapa del nefrón, eje RAAS, publicación.

## Pendiente / futuro

- ATR tipo 1 y tipo 2; "riñón continuo" con daños combinables.
- Dominio propio.
- Fuera del modelo v1: volumen extracelular y Na⁺ dinámicos, insulina, célula β (pendrina), fosfato/citrato.

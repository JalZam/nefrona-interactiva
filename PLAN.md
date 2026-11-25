# Plan: Nefrona Interactiva
**Última actualización:** 2026-11-24 · El detalle técnico y el «Para retomar» están en `CLAUDE.md`.
El plan original (v1: simulador cuantitativo de la ATR 4, octubre 2026) se cumplió y luego se reemplazó; su
texto completo está en el historial de git (este archivo antes del 2026-11-24).

## Objetivo
Sitio educativo gratuito y bilingüe para **aprender viendo** fisiología renal: cada canal, bomba y enzima con
su estequiometría estricta, y qué se daña, y en qué orden, en cada enfermedad o con cada fármaco.

## Hecho
| Qué | Cuándo |
|---|---|
| Investigación, modelo y primera versión (simulador de ATR 4) | 2026-10-23 |
| Animación paso a paso con 4 células en fila; dominio propio | 2026-10-24 / 26 |
| Todas las acidosis sin anion gap: normal, diarrea, ATR 2, 1, 3 y tres formas de ATR 4 | 2026-10-26 |
| Se retiran el simulador y la vista en columna (decisión de Juanjo; no volver a proponerlos) | 2026-11-06 |
| Diuréticos: mapa de la nefrona con las 6 clases | 2026-11-06 |
| Bilingüe ES/EN, botón «Guía», revisión de exactitud contra PubMed | 2026-11-07 |
| Diuréticos: proximal/acetazolamida (aprobado) y osmóticos/manitol; clases sin hacer con «En construcción» | 2026-11-08 |
| Analítica PostHog (Europa) con aviso de cookies y política de datos | 2026-11-08 |
| Acidosis: célula normal junto a la enferma (vista lado a lado) | 2026-11-17 |
| Velocidad de la vista lado a lado (carga por tandas, adelanto a ciegas); resaltado visible en Safari | 2026-11-20 / 23 |
| Buzón de sugerencias; idioma inicial según el navegador; aviso de cookies más visible | 2026-11-23 |
| Buscadores e IA: guías en texto ES/EN, botón «Explicación», robots, mapa del sitio, llms.txt, datos estructurados | 2026-11-24 |

## En curso: diuréticos
- [x] Proximal — inhibidores de la anhidrasa carbónica (acetazolamida)
- [~] Osmóticos (manitol): construido, **falta la revisión de Juanjo**
- [ ] De asa
- [ ] Tiazídicos
- [ ] Ahorradores de K⁺
- [ ] Acuaréticos
- [ ] Guía en texto de diuréticos (al terminar la sección)

Cada clase: Juanjo la revisa y corrige antes de pasar a la siguiente.

## Pendiente
1. ~~Alta en Google Search Console y Bing Webmaster Tools~~ — hecha el 2026-11-25; revisar hacia 2026-12-09 si ya aparece en búsquedas.
2. Decidir si las tres ATR 4 se funden en una (un botón con selector de causa, dos botones, o igual).
3. Reescribir el paso 6 de ATR 4 hipoaldosteronismo (propuesta lista, falta el sí de Juanjo).
4. Revisar los textos de las demás acidosis contra lo que muestra la animación.
5. Uso en celular: revisar la vista lado a lado en un teléfono real y volver a medir la respuesta al toque.
6. Ampliar la tarjeta de la vía paracelular (cortocircuito de cloro).
7. Ideas sin decidir: comparación lado a lado en diuréticos; animación del NH₃ en ATR 1; quitar el contador
   hits.sh; inicio de sesión (más adelante).

## Fuera del alcance
Volumen extracelular y Na⁺ dinámicos, insulina, pendrina/célula β, canal BK, acuaporina-2, hiperkalemia aguda.

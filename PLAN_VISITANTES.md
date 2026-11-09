# Plan: analítica de visitantes con PostHog

Estado: **PUBLICADO** (2026-11-08, commits fc2e867 y 06052f1). Verificado en el sitio: carga el script de
PostHog (servidor UE), la clave responde y el contador hits.sh sigue sumando.
Panel de PostHog listo (Juanjo, 2026-11-08): retención en 12 meses y grabación de sesiones encendida
(verificada desde afuera: /flags devuelve sessionRecording activo).

## Qué quiere saber Juanjo (2026-11-08)
- Desde dónde entran (país, ciudad, desde qué página o red social).
- Si es la misma persona que vuelve.
- Qué revisan y **dónde se quedan atascados**.
- Poder **mostrar** la analítica (tablero) y cuántas personas entran.
- A futuro: página con **inicio de sesión** para tener cierto control.

## Por qué PostHog
- Una sola herramienta para: visitas, países, visitantes que vuelven, **grabaciones de sesión**, **mapas de
  calor**, embudos (dónde abandonan) y tableros para compartir.
- Gratis hasta 1 millón de eventos al mes (de sobra para el tráfico actual).
- Cuando exista el inicio de sesión, `posthog.identify()` une las visitas a cada usuario sin cambiar de
  herramienta.
- Se elige el servidor de **Europa** (eu.posthog.com): facilita cumplir el RGPD además de la Ley 1581.

## Cómo respeta la ley
Ley 1581 de 2012 + Decreto 1377 de 2013 (Colombia) y RGPD (visitantes de Europa).
1. **Aviso de cookies** en la primera visita, en español e inglés, con «Aceptar» y «Rechazar» igual de
   visibles. La elección se recuerda y se puede cambiar desde un enlace «Cookies» en el pie.
2. **Antes de aceptar** (o si rechaza): PostHog solo cuenta la visita **sin cookies** (persistencia en
   memoria), sin grabación de sesión. Así no se pierde el conteo de visitas.
3. **Si acepta**: se activa la cookie (reconoce al que vuelve) y la grabación de sesión.
4. **Política de tratamiento de datos** (página nueva ES/EN): responsable, finalidad, qué se recoge, dónde
   se guarda (PostHog, Europa), cuánto tiempo, derechos (conocer, actualizar, borrar) y correo de contacto.
5. La página no tiene campos para escribir, así que las grabaciones no capturan datos personales; igual se
   deja activado el enmascarado de texto de entrada.

## Qué se va a medir (eventos propios)
Además de las visitas que PostHog cuenta solo:
- **Acidosis:** opción de ATR elegida, paso de la lista tocado, tarjeta «¿por qué?» abierta, referencia
  abierta.
- **Diuréticos:** clase elegida, acercamiento abierto, botón normal ↔ bloqueo, paso tocado.
- **Ambas:** cambio de idioma, botón «Guía», clic en redes sociales.
Con esto se arma el embudo «entra → elige opción → abre acercamiento → recorre los pasos» y se ve dónde
abandonan.

## Pasos de implementación
1. **Juanjo** crea la cuenta en PostHog (servidor de Europa) y me pasa la «Project API key» (es pública,
   va en la página; no es un secreto).
2. Página de política de datos ES/EN.
3. Aviso de cookies ES/EN (script propio pequeño, sin librerías).
4. PostHog en `index.html` y `diureticos.html` con el arranque sin cookies y el cambio al aceptar.
5. Los eventos propios de la lista de arriba.
6. Cambiar la regla «sin rastreo, sin cookies» del CLAUDE.md por la nueva.
7. Probar en local (aviso, aceptar, rechazar, eventos llegando a PostHog), enseñárselo a Juanjo y publicar.
8. Armar en PostHog el tablero: visitas por país, nuevos vs. que vuelven, secciones más vistas, embudo.
9. Decidir si se quita el contador hits.sh de la cabecera (PostHog lo reemplaza).

## Lo que falta decidir (Juanjo)
1. ✅ Responsable de los datos: **Juan José Jaller, como persona natural** (decidido 2026-11-08).
2. ✅ Correo de contacto: **juanjallerch@cimedical.co** (decidido 2026-11-08).
3. ✅ Conservación de los datos: **12 meses** (decidido y configurado en PostHog 2026-11-08).
4. ✅ Cuenta creada (2026-11-08) en el servidor de **Europa** (verificado con /decide: eu responde, us
   rechaza). Project API key (pública, va en la página): `phc_qAq3VixFDjysd75E8RDH2gNZiKq4MFuawpykMzr6FPeh`,
   api_host `https://eu.i.posthog.com`.
5. Más adelante: MCP de PostHog con llave personal de permisos mínimos (lectura + escribir solo tableros e
   insights), cuando ya haya datos.

## Más adelante (fuera de este plan)
Inicio de sesión: requiere guardar usuarios (ver el plan de Supabase del Velocímetro,
`~/nefro-velocimetro/PLAN_CUENTAS_HISTORIAL.md`) y ampliar la política de datos.

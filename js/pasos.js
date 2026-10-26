/* Motor paso a paso: mecanismos (normal, antagonista del MR, ARA2), pasos con
   estado objetivo, transición suave, resaltado y textos. */
(function (global) {
  'use strict';
  const NI = global.NI;
  const $ = (id) => document.getElementById(id);

  const NORMAL = { enac: 1, nak: 1, romk: 1, volt: 1, voltaje: -40, hatp: 1, glut: 1, pK: 0.75, nh3: 1, trap: 1, aldo: 1, aldoK: 0, renina: 1, angiiBlock: 0, mrBlock: 0, K: 4.0, hco3: 24, naOrina: 0.15, acido: 0 };

  // cascada común tras perder la señal del MR (deficiencia o bloqueo)
  function cascada(kFinal, hco3Final, extraTexto) {
    return [
      { titulo: 'Sin Na⁺ entrando, la bomba Na⁺/K⁺-ATPasa se frena',
        texto: 'La bomba solo hace su ciclo cuando completa la cuenta: 3 Na⁺ adentro y 2 K⁺ afuera. Como ENaC ya no deja entrar Na⁺, la cuenta de Na⁺ nunca se completa: los K⁺ que llegan desde la sangre se quedan esperando en la bomba, y cuando ya no caben, rebotan y se acumulan en la sangre.',
        estado: { nak: 0.3, K: 4.6 }, resaltar: ['ch-nak', 'pila-k'] },
      { titulo: 'La luz pierde su carga negativa y ROMK se queda sin empuje',
        texto: 'El voltaje luminal negativo lo creaba la entrada de Na⁺ sin anión: el medidor de la luz se calcula con los Na⁺ que de verdad entran por ENaC frente a los que siguen de largo. Ahora casi todo el Na⁺ pasa de largo, la luz se vuelve casi neutra y el poco K⁺ que entra a la célula no tiene fuerza para salir por ROMK: se devuelve a la sangre por Kir4.1. El Na⁺ no reabsorbido se pierde en la orina.',
        estado: { volt: 0.2, voltaje: -10, romk: 0.4, K: 5.5, naOrina: 0.7 }, resaltar: ['np-carga', 'ch-romk', 'ch-kir', 'pila-na'] },
      { titulo: 'La célula α pierde el empuje para secretar H⁺',
        texto: 'La H⁺-ATPasa es electrogénica: la ayudaba el mismo voltaje negativo. Sin él, parte de los H⁺ rebotan en la bomba y se devuelven a la sangre. Por cada H⁺ que no sale, tampoco nace un HCO₃⁻ nuevo: AE1 se queda esperando con el Cl⁻ aparcado afuera y no hay intercambio. El ácido de la dieta empieza a retenerse.',
        estado: { hatp: 0.6, acido: 0.3, hco3: 22 }, resaltar: ['ch-hatp', 'ch-ae1', 'pila-h'] },
      { titulo: 'El K⁺ alto entra al túbulo proximal y frena la glutaminasa',
        texto: 'El K⁺ entra a la célula proximal a cambio de H⁺; el citosol se alcaliniza y la glutaminasa y la PEPCK bajan su actividad. La glutamina sigue llegando por SNAT3 pero rebota en la mitocondria sin procesarse: se fabrica menos NH₄⁺ y menos HCO₃⁻ nuevo. Este es el eslabón central de la ATR4: la acidosis es consecuencia de la hiperkalemia.',
        estado: { glut: 0.45, K: 5.8 }, resaltar: ['box-mito', 'ch-k-p', 'ch-nhe3'] },
      { titulo: 'En el asa gruesa el K⁺ compite con el NH₄⁺ por NKCC2',
        texto: 'El NH₄⁺ y el K⁺ usan el mismo sitio del cotransportador: NKCC2 solo tiene un puesto para K⁺ o NH₄⁺ por ciclo. Con K⁺ luminal alto (mira cuántos K⁺ llegan ahora por la luz) ese puesto casi siempre lo ocupa el K⁺: el NH₄⁺ rebota y sigue de largo sin construir el gradiente medular. Llega menos NH₄⁺ por NHE4/KCC4 al intersticio y el depósito de NH₃ se vacía.',
        estado: { pK: 0.4, nh3: 0.45 }, resaltar: ['ch-nkcc2', 'ch-nh4-salida', 'np-deposito'] },
      { titulo: 'Llega poco NH₃ al colector: se atrapa poco NH₄⁺',
        texto: 'Con el depósito medular vacío, Rhcg tiene poco NH₃ que pasar a la luz. Los pocos H⁺ secretados bajan el pH urinario (por eso es < 5,5) pero no hay amortiguador que los convierta en NH₄⁺: la excreción neta de ácido cae y el HCO₃⁻ plasmático baja día a día.',
        estado: { trap: 0.5, acido: 0.7, hco3: 18 }, resaltar: ['ch-rhcg-bl', 'ch-rhcg-ap', 'pila-h'] },
      { titulo: 'Resultado: ATR tipo 4',
        texto: `Hiperkalemia (K⁺ ≈ ${kFinal.toFixed(1).replace('.', ',')}), acidosis metabólica hiperclorémica con anion gap normal (HCO₃⁻ ≈ ${hco3Final}), pH urinario bajo (< 5,5), NH₄⁺ urinario bajo y brecha aniónica urinaria positiva. La acidosis saca más K⁺ de las células y cierra el círculo vicioso.${extraTexto ? ' ' + extraTexto : ''}`,
        estado: { K: kFinal, hco3: hco3Final, acido: 0.85 }, resaltar: ['pila-k', 'pila-h', 'np-carga'] }
    ];
  }

  const MECANISMOS = {
    normal: {
      nombre: 'Funcionamiento normal',
      pasos: [
        { titulo: 'El Na⁺ baja por la luz tubular y entra a cada célula por su canal',
          texto: 'El Na⁺ filtrado viaja por la luz de izquierda a derecha. En el túbulo proximal entra por NHE3 (1 Na⁺ entra, 1 H⁺ o 1 NH₄⁺ sale), en el asa gruesa por NKCC2 (que espera a tener 1 Na⁺ y 1 K⁺ o NH₄⁺ para pasarlos junto con 2 Cl⁻; el Cl⁻ sale por ClC-Kb) y en el colector por ENaC. Lo que no se reabsorbe sale en la orina.',
          estado: {}, resaltar: ['ch-nhe3', 'ch-nkcc2', 'ch-enac'] },
        { titulo: 'La aldosterona enciende ENaC a través del receptor MR',
          texto: 'La renina del riñón genera angiotensina II; esta estimula a la suprarrenal, que libera aldosterona. La aldosterona entra a la célula principal, se une al MR, el MR enciende SGK1 en el núcleo y SGK1 inactiva a Nedd4-2, la enzima que retira ENaC de la membrana. Resultado: más ENaC en la membrana.',
          estado: {}, resaltar: ['box-renina', 'box-angii', 'box-suprarrenal', 'box-mr', 'box-sgk1', 'box-nedd', 'ch-enac'] },
        { titulo: 'La bomba Na⁺/K⁺-ATPasa saca el Na⁺ y mete K⁺; la luz queda negativa',
          texto: 'La bomba trabaja por ciclos con una cuenta fija: espera a tener 3 Na⁺ adentro (los que entraron por ENaC) y 2 K⁺ afuera (de la sangre); solo entonces saca los 3 Na⁺ y mete los 2 K⁺. Mira cómo se van acumulando hasta completar la cuenta. Como el Na⁺ entró sin anión, la luz tubular queda eléctricamente negativa (unos −40 mV): el medidor de la luz se calcula con los Na⁺ que entran por ENaC.',
          estado: {}, resaltar: ['ch-nak', 'np-carga'] },
        { titulo: 'El voltaje negativo empuja el K⁺ por ROMK y el H⁺ por la H⁺-ATPasa',
          texto: 'La luz negativa atrae cationes: el K⁺ de la célula principal sale por ROMK hacia la orina, y el H⁺ de la célula α vecina sale por la H⁺-ATPasa. Por cada H⁺ secretado, la anhidrasa carbónica deja un HCO₃⁻ nuevo; AE1 lo saca a la sangre solo a cambio de un Cl⁻ que entra (intercambio 1 : 1, por eso espera a tener los dos).',
          estado: {}, resaltar: ['ch-romk', 'ch-hatp', 'ch-ae1', 'box-ca'] },
        { titulo: 'El túbulo proximal fabrica NH₄⁺ y el asa gruesa lo recicla',
          texto: 'La glutamina entra a la célula proximal: la glutaminasa y la PEPCK la convierten en 2 NH₄⁺ (que salen a la luz por NHE3) y 2 HCO₃⁻ (que salen a la sangre por NBCe1). En el asa gruesa el NH₄⁺ ocupa el sitio del K⁺ en NKCC2 y pasa al intersticio medular, donde se acumula como depósito de NH₃.',
          estado: {}, resaltar: ['box-mito', 'ch-nhe3', 'ch-nkcc2', 'ch-nh4-salida', 'np-deposito'] },
        { titulo: 'En el colector NH₃ + H⁺ → NH₄⁺: así se excreta el ácido del día',
          texto: 'El NH₃ del depósito entra a la célula α por Rhbg/Rhcg y sale a la luz por Rhcg. Allí se une al H⁺ secretado y queda atrapado como NH₄⁺, que no puede volver a difundir y sale en la orina. Balance normal: se excreta el ácido de la dieta, el K⁺ de la dieta y el HCO₃⁻ se mantiene en 24.',
          estado: {}, resaltar: ['ch-rhcg-bl', 'ch-rhcg-ap', 'pila-h'] }
      ]
    },
    mr: {
      nombre: 'Antagonista del receptor MR (espironolactona, eplerenona)',
      pasos: [
        { titulo: 'La espironolactona ocupa el receptor MR',
          texto: 'La aldosterona sigue llegando (incluso sube, porque el riñón pierde sal y la renina aumenta), pero rebota: el receptor está ocupado por el fármaco. Nada de lo que hace el MR va a ocurrir.',
          estado: { mrBlock: 1, renina: 1.4 }, resaltar: ['box-mr', 'box-suprarrenal'] },
        { titulo: 'Sin señal del MR, Nedd4-2 retira ENaC de la membrana',
          texto: 'El MR ya no enciende SGK1; sin SGK1, Nedd4-2 queda activa y marca a ENaC para que la célula lo retire. En horas la membrana apical se queda casi sin ENaC: el Na⁺ que baja por la luz ya no entra a la célula principal.',
          estado: { enac: 0.1, naOrina: 0.4 }, resaltar: ['box-sgk1', 'box-nedd', 'ch-enac'] },
        ...cascada(6.0, 17, '')
      ]
    },
    ara2: {
      nombre: 'ARA2 (bloqueador del receptor AT1 de la angiotensina II)',
      pasos: [
        { titulo: 'El ARA2 bloquea el receptor AT1: la angiotensina II llega pero no actúa',
          texto: 'La renina sigue formando angiotensina II (incluso más, porque se pierde la retroalimentación), pero el receptor AT1 de la suprarrenal está bloqueado: la angiotensina II rebota.',
          estado: { angiiBlock: 1, renina: 1.5 }, resaltar: ['box-angii', 'box-suprarrenal'] },
        { titulo: 'La suprarrenal deja de producir aldosterona',
          texto: 'Sin el estímulo de la angiotensina II, la zona glomerulosa deja de liberar aldosterona: las partículas de aldosterona dejan de aparecer en la sangre. Al MR no le llega nada.',
          estado: { aldo: 0.1 }, resaltar: ['box-suprarrenal', 'g-aldo', 'box-mr'] },
        { titulo: 'Con el MR vacío, Nedd4-2 retira ENaC',
          texto: 'Es la misma consecuencia que con la espironolactona, pero por falta de hormona en vez de bloqueo del receptor: sin SGK1, Nedd4-2 queda activa y ENaC desaparece de la membrana. El Na⁺ deja de entrar a la célula principal.',
          estado: { enac: 0.15, naOrina: 0.4 }, resaltar: ['box-sgk1', 'box-nedd', 'ch-enac'] },
        ...cascada(5.5, 19, 'Con ARA2 la hiperkalemia suele ser más leve que en Addison: el K⁺ alto estimula por sí mismo algo de aldosterona (vía directa, sin angiotensina II), que se ve como las partículas de aldosterona que reaparecen.')
      ]
    }
  };
  // en ARA2, desde que sube el K⁺ reaparece algo de aldosterona por vía directa
  MECANISMOS.ara2.pasos.forEach((p, i) => { if (i >= 5) p.estado = Object.assign({ aldoK: 0.35 }, p.estado); });

  // ───────── Motor ─────────
  const svg = $('svg-nefron-paralelo');
  NI.np.construir(svg);
  const escena = NI.np.crearEscena(svg);
  let mec = 'normal', paso = 0;
  let actual = Object.assign({}, NORMAL), objetivo = Object.assign({}, NORMAL);
  NI.np.setEstado(actual);

  function estadoEnPaso(m, i) {
    const o = Object.assign({}, NORMAL);
    for (let k = 0; k <= i; k++) Object.assign(o, MECANISMOS[m].pasos[k].estado || {});
    return o;
  }
  function irA(i) {
    const pasos = MECANISMOS[mec].pasos;
    paso = Math.max(0, Math.min(pasos.length - 1, i));
    objetivo = estadoEnPaso(mec, paso);
    const p = pasos[paso];
    $('paso-num').textContent = `${MECANISMOS[mec].nombre} · paso ${paso + 1} de ${pasos.length}`;
    $('paso-titulo').textContent = p.titulo;
    $('paso-texto').textContent = p.texto;
    $('btn-anterior').disabled = paso === 0;
    $('btn-siguiente').disabled = paso === pasos.length - 1;
    $('btn-siguiente').textContent = paso === pasos.length - 1 ? 'Fin de la cascada' : 'Siguiente →';
    $('paso-progreso').innerHTML = pasos.map((_, k) => `<i class="${k <= paso ? 'hecho' : ''}"></i>`).join('');
    NI.np.resaltar(p.resaltar);
  }
  function elegirMecanismo(m) {
    mec = m;
    document.querySelectorAll('.mec').forEach(b => b.classList.toggle('activo', b.dataset.mec === m));
    irA(0);
  }
  document.querySelectorAll('.mec').forEach(b => b.addEventListener('click', () => elegirMecanismo(b.dataset.mec)));
  $('btn-siguiente').addEventListener('click', () => irA(paso + 1));
  $('btn-anterior').addEventListener('click', () => irA(paso - 1));
  $('btn-inicio').addEventListener('click', () => irA(0));
  document.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') irA(paso + 1); if (ev.key === 'ArrowLeft') irA(paso - 1); });

  // transición suave hacia el objetivo + animación
  let ultimo = null;
  function bucle(ts) {
    if (ultimo !== null) {
      const dt = Math.min(0.05, (ts - ultimo) / 1000);
      const k = 1 - Math.exp(-dt * 1.6);
      for (const key in objetivo) actual[key] += (objetivo[key] - actual[key]) * k;
      escena.actualizar(dt);
      escena.tick(dt);
      NI.np.render(actual);
    }
    ultimo = ts;
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  // tarjetas ¿por qué?
  document.querySelectorAll('[data-porque]').forEach(elm => elm.addEventListener('click', () => {
    const info = NI.porque[elm.dataset.porque]; if (!info) return;
    const t = $('tarjeta');
    t.innerHTML = `<div class="tarjeta-titulo">${info.titulo}</div><p class="tarjeta-texto">${info.texto}</p>` +
      `<div class="tarjeta-refs">Referencias: ${info.refs.map(n => `<a href="#ref-${n}" title="${(NI.referencias[n - 1] || {}).cita || ''}">[${n}]</a>`).join(' ')}</div>`;
  }));
  NI.renderReferencias($('lista-refs'));
  document.querySelectorAll('#lista-refs li').forEach(li => { li.id = 'ref-' + li.getAttribute('value'); });

  elegirMecanismo('normal');
  NI.pasosAPI = { irA, elegirMecanismo, estado: () => actual, objetivo: () => objetivo, escena };
})(window);

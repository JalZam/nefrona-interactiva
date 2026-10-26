/* Motor de las acidosis tubulares renales: cada ATR es una lista numerada de
   lo que se daña, en el orden en que se daña. Al elegir una, la lista aparece
   completa con el primer punto aplicado; cada punto se aplica al tocarlo (o con
   las flechas ← →): los canales afectados se bloquean y las sustancias se
   acumulan. No hay temporizador. */
(function (global) {
  'use strict';
  const NI = global.NI;
  const $ = (id) => document.getElementById(id);

  const NORMAL = {
    enac: 1, nak: 1, romk: 1, volt: 1, voltaje: -40, hatp: 1, ae1: 1, ca2a: 1,
    nhe3: 1, nbc: 1, ca4: 1, ca2p: 1, hco3Filt: 1, glut: 1, pK: 0.75, nh3: 1, trap: 1,
    aldo: 1, aldoK: 0, renina: 1, angiiBlock: 0, mrBlock: 0,
    K: 4.0, hco3: 24, acido: 0, naOrina: 0.15, hco3Orina: 0, kOrina: 0, phOrina: 5.8
  };

  // cascada común de la ATR4 tras perder ENaC (por falta de aldosterona, bloqueo del MR o bloqueo directo)
  function cascada4(kFinal, hco3Final, phFinal, extraTexto, saltarVoltaje) {
    const pasos = [
      { titulo: 'Sin Na⁺ entrando, la bomba Na⁺/K⁺-ATPasa se frena',
        texto: 'La bomba solo hace su ciclo cuando completa la cuenta: 3 Na⁺ adentro y 2 K⁺ afuera. Como ENaC ya no deja entrar Na⁺, la cuenta de Na⁺ nunca se completa: los K⁺ que llegan desde la sangre se quedan esperando en la bomba, y cuando ya no caben, rebotan y se acumulan en la sangre.',
        estado: { nak: 0.3, K: 4.6 }, resaltar: ['ch-nak', 'pila-k'] },
      { titulo: 'La luz pierde su carga negativa y ROMK se queda sin empuje',
        texto: 'El voltaje luminal negativo lo creaba la entrada de Na⁺ sin anión: el medidor de la luz se calcula con los Na⁺ que de verdad entran por ENaC frente a los que siguen de largo. Ahora casi todo el Na⁺ pasa de largo, la luz se vuelve casi neutra y el poco K⁺ que entra a la célula no tiene fuerza para salir por ROMK: se devuelve a la sangre por Kir4.1. El Na⁺ no reabsorbido se pierde en la orina.',
        estado: { volt: 0.2, voltaje: -10, romk: 0.4, K: 5.5, naOrina: 0.7 }, resaltar: ['np-carga', 'ch-romk', 'ch-kir', 'pila-na'] },
      { titulo: 'La célula α pierde el empuje para secretar H⁺',
        texto: 'La H⁺-ATPasa es electrogénica: la ayudaba el mismo voltaje negativo, y además la aldosterona la estimulaba directamente. Sin ninguno de los dos, parte de los H⁺ rebotan en la bomba y se devuelven a la sangre. Por cada H⁺ que no sale, tampoco nace un HCO₃⁻ nuevo: AE1 se queda esperando con el Cl⁻ aparcado afuera y no hay intercambio. El ácido de la dieta empieza a retenerse.',
        estado: { hatp: 0.6, acido: 0.3, hco3: 22 }, resaltar: ['ch-hatp', 'ch-ae1', 'pila-h'] },
      { titulo: 'El K⁺ alto entra al túbulo proximal y frena la glutaminasa',
        texto: 'El K⁺ entra a la célula proximal a cambio de H⁺; el citosol se alcaliniza y la glutaminasa y la PEPCK bajan su actividad. La glutamina sigue llegando por SNAT3 pero rebota en la mitocondria sin procesarse: se fabrica menos NH₄⁺ y menos HCO₃⁻ nuevo. Este es el eslabón central de la ATR4: la acidosis es consecuencia de la hiperkalemia.',
        estado: { glut: 0.45, K: 5.8 }, resaltar: ['box-mito', 'ch-k-p', 'ch-nhe3'] },
      { titulo: 'En el asa gruesa el K⁺ compite con el NH₄⁺ por NKCC2',
        texto: 'El NH₄⁺ y el K⁺ usan el mismo sitio del cotransportador: NKCC2 solo tiene un puesto para K⁺ o NH₄⁺ por ciclo. Con K⁺ luminal alto (mira cuántos K⁺ llegan ahora por la luz) ese puesto casi siempre lo ocupa el K⁺: el NH₄⁺ rebota y sigue de largo sin construir el gradiente medular. Llega menos NH₄⁺ por NHE4/KCC4 al intersticio y el depósito de NH₃ se vacía.',
        estado: { pK: 0.4, nh3: 0.45 }, resaltar: ['ch-nkcc2', 'ch-nh4-salida', 'np-deposito'] },
      { titulo: 'Llega poco NH₃ al colector: se atrapa poco NH₄⁺',
        texto: 'Con el depósito medular vacío, Rhcg tiene poco NH₃ que pasar a la luz. Los pocos H⁺ secretados bajan el pH urinario, pero no hay amortiguador que los convierta en NH₄⁺: la excreción neta de ácido cae y el HCO₃⁻ plasmático baja día a día.',
        estado: { trap: 0.5, acido: 0.7, hco3: 18, phOrina: phFinal }, resaltar: ['ch-rhcg-bl', 'ch-rhcg-ap', 'pila-h', 'orina-nh4'] },
      { titulo: 'Resultado: ATR tipo 4',
        texto: `Hiperkalemia (K⁺ ≈ ${kFinal.toFixed(1).replace('.', ',')}), acidosis metabólica hiperclorémica con anion gap normal (HCO₃⁻ ≈ ${hco3Final}), pH urinario ${phFinal < 5.5 ? 'bajo (< 5,5)' : 'que no baja de 5,5'}, NH₄⁺ urinario bajo y brecha aniónica urinaria positiva. La acidosis saca más K⁺ de las células y cierra el círculo vicioso.${extraTexto ? ' ' + extraTexto : ''}`,
        estado: { K: kFinal, hco3: hco3Final, acido: 0.85 }, resaltar: ['pila-k', 'pila-h', 'orina-ph'] }
    ];
    return saltarVoltaje ? pasos.slice(3) : pasos;
  }

  const ATR = {
    normal: {
      nombre: 'Funcionamiento normal',
      causas: 'Cómo trabajan las cuatro células cuando todo está bien.',
      pasos: [
        { titulo: 'El Na⁺ baja por la luz tubular y entra a cada célula por su canal',
          texto: 'El Na⁺ filtrado viaja por la luz de izquierda a derecha. En el túbulo proximal entra por NHE3 (1 Na⁺ entra, 1 H⁺ o 1 NH₄⁺ sale), en el asa gruesa por NKCC2 (que espera a tener 1 Na⁺ y 1 K⁺ o NH₄⁺ para pasarlos junto con 2 Cl⁻; el Cl⁻ sale por ClC-Kb) y en el colector por ENaC. Lo que no se reabsorbe sale en la orina.',
          estado: {}, resaltar: ['ch-nhe3', 'ch-nkcc2', 'ch-enac'] },
        { titulo: 'El túbulo proximal recupera el HCO₃⁻ filtrado sin que cruce la membrana',
          texto: 'Por cada Na⁺ que entra por NHE3 sale un H⁺ a la luz. Ese H⁺ se une al HCO₃⁻ filtrado (que espera en la luz) y la anhidrasa carbónica IV de la membrana lo convierte en CO₂ + H₂O. El CO₂ entra a la célula, la anhidrasa carbónica II lo vuelve HCO₃⁻ y NBCe1 lo devuelve a la sangre (1 Na⁺ con 3 HCO₃⁻). Así se recupera el 80 % de los 4 000 mEq de HCO₃⁻ que se filtran cada día.',
          estado: {}, resaltar: ['ch-nhe3', 'box-ca-p', 'ch-nbc'] },
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
          texto: 'La glutamina entra a la célula proximal: la glutaminasa y la PEPCK la convierten en 2 NH₄⁺ (que salen a la luz por NHE3) y 2 HCO₃⁻ nuevos (que salen a la sangre por NBCe1). En el asa gruesa el NH₄⁺ ocupa el sitio del K⁺ en NKCC2 y pasa al intersticio medular, donde se acumula como depósito de NH₃.',
          estado: {}, resaltar: ['box-mito', 'ch-nhe3', 'ch-nkcc2', 'ch-nh4-salida', 'np-deposito'] },
        { titulo: 'En el colector NH₃ + H⁺ → NH₄⁺: así se excreta el ácido del día',
          texto: 'El NH₃ del depósito entra a la célula α por Rhbg y sale a la luz por Rhcg. Allí se une al H⁺ secretado y queda atrapado como NH₄⁺, que no puede volver a difundir y sale en la orina. Balance normal: se excreta el ácido de la dieta (pH urinario 5–6), el K⁺ de la dieta y el HCO₃⁻ plasmático se mantiene en 24.',
          estado: {}, resaltar: ['ch-rhcg-bl', 'ch-rhcg-ap', 'pila-h', 'orina-ph'] }
      ]
    },

    atr2: {
      nombre: 'ATR tipo 2 · proximal',
      causas: 'Síndrome de Fanconi (mieloma, cistinosis, tenofovir, ifosfamida), acetazolamida y topiramato, mutaciones de NBCe1 (con alteraciones oculares).',
      pasos: [
        { titulo: 'NBCe1 deja de sacar el HCO₃⁻ a la sangre',
          texto: 'El defecto está en la salida basolateral: mutación de NBCe1, daño mitocondrial del Fanconi (sin ATP la bomba Na⁺/K⁺ no mantiene el gradiente que mueve a NBCe1) o inhibición de la anhidrasa carbónica por acetazolamida. El Na⁺ ya no se acopla al transportador y el HCO₃⁻ que fabrica la anhidrasa carbónica II se queda esperando dentro de la célula: mira cómo se acumula en NBCe1.',
          estado: { nbc: 0.05 }, resaltar: ['ch-nbc'] },
        { titulo: 'La célula llena de HCO₃⁻ frena a la anhidrasa carbónica II',
          texto: 'Cuando ya no cabe más HCO₃⁻, la anhidrasa carbónica II no puede seguir produciendo: el CO₂ que entra rebota. En la luz, el H⁺ de NHE3 ya no tiene a dónde llevar el HCO₃⁻ filtrado y se pierde hacia abajo. La reabsorción proximal de HCO₃⁻ se detiene.',
          estado: { ca2p: 0.2 }, resaltar: ['box-ca-p', 'ch-nhe3'] },
        { titulo: 'El HCO₃⁻ filtrado escapa por la luz hacia la orina',
          texto: 'Lo que el proximal no recupera (15 % o más del filtrado) desborda la capacidad del asa y del colector y sale en la orina: bicarbonaturia, orina alcalina (pH > 7) y pérdida de Na⁺ y K⁺ que acompañan al HCO₃⁻. El pH urinario alto en esta fase no significa que la célula α esté enferma: simplemente le llega más HCO₃⁻ del que puede titular.',
          estado: { hco3Orina: 1, phOrina: 7.6, naOrina: 0.6, kOrina: 0.5 }, resaltar: ['pila-hco3o', 'orina-ph'] },
        { titulo: 'El HCO₃⁻ plasmático baja hasta un nuevo umbral (≈ 15–18 mEq/L)',
          texto: 'Se pierde HCO₃⁻ hasta que la carga filtrada cae por debajo de lo que el túbulo enfermo sí alcanza a reabsorber. Desde ese punto ya casi no escapa HCO₃⁻: la acidosis es moderada y se estabiliza sola. Por eso la ATR2 es "autolimitada" y por eso es tan difícil de corregir: cualquier HCO₃⁻ que se dé por encima del umbral se pierde en la orina.',
          estado: { hco3: 16, hco3Filt: 0.5, hco3Orina: 0.3, acido: 0.5 }, resaltar: ['pila-h'] },
        { titulo: 'La célula α está sana: la orina vuelve a ser ácida',
          texto: 'Con poco HCO₃⁻ llegando al colector, la H⁺-ATPasa y la trampa de NH₄⁺ funcionan con normalidad: el pH urinario baja de 5,5 y la excreción de NH₄⁺ es normal. Esta es la diferencia clave con la ATR distal: el nefrón distal acidifica la orina cuando se le da la oportunidad. La prueba diagnóstica es al revés: al dar HCO₃⁻ y subir el plasmático por encima del umbral, la fracción excretada de HCO₃⁻ supera el 15 % y el pH urinario sube.',
          estado: { phOrina: 5.3, hco3Orina: 0.1 }, resaltar: ['ch-hatp', 'ch-rhcg-ap', 'orina-ph'] },
        { titulo: 'La pérdida de Na⁺ activa la aldosterona y se pierde K⁺',
          texto: 'El Na⁺ y el agua que escaparon con el HCO₃⁻ reducen el volumen: suben la renina y la aldosterona, ENaC trabaja más, la luz se hace más negativa y ROMK secreta más K⁺. Resultado: hipokalemia, que empeora al tratar con bicarbonato (llegan más HCO₃⁻ y Na⁺ al colector). Por eso se corrige con sales de K⁺ y, a veces, tiazidas.',
          estado: { renina: 1.5, aldo: 1.3, romk: 1.4, K: 3.0, kOrina: 0.8 }, resaltar: ['box-suprarrenal', 'ch-enac', 'ch-romk', 'pila-k', 'pila-ko'] },
        { titulo: 'Resultado: ATR tipo 2',
          texto: 'Acidosis hiperclorémica moderada (HCO₃⁻ 15–18) con anion gap normal, hipokalemia, pH urinario variable (alto si el HCO₃⁻ plasmático está por encima del umbral; < 5,5 en estado estable), FE de HCO₃⁻ > 15 % tras cargar bicarbonato, NH₄⁺ urinario conservado. Si forma parte de un síndrome de Fanconi: glucosuria, fosfaturia, aminoaciduria y uricosuria. El citrato urinario es normal (la acidosis es leve), por eso casi nunca hay cálculos ni nefrocalcinosis; en niños, raquitismo y talla baja.',
          estado: {}, resaltar: ['pila-h', 'pila-k', 'orina-ph'] }
      ]
    },

    atr1: {
      nombre: 'ATR tipo 1 · distal (clásica)',
      causas: 'Mutaciones de la H⁺-ATPasa (ATP6V1B1, ATP6V0A4: con sordera) o de AE1 (SLC4A1); síndrome de Sjögren, lupus, anfotericina B, litio, hipercalciuria, riñón en esponja.',
      pasos: [
        { titulo: 'La H⁺-ATPasa de la célula α deja de bombear',
          texto: 'Falta la bomba (mutación de ATP6V1B1/ATP6V0A4; en Sjögren la célula pierde la bomba de su membrana) o AE1 no saca el HCO₃⁻ y la célula alcalinizada deja de producir H⁺ (mutaciones de SLC4A1). La anfotericina B hace lo mismo por otra vía: abre poros en la membrana y el H⁺ ya secretado se devuelve. En todos los casos el H⁺ no llega a la luz: mira cómo rebota en la bomba.',
          estado: { hatp: 0.05 }, resaltar: ['ch-hatp'] },
        { titulo: 'Sin H⁺ secretado no nace HCO₃⁻ nuevo: AE1 se queda esperando',
          texto: 'La anhidrasa carbónica II solo produce el par H⁺ + HCO₃⁻ si la bomba se lleva el H⁺. AE1 queda con el Cl⁻ aparcado afuera y sin HCO₃⁻ que intercambiar; cuando ya no cabe más Cl⁻, rebota. La ganancia neta de base del organismo (regenerar el HCO₃⁻ que gastó el ácido de la dieta) se pierde.',
          estado: { ae1: 0.3 }, resaltar: ['box-ca', 'ch-ae1'] },
        { titulo: 'La orina no puede acidificarse: pH > 5,5 aunque haya acidosis',
          texto: 'Es el defecto diagnóstico: con acidemia espontánea o tras una carga ácida (NH₄Cl, o furosemida con fludrocortisona), el pH urinario nunca baja de 5,5. Y como no hay H⁺ en la luz, el NH₃ que sale por Rhcg no se atrapa como NH₄⁺ y se devuelve: NH₄⁺ urinario bajo y brecha aniónica urinaria positiva.',
          estado: { trap: 0.1, phOrina: 6.8 }, resaltar: ['orina-ph', 'ch-rhcg-ap', 'orina-nh4'] },
        { titulo: 'El ácido de la dieta se acumula y el HCO₃⁻ plasmático cae sin freno',
          texto: 'A diferencia de la ATR2, aquí no hay umbral de rescate: cada día se retienen los 50–100 mEq de ácido de la dieta y el HCO₃⁻ puede bajar de 10 mEq/L. Acidosis metabólica hiperclorémica con anion gap normal, a veces grave.',
          estado: { acido: 0.9, hco3: 12 }, resaltar: ['pila-h'] },
        { titulo: 'El Na⁺ que entra por ENaC ya no se acompaña de H⁺: se pierde K⁺',
          texto: 'El voltaje negativo de la luz sigue intacto (ENaC funciona) pero ya no lo descarga la secreción de H⁺: todo el empuje recae sobre ROMK. Sumado al hiperaldosteronismo secundario por la pérdida de sal, el K⁺ se va a la orina: hipokalemia, a veces grave (parálisis). Al corregir la acidosis con bicarbonato la kaliuresis mejora.',
          estado: { romk: 1.4, K: 2.9, kOrina: 0.8, aldo: 1.2, renina: 1.4 }, resaltar: ['ch-romk', 'pila-k', 'pila-ko'] },
        { titulo: 'El hueso amortigua el ácido: calcio y citrato se van a la orina',
          texto: 'La acidosis crónica disuelve hueso (hipercalciuria) y aumenta la reabsorción proximal de citrato (hipocitraturia). Calcio alto, citrato bajo y orina alcalina: la receta de la nefrocalcinosis y de los cálculos de fosfato de calcio. En niños, raquitismo y retraso del crecimiento.',
          estado: {}, resaltar: ['orina-ph', 'pila-h'] },
        { titulo: 'Resultado: ATR tipo 1',
          texto: 'Acidosis hiperclorémica con anion gap normal, potencialmente grave (HCO₃⁻ < 10), hipokalemia, pH urinario siempre > 5,5, NH₄⁺ urinario bajo (brecha aniónica urinaria positiva), FE de HCO₃⁻ < 5 %, nefrocalcinosis y litiasis. Forma incompleta: no acidifica la orina pero sin acidosis sistémica (se descubre por cálculos). Las formas hereditarias por ATP6V1B1 cursan con sordera neurosensorial. Se trata con álcali (citrato de K⁺), que corrige la acidosis, la hipokalemia y la hipocitraturia.',
          estado: {}, resaltar: ['pila-h', 'pila-k', 'orina-ph'] }
      ]
    },

    atr3: {
      nombre: 'ATR tipo 3 · mixta (déficit de anhidrasa carbónica II)',
      causas: 'Mutación del gen CA2 (síndrome de Guibaud-Vainsel): osteopetrosis, calcificaciones cerebrales. Hoy se considera una combinación de ATR 1 + 2.',
      pasos: [
        { titulo: 'Falta la anhidrasa carbónica II en el túbulo proximal',
          texto: 'El CO₂ que entra desde la luz no se convierte en HCO₃⁻: rebota. NBCe1 está sano pero no recibe HCO₃⁻ del filtrado, y la reabsorción proximal de HCO₃⁻ se pierde como en la ATR2 (queda solo el HCO₃⁻ nuevo de la glutamina).',
          estado: { ca2p: 0.05 }, resaltar: ['box-ca-p'] },
        { titulo: 'El HCO₃⁻ filtrado escapa a la orina',
          texto: 'Igual que en la ATR2: bicarbonaturia, orina alcalina y pérdida de Na⁺ y K⁺ con el HCO₃⁻, hasta que el HCO₃⁻ plasmático cae por debajo del umbral.',
          estado: { hco3Orina: 1, phOrina: 7.5, kOrina: 0.6, naOrina: 0.5 }, resaltar: ['pila-hco3o', 'orina-ph'] },
        { titulo: 'Falta también en la célula α: no hay H⁺ que bombear',
          texto: 'La misma enzima fabrica el H⁺ de la célula intercalada. Sin ella la H⁺-ATPasa no tiene sustrato, AE1 no tiene HCO₃⁻ y la orina no se acidifica ni siquiera cuando el HCO₃⁻ plasmático ya cayó por debajo del umbral proximal. Aquí está lo "mixto": falla la recuperación y falla la regeneración.',
          estado: { ca2a: 0.05, trap: 0.2 }, resaltar: ['box-ca', 'ch-hatp', 'ch-ae1'] },
        { titulo: 'Acidosis mixta: se suman los dos defectos',
          texto: 'El HCO₃⁻ baja (12–16 mEq/L), la orina permanece alcalina, el NH₄⁺ urinario es bajo y hay hipokalemia por la kaliuresis del HCO₃⁻ y el hiperaldosteronismo secundario.',
          estado: { hco3: 14, acido: 0.8, K: 3.2, romk: 1.3, hco3Filt: 0.5, hco3Orina: 0.4, kOrina: 0.6 }, resaltar: ['pila-h', 'pila-k', 'orina-ph'] },
        { titulo: 'Resultado: ATR tipo 3',
          texto: 'Además del riñón, la anhidrasa carbónica II trabaja en el osteoclasto (que necesita H⁺ para reabsorber hueso) y en el cerebro: osteopetrosis con fracturas y compresión de pares craneales, calcificaciones cerebrales, retraso mental y talla baja. Es muy rara (más frecuente en el Magreb y Oriente Medio) y se trata con álcali.',
          estado: {}, resaltar: ['pila-h', 'orina-ph'] }
      ]
    },

    atr4h: {
      nombre: 'ATR tipo 4 · hipoaldosteronismo',
      causas: 'Nefropatía diabética (hiporreninismo), AINE, IECA y ARA2, heparina, inhibidores de calcineurina, enfermedad de Addison. La forma más frecuente de todas las ATR.',
      pasos: [
        { titulo: 'Hay menos angiotensina II o no actúa',
          texto: 'En la nefropatía diabética y con AINE o inhibidores de calcineurina el riñón produce poca renina (hiporreninismo); con IECA no se forma angiotensina II; con ARA2 se forma pero el receptor AT1 de la suprarrenal está bloqueado y la angiotensina II rebota. En Addison la glándula está destruida y la renina está muy alta.',
          estado: { angiiBlock: 1, renina: 1.2 }, resaltar: ['box-renina', 'box-angii', 'box-suprarrenal'] },
        { titulo: 'La suprarrenal deja de producir aldosterona',
          texto: 'Sin el estímulo de la angiotensina II, la zona glomerulosa deja de liberar aldosterona: las partículas de aldosterona dejan de aparecer en la sangre. Al MR no le llega nada. La heparina, además, atrofia la zona glomerulosa.',
          estado: { aldo: 0.1 }, resaltar: ['box-suprarrenal', 'g-aldo', 'box-mr'] },
        { titulo: 'Con el MR vacío, Nedd4-2 retira ENaC',
          texto: 'Sin aldosterona el MR no enciende SGK1; sin SGK1, Nedd4-2 queda activa y marca a ENaC para que la célula lo retire. En horas la membrana apical se queda casi sin ENaC: el Na⁺ que baja por la luz rebota y se pierde en la orina.',
          estado: { enac: 0.15, naOrina: 0.4 }, resaltar: ['box-sgk1', 'box-nedd', 'ch-enac'] },
        ...cascada4(5.5, 19, 5.2, 'Como la aldosterona baja pero el voltaje no es el único problema, el pH urinario sí baja de 5,5 (los pocos H⁺ no tienen NH₃ que los amortigüe). En hipoaldosteronismo por ARA2 la hiperkalemia suele ser más leve que en Addison: el K⁺ alto estimula por sí mismo algo de aldosterona (vía directa, sin angiotensina II), que se ve como las partículas de aldosterona que reaparecen.')
      ]
    },

    atr4r: {
      nombre: 'ATR tipo 4 · resistencia a la aldosterona',
      causas: 'Espironolactona, eplerenona, finerenona; pseudohipoaldosteronismo tipo 1 por mutación del MR. La aldosterona está alta pero no puede actuar.',
      pasos: [
        { titulo: 'El fármaco ocupa el receptor MR',
          texto: 'La aldosterona sigue llegando (incluso sube, porque el riñón pierde sal y la renina aumenta), pero rebota: el receptor está ocupado por la espironolactona. Nada de lo que hace el MR va a ocurrir.',
          estado: { mrBlock: 1, renina: 1.4 }, resaltar: ['box-mr', 'box-suprarrenal'] },
        { titulo: 'Sin señal del MR, Nedd4-2 retira ENaC de la membrana',
          texto: 'El MR ya no enciende SGK1; sin SGK1, Nedd4-2 queda activa y marca a ENaC para que la célula lo retire. En horas la membrana apical se queda casi sin ENaC: el Na⁺ que baja por la luz ya no entra a la célula principal.',
          estado: { enac: 0.1, naOrina: 0.4 }, resaltar: ['box-sgk1', 'box-nedd', 'ch-enac'] },
        ...cascada4(6.0, 17, 5.3, 'La hiperkalemia suele ser mayor que con ARA2 porque el K⁺ alto no puede compensar: la aldosterona que estimula tampoco actúa.')
      ]
    },

    atr4v: {
      nombre: 'ATR tipo 4 · bloqueo de ENaC (defecto de voltaje)',
      causas: 'Amilorida, triamtereno, trimetoprim, pentamidina; uropatía obstructiva, drepanocitosis, lupus. También llamada ATR distal hiperkalémica.',
      pasos: [
        { titulo: 'ENaC queda bloqueado con aldosterona normal o alta',
          texto: 'El fármaco tapa el canal desde la luz (amilorida y triamtereno siempre; trimetoprim y pentamidina a dosis altas) o el daño tubular lo retira (obstrucción, drepanocitosis). La aldosterona llega, el MR y SGK1 funcionan, pero el Na⁺ rebota en la membrana. La renina y la aldosterona suben por la pérdida de sal.',
          estado: { enac: 0.1, naOrina: 0.5, renina: 1.4, aldo: 1.3 }, resaltar: ['ch-enac', 'box-suprarrenal'] },
        { titulo: 'La bomba se frena y la luz pierde su carga negativa',
          texto: 'Sin Na⁺ entrando, la bomba Na⁺/K⁺ no completa su cuenta de 3 Na⁺ y los K⁺ se acumulan esperando en la sangre. El medidor de la luz, que se calcula con los Na⁺ que entran por ENaC, se vuelve casi neutro: ROMK pierde su empuje y el K⁺ se devuelve por Kir4.1.',
          estado: { nak: 0.3, volt: 0.2, voltaje: -8, romk: 0.4, K: 5.6, naOrina: 0.7 }, resaltar: ['ch-nak', 'np-carga', 'ch-romk', 'pila-k'] },
        { titulo: 'Sin voltaje, la H⁺-ATPasa no logra el gradiente: pH urinario > 5,5',
          texto: 'Aquí está la diferencia con el hipoaldosteronismo: la aldosterona sí estimula la bomba de H⁺ directamente, pero sin la luz negativa la bomba no alcanza a concentrar el H⁺ mil veces. El pH urinario se queda por encima de 5,5 ("defecto de voltaje"), y por cada H⁺ que no sale tampoco nace un HCO₃⁻ nuevo.',
          estado: { hatp: 0.4, phOrina: 6.3, acido: 0.4, hco3: 21 }, resaltar: ['ch-hatp', 'orina-ph', 'np-carga'] },
        ...cascada4(6.2, 17, 6.3, 'Con bloqueo de ENaC el pH urinario queda alto (> 5,5) a diferencia del hipoaldosteronismo; es el dato que los distingue en la clínica.', true)
      ]
    }
  };
  // en hipoaldosteronismo, desde que sube el K⁺ reaparece algo de aldosterona por vía directa
  ATR.atr4h.pasos.forEach((p, i) => { if (i >= 5) p.estado = Object.assign({ aldoK: 0.35 }, p.estado); });

  // ───────── Motor ─────────
  const svg = $('svg-nefron');
  NI.np.construir(svg);
  const escena = NI.np.crearEscena(svg);
  let atrId = 'normal', paso = 0;
  let actual = Object.assign({}, NORMAL), objetivo = Object.assign({}, NORMAL);
  NI.np.setEstado(actual);

  function estadoEnPaso(id, i) {
    const o = Object.assign({}, NORMAL);
    for (let k = 0; k <= i; k++) Object.assign(o, ATR[id].pasos[k].estado || {});
    return o;
  }
  function irA(i, manual) {
    const pasos = ATR[atrId].pasos;
    paso = Math.max(0, Math.min(pasos.length - 1, i));
    objetivo = estadoEnPaso(atrId, paso);
    const lis = $('atr-pasos').children;
    for (let k = 0; k < lis.length; k++) {
      lis[k].classList.toggle('hecho', k < paso);
      lis[k].classList.toggle('activo', k === paso);
      lis[k].classList.toggle('pendiente', k > paso);
    }
    const li = lis[paso];
    const caja = $('atr-card');
    if (li && paso > 0) {
      // mantener el punto activo a la vista dentro de la lista (sin mover la página)
      const arriba = li.offsetTop - 70, abajo = li.offsetTop + li.offsetHeight + 16;
      if (arriba < caja.scrollTop || abajo > caja.scrollTop + caja.clientHeight) caja.scrollTo({ top: arriba, behavior: manual ? 'smooth' : 'auto' });
    } else if (li) caja.scrollTop = 0;
    NI.np.resaltar(pasos[paso].resaltar);
  }
  function elegir(id) {
    atrId = id;
    const a = ATR[id];
    document.querySelectorAll('.atr-btn').forEach(b => b.classList.toggle('activo', b.dataset.atr === id));
    $('atr-nombre').textContent = a.nombre;
    $('atr-causas').textContent = a.causas;
    $('atr-pasos').innerHTML = a.pasos.map((p, i) => `<li data-i="${i}"><b>${p.titulo}</b><span>${p.texto}</span></li>`).join('');
    $('atr-pasos').querySelectorAll('li').forEach(li => li.addEventListener('click', () => irA(+li.dataset.i, true)));
    irA(0);
  }
  document.querySelectorAll('.atr-btn').forEach(b => b.addEventListener('click', () => elegir(b.dataset.atr)));
  // cuántas células se ven a la vez (se recuerda en este navegador)
  function verCelulas(n) {
    if (!document.querySelector('.ver-btn')) return;
    $('anim-card').dataset.ver = n;
    document.querySelectorAll('.ver-btn').forEach(b => b.classList.toggle('activo', b.dataset.ver === String(n)));
    try { localStorage.setItem('ni-ver', String(n)); } catch (e) { /* sin almacenamiento */ }
  }
  document.querySelectorAll('.ver-btn').forEach(b => b.addEventListener('click', () => verCelulas(b.dataset.ver)));
  try { const v = localStorage.getItem('ni-ver'); if (v) verCelulas(v); } catch (e) { /* sin almacenamiento */ }
  document.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') irA(paso + 1, true); if (ev.key === 'ArrowLeft') irA(paso - 1, true); });

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

  // tarjetas ¿por qué? (arriba del panel derecho)
  const tarjeta = $('tarjeta');
  const tarjetaVacia = tarjeta.innerHTML;
  function cerrarTarjeta() { tarjeta.classList.remove('abierta'); tarjeta.innerHTML = tarjetaVacia; }
  document.querySelectorAll('[data-porque]').forEach(elm => elm.addEventListener('click', () => {
    const info = NI.porque[elm.dataset.porque]; if (!info) return;
    tarjeta.innerHTML = `<button class="tarjeta-cerrar" aria-label="Cerrar explicación">✕</button>` +
      `<div class="tarjeta-titulo">${info.titulo}</div><p class="tarjeta-texto">${info.texto}</p>` +
      `<div class="tarjeta-refs">Referencias: ${info.refs.map(n => `<a href="#ref-${n}" title="${(NI.referencias[n - 1] || {}).cita || ''}">[${n}]</a>`).join(' ')}</div>`;
    tarjeta.classList.add('abierta');
    tarjeta.querySelector('.tarjeta-cerrar').addEventListener('click', cerrarTarjeta);
    tarjeta.scrollTop = 0;
  }));
  NI.renderReferencias($('lista-refs'));
  document.querySelectorAll('#lista-refs li').forEach(li => { li.id = 'ref-' + li.getAttribute('value'); });

  elegir('normal');
  NI.atrAPI = { irA, elegir, estado: () => actual, objetivo: () => objetivo, escena, ATR };
})(window);

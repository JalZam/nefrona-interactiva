/* ============================================================
   IDIOMA — textos en español e inglés (las dos páginas).
   Todo texto visible de la página pasa por NI.i18n.t('clave').
   ============================================================ */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});

  const ES = {
    'doc.titulo': 'Diuréticos en la nefrona',
    'doc.desc': 'Mapa animado de la nefrona: la sangre entra por la arteriola aferente, se filtra en el glomérulo, recorre el túbulo y sale como orina. Dónde actúa cada clase de diurético.',
    'nav.acidosis': 'Acidosis', 'nav.diureticos': 'Diuréticos',
    'nav.visitas': 'Visitas totales del sitio: cuenta cargas de página, no identifica personas',
    'logo.sub': 'Diuréticos · dónde actúa cada uno',
    'lang.titulo': 'Idioma / Language',

    'map.titulo': 'Diuréticos en la nefrona',
    'map.sub': 'La sangre entra por la arteriola aferente, se filtra en el glomérulo y el filtrado recorre el túbulo. Casi todo se reabsorbe y vuelve a la sangre; lo que queda sale como orina.',
    'obra.titulo': 'En construcción.',
    'obra.texto': 'Esta sección se está haciendo: por ahora tienen acercamiento a la célula los inhibidores de la anhidrasa carbónica y los osmóticos. Se aceptan sugerencias y correcciones.',
    'obra.sigue': 'Escríbame por',
    'map.nota': 'Las partículas son ilustrativas, no una medida: en la realidad se filtran unos 180 litros al día y se reabsorbe más del 99 %.',
    'map.corteza': 'CORTEZA', 'map.medula': 'MÉDULA',
    'map.entraSangre': 'ENTRA SANGRE', 'map.aferente': 'arteriola aferente',
    'map.vuelveSangre': 'VUELVE LA SANGRE', 'map.reabsorbido': 'con todo lo reabsorbido',
    'map.saleOrina': 'SALE ORINA', 'map.noReabsorbio': 'lo que no se reabsorbió',
    'map.glomerulo': 'Glomérulo', 'map.capilares': 'Capilares peritubulares',
    'map.prox1': 'Túbulo contorneado', 'map.prox2': 'proximal',
    'map.desc1': 'Rama', 'map.desc2': 'descendente',
    'map.asc1': 'Rama ascendente', 'map.asc2': 'gruesa',
    'map.dist': 'Túbulo contorneado distal',
    'map.colCort1': 'Colector', 'map.colCort2': 'cortical',
    'map.colMed1': 'Colector', 'map.colMed2': 'medular',
    'map.asa': 'Asa de Henle',

    'panel.titulo': 'Las seis clases',
    'panel.hint': 'Cada una bloquea un transportador distinto, en un segmento distinto. Por eso cambian cosas distintas en la sangre y en la orina.',
    'panel.vacio': 'Toca un segmento del dibujo, o una clase de la lista, para ver qué diurético actúa ahí.',
    'det.diana': 'Diana', 'det.potencia': 'Potencia', 'det.farmacos': 'Fármacos',
    'btn.verCerca': 'Ver de cerca la célula', 'btn.volver': '← Volver a la nefrona',
    'btn.conDiuretico': 'Ver con el diurético', 'btn.normal': 'Ver el mecanismo normal',
    'det.pronto': 'El acercamiento de esta clase todavía no está hecho.',
    'est.lista': 'Lista', 'est.obra': 'En construcción',
    'obraV.titulo': 'En construcción',
    'obraV.pronto': 'Pronto:',
    'obraV.texto': 'Esta clase todavía no tiene su animación. Mientras tanto, a la derecha están su diana, su potencia y sus fármacos. Se aceptan sugerencias y correcciones.',
    'cls.asa.pronto': 'diuréticos de asa (furosemida)',
    'cls.tia.pronto': 'tiazídicos (hidroclorotiazida)',
    'cls.ahk.pronto': 'ahorradores de K⁺ (amilorida y espironolactona)',
    'cls.acu.pronto': 'acuaréticos (tolvaptán)',
    'pie.normal': 'Toca «Ver con el diurético» para ver qué se bloquea.',
    'pie.bloqueo': 'Los canales bloqueados se marcan con ✕ y las partículas rebotan y se acumulan.',
    'foot.1': 'Herramienta de aprendizaje. No es una calculadora clínica ni una guía de prescripción. Dibujo propio.',
    'refs.titulo': 'Referencias',
    'foot.3': 'Sin publicidad. Se cuentan las visitas con PostHog (servidor en Europa); las cookies, solo con su permiso.',
    'leg.privacidad': 'Política de tratamiento de datos', 'leg.cookies': 'Cookies',
    'ck.titulo': 'Aviso de cookies',
    'ck.texto': 'Usamos cookies para mejorar la página.',
    'ck.mas': 'Más información', 'ck.aceptar': 'Aceptar', 'ck.rechazar': 'Rechazar',

    'leyenda.titulo': 'Guía · qué es cada bolita', 'leyenda.boton': 'Guía',
    'leyenda.na': 'Sodio', 'leyenda.k': 'Potasio', 'leyenda.cl': 'Cloro',
    'leyenda.h': 'Hidrogenión (ácido)', 'leyenda.hco3': 'Bicarbonato',
    'leyenda.co2': 'Dióxido de carbono', 'leyenda.h2o': 'Agua',
    'leyenda.glu': 'Glucosa', 'leyenda.man': 'Manitol',
    'leyenda.sangre': 'Sangre (en el mapa)', 'leyenda.filtrado': 'Filtrado / orina (en el mapa)',

    'cls.iac.nombre': 'Inhibidores de la anhidrasa carbónica',
    'cls.iac.seg': 'Túbulo contorneado proximal',
    'cls.iac.diana': 'Anhidrasa carbónica II y IV',
    'cls.iac.corto': 'Sin anhidrasa carbónica el túbulo no puede recuperar el bicarbonato filtrado, y el Na⁺ se va con él.',
    'cls.iac.pot': 'Débil y autolimitado',
    'cls.iac.farm': 'Acetazolamida · Dorzolamida (tópica, glaucoma)',
    'cls.iac.resumen': '<b>Acetazolamida.</b> Bloquea la anhidrasa carbónica del túbulo proximal, así que el bicarbonato filtrado no se recupera y se pierde en la orina junto con Na⁺ y agua. Produce orina alcalina y acidosis metabólica hiperclorémica. Es un diurético débil y autolimitado: al bajar el bicarbonato de la sangre se filtra menos y el fármaco se queda sin sustrato.',

    'cls.osm.nombre': 'Diuréticos osmóticos',
    'cls.osm.seg': 'Túbulo proximal y asa de Henle (el efecto mayor está en el asa)',
    'cls.osm.diana': 'Ninguna proteína: actúan por osmolaridad',
    'cls.osm.corto': 'No se reabsorben: se quedan en la luz y retienen agua con ellos.',
    'cls.osm.pot': 'Variable; uso en presión intracraneal',
    'cls.osm.farm': 'Manitol · Glicerol',
    'cls.osm.resumen': '<b>Manitol.</b> No se reabsorbe en ningún punto del túbulo: se queda en la luz y arrastra agua por osmolaridad. Actúa en el túbulo proximal y en el asa de Henle; el <b>efecto mayor está en el asa</b> (rama descendente delgada y lavado de la médula). Se usa para bajar la presión intracraneal, no para el edema.',

    'cls.asa.nombre': 'Diuréticos de asa',
    'cls.asa.seg': 'Rama ascendente gruesa',
    'cls.asa.diana': 'Cotransportador NKCC2 (1 Na⁺ : 1 K⁺ : 2 Cl⁻)',
    'cls.asa.corto': 'Bloquean el segmento que reabsorbe entre el 25 y el 30 % del Na⁺ filtrado: son los más potentes.',
    'cls.asa.pot': 'Los más potentes',
    'cls.asa.farm': 'Furosemida · Bumetanida · Torasemida · Ácido etacrínico',
    'cls.asa.resumen': '<b>Furosemida y similares.</b> Bloquean el NKCC2 del asa gruesa, el segmento que reabsorbe entre el 25 y el 30 % del sodio filtrado: por eso son los diuréticos más potentes. Producen hipokalemia, alcalosis metabólica e hipercalciuria.',

    'cls.tia.nombre': 'Tiazídicos',
    'cls.tia.seg': 'Túbulo contorneado distal',
    'cls.tia.diana': 'Cotransportador NCC (1 Na⁺ : 1 Cl⁻)',
    'cls.tia.corto': 'Bloquean el NCC: el Na⁺ se queda en la luz, arrastra agua y el paciente orina más.',
    'cls.tia.pot': 'Moderada; antihipertensivo',
    'cls.tia.farm': 'Hidroclorotiazida · Clortalidona · Indapamida · Metolazona',
    'cls.tia.resumen': '<b>Hidroclorotiazida y similares.</b> Bloquean el NCC del túbulo distal. Natriuresis moderada, pero buen efecto antihipertensivo a largo plazo. Retienen calcio y son la causa más frecuente de hiponatremia por medicamentos.',

    'cls.ahk.nombre': 'Ahorradores de K⁺ y antialdosterónicos',
    'cls.ahk.seg': 'Túbulo colector cortical (célula principal)',
    'cls.ahk.diana': 'Canal ENaC (directo) o receptor mineralocorticoide',
    'cls.ahk.corto': 'Cierran el canal de Na⁺ del colector, por el poro o quitándole la orden de la aldosterona. Retienen K⁺.',
    'cls.ahk.pot': 'Débil como diurético',
    'cls.ahk.farm': 'Amilorida · Triamtereno · Espironolactona · Eplerenona · Finerenona',
    'cls.ahk.resumen': '<b>Espironolactona y amilorida.</b> Cierran el canal ENaC del colector: la espironolactona quitándole la orden de la aldosterona, la amilorida tapando el poro. Como diuréticos son débiles, pero retienen potasio y pueden producir hiperkalemia y acidosis.',

    'cls.acu.nombre': 'Acuaréticos',
    'cls.acu.seg': 'Túbulo colector medular',
    'cls.acu.diana': 'Receptor V2 de la vasopresina',
    'cls.acu.corto': 'Sin la señal V2 no se pone la acuaporina-2: se pierde agua sola, sin sal. Sube el Na⁺ de la sangre.',
    'cls.acu.pot': 'Solo agua; sube la natremia',
    'cls.acu.farm': 'Tolvaptán · Conivaptán',
    'cls.acu.resumen': '<b>Tolvaptán.</b> Bloquea el receptor V2 de la vasopresina: sin acuaporina-2 se excreta agua libre sin sal, así que sube el sodio de la sangre. Sirve para la hiponatremia, no para descongestionar.',

    'z.iac.titulo': 'Túbulo contorneado proximal',
    'z.iac.farmaco': 'Acetazolamida',
    'z.luz': 'LUZ DEL TÚBULO  →  hacia la orina',
    'z.sangre': 'SANGRE / INTERSTICIO',
    'z.celula1': 'Célula del túbulo', 'z.celula2': 'contorneado proximal',
    'z.ac4sub': 'H₂CO₃ → CO₂ + H₂O', 'z.ac2sub': 'CO₂ + H₂O → H⁺ + HCO₃⁻',
    'z.nak': 'Na⁺/K⁺-ATPasa', 'z.kcanal': 'Canal de K⁺',
    'z.orina': 'ORINA', 'z.uHco3': 'HCO₃⁻:', 'z.uPh': 'pH:', 'z.uVol': 'Volumen:',
    'z.v.casiNada': 'casi nada', 'z.v.acido': 'ácido', 'z.v.normal': 'normal',
    'z.v.mucho': 'mucho', 'z.v.alcalino': 'alcalino (> 6,5)', 'z.v.aumentado': 'aumentado',
    'z.pilaNa': 'Na⁺ que sigue de largo', 'z.pilaHco3': 'HCO₃⁻ que se pierde',

    'z.iac.n1': 'El filtrado trae Na⁺ y el HCO₃⁻ que se filtró en el glomérulo.',
    'z.iac.n2': 'El NHE3 mete Na⁺ a la célula y saca H⁺ a la luz.',
    'z.iac.n3': 'En la luz, ese H⁺ se une al HCO₃⁻ y forma H₂CO₃. La <b>anhidrasa carbónica IV</b> lo parte en CO₂ y H₂O.',
    'z.iac.n4': 'El CO₂ y el H₂O entran a la célula sin necesidad de transportador.',
    'z.iac.n5': 'Dentro, la <b>anhidrasa carbónica II</b> los vuelve a juntar: H⁺ y HCO₃⁻ otra vez.',
    'z.iac.n6': 'El H⁺ se recicla por el NHE3 y el HCO₃⁻ sale a la sangre por el NBCe1, llevándose 1 Na⁺ por cada 3 HCO₃⁻.',
    'z.iac.n7': 'La bomba Na⁺/K⁺ saca 3 Na⁺ y mete 2 K⁺: mantiene el Na⁺ bajo dentro de la célula y hace posible todo lo anterior.',
    'z.iac.n8': 'Resultado: se recupera casi todo el HCO₃⁻ filtrado y la orina sale prácticamente sin bicarbonato.',
    'z.iac.b1': 'La acetazolamida bloquea las dos anhidrasas carbónicas, la IV de la luz y la II de dentro.',
    'z.iac.b2': 'En la luz el H₂CO₃ ya no se parte: el <b>HCO₃⁻ se queda</b> y empieza a acumularse.',
    'z.iac.b3': 'Sin CO₂ ni H₂O entrando, dentro de la célula no se fabrica H⁺.',
    'z.iac.b4': 'Sin H⁺ que sacar, el <b>NHE3 se frena</b> y deja de meter Na⁺.',
    'z.iac.b5': 'El Na⁺ y el HCO₃⁻ siguen de largo por el túbulo, y el <b>agua va detrás</b>: el paciente orina más.',
    'z.iac.b6': 'Llega menos HCO₃⁻ a la sangre por el NBCe1.',
    'z.iac.b7': 'En la orina: más bicarbonato, pH alcalino. En la sangre: baja el HCO₃⁻ y sube el Cl⁻ → <b>acidosis metabólica hiperclorémica</b>.',
    'z.iac.b8': 'Es autolimitado: al bajar el HCO₃⁻ de la sangre se filtra menos, y el fármaco se queda sin sustrato.',

    'z.osm.titulo': 'Túbulo proximal (y rama descendente delgada)',
    'z.osm.farmaco': 'Manitol',
    'z.uNa': 'Na⁺:', 'z.uMan': 'Manitol:',
    'z.v.poco': 'poco', 'z.v.ninguno': 'ninguno', 'z.v.muyAumentado': 'muy aumentado', 'z.v.todoFiltrado': 'todo el filtrado',
    'z.pilaH2o': 'H₂O retenida en la luz',
    'z.osm.naLuzN': 'Na⁺ en la luz ≈ el del plasma',
    'z.osm.naLuzB': 'Na⁺ en la luz < el del plasma (diluido)',
    'z.osm.pieN': 'Toca «Ver con el diurético» para añadir manitol al filtrado.',
    'z.osm.pieB': 'El manitol (morado) no tiene transportador: se queda en la luz y retiene agua. No se bloquea ningún canal.',
    'z.osm.n1': 'El filtrado llega al túbulo proximal con Na⁺, glucosa y agua, con la misma concentración de Na⁺ que el plasma.',
    'z.osm.n2': 'El Na⁺ entra a la célula por cotransportadores de la membrana apical. Aquí se dibuja el <b>SGLT2</b>, que mete 1 Na⁺ con 1 glucosa; la vía principal es el NHE3, que se ve en el acercamiento de la acetazolamida.',
    'z.osm.n3': 'La glucosa sale a la sangre por el <b>GLUT2</b>, sin gastar energía.',
    'z.osm.n4': 'La bomba Na⁺/K⁺ saca 3 Na⁺ a la sangre y mete 2 K⁺; el K⁺ vuelve a salir por su canal.',
    'z.osm.n5': 'Los solutos que pasan a la sangre dejan el intersticio un poco más concentrado que la luz, y el <b>agua los sigue</b> por la acuaporina-1 (AQP1) de las dos membranas.',
    'z.osm.n6': 'Como el agua sale junto con la sal, el líquido de la luz conserva la misma concentración de Na⁺ que el plasma: la reabsorción del proximal es <b>isoosmótica</b>.',
    'z.osm.n7': 'Resultado: el proximal recupera cerca de dos tercios del Na⁺ y del agua filtrados.',
    'z.osm.b1': 'El manitol se filtra libremente en el glomérulo y <b>no tiene transportador</b>: no se reabsorbe en ningún punto del túbulo. Aquí no se bloquea ningún canal.',
    'z.osm.b2': 'A medida que sale agua, el manitol se concentra en la luz y su fuerza osmótica <b>retiene agua</b> dentro del túbulo.',
    'z.osm.b3': 'Por la AQP1 pasa menos agua: la acuaporina funciona, pero falta la diferencia de concentración que mueve el agua.',
    'z.osm.b4': 'El agua que se queda <b>diluye el Na⁺ de la luz</b>, que baja por debajo de la del plasma.',
    'z.osm.b5': 'Con menos Na⁺ en la luz, el SGLT2 y los demás cotransportadores reciben menos: <b>cae la reabsorción de Na⁺</b>, y con ella la de agua.',
    'z.osm.b6': 'Lo mismo sigue en la rama descendente delgada, también permeable al agua por la AQP1: se extrae menos agua del asa. El efecto en el proximal es real pero modesto; el <b>efecto mayor está en el asa de Henle</b>.',
    'z.osm.b7': 'Además aumenta el flujo de sangre de la médula y se <b>lava el gradiente medular</b> (sale urea de la médula hacia la orina): el asa gruesa reabsorbe menos NaCl y el riñón concentra menos la orina (ref. 26).',
    'z.osm.b8': 'En la orina: mucho volumen, más Na⁺ y K⁺, y todo el manitol filtrado. Se usa para la presión intracraneal, no para el edema; en dosis altas, sobre todo con la función renal baja, puede producir lesión renal (<b>nefrosis osmótica</b>).'
  };

  const EN = {
    'doc.titulo': 'Diuretics along the nephron',
    'doc.desc': 'Animated nephron map: blood enters through the afferent arteriole, is filtered at the glomerulus, travels down the tubule and leaves as urine. Where each class of diuretic acts.',
    'nav.acidosis': 'Acidosis', 'nav.diureticos': 'Diuretics',
    'nav.visitas': 'Total site visits: counts page loads, does not identify people',
    'logo.sub': 'Diuretics · where each one acts',
    'lang.titulo': 'Language / Idioma',

    'map.titulo': 'Diuretics along the nephron',
    'map.sub': 'Blood enters through the afferent arteriole and is filtered at the glomerulus; the filtrate then travels down the tubule. Almost all of it is reabsorbed back into the blood, and what is left leaves as urine.',
    'obra.titulo': 'Under construction.',
    'obra.texto': 'This section is still being built: for now only the carbonic anhydrase inhibitors and the osmotic diuretics have a close-up of the cell. Suggestions and corrections are welcome.',
    'obra.sigue': 'Write to me on',
    'map.nota': 'The particles are illustrative, not a measurement: in real life about 180 liters are filtered each day and more than 99 % is reabsorbed.',
    'map.corteza': 'CORTEX', 'map.medula': 'MEDULLA',
    'map.entraSangre': 'BLOOD IN', 'map.aferente': 'afferent arteriole',
    'map.vuelveSangre': 'BLOOD BACK', 'map.reabsorbido': 'with everything reabsorbed',
    'map.saleOrina': 'URINE OUT', 'map.noReabsorbio': 'what was not reabsorbed',
    'map.glomerulo': 'Glomerulus', 'map.capilares': 'Peritubular capillaries',
    'map.prox1': 'Proximal convoluted', 'map.prox2': 'tubule',
    'map.desc1': 'Descending', 'map.desc2': 'limb',
    'map.asc1': 'Thick ascending', 'map.asc2': 'limb',
    'map.dist': 'Distal convoluted tubule',
    'map.colCort1': 'Cortical', 'map.colCort2': 'collecting duct',
    'map.colMed1': 'Medullary', 'map.colMed2': 'collecting duct',
    'map.asa': 'Loop of Henle',

    'panel.titulo': 'The six classes',
    'panel.hint': 'Each one blocks a different transporter in a different segment. That is why each changes different things in the blood and in the urine.',
    'panel.vacio': 'Tap a segment of the drawing, or a class in the list, to see which diuretic acts there.',
    'det.diana': 'Target', 'det.potencia': 'Potency', 'det.farmacos': 'Drugs',
    'btn.verCerca': 'Zoom into the cell', 'btn.volver': '← Back to the nephron',
    'btn.conDiuretico': 'Show with the diuretic', 'btn.normal': 'Show the normal mechanism',
    'det.pronto': 'The close-up for this class has not been built yet.',
    'est.lista': 'Ready', 'est.obra': 'Under construction',
    'obraV.titulo': 'Under construction',
    'obraV.pronto': 'Coming soon:',
    'obraV.texto': 'This class does not have its animation yet. In the meantime, its target, potency and drugs are listed on the right. Suggestions and corrections are welcome.',
    'cls.asa.pronto': 'loop diuretics (furosemide)',
    'cls.tia.pronto': 'thiazides (hydrochlorothiazide)',
    'cls.ahk.pronto': 'potassium-sparing diuretics (amiloride and spironolactone)',
    'cls.acu.pronto': 'aquaretics (tolvaptan)',
    'pie.normal': 'Tap “Show with the diuretic” to see what gets blocked.',
    'pie.bloqueo': 'Blocked channels are marked with ✕, and the particles bounce back and pile up.',
    'foot.1': 'Learning tool. Not a clinical calculator and not prescribing guidance. Original drawing.',
    'refs.titulo': 'References',
    'foot.3': 'No advertising. Visits are counted with PostHog (servers in Europe); cookies only with your permission.',
    'leg.privacidad': 'Data processing policy', 'leg.cookies': 'Cookies',
    'ck.titulo': 'Cookie notice',
    'ck.texto': 'We use cookies to improve this site.',
    'ck.mas': 'More information', 'ck.aceptar': 'Accept', 'ck.rechazar': 'Reject',

    'leyenda.titulo': 'Key · what each dot is', 'leyenda.boton': 'Key',
    'leyenda.na': 'Sodium', 'leyenda.k': 'Potassium', 'leyenda.cl': 'Chloride',
    'leyenda.h': 'Hydrogen ion', 'leyenda.hco3': 'Bicarbonate',
    'leyenda.co2': 'Carbon dioxide', 'leyenda.h2o': 'Water',
    'leyenda.glu': 'Glucose', 'leyenda.man': 'Mannitol',
    'leyenda.sangre': 'Blood (in the map)', 'leyenda.filtrado': 'Filtrate / urine (in the map)',

    'cls.iac.nombre': 'Carbonic anhydrase inhibitors',
    'cls.iac.seg': 'Proximal convoluted tubule',
    'cls.iac.diana': 'Carbonic anhydrase (IV in the brush border, II in the cytoplasm)',
    'cls.iac.corto': 'Without carbonic anhydrase the tubule cannot reclaim the filtered bicarbonate, and Na⁺ leaves with it.',
    'cls.iac.pot': 'Weak and self-limiting',
    'cls.iac.farm': 'Acetazolamide · Dorzolamide (topical, glaucoma)',
    'cls.iac.resumen': '<b>Acetazolamide.</b> It blocks carbonic anhydrase in the proximal tubule, so filtered bicarbonate is not reabsorbed and is lost in the urine together with Na⁺ and water. It produces alkaline urine and hyperchloremic metabolic acidosis. It is a weak, self-limiting diuretic: as blood bicarbonate falls, less is filtered and the drug runs out of substrate.',

    'cls.osm.nombre': 'Osmotic diuretics',
    'cls.osm.seg': 'Proximal tubule and loop of Henle (the larger effect is in the loop)',
    'cls.osm.diana': 'No protein: they act by osmolality',
    'cls.osm.corto': 'They are not reabsorbed: they stay in the lumen and hold water with them.',
    'cls.osm.pot': 'Variable; used for intracranial pressure',
    'cls.osm.farm': 'Mannitol · Glycerol',
    'cls.osm.resumen': '<b>Mannitol.</b> It is not reabsorbed anywhere along the tubule: it stays in the lumen and drags water with it by osmolality. It acts in the proximal tubule and in the loop of Henle; the <b>larger effect is in the loop</b> (thin descending limb and medullary washout). It is used to lower intracranial pressure, not for edema.',

    'cls.asa.nombre': 'Loop diuretics',
    'cls.asa.seg': 'Thick ascending limb',
    'cls.asa.diana': 'Na⁺-K⁺-2Cl⁻ cotransporter (NKCC2)',
    'cls.asa.corto': 'They block the segment that reabsorbs 25–30 % of the filtered Na⁺ load: they are the most potent.',
    'cls.asa.pot': 'The most potent',
    'cls.asa.farm': 'Furosemide · Bumetanide · Torsemide · Ethacrynic acid',
    'cls.asa.resumen': '<b>Furosemide and relatives.</b> They block NKCC2 in the thick ascending limb, the segment that reabsorbs 25–30 % of filtered sodium, which is why they are the most potent diuretics. They cause hypokalemia, metabolic alkalosis and hypercalciuria.',

    'cls.tia.nombre': 'Thiazides',
    'cls.tia.seg': 'Distal convoluted tubule',
    'cls.tia.diana': 'Na⁺-Cl⁻ cotransporter (NCC)',
    'cls.tia.corto': 'They block NCC: Na⁺ stays in the lumen, drags water along, and the patient passes more urine.',
    'cls.tia.pot': 'Moderate; antihypertensive',
    'cls.tia.farm': 'Hydrochlorothiazide · Chlorthalidone · Indapamide · Metolazone',
    'cls.tia.resumen': '<b>Hydrochlorothiazide and relatives.</b> They block NCC in the distal tubule. Natriuresis is modest, but the long-term antihypertensive effect is good. They retain calcium and are the commonest drug cause of hyponatremia.',

    'cls.ahk.nombre': 'Potassium-sparing diuretics and MR antagonists',
    'cls.ahk.seg': 'Cortical collecting duct (principal cell)',
    'cls.ahk.diana': 'Epithelial sodium channel (ENaC), directly or through the mineralocorticoid receptor',
    'cls.ahk.corto': 'They shut the Na⁺ channel of the collecting duct, either at the pore or by blocking the mineralocorticoid receptor. They retain K⁺.',
    'cls.ahk.pot': 'Weak as a diuretic',
    'cls.ahk.farm': 'Amiloride · Triamterene · Spironolactone · Eplerenone · Finerenone',
    'cls.ahk.resumen': '<b>Spironolactone and amiloride.</b> They shut the epithelial sodium channel (ENaC) of the collecting duct: spironolactone by blocking the mineralocorticoid receptor, amiloride by plugging the pore itself. They are weak diuretics, but they retain potassium and can cause hyperkalemia and acidosis.',

    'cls.acu.nombre': 'Aquaretics',
    'cls.acu.seg': 'Medullary collecting duct',
    'cls.acu.diana': 'Vasopressin V2 receptor',
    'cls.acu.corto': 'Without the V2 signal, aquaporin-2 is not inserted: free water is excreted without salt and serum Na⁺ rises.',
    'cls.acu.pot': 'Water only; raises serum sodium',
    'cls.acu.farm': 'Tolvaptan · Conivaptan',
    'cls.acu.resumen': '<b>Tolvaptan.</b> It blocks the vasopressin V2 receptor: without aquaporin-2, free water is excreted without salt, so blood sodium rises. It is used for hyponatremia, not for decongestion.',

    'z.iac.titulo': 'Proximal convoluted tubule',
    'z.iac.farmaco': 'Acetazolamide',
    'z.luz': 'TUBULAR LUMEN  →  towards the urine',
    'z.sangre': 'BLOOD / INTERSTITIUM',
    'z.celula1': 'Proximal convoluted', 'z.celula2': 'tubule cell',
    'z.ac4sub': 'H₂CO₃ → CO₂ + H₂O', 'z.ac2sub': 'CO₂ + H₂O → H⁺ + HCO₃⁻',
    'z.nak': 'Na⁺/K⁺-ATPase', 'z.kcanal': 'K⁺ channel',
    'z.orina': 'URINE', 'z.uHco3': 'HCO₃⁻:', 'z.uPh': 'pH:', 'z.uVol': 'Volume:',
    'z.v.casiNada': 'almost none', 'z.v.acido': 'acidic', 'z.v.normal': 'normal',
    'z.v.mucho': 'a lot', 'z.v.alcalino': 'alkaline (> 6.5)', 'z.v.aumentado': 'increased',
    'z.pilaNa': 'Na⁺ carrying on downstream', 'z.pilaHco3': 'HCO₃⁻ being lost',

    'z.iac.n1': 'The filtrate brings Na⁺ and the HCO₃⁻ that was filtered at the glomerulus.',
    'z.iac.n2': 'NHE3 reabsorbs Na⁺ into the cell and secretes H⁺ into the lumen.',
    'z.iac.n3': 'In the lumen that H⁺ joins HCO₃⁻ to form H₂CO₃. <b>Carbonic anhydrase IV</b> splits it into CO₂ and H₂O.',
    'z.iac.n4': 'CO₂ and H₂O enter the cell without needing any transporter.',
    'z.iac.n5': 'Inside, <b>carbonic anhydrase II</b> puts them back together: H⁺ and HCO₃⁻ again.',
    'z.iac.n6': 'The H⁺ is recycled through NHE3, and HCO₃⁻ leaves to the blood through NBCe1, taking 1 Na⁺ for every 3 HCO₃⁻.',
    'z.iac.n7': 'The Na⁺/K⁺ pump sends out 3 Na⁺ and brings in 2 K⁺: it keeps Na⁺ low inside the cell and makes everything above possible.',
    'z.iac.n8': 'Result: nearly all the filtered HCO₃⁻ is reabsorbed and the urine leaves with practically no bicarbonate.',
    'z.iac.b1': 'Acetazolamide blocks both carbonic anhydrases, IV in the lumen and II inside the cell.',
    'z.iac.b2': 'In the lumen H₂CO₃ is no longer split: <b>HCO₃⁻ stays there</b> and starts to pile up.',
    'z.iac.b3': 'With no CO₂ or H₂O coming in, no H⁺ is made inside the cell.',
    'z.iac.b4': 'With no H⁺ to push out, <b>NHE3 slows down</b> and stops bringing Na⁺ in.',
    'z.iac.b5': 'Na⁺ and HCO₃⁻ carry on down the tubule and <b>water follows</b>: the patient passes more urine.',
    'z.iac.b6': 'Less HCO₃⁻ reaches the blood through NBCe1.',
    'z.iac.b7': 'In the urine: more bicarbonate, alkaline pH. In the blood: HCO₃⁻ falls and Cl⁻ rises → <b>hyperchloremic metabolic acidosis</b>.',
    'z.iac.b8': 'It is self-limiting: as blood HCO₃⁻ falls, less is filtered and the drug runs out of substrate.',

    'z.osm.titulo': 'Proximal tubule (and thin descending limb)',
    'z.osm.farmaco': 'Mannitol',
    'z.uNa': 'Na⁺:', 'z.uMan': 'Mannitol:',
    'z.v.poco': 'low', 'z.v.ninguno': 'none', 'z.v.muyAumentado': 'greatly increased', 'z.v.todoFiltrado': 'all that was filtered',
    'z.pilaH2o': 'H₂O held in the lumen',
    'z.osm.naLuzN': 'Luminal Na⁺ ≈ plasma Na⁺',
    'z.osm.naLuzB': 'Luminal Na⁺ < plasma Na⁺ (diluted)',
    'z.osm.pieN': 'Tap “Show with the diuretic” to add mannitol to the filtrate.',
    'z.osm.pieB': 'Mannitol (purple) has no transporter: it stays in the lumen and holds water. No channel is blocked.',
    'z.osm.n1': 'The filtrate reaches the proximal tubule carrying Na⁺, glucose and water, with the same Na⁺ concentration as plasma.',
    'z.osm.n2': 'Na⁺ enters the cell through cotransporters in the apical membrane. Shown here is <b>SGLT2</b>, which carries 1 Na⁺ with 1 glucose; the main route is NHE3, shown in the acetazolamide close-up.',
    'z.osm.n3': 'Glucose leaves to the blood through <b>GLUT2</b>, with no energy cost.',
    'z.osm.n4': 'The Na⁺/K⁺ pump sends 3 Na⁺ out to the blood and brings in 2 K⁺; the K⁺ leaves again through its channel.',
    'z.osm.n5': 'The solutes reaching the blood leave the interstitium slightly more concentrated than the lumen, and <b>water follows them</b> through aquaporin-1 (AQP1) in both membranes.',
    'z.osm.n6': 'Because water leaves together with salt, the luminal fluid keeps the same Na⁺ concentration as plasma: proximal reabsorption is <b>isosmotic</b>.',
    'z.osm.n7': 'Result: the proximal tubule reclaims about two thirds of the filtered Na⁺ and water.',
    'z.osm.b1': 'Mannitol is freely filtered at the glomerulus and <b>has no transporter</b>: it is not reabsorbed anywhere along the tubule. No channel is blocked here.',
    'z.osm.b2': 'As water leaves, mannitol becomes concentrated in the lumen and its osmotic pull <b>holds water</b> inside the tubule.',
    'z.osm.b3': 'Less water crosses AQP1: the aquaporin works, but the concentration difference that drives water is missing.',
    'z.osm.b4': 'The water left behind <b>dilutes luminal Na⁺</b>, which falls below the plasma level.',
    'z.osm.b5': 'With less Na⁺ in the lumen, SGLT2 and the other cotransporters receive less: <b>Na⁺ reabsorption falls</b>, and water reabsorption with it.',
    'z.osm.b6': 'The same continues in the thin descending limb, which is also water-permeable through AQP1: less water is extracted from the loop. The proximal effect is real but modest; the <b>larger effect is in the loop of Henle</b>.',
    'z.osm.b7': 'Medullary blood flow also rises and the <b>medullary gradient is washed out</b> (urea leaves the medulla into the urine): the thick ascending limb reabsorbs less NaCl and the kidney concentrates the urine less (ref. 26).',
    'z.osm.b8': 'In the urine: high volume, more Na⁺ and K⁺, and all the filtered mannitol. It is used for intracranial pressure, not for edema; at high doses, especially with reduced kidney function, it can injure the kidney (<b>osmotic nephrosis</b>).'
  };

  const DICC = { es: ES, en: EN };
  // Traducción de literales sueltos: clave = el texto en español tal cual aparece
  // en el código. Sirve para los rótulos que se vuelven a dibujar en cada cuadro.
  const TEXTOS = { es: {}, en: {} };
  const oyentes = [];
  let lang = 'es';

  try {
    const g = localStorage.getItem('ni-lang');
    if (g === 'es' || g === 'en') lang = g;
  } catch (e) { /* almacenamiento bloqueado: se queda en español */ }
  // ?lang=en manda sobre lo guardado (sirve para enlazar la página en un idioma)
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') lang = q;
  } catch (e) { /* nada */ }
  document.documentElement.setAttribute('lang', lang);

  // Añade claves a los diccionarios (cada página aporta las suyas)
  function extender(es, en, textos) {
    Object.assign(ES, es || {});
    Object.assign(EN, en || {});
    if (textos) Object.assign(TEXTOS.en, textos);
  }
  // Traduce un literal escrito en español; si no está, lo devuelve igual
  function tx(s) {
    if (lang === 'es') return s;
    const d = TEXTOS[lang];
    return (d && d[s] != null) ? d[s] : s;
  }

  function t(clave) {
    const d = DICC[lang] || ES;
    return (d[clave] != null) ? d[clave] : (ES[clave] != null ? ES[clave] : clave);
  }
  function set(nuevo) {
    if (nuevo !== 'es' && nuevo !== 'en') return;
    lang = nuevo;
    try { localStorage.setItem('ni-lang', lang); } catch (e) { /* no pasa nada */ }
    document.documentElement.setAttribute('lang', lang);
    oyentes.forEach(f => { try { f(lang); } catch (e) { console.warn(e); } });
  }
  function alCambiar(f) { oyentes.push(f); }

  // Rellena todo lo que lleve data-i18n / data-i18n-attr en el HTML
  function pintarHTML() {
    document.querySelectorAll('[data-i18n]').forEach(n => {
      n.innerHTML = t(n.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(n => {
      n.setAttribute('title', t(n.getAttribute('data-i18n-title')));
    });
    const tit = document.querySelector('title');
    if (tit) tit.textContent = t('doc.titulo');
  }

  NI.i18n = { t, tx, set, extender, alCambiar, pintarHTML, get lang() { return lang; } };
})(typeof window !== 'undefined' ? window : globalThis);

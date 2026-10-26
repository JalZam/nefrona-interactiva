/* Referencias numeradas (misma numeración que INVESTIGATION.md) y tarjetas "¿por qué?" */
(function (global) {
  'use strict';
  const NI = global.NI || (global.NI = {});

  NI.referencias = [
    { n: 1, cita: 'Palmer BF, Kelepouris E, Clegg DJ. Renal Tubular Acidosis and Management Strategies: A Narrative Review. Adv Ther. 2021;38(2):949-968.', doi: '10.1007/s12325-020-01587-5' },
    { n: 2, cita: 'Batlle D, Arruda J. Hyperkalemic Forms of Renal Tubular Acidosis: Clinical and Pathophysiological Aspects. Adv Chronic Kidney Dis. 2018;25(4):321-333.', doi: '10.1053/j.ackd.2018.05.004' },
    { n: 3, cita: 'DuBose TD Jr. Hyperkalemic hyperchloremic metabolic acidosis: pathophysiologic insights. Kidney Int. 1997;51(2):591-602.', doi: '10.1038/ki.1997.85' },
    { n: 4, cita: 'Hamm LL, Nakhoul N, Hering-Smith KS. Acid-Base Homeostasis. Clin J Am Soc Nephrol. 2015;10(12):2232-2242.', doi: '10.2215/CJN.07400715' },
    { n: 5, cita: 'Weiner ID, Verlander JW. Ammonia Transporters and Their Role in Acid-Base Balance. Physiol Rev. 2017;97(2):465-494.', doi: '10.1152/physrev.00011.2016' },
    { n: 6, cita: 'Weiner ID, Mitch WE, Sands JM. Urea and Ammonia Metabolism and the Control of Renal Nitrogen Excretion. Clin J Am Soc Nephrol. 2015;10(8):1444-1458.', doi: '10.2215/CJN.10311013' },
    { n: 7, cita: 'Weiner ID, Verlander JW. Ammonia transport in the kidney by Rhesus glycoproteins. Am J Physiol Renal Physiol. 2014;306(10):F1107-F1120.', doi: '10.1152/ajprenal.00013.2014' },
    { n: 8, cita: 'Weiner ID, Verlander JW. Emerging Features of Ammonia Metabolism and Transport in Acid-Base Balance. Semin Nephrol. 2019;39(4):394-405.', doi: '10.1016/j.semnephrol.2019.04.008' },
    { n: 9, cita: 'Wagner CA, Devuyst O, Bourgeois S, Mohebbi N. Regulated acid-base transport in the collecting duct. Pflugers Arch. 2009;458(1):137-156.', doi: '10.1007/s00424-009-0657-z' },
    { n: 10, cita: 'Winter C, Schulz N, Giebisch G, Geibel JP, Wagner CA. Nongenomic stimulation of vacuolar H+-ATPases in intercalated renal tubule cells by aldosterone. Proc Natl Acad Sci U S A. 2004;101(8):2636-2641.', doi: '10.1073/pnas.0307321101' },
    { n: 11, cita: 'Winter C, Kampik NB, Vedovelli L, et al. Aldosterone stimulates vacuolar H+-ATPase activity in renal acid-secretory intercalated cells mainly via a protein kinase C-dependent pathway. Am J Physiol Cell Physiol. 2011;301(5):C1251-C1261.', doi: '10.1152/ajpcell.00076.2011' },
    { n: 12, cita: 'Pearce D, Manis AD, Nesterov V, Korbmacher C. Regulation of distal tubule sodium transport: mechanisms and roles in homeostasis and pathophysiology. Pflugers Arch. 2022;474(8):869-884.', doi: '10.1007/s00424-022-02732-5' },
    { n: 13, cita: 'Verrey F, Summa V, Heitzmann D, et al. Short-term aldosterone action on Na,K-ATPase surface expression: role of aldosterone-induced SGK1? Ann N Y Acad Sci. 2003;986:554-561.', doi: '10.1111/j.1749-6632.2003.tb07253.x' },
    { n: 14, cita: 'Vallon V, Lang F. New insights into the role of serum- and glucocorticoid-inducible kinase SGK1 in the regulation of renal function and blood pressure. Curr Opin Nephrol Hypertens. 2005;14(1):59-66.', doi: '10.1097/00041552-200501000-00010' },
    { n: 15, cita: 'Bens M, Chassin C, Vandewalle A. Regulation of NaCl transport in the renal collecting duct: lessons from cultured cells. Pflugers Arch. 2006;453(2):133-146.', doi: '10.1007/s00424-006-0123-0' },
    { n: 16, cita: 'Palmer LG. Potassium secretion and the regulation of distal nephron K channels. Am J Physiol. 1999;277(6):F821-F825.', doi: '10.1152/ajprenal.1999.277.6.F821' },
    { n: 17, cita: 'Palmer LG, Schnermann J. Integrated control of Na transport along the nephron. Clin J Am Soc Nephrol. 2015;10(4):676-687.', doi: '10.2215/CJN.12391213' },
    { n: 18, cita: 'Palmer BF, Clegg DJ. Pathophysiology and clinical management of hyperkalemia in chronic kidney disease. Minerva Med. 2023;114(5):719-735.', doi: '10.23736/S0026-4806.23.08465-3' },
    { n: 19, cita: 'Palmer BF, Clegg DJ. Extrarenal Effects of Aldosterone on Potassium Homeostasis. Kidney360. 2022;3(3):561-568.', doi: '10.34067/KID.0006762021' },
    { n: 20, cita: 'Eladari D, Chambrey R, Peti-Peterdi J. A new look at electrolyte transport in the distal tubule. Annu Rev Physiol. 2012;74:325-349.', doi: '10.1146/annurev-physiol-020911-153225' },
    { n: 21, cita: 'Edwards A, Crambert G. Versatility of NaCl transport mechanisms in the cortical collecting duct. Am J Physiol Renal Physiol. 2017;313(6):F1254-F1263.', doi: '10.1152/ajprenal.00369.2017' },
    { n: 22, cita: 'Wall SM. Regulation of Blood Pressure and Salt Balance By Pendrin-Positive Intercalated Cells. Hypertension. 2022;79(4):706-716.', doi: '10.1161/HYPERTENSIONAHA.121.16492' },
    { n: 23, cita: 'Batlle D, Ba Aqeel SH, Marquez A. The Urine Anion Gap in Context. Clin J Am Soc Nephrol. 2018;13(2):195-197.', doi: '10.2215/CJN.13791217' },
    { n: 24, cita: 'Rehman MZ, et al. Urinary Ammonium in Clinical Medicine: Direct Measurement and the Urine Anion Gap as a Surrogate Marker During Metabolic Acidosis. Adv Kidney Dis Health. 2023;30(2):197-206.', doi: '10.1053/j.akdh.2022.12.006' },
    { n: 25, cita: 'Berend K. Review of the Diagnostic Evaluation of Normal Anion Gap Metabolic Acidosis. Kidney Dis (Basel). 2017;3(4):149-159.', doi: '10.1159/000479279' },
    { n: 26, cita: 'Adomako EA, Maalouf NM. Type 4 renal tubular acidosis and uric acid nephrolithiasis: two faces of the same coin? Curr Opin Nephrol Hypertens. 2023;32(2):145-152.', doi: '10.1097/MNH.0000000000000859' },
    { n: 27, cita: 'Velázquez H, Perazella MA, Wright FS, Ellison DH. Renal mechanism of trimethoprim-induced hyperkalemia. Ann Intern Med. 1993;119(4):296-301.', doi: '10.7326/0003-4819-119-4-199308150-00008' },
    { n: 28, cita: 'Hoorn EJ, Walsh SB, McCormick JA, et al. The calcineurin inhibitor tacrolimus activates the renal sodium chloride cotransporter to cause hypertension. Nat Med. 2011;17(10):1304-1309.', doi: '10.1038/nm.2497' },
    { n: 29, cita: 'Unsal Y, et al. Calcineurin inhibitor-related hyperkalemia is caused by hyporeninemic hypoaldosteronism and fludrocortisone is an effective treatment. Pediatr Transplant. 2024;28(4):e14778.', doi: '10.1111/petr.14778' },
    { n: 30, cita: 'Oster JR, Singer I, Fishman LM. Heparin-induced aldosterone suppression and hyperkalemia. Am J Med. 1995;98(6):575-586.', doi: '10.1016/s0002-9343(99)80017-5' },
    { n: 31, cita: 'Sousa AG, et al. Hyporeninemic hypoaldosteronism and diabetes mellitus: Pathophysiology assumptions, clinical aspects and implications for management. World J Diabetes. 2016;7(5):101-111.', doi: '10.4239/wjd.v7.i5.101' },
    { n: 32, cita: 'Wilczynski C, Shaw C, Alimohammadi M. Selective hypoaldosteronism: a review. Endocr Pract. 2015;21(8):957-965.', doi: '10.4158/EP14551.RA' },
    { n: 33, cita: 'Adachi M, et al. Classification of pseudohypoaldosteronism type II as type IV renal tubular acidosis. Endocr J. 2023;70(7):723-729.', doi: '10.1507/endocrj.EJ22-0607' },
    { n: 34, cita: 'Rose BD, Post TW. Clinical Physiology of Acid-Base and Electrolyte Disorders. 5.ª ed. McGraw-Hill; 2001.' },
    { n: 35, cita: 'Yu ASL, Chertow GM, Luyckx VA, Marsden PA, Skorecki K, Taal MW (eds). Brenner & Rector\'s The Kidney. 11.ª ed. Elsevier; 2020.' },
    { n: 36, cita: 'Johnson RJ, Floege J, Tonelli M (eds). Comprehensive Clinical Nephrology. 7.ª ed. Elsevier; 2024.' },
    { n: 37, cita: 'Rodríguez Soriano J. Renal tubular acidosis: the clinical entity. J Am Soc Nephrol. 2002;13(8):2160-2170.', doi: '10.1097/01.asn.0000023430.92674.e5' },
    { n: 38, cita: 'Karet FE. Inherited distal renal tubular acidosis. J Am Soc Nephrol. 2002;13(8):2178-2184.', doi: '10.1097/01.asn.0000023433.08833.88' }
  ];

  // Tarjetas: texto fijo + función estado(d, s) que devuelve una frase con lo que pasa ahora
  NI.porque = {
    enac: {
      titulo: 'ENaC — canal epitelial de sodio (apical)',
      texto: 'Deja entrar Na⁺ desde la luz. Es el paso limitante del transporte de Na⁺ en el colector. La aldosterona, vía MR → SGK1, fosforila a Nedd4-2 y así evita que ENaC sea retirado de la membrana (horas); a más largo plazo aumenta la transcripción de la subunidad α (días). La angiotensina II también lo estimula directamente. Amilorida, triamtereno, trimetoprim y pentamidina lo tapan desde la luz. Al entrar Na⁺ sin anión, la luz queda eléctricamente negativa: ese voltaje es el que empuja la secreción de K⁺ (ROMK) y de H⁺ (célula α vecina).',
      refs: [12, 14, 15, 27, 34],
      estado: (d) => `Actividad ${pct(d.actENaC)} · expresión ${pct(d.exprENaC)} · voltaje ${d.voltaje.toFixed(0)} mV`
    },
    romk: {
      titulo: 'ROMK (Kir1.1) — canal de potasio apical',
      texto: 'Secreta K⁺ hacia la luz. Lo impulsan dos cosas: el K⁺ intracelular alto (mantenido por la Na⁺/K⁺-ATPasa) y el voltaje luminal negativo que genera ENaC. La aldosterona aumenta su número en días; el K⁺ plasmático alto también lo induce por una vía renal propia, independiente de la aldosterona. Si ENaC se apaga, ROMK queda intacto pero sin fuerza eléctrica: la secreción de K⁺ cae igual.',
      refs: [16, 18, 34, 35],
      estado: (d) => `Expresión ${pct(d.actROMK)} · secreción por ROMK ${d.jKromk.toFixed(0)} mEq/día`
    },
    bk: {
      titulo: 'BK (maxi-K) — canal de potasio activado por flujo',
      texto: 'Segundo canal de K⁺ apical. Se abre con el flujo tubular alto y con el Ca²⁺ intracelular. Explica por qué los diuréticos de asa y la carga de sal aumentan la secreción de K⁺ aunque la aldosterona no cambie. En el modelo aporta un 20 % de la secreción de K⁺ y no depende del voltaje, por eso con amilorida el K⁺ sube mucho pero no sin límite.',
      refs: [16, 20, 35],
      estado: (d) => `Secreción por BK ${d.jKbk.toFixed(0)} mEq/día`
    },
    aqp2: {
      titulo: 'Aquaporina-2 — canal de agua (apical)',
      texto: 'Lo inserta la vasopresina (ADH) vía receptor V2 y AMPc. Reabsorbe agua siguiendo el gradiente osmótico medular. No participa en la ATR4; se dibuja para completar la célula. No se modela en la versión 1.',
      refs: [35, 36],
      estado: () => 'Sin cambios en esta simulación'
    },
    nak: {
      titulo: 'Na⁺/K⁺-ATPasa — bomba basolateral',
      texto: 'Saca 3 Na⁺ a la sangre y mete 2 K⁺ a la célula por cada ATP. Mantiene el Na⁺ intracelular bajo (para que ENaC siga teniendo gradiente) y el K⁺ intracelular alto (para que ROMK tenga qué secretar). La aldosterona aumenta la subunidad α en días; la entrada de Na⁺ por ENaC la activa de inmediato. Los inhibidores de calcineurina la reducen.',
      refs: [13, 15, 17, 35],
      estado: (d) => `Actividad ${pct(d.actNaK)}`
    },
    kir41: {
      titulo: 'Kir4.1 / Kir5.1 — canal de potasio basolateral',
      texto: 'Recicla K⁺ hacia el intersticio y fija el potencial basolateral. Es el "sensor" de K⁺ del túbulo distal: el K⁺ plasmático alto lo despolariza y, vía WNK/SPAK, apaga NCC en el túbulo distal para que llegue más Na⁺ al colector y se secrete más K⁺. No se modela en la versión 1.',
      refs: [12, 20],
      estado: () => 'No modelado en v1'
    },
    mr: {
      titulo: 'MR — receptor mineralocorticoide',
      texto: 'Receptor citosólico de la aldosterona. Unido a ella viaja al núcleo y enciende la transcripción de SGK1 (30–60 min), αENaC, Na⁺/K⁺-ATPasa y ROMK. El cortisol también se une al MR, pero la enzima 11β-HSD2 lo inactiva en estas células; por eso el receptor "solo ve" aldosterona. La espironolactona y la eplerenona lo bloquean: la aldosterona sube en sangre pero no actúa.',
      refs: [12, 14, 34],
      estado: (d) => `Ocupación del receptor ${pct(d.mr)} · aldosterona ${d.aldoNgdl.toFixed(0)} ng/dL`
    },
    sgk1: {
      titulo: 'SGK1 — quinasa inducida por aldosterona',
      texto: 'Es el primer gen que enciende el MR. SGK1 fosforila a Nedd4-2 y la inactiva; también fosforila subunidades de ENaC y de la Na⁺/K⁺-ATPasa. Es el eslabón rápido (horas) entre la hormona y el canal.',
      refs: [13, 14, 15],
      estado: (d) => `Señal ${pct(d.objExpr)}`
    },
    nedd: {
      titulo: 'Nedd4-2 — ubiquitina-ligasa',
      texto: 'Marca a ENaC con ubiquitina para que la célula lo retire de la membrana y lo degrade. Cuando SGK1 la fosforila, Nedd4-2 se queda inactiva y ENaC permanece en la superficie. Sin aldosterona (o con el MR bloqueado) Nedd4-2 vuelve a estar activa y ENaC desaparece de la membrana en pocas horas.',
      refs: [14, 15],
      estado: (d) => d.mr < 0.5 ? 'ACTIVA: está retirando ENaC' : 'Inhibida por SGK1: ENaC se queda'
    },
    nucleo: {
      titulo: 'Núcleo — efectos genómicos',
      texto: 'El MR con aldosterona actúa como factor de transcripción. Respuesta temprana (SGK1, 30–60 min) y tardía (αENaC, subunidad α de la Na⁺/K⁺-ATPasa, ROMK; 6 h a días). Por eso la hiperkalemia de la ATR4 tarda días en instalarse y en corregirse.',
      refs: [12, 13],
      estado: (d) => `Objetivo de expresión ${pct(d.objExpr)}`
    },
    paracelular: {
      titulo: 'Vía paracelular — Cl⁻ sigue al Na⁺',
      texto: 'Entre célula y célula (unión estrecha) el Cl⁻ pasa de la luz a la sangre empujado por el mismo voltaje luminal negativo que genera ENaC. Es el acompañante que hace eléctricamente neutra la reabsorción de NaCl. Cuando ENaC cae, también cae el Cl⁻ paracelular y queda más NaCl en la orina (natriuresis leve).',
      refs: [17, 21, 35],
      estado: (d) => `Flujo paracelular ≈ ${pct(d.actENaC)} del normal`
    },
    hatpasa: {
      titulo: 'H⁺-ATPasa vacuolar — bomba de protones (apical)',
      texto: 'Bomba electrogénica que saca H⁺ a la luz consumiendo ATP. Es el principal mecanismo de acidificación distal. La activan la acidosis sistémica (inserta más bombas en la membrana), la angiotensina II y la aldosterona (vía genómica por MR y vía rápida no genómica por PKC, en minutos). El voltaje luminal negativo generado por ENaC en la célula principal vecina le facilita el trabajo; sin voltaje (amilorida) la bomba no logra el gradiente y el pH urinario no baja de 5,5.',
      refs: [9, 10, 11, 2],
      estado: (d) => `Actividad ${pct(d.actHATP)} · secreción de H⁺ ${d.jH.toFixed(0)} mEq/día`
    },
    hkatpasa: {
      titulo: 'H⁺/K⁺-ATPasa — bomba apical',
      texto: 'Secreta H⁺ y reabsorbe K⁺ a cambio. Se induce cuando falta K⁺ (hipokalemia): por eso la depleción de K⁺ produce alcalosis. En hiperkalemia tiene poco papel. En el modelo es un flujo pequeño y constante.',
      refs: [9, 21],
      estado: (d) => d.Kp < 3.5 ? 'Inducida por hipokalemia' : 'Actividad basal'
    },
    rhcg: {
      titulo: 'Rhcg / Rhbg — transportadores de amoniaco',
      texto: 'Glicoproteínas Rhesus que transportan NH₃ (no NH₄⁺) a través de las membranas de la célula intercalada: Rhbg/Rhcg en la basolateral toman el NH₃ del intersticio medular y Rhcg en la apical lo pasa a la luz, donde se une al H⁺ secretado y queda atrapado como NH₄⁺ (no puede volver a difundir). Sin Rhcg la excreción de NH₄⁺ cae a la mitad. Lo que limita aquí no es el transportador sino cuánto NH₃ hay en el intersticio, y eso depende del túbulo proximal y del asa gruesa.',
      refs: [5, 7, 8],
      estado: (d) => `NH₃ disponible ${pct(d.nh3Disponible / 44)} del normal · NH₄⁺ atrapado ${d.nh4u.toFixed(0)} mEq/día`
    },
    ae1: {
      titulo: 'AE1 (banda 3, SLC4A1) — intercambiador Cl⁻/HCO₃⁻ basolateral',
      texto: 'Saca a la sangre el HCO₃⁻ "nuevo" que produce la anhidrasa carbónica por cada H⁺ secretado, a cambio de un Cl⁻ que entra. Es la ganancia neta de base del organismo: cada H⁺ que termina en la orina (como NH₄⁺ o acidez titulable) es un HCO₃⁻ que vuelve a la sangre. Las mutaciones de AE1 causan ATR distal tipo 1.',
      refs: [9, 20, 35],
      estado: (d) => `HCO₃⁻ nuevo ≈ excreción neta de ácido ${d.ena.toFixed(0)} mEq/día (la dieta produce ${NI.sim.e.cargaAcida})`
    },
    clc: {
      titulo: 'Canal de cloro basolateral (ClC-Kb / barttina)',
      texto: 'Deja salir a la sangre el Cl⁻ que entró por AE1 (célula α) o por NKCC2 (asa gruesa). Cierra el circuito del cloro. Las mutaciones de ClC-Kb causan síndrome de Bartter tipo 3.',
      refs: [20, 35],
      estado: () => 'Flujo acoplado al Cl⁻ que entra'
    },
    fosfato: {
      titulo: 'Acidez titulable — el fosfato como amortiguador',
      texto: 'El HPO₄²⁻ filtrado que llega al colector toma un H⁺ y sale como H₂PO₄⁻ (pKa 6,8). Es la "acidez titulable": unos 20–30 mEq/día, un tercio de la excreción neta de ácido (ENA = NH₄⁺ + acidez titulable − HCO₃⁻ urinario). Casi no puede aumentar en la acidosis, porque depende del fosfato que se filtra; la respuesta adaptativa la da el NH₄⁺. En la ERC baja con la TFG.',
      refs: [4, 23, 25],
      estado: () => ''
    },
    estimulo_hatp: {
      titulo: 'Estímulos directos de la H⁺-ATPasa: aldosterona y acidosis',
      texto: 'La aldosterona activa la bomba de H⁺ de la célula α en minutos por una vía no genómica (proteína quinasa C, Ca²⁺), en parte independiente del receptor MR, y a largo plazo aumenta sus subunidades. La acidosis sistémica hace que la célula inserte en la membrana apical bombas guardadas en vesículas. La angiotensina II también la estimula. En el hipoaldosteronismo se pierde este estímulo además del voltaje.',
      refs: [9, 10, 11],
      estado: () => ''
    },
    diarrea: {
      titulo: 'Pérdida intestinal de HCO₃⁻',
      texto: 'Las secreciones del intestino delgado, el páncreas y la bilis son ricas en HCO₃⁻, y el colon lo intercambia por Cl⁻. En la diarrea se pierden 30–100 mEq/día: acidosis hiperclorémica con anion gap normal e hipokalemia. El riñón sano responde multiplicando la excreción de NH₄⁺: brecha aniónica urinaria negativa, a diferencia de las ATR.',
      refs: [25, 23, 24],
      estado: () => ''
    },
    ca4: {
      titulo: 'Anhidrasa carbónica IV — la de la luz del túbulo proximal',
      texto: 'Enzima anclada a la membrana apical, de cara a la luz. El H⁺ que secreta NHE3 se une al HCO₃⁻ filtrado y forma H₂CO₃; la CA IV lo deshidrata al instante en CO₂ + H₂O, que entran a la célula por difusión. Sin ella la reacción sería cientos de veces más lenta y el HCO₃⁻ pasaría de largo. La acetazolamida la inhibe (junto con la CA II del citoplasma): ATR proximal farmacológica.',
      refs: [4, 37, 36],
      estado: () => 'Convierte el HCO₃⁻ filtrado en CO₂ al ritmo de los H⁺ que llegan'
    },
    ca2p: {
      titulo: 'Anhidrasa carbónica II del túbulo proximal',
      texto: 'Dentro de la célula rehidrata el CO₂ que entró desde la luz y lo vuelve HCO₃⁻ (que sale por NBCe1) + H⁺ (que vuelve a salir por NHE3). Es el mismo ciclo que en la célula α, pero aquí su trabajo es recuperar el HCO₃⁻ filtrado (unos 4 000 mEq/día, el 80 % en este segmento), no fabricar HCO₃⁻ nuevo. En la luz la ayuda la anhidrasa carbónica IV (H⁺ + HCO₃⁻ → CO₂ + H₂O). Su déficit congénito causa la ATR tipo 3 (mixta: proximal + distal) con osteopetrosis; la acetazolamida la inhibe.',
      refs: [4, 37, 9],
      estado: () => 'Rehidrata el CO₂ que entra desde la luz'
    },
    ca2: {
      titulo: 'Anhidrasa carbónica II — fábrica de H⁺ y HCO₃⁻',
      texto: 'Convierte CO₂ + H₂O en H⁺ + HCO₃⁻ dentro de la célula. El H⁺ se bombea a la luz y el HCO₃⁻ sale a la sangre: un par inseparable. Su déficit congénito causa ATR tipo 3 (mixta). La acetazolamida la inhibe.',
      refs: [4, 9],
      estado: (d) => `Produce H⁺ al ritmo de la bomba: ${d.jH.toFixed(0)} mEq/día`
    },
    glutaminasa: {
      titulo: 'Amoniogénesis — glutaminasa (PDG), GDH y PEPCK',
      texto: 'La glutamina entra a la mitocondria: la glutaminasa dependiente de fosfato libera el primer NH₄⁺ y la glutamato deshidrogenasa el segundo. El α-cetoglutarato restante se metaboliza (PEPCK → gluconeogénesis) y rinde 2 HCO₃⁻ nuevos. La acidosis aumenta estas enzimas varias veces en 2–3 días. La hiperkalemia las frena: el K⁺ entra a la célula a cambio de H⁺, el citosol se alcaliniza y la vía se apaga. Este es el eslabón central de la ATR4: la acidosis es consecuencia de la hiperkalemia.',
      refs: [3, 5, 6, 8, 26],
      estado: (d) => `Actividad ${pct(d.prodNH4 / 50)} · freno por K⁺ ${pct(d.mK)} · adaptación ×${(NI.sim.s.adapt).toFixed(1)}`
    },
    nhe3: {
      titulo: 'NHE3 — intercambiador Na⁺/H⁺ apical',
      texto: 'Reabsorbe Na⁺ a cambio de H⁺ (así se reabsorbe el 80 % del HCO₃⁻ filtrado). El NH₄⁺ puede ocupar el sitio del H⁺: es la principal vía de secreción del amonio al túbulo. La angiotensina II lo estimula. Su defecto contribuye a la ATR tipo 2 (proximal).',
      refs: [5, 6, 17],
      estado: (d) => `Secreta NH₄⁺ al ritmo de la producción: ${d.prodNH4.toFixed(0)} mEq/día`
    },
    nbce1: {
      titulo: 'NBCe1 — cotransportador Na⁺·3HCO₃⁻ basolateral',
      texto: 'Saca a la sangre el HCO₃⁻ reabsorbido y el HCO₃⁻ nuevo de la amoniogénesis. Sus mutaciones causan ATR tipo 2 con afectación ocular.',
      refs: [4, 35],
      estado: (d) => `HCO₃⁻ nuevo de la glutamina ≈ ${d.prodNH4.toFixed(0)} mEq/día`
    },
    snat3: {
      titulo: 'SNAT3 (SLC38A3) — entrada de glutamina',
      texto: 'Transportador basolateral de glutamina. La acidosis aumenta su expresión para alimentar la amoniogénesis. En hiperkalemia entra menos glutamina a la vía.',
      refs: [5, 8],
      estado: (d) => `Entrada de glutamina ${pct(d.prodNH4 / 50)} del normal`
    },
    nkcc2: {
      titulo: 'NKCC2 — cotransportador Na⁺·K⁺·2Cl⁻ (apical, asa gruesa)',
      texto: 'Reabsorbe Na⁺, K⁺ y 2 Cl⁻. El NH₄⁺ tiene el mismo tamaño hidratado que el K⁺ y ocupa su sitio: así se reabsorbe la mayor parte del NH₄⁺ que viene del proximal y se acumula en el intersticio medular (gradiente que luego alimenta al colector vía Rhcg). Cuando el K⁺ luminal está alto compite con el NH₄⁺ y se recicla menos amonio: segundo golpe de la hiperkalemia a la excreción de ácido. La furosemida lo bloquea.',
      refs: [3, 5, 7],
      estado: (d) => `Fracción de NH₄⁺ reabsorbida ${pct(d.talFrac)} (normal 75 %) · competencia por K⁺ ${pct(1 - d.pK)}`
    },
    romk_tal: {
      titulo: 'ROMK en el asa gruesa — recicla K⁺ a la luz',
      texto: 'Devuelve a la luz el K⁺ que entró por NKCC2 para que el cotransportador nunca se quede sin K⁺ luminal, y genera el voltaje luminal positivo que empuja la reabsorción paracelular de Ca²⁺ y Mg²⁺. Mutaciones: síndrome de Bartter tipo 2.',
      refs: [16, 20],
      estado: () => 'Reciclaje continuo'
    },
    nh4_salida: {
      titulo: 'Salida basolateral de NH₄⁺ (NHE4, KCC4, Na⁺/K⁺-ATPasa)',
      texto: 'El NH₄⁺ reabsorbido sale al intersticio medular por varias vías (NHE4, KCC4 y la propia Na⁺/K⁺-ATPasa, que lo acepta en lugar del K⁺). Allí se concentra y, como NH₃, difunde hacia el colector medular. El depósito medular es el "tanque" del que vive la excreción final de ácido.',
      refs: [5, 7],
      estado: (d) => `Depósito medular ${pct(NI.sim.s.nh3Medular / 37.5)} del normal`
    },
    renina: {
      titulo: 'Renina — aparato yuxtaglomerular',
      texto: 'Se libera ante baja perfusión, poca llegada de NaCl a la mácula densa y estímulo simpático; las prostaglandinas son necesarias para su secreción. Los AINES (sin prostaglandinas), la nefropatía diabética (daño del aparato yuxtaglomerular, hipoaldosteronismo hiporreninémico) y los inhibidores de calcineurina la reducen. Sube cuando cae la aldosterona o se pierde sal (Addison, espironolactona, amilorida).',
      refs: [31, 32, 29],
      estado: (d) => `Renina ${d.reninaNgmlh.toFixed(1)} ng/mL/h (normal ≈ 1,5)`
    },
    angii: {
      titulo: 'Angiotensina II',
      texto: 'Estimula la síntesis de aldosterona en la zona glomerulosa y, por sí misma, ENaC, la H⁺-ATPasa y la amoniogénesis proximal. Los IECA impiden formarla y los ARA2 bloquean su receptor AT1: en ambos casos cae la aldosterona aunque la renina suba.',
      refs: [1, 12, 9],
      estado: (d) => `AngII efectiva ${pct(d.angII)} del normal`
    },
    suprarrenal: {
      titulo: 'Zona glomerulosa — síntesis de aldosterona',
      texto: 'La aldosterona se sintetiza con dos estímulos independientes: la angiotensina II y el K⁺ plasmático (el K⁺ alto despolariza la célula glomerulosa y activa la aldosterona sintasa). Addison destruye la glándula (aldosterona ≈ 0 con renina muy alta). La heparina reduce el número y la afinidad de los receptores AT1 en la zona glomerulosa y la atrofia (días). En la nefropatía diabética la glándula también responde mal al K⁺.',
      refs: [30, 32, 19],
      estado: (d) => `Aldosterona ${d.aldoNgdl.toFixed(0)} ng/dL (normal ≈ 10)`
    },
    voltaje: {
      titulo: 'Voltaje transepitelial luminal',
      texto: 'La entrada de Na⁺ por ENaC sin anión acompañante deja la luz negativa respecto a la sangre (unos −10 a −50 mV según el estado de la aldosterona). Ese voltaje empuja a los cationes hacia la luz: K⁺ por ROMK y H⁺ por la H⁺-ATPasa de la célula intercalada α. Cuando ENaC cae, el voltaje se pierde y ambas secreciones bajan a la vez: esa es la conexión que convierte un problema de sodio en un problema de potasio y de ácido. Si el bloqueo es directo sobre ENaC (amilorida) la bomba de H⁺ queda sin ayuda y el pH urinario no logra bajar de 5,5.',
      refs: [2, 9, 27, 34],
      estado: (d) => `${d.voltaje.toFixed(0)} mV`
    }
  };

  function pct(x) { return Math.round(x * 100) + ' %'; }
  NI.pct = pct;

  NI.renderReferencias = function (ol) {
    ol.innerHTML = NI.referencias.map(r => `<li value="${r.n}">${r.cita}${r.doi ? ` <a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">doi:${r.doi}</a>` : ''}</li>`).join('');
  };
})(typeof window !== 'undefined' ? window : globalThis);

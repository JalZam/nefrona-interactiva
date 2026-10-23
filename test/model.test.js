// Pruebas de calibración del modelo. Uso: node test/model.test.js
const NI = require('../js/model.js');
const M = NI.model;
let fallos = 0;
function check(nombre, cond, detalle) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + nombre + (detalle ? '   [' + detalle + ']' : ''));
  if (!cond) fallos++;
}
function correr(causas, dias, ctx) {
  const sim = M.crearSimulador();
  Object.assign(sim.e, causas || {}, ctx || {});
  // monotonía: contamos cambios de signo de pendiente en K y HCO3
  let prevK = sim.s.K, prevH = sim.s.HCO3, sK = 0, sH = 0, cK = 0, cH = 0;
  for (let i = 0; i < Math.round(dias / 0.5); i++) {
    sim.avanzar(0.5);
    const dK = Math.sign(+(sim.s.K - prevK).toFixed(3)), dH = Math.sign(+(sim.s.HCO3 - prevH).toFixed(3));
    if (dK && sK && dK !== sK) cK++; if (dK) sK = dK;
    if (dH && sH && dH !== sH) cH++; if (dH) sH = dH;
    prevK = sim.s.K; prevH = sim.s.HCO3;
  }
  const d = sim.derivado();
  return { s: sim.s, d, cambiosK: cK, cambiosH: cH };
}
const f = (x, n = 2) => (+x).toFixed(n);
function resumen(nombre, r) {
  const s = r.s, d = r.d;
  console.log(`\n${nombre}: K ${f(d.Kp)}  HCO3 ${f(s.HCO3,1)}  Cl ${f(d.Cl,0)}  pH ${f(d.pH)}  | orina pH ${f(d.pHu)}  NH4 ${f(d.nh4u,0)}/d  TTKG ${f(d.ttkg,1)}  UAG ${f(d.uag,0)} | aldo ${f(d.aldoNgdl,0)} ng/dL  renina ${f(d.reninaNgmlh,1)} | V ${f(d.voltaje,0)} mV  ENaC ${f(d.actENaC)}  ROMK ${f(d.actROMK)}  H+ ${f(d.actHATP)}  amonio ${f(d.mK)}`);
}

console.log('=== (a) Estado normal 30 días ===');
let r = correr({}, 30);
resumen('Normal', r);
check('K 4,0 ± 0,1', Math.abs(r.d.Kp - 4) < 0.1, f(r.d.Kp));
check('HCO3 24 ± 0,5', Math.abs(r.s.HCO3 - 24) < 0.5, f(r.s.HCO3,1));
check('pH urinario 5,0–6,5', r.d.pHu >= 5 && r.d.pHu <= 6.5, f(r.d.pHu));
check('TTKG 6–10', r.d.ttkg >= 6 && r.d.ttkg <= 10, f(r.d.ttkg,1));

console.log('\n=== (b) Cada causa al 100 %, TFG 50, 14 días ===');
const causas = ['espironolactona','amilorida','ieca','aine','heparina','diabetes','addison','calcineurina'];
const res = {};
const fuertes = ['espironolactona','amilorida','diabetes','addison'];
for (const c of causas) {
  r = correr({ [c]: 1 }, 14, { tfg: 50 });
  res[c] = r;
  resumen(c, r);
  if (fuertes.includes(c)) {
    check(c + ': K 5,0–7,0', r.d.Kp >= 5.0 && r.d.Kp <= 7.0, f(r.d.Kp));
    // amilorida = ATR hiperkalémica dependiente de voltaje: acidosis más profunda (Batlle 2018)
    const hMin = c === 'amilorida' ? 12 : 15;
    check(c + `: HCO3 ${hMin}–23`, r.s.HCO3 >= hMin && r.s.HCO3 <= 23, f(r.s.HCO3,1));
    check(c + ': TTKG < 7', r.d.ttkg < 7, f(r.d.ttkg,1));
    check(c + ': NH4 urinario < 45 (bajo para la acidosis)', r.d.nh4u < 45, f(r.d.nh4u,0));
    check(c + ': UAG ≥ 0', r.d.uag >= 0, f(r.d.uag,0));
  } else {
    check(c + ' (leve): K 4,4–5,5', r.d.Kp >= 4.4 && r.d.Kp <= 5.5, f(r.d.Kp));
    check(c + ' (leve): HCO3 18–24', r.s.HCO3 >= 18 && r.s.HCO3 <= 24, f(r.s.HCO3,1));
  }
  check(c + ': sin oscilación', r.cambiosK <= 2 && r.cambiosH <= 2, `K ${r.cambiosK}, HCO3 ${r.cambiosH}`);
}

console.log('\n=== (c) pH urinario: amilorida > 5,5; addison < 5,5 ===');
check('amilorida pHu > 5,5', res.amilorida.d.pHu > 5.5, f(res.amilorida.d.pHu));
check('addison pHu < 5,5', res.addison.d.pHu < 5.5, f(res.addison.d.pHu));
check('diabetes pHu < 5,5', res.diabetes.d.pHu < 5.5, f(res.diabetes.d.pHu));

console.log('\n=== (d) Hormonas ===');
check('espironolactona: aldo alta (> 15 ng/dL)', res.espironolactona.d.aldoNgdl > 15, f(res.espironolactona.d.aldoNgdl,0));
check('diabetes: aldo baja (< 8) y renina baja (< 1)', res.diabetes.d.aldoNgdl < 8 && res.diabetes.d.reninaNgmlh < 1, `${f(res.diabetes.d.aldoNgdl,0)} / ${f(res.diabetes.d.reninaNgmlh,1)}`);
check('addison: aldo ≈ 0 y renina alta (> 3)', res.addison.d.aldoNgdl < 1 && res.addison.d.reninaNgmlh > 3, `${f(res.addison.d.aldoNgdl,0)} / ${f(res.addison.d.reninaNgmlh,1)}`);

console.log('\n=== (e) Addison con TFG 100 (acidosis modesta, Batlle) ===');
r = correr({ addison: 1 }, 21, { tfg: 100 });
resumen('addison TFG100', r);
check('HCO3 19–24 (modesta)', r.s.HCO3 >= 19 && r.s.HCO3 <= 24, f(r.s.HCO3,1));
check('K 5,0–6,5', r.d.Kp >= 5 && r.d.Kp <= 6.5, f(r.d.Kp));

console.log('\n=== (f) Combinación diabético + IECA + AINE, TFG 40 ===');
r = correr({ diabetes: 1, ieca: 1, aine: 1 }, 14, { tfg: 40 });
resumen('combo', r);
check('K > 5,3', r.d.Kp > 5.3, f(r.d.Kp));
check('K < 8', r.d.Kp < 8, f(r.d.Kp));

console.log('\n=== (g) Sin causas con TFG 50: K casi normal ===');
r = correr({}, 30, { tfg: 50 });
resumen('TFG50', r);
check('K 4,0–4,8', r.d.Kp >= 4 && r.d.Kp <= 4.8, f(r.d.Kp));
check('HCO3 ≥ 22', r.s.HCO3 >= 22, f(r.s.HCO3,1));

console.log(fallos ? `\n${fallos} prueba(s) fallida(s)` : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);

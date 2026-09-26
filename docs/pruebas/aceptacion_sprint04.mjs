/**
 * PRUEBA DE ACEPTACION DEL SPRINT 4 contra la API local y la base compartida.
 * Panel de indicadores (PAN-29), prediccion de demanda (PAN-26/27) y permisos. Crea sus datos y los BORRA.
 *
 *   CLAVE_DEMO=<contrasena> node docs/pruebas/aceptacion_sprint04.mjs
 *   PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=... node docs/pruebas/aceptacion_sprint04.mjs
 *
 * Las otras pruebas del sprint son comandos del proyecto: npm run test:integracion (PAN-25),
 * npm run prueba:humo y npm run prueba:seguridad (PAN-40).
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const RAIZ = process.env.PROYECTO ?? 'F:/Universidad/6to/Proyecto III/project_bus';
const require = createRequire(`${RAIZ}/package.json`);
const pg = require('pg');

const API = 'http://localhost:4000';
const SUPA = 'https://tvyhpwpyxmbdfxogopnl.supabase.co';
const PUBLICA = 'sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi';
const RUTA_SEMILLA = '00000000-0000-4000-8000-000000000601';
const env = readFileSync(`${RAIZ}/backend/.env`, 'utf8');
const url = env.match(/^DATABASE_URL\s*=\s*(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
if (!process.env.CLAVE_DEMO) throw new Error('Falta CLAVE_DEMO (contrasena de las cuentas de prueba)');
const db = new pg.Client({ connectionString: url });
await db.connect();

async function token(correo) {
  const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: PUBLICA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: correo, password: process.env.CLAVE_DEMO }),
  });
  return (await r.json()).access_token;
}
// reservar y vender exigen aceptar los Terminos y Condiciones: se envia salvo que el caso lo indique
const CON_CONSENTIMIENTO = ['/v1/ventas/reservas', '/v1/taquilla/ventas'];
async function pedir(metodo, ruta, { cuerpo, tk } = {}) {
  if (metodo === 'POST' && CON_CONSENTIMIENTO.includes(ruta) && cuerpo && !('acepta_condiciones' in cuerpo)) {
    cuerpo = { ...cuerpo, acepta_condiciones: true };
  }
  const r = await fetch(API + ruta, {
    method: metodo,
    headers: { ...(cuerpo ? { 'Content-Type': 'application/json' } : {}), ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let d = null;
  try {
    d = await r.json();
  } catch {}
  return { s: r.status, d };
}
const filas = [];
function caso(tarjeta, nombre, obtenido, esperado, detalle = '') {
  filas.push({ tarjeta, caso: nombre, estado: String(obtenido), esperado: String(esperado), ok: obtenido === esperado ? 'si' : 'NO', detalle: String(detalle ?? '').slice(0, 70) });
}
const CONTEO = `select (select count(*) from personas)::int personas, (select count(*) from ventas)::int ventas,
  (select count(*) from pasajes)::int pasajes, (select count(*) from pagos)::int pagos, (select count(*) from encomiendas)::int encomiendas,
  (select count(*) from buses)::int buses, (select count(*) from viajes)::int viajes, (select count(*) from rutas)::int rutas`;
const antes = (await db.query(CONTEO)).rows[0];
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date());
const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date(Date.now() + 864e5));
const limpiar = { ventas: new Set(), encomiendas: new Set(), viajes: new Set(), buses: new Set(), rutas: new Set(), documentos: new Set() };
const persona = (n) => {
  const numero_documento = `95${String(n).padStart(5, '0')}`;
  limpiar.documentos.add(numero_documento);
  return { tipo_documento: 'ci', numero_documento, nombres: 'Prueba', apellidos: `Sprint4 ${n}` };
};

try {
  const ana = await token('ana.quispe@panamericana.test');
  const luis = await token('luis.rojas@panamericana.test');
  const indicadores = async (extra = '') => (await pedir('GET', `/v1/panel/indicadores?desde=${hoy}&hasta=${hoy}${extra}`, { tk: ana })).d;

  // ---------------- PAN-29 · indicadores ----------------
  let r = await pedir('GET', '/v1/panel/indicadores');
  caso('PAN-29', 'sin sesion -> 401', r.s, 401);
  r = await pedir('GET', '/v1/panel/indicadores', { tk: luis });
  caso('PAN-29', 'vendedor -> 403', r.s, 403);
  r = await pedir('GET', '/v1/panel/indicadores', { tk: ana });
  caso('PAN-29', 'por defecto, los ultimos 30 dias', r.s === 200 && r.d.hasta === hoy, true, `${r.d?.desde} a ${r.d?.hasta}`);
  r = await pedir('GET', '/v1/panel/indicadores?desde=2026-02-30', { tk: ana });
  caso('PAN-29', 'fecha inexistente -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('GET', `/v1/panel/indicadores?desde=${manana}&hasta=${hoy}`, { tk: ana });
  caso('PAN-29', 'desde posterior a hasta -> 400', r.s, 400);

  const base = await indicadores();
  const baseRuta = await indicadores(`&ruta_id=${RUTA_SEMILLA}`);

  // operaciones de hoy: una venta de taquilla (2 pasajes), una venta web pagada (1 pasaje), una anulacion y una encomienda
  const busqueda = (await pedir('GET', `/v1/viajes/buscar?origen=${(await pedir('GET', '/v1/catalogos/ciudades')).d.find((c) => c.nombre === 'La Paz').id}&destino=${(await pedir('GET', '/v1/catalogos/ciudades')).d.find((c) => c.nombre === 'Oruro').id}&fecha=${manana}`)).d;
  const viaje = busqueda[0];
  const libres = (await pedir('GET', `/v1/viajes/${viaje.viaje_id}/asientos?desde=${viaje.origen.orden}&hasta=${viaje.destino.orden}`)).d.asientos.filter((a) => a.disponible);
  const tramo = { viaje_id: viaje.viaje_id, orden_origen: viaje.origen.orden, orden_destino: viaje.destino.orden };
  const taquilla = await pedir('POST', '/v1/taquilla/ventas', { tk: luis, cuerpo: { ...tramo, pasajeros: [{ asiento_id: libres[0].id, ...persona(1) }, { asiento_id: libres[1].id, ...persona(2) }] } });
  limpiar.ventas.add(taquilla.d.id);
  const web = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { ...tramo, pasajeros: [{ asiento_id: libres[2].id, ...persona(3) }] } });
  limpiar.ventas.add(web.d.id);
  await pedir('POST', `/v1/ventas/${web.d.codigo}/pagar`);
  const anulado = await pedir('POST', `/v1/pasajes/${taquilla.d.pasajes[0].codigo}/anular`, { tk: luis });
  const terminales = (await pedir('GET', '/v1/terminales', { tk: ana })).d;
  const encomienda = await pedir('POST', '/v1/encomiendas', {
    tk: ana,
    cuerpo: { remitente: persona(4), destinatario: persona(5), terminal_origen_id: terminales[0].id, terminal_destino_id: terminales[1].id, descripcion: 'Caja S4', peso_kg: 2, costo: 20 },
  });
  limpiar.encomiendas.add(encomienda.d.id);
  caso('PAN-29', 'operaciones de prueba creadas', [taquilla.s, web.s, anulado.s, encomienda.s].join(','), '201,201,200,201');

  const despues = await indicadores();
  const precio = taquilla.d.pasajes[0].precio;
  const cobrado = taquilla.d.total + web.d.total + 20;
  caso('PAN-29', 'pasajes vendidos +2 y anulados +1', `${despues.pasajes.vendidos - base.pasajes.vendidos}/${despues.pasajes.anulados - base.pasajes.anulados}`, '2/1');
  caso('PAN-29', 'cobrado sube lo cobrado (pasajes + encomienda)', Math.round((despues.ingresos.cobrado - base.ingresos.cobrado) * 100) / 100, Math.round(cobrado * 100) / 100);
  caso('PAN-29', 'reembolsado sube el pasaje anulado y neto cuadra', `${Math.round((despues.ingresos.reembolsado - base.ingresos.reembolsado) * 100) / 100}/${Math.round((despues.ingresos.cobrado - despues.ingresos.reembolsado - despues.ingresos.neto) * 100)}`, `${precio}/0`);
  const canal = (datos, c) => datos.ventas_por_canal.find((x) => x.canal === c)?.ventas ?? 0;
  caso('PAN-29', 'ventas por canal: taquilla +2 (pasaje + encomienda), web +1', `${canal(despues, 'taquilla') - canal(base, 'taquilla')}/${canal(despues, 'web') - canal(base, 'web')}`, '2/1');
  caso('PAN-29', 'encomiendas registradas +1', despues.encomiendas.registradas - base.encomiendas.registradas, 1);
  const conRuta = await indicadores(`&ruta_id=${RUTA_SEMILLA}`);
  caso('PAN-29', 'filtro de ruta: la encomienda no cuenta en canales', canal(conRuta, 'taquilla') - canal(baseRuta, 'taquilla'), 1);
  const ocupacion = (await pedir('GET', `/v1/panel/indicadores?desde=${manana}&hasta=${manana}`, { tk: ana })).d;
  const fila = ocupacion.ocupacion.find((o) => o.viaje_id === viaje.viaje_id);
  caso('PAN-29', 'ocupacion del viaje de mañana cuenta los pasajes pagados', fila ? fila.vendidos >= 2 : false, true, fila ? `${fila.vendidos}/${fila.total} = ${fila.porcentaje} %` : 'sin fila');

  // ---------------- PAN-26/27 · prediccion ----------------
  r = await pedir('GET', '/v1/panel/prediccion', { tk: luis });
  caso('PAN-27', 'vendedor -> 403', r.s, 403);
  r = await pedir('GET', '/v1/panel/prediccion?dias=0', { tk: ana });
  caso('PAN-27', 'dias=0 -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('GET', '/v1/panel/prediccion?dias=32', { tk: ana });
  caso('PAN-27', 'dias=32 -> 400', r.s, 400);
  r = await pedir('GET', '/v1/panel/prediccion', { tk: ana });
  const rutasActivas = (await db.query('select count(*)::int n from rutas where activo')).rows[0].n;
  caso('PAN-27', '7 dias por cada ruta activa', r.d?.dias?.length, 7 * rutasActivas, `${rutasActivas} ruta(s)`);
  caso('PAN-26', 'modelo declarado sintetico con metricas', /^sinteticos/.test(r.d?.modelo?.datos) && r.d.modelo.metricas.r2 > 0.85, true, `MAE ${r.d?.modelo?.metricas?.mae} · RMSE ${r.d?.modelo?.metricas?.rmse} · R² ${r.d?.modelo?.metricas?.r2}`);
  caso('PAN-27', 'el primer dia es hoy en La Paz', r.d?.dias?.[0]?.fecha, hoy);

  // una ruta nueva con un bus de 4 asientos mañana: la demanda del modelo la supera -> refuerzo sugerido
  const bus = await pedir('POST', '/v1/buses', { tk: ana, cuerpo: { placa: '9906QAT', marca: 'Prueba', modelo: 'S4', numero_pisos: 1 } });
  limpiar.buses.add(bus.d.id);
  await pedir('POST', `/v1/buses/${bus.d.id}/asientos/generar`, { tk: ana, cuerpo: { pisos: [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'semicama' }] } });
  const ruta = await pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'Prueba S4 Oruro - Cochabamba', paradas: [{ terminal_id: terminales.find((t) => t.ciudad.nombre === 'Oruro').id, minutos_desde_origen: 0 }, { terminal_id: terminales.find((t) => t.ciudad.nombre === 'Cochabamba').id, minutos_desde_origen: 240 }] } });
  limpiar.rutas.add(ruta.d.id);
  const nuevo = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta.d.id, bus_id: bus.d.id, fecha_salida: `${manana}T09:00:00-04:00`, tarifas: [{ tipo_asiento: 'semicama', precio: 60 }] } });
  limpiar.viajes.add(nuevo.d.id);
  r = await pedir('GET', '/v1/panel/prediccion?dias=3', { tk: ana });
  const deLaRuta = r.d.dias.filter((d) => d.ruta.id === ruta.d.id);
  const dia2 = deLaRuta.find((d) => d.fecha === manana);
  caso('PAN-27', 'ruta nueva sin historia: base del modelo', r.d.bases.find((b) => b.ruta.id === ruta.d.id)?.fuente, 'modelo');
  caso('PAN-27', 'mañana: 4 asientos para la demanda estimada -> refuerzo', dia2?.alerta, 'refuerzo_sugerido', `${dia2?.pasajes_estimados} pasajes para ${dia2?.capacidad_programada} asientos`);
  caso('PAN-27', 'dias sin viajes de esa ruta -> sin_viajes', deLaRuta.filter((d) => d.fecha !== manana).every((d) => d.alerta === 'sin_viajes'), true);
} finally {
  const encomiendas = [...limpiar.encomiendas];
  const ventasEnc = (await db.query('select venta_id from encomiendas where id = any($1::uuid[])', [encomiendas])).rows.map((f) => f.venta_id);
  const ventas = [...limpiar.ventas, ...ventasEnc];
  await db.query('begin');
  await db.query('delete from encomiendas where id = any($1::uuid[])', [encomiendas]);
  await db.query('delete from pagos where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from pasajes where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from ventas where id = any($1::uuid[])', [ventas]);
  await db.query('delete from clientes where persona_id in (select id from personas where numero_documento = any($1))', [[...limpiar.documentos]]);
  await db.query('delete from personas where numero_documento = any($1)', [[...limpiar.documentos]]);
  await db.query('delete from viajes where id = any($1::uuid[])', [[...limpiar.viajes]]);
  await db.query('delete from rutas where id = any($1::uuid[])', [[...limpiar.rutas]]);
  await db.query('delete from buses where id = any($1::uuid[])', [[...limpiar.buses]]);
  await db.query('commit');
  const despues = (await db.query(CONTEO)).rows[0];
  console.table(filas);
  console.log('fallos:', filas.filter((f) => f.ok === 'NO').length, 'de', filas.length);
  console.log('base despues:', despues, JSON.stringify(antes) === JSON.stringify(despues) ? '(igual que antes)' : '(DISTINTA: revisar)');
  await db.end();
}

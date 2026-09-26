/**
 * PRUEBA DE ACEPTACION DEL SPRINT 3 contra la API local y la base compartida.
 * Taquilla, boleto, anulacion, encomiendas, editar tarifas y editor de croquis (PAN-30 a PAN-38 y PAN-43).
 * Crea sus propios datos (buses 9903QAT y 9904QAT, viajes, ventas, encomiendas) y BORRA todo al final.
 *
 * Uso (Git Bash), con la API corriendo en el puerto 4000:
 *   CLAVE_DEMO=<contrasena de las cuentas de prueba> node docs/pruebas/aceptacion_sprint03.mjs
 * Para probar el repositorio del equipo, levantar SU API y pasar su carpeta:
 *   PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=... node docs/pruebas/aceptacion_sprint03.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const RAIZ = process.env.PROYECTO ?? 'F:/Universidad/6to/Proyecto III/project_bus';
const require = createRequire(`${RAIZ}/package.json`);
const pg = require('pg');

const API = 'http://localhost:4000';
const SUPA = 'https://tvyhpwpyxmbdfxogopnl.supabase.co';
const PUBLICA = 'sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi';
const RUTA_SEMILLA = '00000000-0000-4000-8000-000000000601'; // La Paz -> Oruro -> Cochabamba
const LUIS = '00000000-0000-4000-8000-000000000002';
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
    headers: {
      ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
      ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
    },
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
  const ok = Array.isArray(esperado) ? esperado.includes(obtenido) : obtenido === esperado;
  filas.push({ tarjeta, caso: nombre, estado: String(obtenido), esperado: String(esperado), ok: ok ? 'si' : 'NO', detalle: String(detalle ?? '').slice(0, 70) });
}

const CONTEO = `select (select count(*) from personas)::int personas, (select count(*) from clientes)::int clientes,
  (select count(*) from ventas)::int ventas, (select count(*) from pasajes)::int pasajes, (select count(*) from pagos)::int pagos,
  (select count(*) from encomiendas)::int encomiendas, (select count(*) from historial_encomiendas)::int historial,
  (select count(*) from buses)::int buses, (select count(*) from viajes)::int viajes`;
const antes = (await db.query(CONTEO)).rows[0];

// lo que se borra al final
const limpiar = { ventas: new Set(), encomiendas: new Set(), viajes: new Set(), buses: new Set(), documentos: new Set() };
const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date(Date.now() + 86400000));
const persona = (n) => {
  const numero_documento = `92${String(n).padStart(5, '0')}`;
  limpiar.documentos.add(numero_documento);
  return { tipo_documento: 'ci', numero_documento, nombres: 'Prueba', apellidos: `Sprint3 ${n}` };
};
const pasajero = (asiento_id, n) => ({ asiento_id, ...persona(n) });
const registrarVenta = (r) => {
  if (r.d?.id) limpiar.ventas.add(r.d.id);
  return r;
};

try {
  const ana = await token('ana.quispe@panamericana.test');
  const luis = await token('luis.rojas@panamericana.test');
  const terminales = (await pedir('GET', '/v1/terminales', { tk: ana })).d;
  const terminal = (c) => terminales.find((t) => t.ciudad.nombre === c).id;

  // ---------------- PAN-43 · catalogo de tipos y tipo de asiento ----------------
  let r = await pedir('GET', '/v1/catalogos/tipos-asiento');
  caso('PAN-43', 'catalogo de tipos de asiento (publico)', r.s, 200, r.d?.map((t) => t.codigo).join(','));

  r = await pedir('POST', '/v1/buses', { tk: ana, cuerpo: { placa: '9903QAT', marca: 'Prueba', modelo: 'S3', numero_pisos: 1 } });
  const bus = r.d.id;
  limpiar.buses.add(bus);
  r = await pedir('POST', `/v1/buses/${bus}/asientos/generar`, { tk: ana, cuerpo: { pisos: [{ piso: 1, filas: 3, asientos_por_fila: 4, tipo: 'semicama' }] } });
  const asientos = Object.fromEntries(r.d.asientos.map((a) => [a.numero, a.id]));
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/${asientos[1]}`, { tk: ana, cuerpo: { tipo: 'cama' } });
  caso('PAN-43', 'cambiar el asiento 1 a cama (bus sin viajes)', r.s, 200, r.d?.asientos?.find((a) => a.numero === 1)?.tipo);
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/${asientos[1]}`, { tk: luis, cuerpo: { tipo: 'normal' } });
  caso('PAN-43', 'vendedor cambia un asiento -> 403', r.s, 403, r.d?.codigo);
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/${asientos[1]}`, { tk: ana, cuerpo: { tipo: 'ejecutivo' } });
  caso('PAN-43', 'tipo fuera del catalogo -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/11111111-1111-4111-8111-111111111111`, { tk: ana, cuerpo: { tipo: 'cama' } });
  caso('PAN-43', 'asiento de otro bus -> 404', r.s, 404, r.d?.codigo);

  // viaje de manana con cama y semicama
  const tarifas = [{ tipo_asiento: 'cama', precio: 140 }, { tipo_asiento: 'semicama', precio: 100 }];
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: RUTA_SEMILLA, bus_id: bus, fecha_salida: `${manana}T10:00:00-04:00`, tarifas } });
  const viaje = r.d.id;
  limpiar.viajes.add(viaje);
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/${asientos[2]}`, { tk: ana, cuerpo: { tipo: 'normal' } });
  caso('PAN-43', 'tipo sin precio en un viaje programado -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('PUT', `/v1/buses/${bus}/asientos/${asientos[2]}`, { tk: ana, cuerpo: { tipo: 'cama' } });
  caso('PAN-43', 'tipo con precio en el viaje -> 200', r.s, 200);

  // ---------------- PAN-35 · editar tarifas ----------------
  r = await pedir('PUT', `/v1/viajes/${viaje}/tarifas`, { tk: ana, cuerpo: { tarifas: [{ tipo_asiento: 'cama', precio: 150 }, { tipo_asiento: 'semicama', precio: 110 }] } });
  caso('PAN-35', 'cambiar precios del viaje', r.s, 200, r.d?.tarifas?.map((t) => `${t.tipo_asiento} ${t.precio}`).join(' · '));
  r = await pedir('PUT', `/v1/viajes/${viaje}/tarifas`, { tk: ana, cuerpo: { tarifas: [{ tipo_asiento: 'cama', precio: 150 }] } });
  caso('PAN-35', 'falta un tipo del bus -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('PUT', `/v1/viajes/${viaje}/tarifas`, { tk: ana, cuerpo: { tarifas: [...tarifas, { tipo_asiento: 'normal', precio: 50 }] } });
  caso('PAN-35', 'tipo que el bus no tiene -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('PUT', `/v1/viajes/${viaje}/tarifas`, { tk: luis, cuerpo: { tarifas } });
  caso('PAN-35', 'vendedor cambia precios -> 403', r.s, 403);
  r = await pedir('PUT', '/v1/viajes/11111111-1111-4111-8111-111111111111/tarifas', { tk: ana, cuerpo: { tarifas } });
  caso('PAN-35', 'viaje inexistente -> 404', r.s, 404);

  // ---------------- PAN-30 · venta en taquilla ----------------
  const venta = (tk, asientosElegidos, n, desde = 1, hasta = 2) =>
    pedir('POST', '/v1/taquilla/ventas', { tk, cuerpo: { viaje_id: viaje, orden_origen: desde, orden_destino: hasta, pasajeros: asientosElegidos.map((a, i) => pasajero(a, n + i)) } });
  r = registrarVenta(await venta(luis, [asientos[3], asientos[4]], 1));
  caso('PAN-30', 'vender 2 asientos en efectivo (vendedor)', r.s, 201, `${r.d?.codigo} · ${r.d?.estado} · ${r.d?.canal} · Bs ${r.d?.total}`);
  const vendida = r.d;
  caso('PAN-30', 'venta pagada, canal taquilla, pasajes emitidos', `${vendida?.estado}/${vendida?.canal}/${vendida?.pasajes?.map((p) => p.estado).join(',')}`, 'pagada/taquilla/pagado,pagado');
  caso('PAN-30', 'el vendedor ve el documento completo', vendida?.pasajes?.[0]?.pasajero?.numero_documento, '9200001');
  let fila = (await db.query(`select v.usuario_id, p.metodo, p.estado, p.monto::float8 monto from ventas v join pagos p on p.venta_id = v.id where v.codigo = $1`, [vendida.codigo])).rows[0];
  caso('PAN-30', 'vendedor registrado y pago en efectivo por el total', `${fila?.usuario_id === LUIS}/${fila?.metodo}/${fila?.estado}/${fila?.monto}`, `true/efectivo/aprobado/${vendida.total}`);
  r = await venta(null, [asientos[5]], 10);
  caso('PAN-30', 'sin sesion -> 401', r.s, 401);
  r = registrarVenta(await venta(luis, [asientos[3]], 11));
  caso('PAN-30', 'asiento ya vendido en ese tramo -> 409', r.s, 409, r.d?.mensaje);
  // la web y la taquilla, a la vez, por el mismo asiento y tramo: el mismo inventario, un solo ganador
  const [web, taquilla] = await Promise.all([
    pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 3, pasajeros: [pasajero(asientos[6], 20)] } }),
    venta(luis, [asientos[6]], 21, 1, 3),
  ]);
  registrarVenta(web);
  registrarVenta(taquilla);
  caso('PAN-30', 'web y taquilla a la vez por el mismo asiento: 201 y 409', [web.s, taquilla.s].sort().join(','), '201,409');

  // ---------------- PAN-38 · boleto ----------------
  const pasaje1 = vendida.pasajes[0].codigo;
  const pasaje2 = vendida.pasajes[1].codigo;
  r = await pedir('GET', `/v1/pasajes/${pasaje1.toLowerCase()}`);
  caso('PAN-38', 'boleto publico por codigo (sin sesion)', r.s, 200, `${r.d?.viaje?.origen?.ciudad} -> ${r.d?.viaje?.destino?.ciudad} · asiento ${r.d?.asiento?.numero}`);
  caso('PAN-38', 'documento oculto en el boleto', r.d?.pasajero?.numero_documento, '****001');
  caso('PAN-38', 'anulable hasta 2 h antes de subir', new Date(r.d?.viaje?.origen?.hora) - new Date(r.d?.anulable_hasta), 7200000);
  r = await pedir('GET', '/v1/pasajes/P-NOEXISTE');
  caso('PAN-38', 'codigo inexistente -> 404', r.s, 404, r.d?.codigo);

  // ---------------- PAN-32 · anular ----------------
  r = await pedir('POST', `/v1/pasajes/${pasaje1}/anular`);
  caso('PAN-32', 'anular sin sesion -> 401', r.s, 401);
  r = await pedir('POST', `/v1/pasajes/${pasaje1}/anular`, { tk: luis });
  caso('PAN-32', 'anular un pasaje pagado a tiempo', r.s, 200, `reembolso Bs ${r.d?.reembolso} · ${r.d?.pasaje?.estado}`);
  fila = (await db.query(`select v.estado, (select count(*) from pagos p where p.venta_id = v.id and p.estado = 'reembolsado')::int reembolsos from ventas v where v.codigo = $1`, [vendida.codigo])).rows[0];
  caso('PAN-32', 'reembolso registrado; la venta sigue pagada (le queda un pasaje)', `${fila.estado}/${fila.reembolsos}`, 'pagada/1');
  r = await pedir('GET', `/v1/viajes/${viaje}/asientos?desde=1&hasta=2`);
  caso('PAN-32', 'el asiento anulado queda libre para el tramo', r.d?.asientos?.find((a) => a.id === asientos[3])?.disponible, true);
  r = await pedir('POST', `/v1/pasajes/${pasaje1}/anular`, { tk: luis });
  caso('PAN-32', 'anular otra vez -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', `/v1/pasajes/${pasaje2}/anular`, { tk: ana });
  fila = (await db.query('select estado from ventas where codigo = $1', [vendida.codigo])).rows[0];
  caso('PAN-32', 'sin pasajes activos, la venta queda anulada', `${r.s}/${fila.estado}`, '200/anulada');
  const reservaWeb = web.s === 201 ? web.d : taquilla.d;
  if (web.s === 201) {
    r = await pedir('POST', `/v1/pasajes/${reservaWeb.pasajes[0].codigo}/anular`, { tk: luis });
    caso('PAN-32', 'una reserva sin pagar no se anula -> 409', r.s, 409, r.d?.codigo);
  } else {
    caso('PAN-32', 'una reserva sin pagar no se anula -> 409', 'omitido (gano la taquilla)', 'omitido (gano la taquilla)');
  }
  // cinco anulaciones simultaneas del mismo pasaje: una sola devuelve el dinero
  r = registrarVenta(await venta(luis, [asientos[3]], 30));
  const pasaje3 = r.d.pasajes[0].codigo;
  const anulaciones = await Promise.all([0, 1, 2, 3, 4].map(() => pedir('POST', `/v1/pasajes/${pasaje3}/anular`, { tk: luis })));
  fila = (await db.query(`select count(*)::int n from pagos where referencia_externa = $1`, [`REEMBOLSO-${pasaje3}`])).rows[0];
  caso('PAN-32', '5 anulaciones a la vez: una sola gana y un solo reembolso', `${anulaciones.filter((x) => x.s === 200).length}/${fila.n}`, '1/1');
  r = registrarVenta(await venta(luis, [asientos[3]], 31));
  caso('PAN-32', 'el asiento anulado se vuelve a vender', r.s, 201);
  // viaje que sale en 90 minutos: se vende, pero ya no se anula
  r = await pedir('POST', '/v1/buses', { tk: ana, cuerpo: { placa: '9904QAT', marca: 'Prueba', modelo: 'S3', numero_pisos: 1 } });
  const bus2 = r.d.id;
  limpiar.buses.add(bus2);
  r = await pedir('POST', `/v1/buses/${bus2}/asientos/generar`, { tk: ana, cuerpo: { pisos: [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'semicama' }] } });
  const asientoPronto = r.d.asientos[0].id;
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: RUTA_SEMILLA, bus_id: bus2, fecha_salida: new Date(Date.now() + 90 * 60000).toISOString(), tarifas: [{ tipo_asiento: 'semicama', precio: 100 }] } });
  const viajePronto = r.d.id;
  limpiar.viajes.add(viajePronto);
  r = registrarVenta(await pedir('POST', '/v1/taquilla/ventas', { tk: luis, cuerpo: { viaje_id: viajePronto, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(asientoPronto, 40)] } }));
  caso('PAN-30', 'vender un viaje que sale en 90 minutos', r.s, 201);
  r = await pedir('POST', `/v1/pasajes/${r.d.pasajes[0].codigo}/anular`, { tk: luis });
  caso('PAN-32', 'a menos de 2 h de subir -> anulacion_fuera_de_plazo', r.s, 409, r.d?.codigo);

  // ---------------- PAN-33 · encomiendas ----------------
  const envio = (n, origen = 'La Paz', destino = 'Oruro', extra = {}) => ({
    remitente: { ...persona(n), telefono: '71234567' },
    destinatario: persona(n + 1),
    terminal_origen_id: terminal(origen),
    terminal_destino_id: terminal(destino),
    descripcion: 'Caja con repuestos de prueba',
    peso_kg: 4.5,
    costo: 25,
    ...extra,
  });
  const registrarEncomienda = async (tk, datos) => {
    const res = await pedir('POST', '/v1/encomiendas', { tk, cuerpo: datos });
    if (res.d?.id) limpiar.encomiendas.add(res.d.id);
    return res;
  };
  r = await registrarEncomienda(luis, envio(50));
  caso('PAN-33', 'vendedor registra encomienda -> 403', r.s, 403);
  r = await registrarEncomienda(ana, envio(50));
  caso('PAN-33', 'registrar y cobrar una encomienda', r.s, 201, `${r.d?.codigo_seguimiento} · ${r.d?.estado} · venta ${r.d?.venta?.codigo}`);
  const e1 = r.d;
  fila = (await db.query(`select v.estado, v.canal, p.metodo, p.estado pago, p.monto::float8 monto from encomiendas e join ventas v on v.id = e.venta_id join pagos p on p.venta_id = v.id where e.id = $1`, [e1.id])).rows[0];
  caso('PAN-33', 'pagada en origen: venta de taquilla y pago en efectivo', `${fila?.estado}/${fila?.canal}/${fila?.metodo}/${fila?.pago}/${fila?.monto}`, 'pagada/taquilla/efectivo/aprobado/25');
  r = await registrarEncomienda(ana, envio(52, 'La Paz', 'La Paz'));
  caso('PAN-33', 'misma terminal de origen y destino -> 400', r.s, 400, r.d?.mensaje);
  r = await registrarEncomienda(ana, envio(52, 'La Paz', 'Oruro', { peso_kg: 0 }));
  caso('PAN-33', 'peso 0 -> 400', r.s, 400, r.d?.mensaje);
  r = await registrarEncomienda(ana, { ...envio(52), destinatario: { ...persona(53), numero_documento: 'ABC' } });
  caso('PAN-33', 'CI invalido -> 400', r.s, 400, r.d?.codigo);
  r = await registrarEncomienda(ana, { ...envio(52), terminal_destino_id: '11111111-1111-4111-8111-111111111111' });
  caso('PAN-33', 'terminal inexistente -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('GET', '/v1/encomiendas?estado=registrada', { tk: ana });
  caso('PAN-33', 'lista filtrada por estado', r.d?.some((e) => e.id === e1.id), true);
  const cambiar = (codigo, cuerpo, tk = ana) => pedir('POST', `/v1/encomiendas/${codigo}/estado`, { tk, cuerpo });
  r = await cambiar(e1.codigo_seguimiento, { estado: 'entregada' });
  caso('PAN-33', 'saltar de registrada a entregada -> 409', r.s, 409, r.d?.mensaje);
  // cuatro despachos a la vez: uno solo cambia el estado
  const despachos = await Promise.all([0, 1, 2, 3].map(() => cambiar(e1.codigo_seguimiento, { estado: 'en_transito', viaje_id: viaje })));
  caso('PAN-33', '4 despachos a la vez: uno solo cambia el estado', despachos.filter((x) => x.s === 200).length, 1, despachos.map((x) => x.d?.codigo ?? x.s).join(','));
  r = await cambiar(e1.codigo_seguimiento, { estado: 'en_destino' });
  r = await cambiar(e1.codigo_seguimiento, { estado: 'entregada', observacion: 'Recibio el destinatario' });
  caso('PAN-33', 'despachar, llegar y entregar', r.s, 200, r.d?.historial?.map((h) => h.estado).join(' > '));
  caso('PAN-33', 'el historial guarda usuario, viaje y observacion', `${r.d?.historial?.length}/${r.d?.viaje?.bus}/${r.d?.historial?.at(-1)?.observacion}`, '4/9903QAT/Recibio el destinatario');
  r = await cambiar(e1.codigo_seguimiento, { estado: 'cancelada' });
  caso('PAN-33', 'entregada ya no cambia -> 409', r.s, 409, r.d?.mensaje);
  // Cochabamba -> La Paz: la ruta de prueba va al reves, asi que ese viaje no sirve
  r = await registrarEncomienda(ana, envio(60, 'Cochabamba', 'La Paz'));
  const e2 = r.d;
  r = await cambiar(e2.codigo_seguimiento, { estado: 'en_transito', viaje_id: viaje });
  caso('PAN-33', 'viaje que no pasa por origen y despues destino -> 400', r.s, 400, r.d?.codigo);
  r = await cambiar(e2.codigo_seguimiento, { estado: 'cancelada', observacion: 'El cliente desistio' });
  fila = (await db.query(`select v.estado, (select count(*) from pagos p where p.venta_id = v.id and p.estado = 'reembolsado')::int reembolsos from encomiendas e join ventas v on v.id = e.venta_id where e.id = $1`, [e2.id])).rows[0];
  caso('PAN-33', 'cancelar antes de salir: reembolso y venta anulada', `${r.s}/${fila.estado}/${fila.reembolsos}`, '200/anulada/1');

  // ---------------- PAN-34 · seguimiento publico ----------------
  r = await pedir('GET', `/v1/seguimiento/${e1.codigo_seguimiento.toLowerCase()}`);
  caso('PAN-34', 'seguimiento publico por codigo', r.s, 200, `${r.d?.estado} · ${r.d?.historial?.length} pasos`);
  caso('PAN-34', 'sin nombres, documentos ni observaciones', /Prueba|Sprint3|9200|Recibio|Ana/.test(JSON.stringify(r.d)), false);
  r = await pedir('GET', '/v1/seguimiento/E-NOEXISTE');
  caso('PAN-34', 'codigo inexistente -> 404', r.s, 404);
} finally {
  // ---------------- limpieza ----------------
  const encomiendas = [...limpiar.encomiendas];
  const ventasDeEncomiendas = (await db.query('select venta_id from encomiendas where id = any($1::uuid[])', [encomiendas])).rows.map((f) => f.venta_id);
  const ventas = [...limpiar.ventas, ...ventasDeEncomiendas];
  await db.query('begin');
  await db.query('delete from encomiendas where id = any($1::uuid[])', [encomiendas]);
  await db.query('delete from pagos where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from pasajes where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from ventas where id = any($1::uuid[])', [ventas]);
  await db.query('delete from clientes where persona_id in (select id from personas where numero_documento = any($1))', [[...limpiar.documentos]]);
  await db.query('delete from personas where numero_documento = any($1)', [[...limpiar.documentos]]);
  await db.query('delete from viajes where id = any($1::uuid[])', [[...limpiar.viajes]]);
  await db.query('delete from buses where id = any($1::uuid[])', [[...limpiar.buses]]);
  await db.query('commit');
  const despues = (await db.query(CONTEO)).rows[0];
  console.table(filas);
  console.log('fallos:', filas.filter((f) => f.ok === 'NO').length, 'de', filas.length);
  console.log('base antes:  ', antes);
  console.log('base despues:', despues, JSON.stringify(antes) === JSON.stringify(despues) ? '(igual que antes)' : '(DISTINTA: revisar)');
  await db.end();
}

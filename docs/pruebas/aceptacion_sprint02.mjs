/**
 * PRUEBA DE ACEPTACION DEL SPRINT 2 contra la API local y la base compartida.
 * Crea sus propios datos, verifica cada criterio de las tarjetas PAN-10 a PAN-23 y BORRA todo al final.
 *
 * Uso (Git Bash), con la API corriendo en el puerto 4000:
 *   CLAVE_DEMO=<contrasena de las cuentas de prueba> node docs/pruebas/aceptacion_sprint02.mjs
 * Para probar el repositorio del equipo, levantar SU API y pasar su carpeta:
 *   PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=... node docs/pruebas/aceptacion_sprint02.mjs
 * Subir LIMITE_RESERVAS_POR_HORA en backend/.env (por ejemplo a 1000): la prueba hace mas de 30 reservas.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const RAIZ = process.env.PROYECTO ?? 'F:/Universidad/6to/Proyecto III/project_bus';
const require = createRequire(`${RAIZ}/package.json`);
const pg = require('pg');

const API = 'http://localhost:4000';
const SUPA = 'https://tvyhpwpyxmbdfxogopnl.supabase.co';
const PUBLICA = 'sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi';
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
  try { d = await r.json(); } catch {}
  return { s: r.status, d };
}

const filas = [];
function caso(tarjeta, nombre, obtenido, esperado, detalle = '') {
  const ok = Array.isArray(esperado) ? esperado.includes(obtenido) : obtenido === esperado;
  filas.push({ tarjeta, caso: nombre, estado: String(obtenido), esperado: String(esperado), ok: ok ? 'si' : 'NO', detalle: String(detalle ?? '').slice(0, 70) });
}

// ids que se borran al final
const limpiar = { ventas: new Set(), viajes: new Set(), rutas: new Set(), buses: new Set(), documentos: new Set() };
const hoyLaPaz = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date());
const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date(Date.now() + 86400000));
const pasajero = (asiento_id, n, extra = {}) => {
  const numero_documento = `91${String(n).padStart(5, '0')}`;
  limpiar.documentos.add(numero_documento);
  return { asiento_id, tipo_documento: 'ci', numero_documento, nombres: 'Prueba', apellidos: `Sprint ${n}`, ...extra };
};

try {
  const ana = await token('ana.quispe@panamericana.test');
  const luis = await token('luis.rojas@panamericana.test');
  const ciudades = (await pedir('GET', '/v1/catalogos/ciudades')).d;
  const ciudad = (n) => ciudades.find((c) => c.nombre === n).id;

  // ---------------- PAN-10 · autenticacion y roles ----------------
  let r = await pedir('GET', '/v1/sesion');
  caso('PAN-10', 'sin token -> 401', r.s, 401, r.d?.codigo);
  r = await pedir('GET', '/v1/sesion', { tk: 'eyJhbGciOiJFUzI1NiJ9.e30.firma' });
  caso('PAN-10', 'token falso -> 401', r.s, 401, r.d?.codigo);
  r = await pedir('GET', '/v1/sesion', { tk: ana });
  caso('PAN-10', 'Ana (administradora) -> 200 con roles', r.s, 200, r.d?.roles?.join(','));
  r = await pedir('GET', '/v1/sesion', { tk: luis });
  caso('PAN-10', 'Luis (vendedor) -> 200', r.s, 200, r.d?.roles?.join(','));
  r = await pedir('GET', '/v1/buses');
  caso('PAN-10', 'listar buses sin sesion -> 401', r.s, 401);
  r = await pedir('POST', '/v1/rutas', { tk: luis, cuerpo: { nombre: 'x', paradas: [] } });
  caso('PAN-10', 'vendedor registra ruta -> 403', r.s, 403, r.d?.codigo);
  r = await pedir('GET', '/v1/usuarios', { tk: luis });
  caso('PAN-10', 'vendedor lista usuarios -> 403', r.s, 403);

  // ---------------- PAN-12 · croquis ----------------
  r = await pedir('POST', '/v1/buses', { tk: ana, cuerpo: { placa: '9901QAT', marca: 'Prueba', modelo: 'S2', numero_pisos: 2 } });
  caso('PAN-12', 'bus de prueba (2 pisos)', r.s, 201, r.d?.placa);
  const bus = r.d.id;
  limpiar.buses.add(bus);
  r = await pedir('POST', `/v1/buses/${bus}/asientos/generar`, {
    tk: ana,
    cuerpo: { pisos: [{ piso: 1, filas: 3, asientos_por_fila: 3, tipo: 'cama' }, { piso: 2, filas: 5, asientos_por_fila: 4, tipo: 'semicama' }] },
  });
  caso('PAN-12', 'generar croquis estandar', r.s, 201, `${r.d?.asientos?.length} asientos (9 cama + 20 semicama)`);
  const asientos = r.d.asientos;
  r = await pedir('POST', `/v1/buses/${bus}/asientos/generar`, { tk: ana, cuerpo: { pisos: [{ piso: 1, filas: 1, asientos_por_fila: 4, tipo: 'normal' }] } });
  caso('PAN-12', 'generar otra vez -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', `/v1/buses/${bus}/asientos`, { tk: ana, cuerpo: { numero: 1, piso: 1, fila: 9, columna: 1, tipo: 'cama' } });
  caso('PAN-12', 'asiento con numero repetido -> 409', r.s, 409, r.d?.mensaje);
  r = await pedir('POST', `/v1/buses/${bus}/asientos`, { tk: ana, cuerpo: { numero: 30, piso: 3, fila: 1, columna: 1, tipo: 'cama' } });
  caso('PAN-12', 'piso que el bus no tiene -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', `/v1/buses/${bus}/asientos`, { tk: ana, cuerpo: { numero: 30, piso: 1, fila: 4, columna: 1, tipo: 'ejecutivo' } });
  caso('PAN-12', 'tipo fuera del catalogo -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', `/v1/buses/${bus}/asientos`, { tk: ana, cuerpo: { numero: 30, piso: 1, fila: 4, columna: 1, tipo: 'cama' } });
  caso('PAN-12', 'asiento suelto -> 201', r.s, 201, `${r.d?.asientos?.length} asientos`);
  r = await pedir('GET', `/v1/buses/${bus}/asientos`, { tk: luis });
  caso('PAN-12', 'ver croquis (vendedor) -> 200', r.s, 200);

  // ---------------- PAN-13 · rutas ----------------
  const terminales = (await pedir('GET', '/v1/terminales', { tk: ana })).d;
  const terminal = (c) => terminales.find((t) => t.ciudad.nombre === c).id;
  r = await pedir('POST', '/v1/rutas', {
    tk: ana,
    cuerpo: { nombre: 'PRUEBA S2 La Paz - Oruro', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0, km_desde_origen: 0 }, { terminal_id: terminal('Oruro'), minutos_desde_origen: 210, km_desde_origen: 190 }] },
  });
  caso('PAN-13', 'registrar ruta con 2 paradas', r.s, 201, `duracion ${r.d?.duracion_estimada_min} min · ${r.d?.distancia_km} km`);
  const ruta = r.d.id;
  limpiar.rutas.add(ruta);
  r = await pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'prueba s2 la paz - oruro', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0 }, { terminal_id: terminal('Oruro'), minutos_desde_origen: 200 }] } });
  caso('PAN-13', 'nombre repetido -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'PRUEBA S2 X', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0 }] } });
  caso('PAN-13', 'una sola parada -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'PRUEBA S2 Y', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0 }, { terminal_id: terminal('Oruro'), minutos_desde_origen: 100 }, { terminal_id: terminal('Cochabamba'), minutos_desde_origen: 90 }] } });
  caso('PAN-13', 'minutos que no crecen -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'PRUEBA S2 Z', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0 }, { terminal_id: '11111111-1111-4111-8111-111111111111', minutos_desde_origen: 60 }] } });
  caso('PAN-13', 'terminal inexistente -> 400', r.s, 400, r.d?.codigo);
  // dos registros simultaneos con el mismo nombre: el indice unico deja pasar solo uno
  const gemelas = await Promise.all([0, 1].map(() => pedir('POST', '/v1/rutas', { tk: ana, cuerpo: { nombre: 'Prueba S2 Gemela', paradas: [{ terminal_id: terminal('La Paz'), minutos_desde_origen: 0 }, { terminal_id: terminal('Oruro'), minutos_desde_origen: 200 }] } })));
  gemelas.filter((x) => x.s === 201).forEach((x) => limpiar.rutas.add(x.d.id));
  caso('PAN-13', 'mismo nombre a la vez -> un 201 y un 409', gemelas.map((x) => x.s).sort().join(','), '201,409');

  // ---------------- PAN-15 · programar viajes ----------------
  const tarifas = [{ tipo_asiento: 'cama', precio: 150 }, { tipo_asiento: 'semicama', precio: 110 }];
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta, bus_id: bus, fecha_salida: `${manana}T10:00:00-04:00`, tarifas } });
  caso('PAN-15', 'programar viaje con tarifas', r.s, 201, `llega ${r.d?.fecha_llegada_estimada}`);
  const viaje = r.d.id;
  limpiar.viajes.add(viaje);
  caso('PAN-15', 'llegada = salida + 210 min', new Date(r.d.fecha_llegada_estimada) - new Date(r.d.fecha_salida), 210 * 60000);
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta, bus_id: bus, fecha_salida: `${manana}T12:00:00-04:00`, tarifas } });
  caso('PAN-15', 'mismo bus en horario cruzado -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta, bus_id: bus, fecha_salida: `${manana}T20:00:00-04:00`, tarifas: [tarifas[0]] } });
  caso('PAN-15', 'falta la tarifa de un tipo -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta, bus_id: bus, fecha_salida: `${manana}T20:00:00-04:00`, tarifas: [...tarifas, { tipo_asiento: 'normal', precio: 90 }] } });
  caso('PAN-15', 'tarifa de un tipo que el bus no tiene -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/viajes', { tk: ana, cuerpo: { ruta_id: ruta, bus_id: bus, fecha_salida: '2026-01-01T10:00:00-04:00', tarifas } });
  caso('PAN-15', 'fecha pasada -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('GET', '/v1/viajes', { tk: ana });
  caso('PAN-15', 'el viaje aparece en la lista', r.d?.some((v) => v.id === viaje), true, `${r.d?.length} viajes desde hoy`);

  // ---------------- PAN-17 · busqueda ----------------
  r = await pedir('GET', `/v1/viajes/buscar?origen=${ciudad('La Paz')}&destino=${ciudad('Oruro')}&fecha=${manana}`);
  const delBus = r.d?.find((x) => x.viaje_id === viaje);
  caso('PAN-17', 'encuentra el viaje La Paz -> Oruro', Boolean(delBus), true, JSON.stringify(delBus?.tarifas_tramo));
  caso('PAN-17', 'asientos libres = 30', delBus?.asientos_libres, 30);
  r = await pedir('GET', `/v1/viajes/buscar?origen=${ciudad('Oruro')}&destino=${ciudad('Cochabamba')}&fecha=${manana}`);
  caso('PAN-17', 'tramo intermedio Oruro -> Cochabamba (ruta demo)', r.s, 200, r.d?.map((x) => `${x.bus.placa} ${x.precio_desde}`).join(' | '));
  caso('PAN-17', 'precio del tramo = mitad redondeada (47,50)', r.d?.[0]?.precio_desde, 47.5);
  r = await pedir('GET', `/v1/viajes/buscar?origen=${ciudad('Oruro')}&destino=${ciudad('Oruro')}&fecha=${manana}`);
  caso('PAN-17', 'origen = destino -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('GET', `/v1/viajes/buscar?origen=${ciudad('Cochabamba')}&destino=${ciudad('La Paz')}&fecha=${manana}`);
  caso('PAN-17', 'sentido contrario sin viajes -> lista vacia', r.d?.length, 0);

  // ---------------- PAN-19 · disponibilidad ----------------
  r = await pedir('GET', `/v1/viajes/${viaje}/asientos?desde=1&hasta=2`);
  caso('PAN-19', 'croquis del tramo con 30 asientos libres', r.d?.asientos?.filter((a) => a.disponible).length, 30, `${r.d?.numero_pisos} pisos`);
  r = await pedir('GET', `/v1/viajes/${viaje}/asientos?desde=2&hasta=1`);
  caso('PAN-19', 'tramo al reves -> 400', r.s, 400);
  r = await pedir('GET', '/v1/viajes/11111111-1111-4111-8111-111111111111/asientos?desde=1&hasta=2');
  caso('PAN-19', 'viaje inexistente -> 404', r.s, 404);

  // ---------------- PAN-21 · reservar ----------------
  const cama = asientos.find((a) => a.tipo === 'cama' && a.numero === 1);
  const semi = asientos.find((a) => a.tipo === 'semicama');
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(cama.id, 1), pasajero(semi.id, 2, { telefono: '71112233' })] } });
  caso('PAN-21', 'reservar 2 asientos (sin sesion)', r.s, 201, `${r.d?.codigo} total ${r.d?.total}`);
  const venta1 = r.d;
  limpiar.ventas.add(venta1.id);
  caso('PAN-21', 'total = 150 + 110', venta1.total, 260);
  caso('PAN-21', 'reserva de 10 minutos', Math.round((new Date(venta1.reservado_hasta) - Date.now()) / 60000), [9, 10]);
  caso('PAN-21', 'documento oculto en la respuesta publica', venta1.pasajes[0].pasajero.numero_documento.startsWith('****'), true, venta1.pasajes[0].pasajero.numero_documento);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(cama.id, 3)] } });
  caso('PAN-21', 'mismo asiento y tramo -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(asientos[5].id, 4), pasajero(asientos[6].id, 4)] } });
  caso('PAN-21', 'misma persona dos veces -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: asientos.slice(10, 16).map((a, i) => pasajero(a.id, 10 + i)) } });
  caso('PAN-21', '6 pasajeros -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [{ ...pasajero(asientos[7].id, 5), numero_documento: 'ABC' }] } });
  caso('PAN-21', 'CI invalido -> 400', r.s, 400, r.d?.codigo);

  // concurrencia: 8 reservas SIMULTANEAS del mismo asiento y tramo -> exactamente 1 gana
  const disputado = asientos.find((a) => a.numero === 20);
  const carrera = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(disputado.id, 100 + i)] } }),
    ),
  );
  carrera.filter((x) => x.s === 201).forEach((x) => limpiar.ventas.add(x.d.id));
  caso('PAN-21', '8 reservas simultaneas: una sola gana', carrera.filter((x) => x.s === 201).length, 1, `201 x${carrera.filter((x) => x.s === 201).length} · 409 x${carrera.filter((x) => x.s === 409).length}`);
  caso('PAN-21', 'las otras 7 reciben 409', carrera.filter((x) => x.s === 409).length, 7);

  // tramos en la ruta demo (3 paradas): el mismo asiento 1->2 y 2->3 al mismo tiempo -> los dos ganan
  const busq = (await pedir('GET', `/v1/viajes/buscar?origen=${ciudad('La Paz')}&destino=${ciudad('Cochabamba')}&fecha=${manana}`)).d;
  const demo = busq.find((x) => x.bus.placa === '3187HTR');
  const dispDemo = (await pedir('GET', `/v1/viajes/${demo.viaje_id}/asientos?desde=1&hasta=3`)).d;
  const libre = dispDemo.asientos.filter((a) => a.disponible).at(-1);
  const tramos = await Promise.all([
    pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: demo.viaje_id, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(libre.id, 200)] } }),
    pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: demo.viaje_id, orden_origen: 2, orden_destino: 3, pasajeros: [pasajero(libre.id, 201)] } }),
  ]);
  tramos.filter((x) => x.s === 201).forEach((x) => limpiar.ventas.add(x.d.id));
  caso('PAN-21', 'mismo asiento, tramos que NO se cruzan: los dos ganan', tramos.map((x) => x.s).join(','), '201,201');
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: demo.viaje_id, orden_origen: 1, orden_destino: 3, pasajeros: [pasajero(libre.id, 202)] } });
  caso('PAN-21', 'tramo 1->3 sobre 1->2 y 2->3 reservados -> 409', r.s, 409, r.d?.mensaje);
  const otro = dispDemo.asientos.filter((a) => a.disponible).at(-2);
  const cruzados = await Promise.all([
    pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: demo.viaje_id, orden_origen: 1, orden_destino: 3, pasajeros: [pasajero(otro.id, 203)] } }),
    pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: demo.viaje_id, orden_origen: 2, orden_destino: 3, pasajeros: [pasajero(otro.id, 204)] } }),
  ]);
  cruzados.filter((x) => x.s === 201).forEach((x) => limpiar.ventas.add(x.d.id));
  caso('PAN-21', 'tramos que SI se cruzan, simultaneos: 201 y 409', cruzados.map((x) => x.s).sort().join(','), '201,409');

  // ---------------- PAN-22 · pagar ----------------
  r = await pedir('POST', `/v1/ventas/${venta1.codigo}/pagar`, { cuerpo: {} });
  caso('PAN-22', 'pagar la venta pendiente', r.s, 200, `${r.d?.estado} · pasajes ${r.d?.pasajes?.map((p) => p.estado).join(',')}`);
  caso('PAN-22', 'pasajes pagados con codigo P-', r.d?.pasajes?.every((p) => p.estado === 'pagado' && /^P-/.test(p.codigo)), true);
  const pago = await db.query('select monto::float8 as monto, metodo, estado, referencia_externa from pagos where venta_id = $1', [venta1.id]);
  caso('PAN-22', 'pago aprobado por el total, con referencia simulada', pago.rows[0]?.monto, 260, `${pago.rows[0]?.metodo} · ${pago.rows[0]?.estado} · ${pago.rows[0]?.referencia_externa}`);
  r = await pedir('POST', `/v1/ventas/${venta1.codigo}/pagar`, { cuerpo: {} });
  caso('PAN-22', 'pagar otra vez -> 409', r.s, 409, r.d?.codigo);
  r = await pedir('POST', '/v1/ventas/V-NOEXISTE/pagar', { cuerpo: {} });
  caso('PAN-22', 'venta inexistente -> 404', r.s, 404);

  // vencimiento: la reserva se deja vencer y ya no se puede pagar; el asiento vuelve a estar libre
  const aVencer = asientos.find((a) => a.numero === 25);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(aVencer.id, 300)] } });
  limpiar.ventas.add(r.d.id);
  await db.query(`update pasajes set reservado_hasta = now() - interval '1 minute' where venta_id = $1`, [r.d.id]);
  const vencida = r.d.codigo;
  r = await pedir('GET', `/v1/viajes/${viaje}/asientos?desde=1&hasta=2`);
  caso('PAN-19', 'la reserva vencida se muestra libre', r.d.asientos.find((a) => a.id === aVencer.id).disponible, true);
  r = await pedir('POST', `/v1/ventas/${vencida}/pagar`, { cuerpo: {} });
  caso('PAN-22', 'pagar una reserva vencida -> 409 reserva_expirada', r.d?.codigo, 'reserva_expirada');
  r = await pedir('GET', `/v1/ventas/${vencida}`);
  caso('PAN-22', 'la venta queda expirada', r.d?.estado, 'expirada', `pasajes ${r.d?.pasajes?.map((p) => p.estado)}`);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { viaje_id: viaje, orden_origen: 1, orden_destino: 2, pasajeros: [pasajero(aVencer.id, 301)] } });
  if (r.d?.id) limpiar.ventas.add(r.d.id);
  caso('PAN-21', 'el asiento liberado se puede volver a reservar', r.s, 201);

  // ocupacion en el backoffice
  r = await pedir('GET', '/v1/viajes', { tk: ana });
  const fila = r.d.find((v) => v.id === viaje);
  caso('PAN-16', 'la lista del backoffice muestra la ocupacion', fila?.asientos_vendidos, 4, `${fila?.asientos_vendidos} / ${fila?.total_asientos}`);
} finally {
  // ---------------- limpieza ----------------
  const ventas = [...limpiar.ventas];
  await db.query('begin');
  await db.query('delete from pagos where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from pasajes where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from ventas where id = any($1::uuid[])', [ventas]);
  await db.query('delete from clientes where persona_id in (select id from personas where numero_documento = any($1))', [[...limpiar.documentos]]);
  await db.query('delete from personas where numero_documento = any($1)', [[...limpiar.documentos]]);
  await db.query('delete from viajes where id = any($1::uuid[])', [[...limpiar.viajes]]);
  await db.query('delete from rutas where id = any($1::uuid[])', [[...limpiar.rutas]]);
  await db.query('delete from buses where id = any($1::uuid[])', [[...limpiar.buses]]);
  await db.query('commit');
  const restos = await db.query(`select (select count(*) from personas)::int personas, (select count(*) from clientes)::int clientes,
      (select count(*) from ventas)::int ventas, (select count(*) from pasajes)::int pasajes, (select count(*) from pagos)::int pagos,
      (select count(*) from buses)::int buses, (select count(*) from rutas)::int rutas`);
  console.table(filas);
  console.log('fallos:', filas.filter((f) => f.ok === 'NO').length, 'de', filas.length);
  console.log('base despues de limpiar:', restos.rows[0]);
  await db.end();
}

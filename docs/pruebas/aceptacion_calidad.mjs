/**
 * PRUEBA DE ACEPTACION DEL INCREMENTO DE CALIDAD Y LEGAL contra la API y la web locales.
 * Tarifas diferenciadas (PAN-44), consentimiento (PAN-45), documentos legales y datos del negocio (PAN-46),
 * buscadores y metadatos (PAN-48). Crea sus datos y los BORRA al final.
 *
 *   CLAVE_DEMO=<contrasena> node docs/pruebas/aceptacion_calidad.mjs
 *   PROYECTO="F:/Universidad/6to/Proyecto III/panamericana" CLAVE_DEMO=... node docs/pruebas/aceptacion_calidad.mjs
 *
 * Con la API en el puerto 4000 y la web en el 3000 (npm run dev:web o next start). Sin la web, sus casos se omiten.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const RAIZ = process.env.PROYECTO ?? 'F:/Universidad/6to/Proyecto III/project_bus';
const require = createRequire(`${RAIZ}/package.json`);
const pg = require('pg');

const API = 'http://localhost:4000';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';
const SUPA = 'https://tvyhpwpyxmbdfxogopnl.supabase.co';
const PUBLICA = 'sb_publishable_pekXdkyDZys5MbAEw4KJWA_pVnIHBMi';
// huella del favicon que trae la plantilla de Next.js (logo de un tercero): no debe publicarse
const FAVICON_PLANTILLA = '2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932';
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
async function pedir(metodo, ruta, { cuerpo, tk } = {}) {
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
async function pagina(ruta) {
  const r = await fetch(WEB + ruta);
  return { s: r.status, texto: await r.text() };
}
const filas = [];
function caso(tarjeta, nombre, obtenido, esperado, detalle = '') {
  filas.push({ tarjeta, caso: nombre, estado: String(obtenido), esperado: String(esperado), ok: obtenido === esperado ? 'si' : 'NO', detalle: String(detalle ?? '').slice(0, 70) });
}
const CONTEO = `select (select count(*) from personas)::int personas, (select count(*) from ventas)::int ventas,
  (select count(*) from pasajes)::int pasajes, (select count(*) from pagos)::int pagos`;
const antes = (await db.query(CONTEO)).rows[0];
const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date(Date.now() + 864e5));
const limpiar = { ventas: new Set(), documentos: new Set() };
const persona = (n, tipo_pasajero) => {
  const numero_documento = `96${String(n).padStart(5, '0')}`;
  limpiar.documentos.add(numero_documento);
  return { tipo_documento: 'ci', numero_documento, nombres: 'Prueba', apellidos: `Calidad ${n}`, ...(tipo_pasajero ? { tipo_pasajero } : {}) };
};
// la misma regla que la API: redondeo hacia abajo a Bs 0,50 y nunca menos de Bs 0,50
const conDescuento = (precio, d) => (d <= 0 ? precio : Math.max(0.5, Math.floor(((precio * (100 - d)) / 100) * 2 + 1e-9) / 2));

try {
  const luis = await token('luis.rojas@panamericana.test');

  // ---------------- PAN-44 · catalogo de tarifas de la ley ----------------
  let r = await pedir('GET', '/v1/catalogos/tipos-pasajero');
  const tarifas = r.d ?? [];
  caso('PAN-44', 'catalogo publico de tarifas -> 200', r.s, 200);
  caso('PAN-44', 'tarifas y descuentos en orden', tarifas.map((t) => `${t.codigo}:${t.descuento_porcentaje}`).join(' '), 'general:0 adulto_mayor:20 discapacidad:50 menor:50');
  caso('PAN-44', 'cada descuento dice que documento presentar', tarifas.filter((t) => t.codigo !== 'general').every((t) => Boolean(t.requisito)), true);
  const descuento = Object.fromEntries(tarifas.map((t) => [t.codigo, t.descuento_porcentaje]));

  // viaje de mañana La Paz -> Oruro de los datos de demostracion
  const ciudades = (await pedir('GET', '/v1/catalogos/ciudades')).d;
  const id = (nombre) => ciudades.find((c) => c.nombre === nombre).id;
  const viaje = (await pedir('GET', `/v1/viajes/buscar?origen=${id('La Paz')}&destino=${id('Oruro')}&fecha=${manana}`)).d[0];
  const tramo = { viaje_id: viaje.viaje_id, orden_origen: viaje.origen.orden, orden_destino: viaje.destino.orden };
  const libres = (await pedir('GET', `/v1/viajes/${viaje.viaje_id}/asientos?desde=${tramo.orden_origen}&hasta=${tramo.orden_destino}`)).d.asientos.filter((a) => a.disponible);
  const mapa = libres[0].precios_por_tarifa ?? {};
  caso('PAN-44', 'la disponibilidad informa el precio con cada tarifa', tarifas.every((t) => mapa[t.codigo] === conDescuento(libres[0].precio, t.descuento_porcentaje)), true, JSON.stringify(mapa));

  // ---------------- PAN-45 · consentimiento ----------------
  const reserva = (pasajeros, extra = {}) => ({ ...tramo, pasajeros, ...extra });
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: reserva([{ asiento_id: libres[0].id, ...persona(1) }]) });
  caso('PAN-45', 'reserva sin el campo de consentimiento -> 400', r.s, 400, r.d?.codigo);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: reserva([{ asiento_id: libres[0].id, ...persona(1) }], { acepta_condiciones: false }) });
  caso('PAN-45', 'reserva sin aceptar los términos -> 400', r.s, 400, r.d?.mensaje);
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: { ...reserva([], { acepta_condiciones: false }), viaje_id: '00000000-0000-4000-8000-00000000abcd' } });
  caso('PAN-45', 'sin consentimiento no se consulta el viaje (400, no 404)', r.s, 400, r.d?.codigo);
  r = await pedir('POST', '/v1/taquilla/ventas', { tk: luis, cuerpo: reserva([{ asiento_id: libres[0].id, ...persona(1) }], { acepta_condiciones: false }) });
  caso('PAN-45', 'taquilla sin aceptar los términos -> 400', r.s, 400, r.d?.codigo);

  // ---------------- PAN-44 · precio con descuento ----------------
  r = await pedir('POST', '/v1/ventas/reservas', { cuerpo: reserva([{ asiento_id: libres[0].id, ...persona(2, 'estudiante') }], { acepta_condiciones: true }) });
  caso('PAN-44', 'tarifa que no existe -> 400', r.s, 400, r.d?.mensaje);

  const elegidos = [
    { asiento: libres[0], tipo: 'general' },
    { asiento: libres[1], tipo: 'adulto_mayor' },
    { asiento: libres[2], tipo: 'discapacidad' },
  ];
  const web = await pedir('POST', '/v1/ventas/reservas', {
    cuerpo: reserva(
      elegidos.map((e, i) => ({ asiento_id: e.asiento.id, ...persona(10 + i, e.tipo) })),
      { acepta_condiciones: true },
    ),
  });
  if (web.d?.id) limpiar.ventas.add(web.d.id);
  caso('PAN-44', 'reserva web con tres tarifas -> 201', web.s, 201, web.d?.mensaje);
  // lo que cobra la reserva es exactamente lo que la disponibilidad mostro para esa tarifa
  const esperados = elegidos.map((e) => e.asiento.precios_por_tarifa[e.tipo]);
  const porAsiento = (venta, asiento) => venta.pasajes.find((p) => p.asiento.numero === asiento.numero);
  caso('PAN-44', 'cada pasaje con el precio de su tarifa', elegidos.map((e) => porAsiento(web.d, e.asiento)?.precio).join(' / '), esperados.join(' / '));
  caso('PAN-44', 'el total suma los precios con descuento', web.d?.total, Math.round(esperados.reduce((a, b) => a + b, 0) * 100) / 100);
  caso('PAN-44', 'el detalle trae la tarifa y su requisito', porAsiento(web.d, libres[1])?.tipo_pasajero?.requisito, 'Cédula de identidad');

  r = await pedir('POST', `/v1/ventas/${web.d.codigo}/pagar`);
  caso('PAN-44', 'pago de la venta con descuentos -> 200', r.s, 200);
  const pasajeMayor = porAsiento(web.d, libres[1]);
  r = await pedir('GET', `/v1/pasajes/${pasajeMayor.codigo}`);
  caso('PAN-44', 'el boleto muestra la tarifa del pasaje', `${r.d?.tipo_pasajero?.codigo} · ${r.d?.precio}`, `adulto_mayor · ${esperados[1]}`);

  const taquilla = await pedir('POST', '/v1/taquilla/ventas', {
    tk: luis,
    cuerpo: reserva([{ asiento_id: libres[3].id, ...persona(20, 'menor') }], { acepta_condiciones: true }),
  });
  if (taquilla.d?.id) limpiar.ventas.add(taquilla.d.id);
  caso('PAN-44', 'taquilla con tarifa de menor -> 201 y 50 %', `${taquilla.s} · ${taquilla.d?.total}`, `201 · ${conDescuento(libres[3].precio, descuento.menor)}`);
  r = await pedir('POST', `/v1/pasajes/${taquilla.d.pasajes[0].codigo}/anular`, { tk: luis });
  caso('PAN-44', 'anular devuelve lo que se pagó con descuento', r.d?.reembolso, taquilla.d?.total);

  // ---------------- PAN-46 y PAN-48 · web: documentos legales, buscadores y marca ----------------
  let webArriba = true;
  try {
    await fetch(WEB, { method: 'HEAD' });
  } catch {
    webArriba = false;
  }
  if (!webArriba) {
    caso('PAN-46', `web en ${WEB}`, 'omitida', 'omitida', 'levantar la web para probar estas páginas');
  } else {
    const documentos = { '/terminos': 'Términos y Condiciones', '/privacidad': 'Política de Privacidad', '/reembolsos': 'Política de Reembolsos', '/cookies': 'Política de Cookies' };
    for (const [ruta, titulo] of Object.entries(documentos)) {
      const p = await pagina(ruta);
      caso('PAN-46', `${ruta} publicada con su título`, p.s === 200 && p.texto.includes(titulo), true);
    }
    const portada = await pagina('/');
    caso('PAN-46', 'el pie enlaza los cuatro documentos', Object.keys(documentos).every((ruta) => portada.texto.includes(`href="${ruta}"`)), true);
    caso('PAN-46', 'datos del negocio sin confirmar se ven como pendientes', portada.texto.includes('por completar'), true, 'se completan en shared/src/negocio.ts');
    caso('PAN-46', 'la portada no promete destinos que no existen', /y m[aá]s destinos/i.test(portada.texto), false);
    caso('PAN-46', 'sin scripts de otros sitios', /<script[^>]+src="https?:/i.test(portada.texto), false);
    const favicon = Buffer.from(await (await fetch(`${WEB}/favicon.ico`)).arrayBuffer());
    caso('PAN-46', 'favicon propio (no el logo de la plantilla)', createHash('sha256').update(favicon).digest('hex') !== FAVICON_PLANTILLA && favicon.length > 0, true);

    const robots = await pagina('/robots.txt');
    caso('PAN-48', 'sin dominio oficial, robots.txt no deja indexar', /Disallow: \/\s*$/m.test(robots.texto), true, robots.texto.replace(/\s+/g, ' '));
    const mapa = await pagina('/sitemap.xml');
    caso('PAN-48', 'sin dominio oficial, el mapa del sitio sale vacío', mapa.s === 200 && !mapa.texto.includes('<url>'), true);
    const boleto = await pagina(`/boleto/${pasajeMayor.codigo}`);
    caso('PAN-48', 'un boleto no se indexa (noindex)', /<meta name="robots" content="noindex, nofollow"/.test(boleto.texto), true);
    caso('PAN-48', 'cada página tiene su título', /<title>Política de Privacidad · Panamericana<\/title>/.test((await pagina('/privacidad')).texto), true);
    caso('PAN-48', 'idioma declarado es-BO', /<html lang="es-BO"/.test(portada.texto), true);
  }
} finally {
  const ventas = [...limpiar.ventas];
  await db.query('begin');
  await db.query('delete from pagos where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from pasajes where venta_id = any($1::uuid[])', [ventas]);
  await db.query('delete from ventas where id = any($1::uuid[])', [ventas]);
  await db.query('delete from clientes where persona_id in (select id from personas where numero_documento = any($1))', [[...limpiar.documentos]]);
  await db.query('delete from personas where numero_documento = any($1)', [[...limpiar.documentos]]);
  await db.query('commit');
  const despues = (await db.query(CONTEO)).rows[0];
  console.table(filas);
  console.log('fallos:', filas.filter((f) => f.ok === 'NO').length, 'de', filas.length);
  console.log('base despues:', despues, JSON.stringify(antes) === JSON.stringify(despues) ? '(igual que antes)' : '(DISTINTA: revisar)');
  await db.end();
}

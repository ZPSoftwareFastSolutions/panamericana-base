/**
 * PRUEBA DE HUMO: npm run prueba:humo
 *
 * Recorre la API como lo haria la demo y avisa si algo basico esta roto. SOLO LEE: no crea
 * ventas ni encomiendas, asi que se puede correr contra la base compartida o contra staging.
 *
 *   API_URL=https://...  npm run prueba:humo          (por defecto http://localhost:4000)
 *   CLAVE_DEMO=...       agrega las pruebas con sesion (cuentas de prueba de Ana y Luis)
 */
import { existsSync, readFileSync } from 'node:fs';
import { RUTAS_API } from '@panamericana/shared';

if (existsSync('.env')) process.loadEnvFile('.env');

const API = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const filas: { prueba: string; resultado: string; ok: boolean }[] = [];

async function pedir(ruta: string, opciones: { metodo?: string; token?: string; cuerpo?: unknown } = {}) {
  const respuesta = await fetch(API + ruta, {
    method: opciones.metodo ?? 'GET',
    headers: {
      ...(opciones.cuerpo ? { 'Content-Type': 'application/json' } : {}),
      ...(opciones.token ? { Authorization: `Bearer ${opciones.token}` } : {}),
    },
    body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
  });
  let datos: unknown = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }
  return { estado: respuesta.status, datos: datos as Record<string, unknown> & unknown[] };
}

function revisar(prueba: string, estado: number, esperado: number, detalle = '') {
  filas.push({ prueba, resultado: `${estado}${detalle ? ` · ${detalle}` : ''}`, ok: estado === esperado });
}

/** la clave publicable de la web (no es secreta) para pedir el token de las cuentas de prueba */
function clavePublicable(): string | undefined {
  if (process.env.SUPABASE_PUBLISHABLE_KEY) return process.env.SUPABASE_PUBLISHABLE_KEY;
  const archivo = '../web/.env.local';
  if (!existsSync(archivo)) return undefined;
  return readFileSync(archivo, 'utf8').match(/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim();
}

async function token(correo: string): Promise<string | undefined> {
  const clave = clavePublicable();
  if (!process.env.CLAVE_DEMO || !process.env.SUPABASE_URL || !clave) return undefined;
  const respuesta = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: clave, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: correo, password: process.env.CLAVE_DEMO }),
  });
  return ((await respuesta.json()) as { access_token?: string }).access_token;
}

async function principal() {
  const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date(Date.now() + 864e5));

  let r = await pedir(RUTAS_API.salud);
  revisar('API responde', r.estado, 200);

  r = await pedir(RUTAS_API.catalogos.ciudades);
  revisar('catalogo de ciudades', r.estado, 200, `${Array.isArray(r.datos) ? r.datos.length : 0} ciudades`);
  const ciudades = (Array.isArray(r.datos) ? r.datos : []) as { id: string; nombre: string }[];
  r = await pedir(RUTAS_API.catalogos.tiposAsiento);
  revisar('catalogo de tipos de asiento', r.estado, 200);
  r = await pedir(RUTAS_API.catalogos.tiposPasajero);
  revisar('tarifas diferenciadas de la ley', r.estado, 200, `${Array.isArray(r.datos) ? r.datos.length : 0} tarifas`);

  const origen = ciudades.find((c) => c.nombre === 'La Paz');
  const destino = ciudades.find((c) => c.nombre === 'Oruro');
  if (origen && destino) {
    r = await pedir(RUTAS_API.viajes.buscarCon(origen.id, destino.id, manana));
    const viajes = (Array.isArray(r.datos) ? r.datos : []) as { viaje_id: string; origen: { orden: number }; destino: { orden: number } }[];
    revisar('buscar viajes La Paz -> Oruro (mañana)', r.estado, 200, `${viajes.length} viajes`);
    const primero = viajes[0];
    if (primero) {
      r = await pedir(RUTAS_API.viajes.asientosDelTramo(primero.viaje_id, primero.origen.orden, primero.destino.orden));
      revisar('croquis del tramo', r.estado, 200);
    }
  }

  r = await pedir(RUTAS_API.pasajes.detalle('P-NOEXISTE'));
  revisar('boleto inexistente -> 404', r.estado, 404);
  r = await pedir(RUTAS_API.encomiendas.seguimientoDe('E-NOEXISTE'));
  revisar('seguimiento inexistente -> 404', r.estado, 404);
  r = await pedir(RUTAS_API.ventas.reservas, { metodo: 'POST', cuerpo: {} });
  revisar('reserva sin datos -> 400', r.estado, 400);
  r = await pedir(RUTAS_API.ventas.reservas, {
    metodo: 'POST',
    cuerpo: { viaje_id: '00000000-0000-4000-8000-000000000000', orden_origen: 1, orden_destino: 2, pasajeros: [], acepta_condiciones: false },
  });
  revisar('reserva sin aceptar los términos -> 400', r.estado, 400);

  for (const ruta of [RUTAS_API.buses.base, RUTAS_API.encomiendas.base, RUTAS_API.panel.indicadores, RUTAS_API.panel.prediccion]) {
    r = await pedir(ruta);
    revisar(`${ruta} sin sesión -> 401`, r.estado, 401);
  }
  r = await pedir(RUTAS_API.taquilla.ventas, { metodo: 'POST', cuerpo: {} });
  revisar('taquilla sin sesión -> 401', r.estado, 401);

  const ana = await token('ana.quispe@panamericana.test');
  const luis = await token('luis.rojas@panamericana.test');
  if (ana && luis) {
    r = await pedir(RUTAS_API.sesion.actual, { token: ana });
    revisar('sesión de la administradora', r.estado, 200);
    r = await pedir(RUTAS_API.panel.indicadores, { token: ana });
    revisar('panel de indicadores', r.estado, 200);
    r = await pedir(RUTAS_API.panel.prediccionDe(7), { token: ana });
    const modelo = (r.datos as { modelo?: { metricas?: { r2?: number } } }).modelo;
    revisar('predicción de demanda (7 días)', r.estado, 200, `R² ${modelo?.metricas?.r2 ?? '?'}`);
    r = await pedir(RUTAS_API.panel.indicadores, { token: luis });
    revisar('vendedor en el panel -> 403', r.estado, 403);
  } else {
    filas.push({ prueba: 'pruebas con sesión', resultado: 'omitidas (falta CLAVE_DEMO)', ok: true });
  }

  console.log(`Prueba de humo contra ${API}`);
  console.table(filas.map((f) => ({ ...f, ok: f.ok ? 'si' : 'NO' })));
  const fallas = filas.filter((f) => !f.ok).length;
  console.log(fallas === 0 ? 'Todo en orden.' : `${fallas} prueba(s) fallaron.`);
  process.exitCode = fallas === 0 ? 0 : 1;
}

principal().catch((error: unknown) => {
  console.error('No se pudo completar la prueba de humo:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

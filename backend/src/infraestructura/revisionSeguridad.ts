/**
 * REVISION DE SEGURIDAD: npm run prueba:seguridad
 *
 * Lista de control automatica antes de presentar o desplegar:
 *  1. base de datos: todas las tablas con RLS y sin politicas publicas; vistas con security_invoker
 *     y sin lectura para el rol anonimo (los datos salen SOLO por la API);
 *  2. configuracion: origenes permitidos (CORS) definidos y sin comodin;
 *  3. repositorio: ningun .env versionado ni contraseñas o claves secretas en los archivos;
 *  4. API (si esta corriendo): rutas del panel cerradas, CORS que rechaza otros sitios y sin
 *     el encabezado que delata la tecnologia (x-powered-by);
 *  5. legal: datos del negocio completos (en produccion), documentos legales publicados y la web
 *     sin analiticas, fuentes ni scripts de terceros (si aparecen, hay que pedir consentimiento
 *     y actualizar la Politica de Cookies antes de publicar).
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { datosDelNegocioPendientes, RUTAS_API } from '@panamericana/shared';

if (existsSync('.env')) process.loadEnvFile('.env');

const API = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const filas: { area: string; control: string; ok: boolean; detalle: string }[] = [];
const control = (area: string, nombre: string, ok: boolean, detalle = '') => filas.push({ area, control: nombre, ok, detalle });

async function revisarBase() {
  if (!process.env.DATABASE_URL) {
    control('base', 'conexion', false, 'falta DATABASE_URL');
    return;
  }
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const sinRls = await db.query<{ tabla: string }>(
      `select c.relname as tabla from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
    );
    const tablas = await db.query<{ n: number }>(
      `select count(*)::int as n from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'`,
    );
    control('base', `RLS activo en las ${tablas.rows[0]!.n} tablas`, sinRls.rowCount === 0, sinRls.rows.map((f) => f.tabla).join(', '));

    const politicas = await db.query<{ politica: string }>(
      `select tablename || '.' || policyname as politica from pg_policies where schemaname = 'public'`,
    );
    control('base', 'sin políticas que abran datos al público', politicas.rowCount === 0, politicas.rows.map((f) => f.politica).join(', '));

    const vistas = await db.query<{ vista: string; invoker: boolean; anon: boolean }>(
      `select c.relname as vista,
              coalesce(c.reloptions::text like '%security_invoker=true%', false) as invoker,
              has_table_privilege('anon', c.oid, 'select') as anon
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'v'`,
    );
    const malas = vistas.rows.filter((v) => !v.invoker || v.anon);
    control(
      'base',
      `las ${vistas.rowCount} vistas usan security_invoker y el rol anonimo no las lee`,
      malas.length === 0,
      malas.map((v) => v.vista).join(', '),
    );
  } finally {
    await db.end();
  }
}

function revisarConfiguracion() {
  const origenes = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
  control('configuracion', 'ALLOWED_ORIGINS definido (CORS)', origenes.length > 0, origenes.join(', ') || 'vacio: la API aceptaria cualquier sitio');
  control('configuracion', 'CORS sin comodin *', !origenes.includes('*'));
  if (process.env.NODE_ENV === 'production') {
    control('configuracion', 'produccion sin origenes localhost', !origenes.some((o) => o.includes('localhost')), origenes.join(', '));
  }
  control('configuracion', 'SUPABASE_URL definido (validacion de tokens por JWKS)', Boolean(process.env.SUPABASE_URL));
}

function revisarRepositorio() {
  let archivos: string[];
  try {
    archivos = execSync('git ls-files', { cwd: '..', encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    control('repositorio', 'lectura de archivos versionados', false, 'no se pudo ejecutar git');
    return;
  }
  const envVersionados = archivos.filter((a) => /(^|\/)\.env(\.local)?$/.test(a));
  control('repositorio', 'ningún .env ni .env.local versionado', envVersionados.length === 0, envVersionados.join(', '));

  // una cadena de conexion con contraseña real (no el marcador) o claves secretas de Supabase
  const secretos = [/postgres(ql)?:\/\/[^:\s/]+:(?!CONTRASENA|<)[^@\s]{6,}@/, /sb_secret_[A-Za-z0-9_-]{10,}/, /service_role["'\s:=]+ey[A-Za-z0-9_-]{20,}/];
  const conSecretos = archivos.filter((archivo) => {
    if (!/\.(ts|tsx|js|mjs|json|sql|yml|yaml|env|example|md)$/.test(archivo) || archivo.endsWith('package-lock.json')) return false;
    const ruta = `../${archivo}`;
    if (!existsSync(ruta)) return false;
    const contenido = readFileSync(ruta, 'utf8');
    return secretos.some((patron) => patron.test(contenido));
  });
  control('repositorio', 'sin contraseñas ni claves secretas en los archivos', conSecretos.length === 0, conSecretos.join(', '));
}

/** archivos de la web que se revisan en busca de terceros */
function archivosDeLaWeb(carpeta: string, lista: string[] = []): string[] {
  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) archivosDeLaWeb(ruta, lista);
    else if (/\.(tsx?|css|js)$/.test(entrada.name)) lista.push(ruta);
  }
  return lista;
}

function revisarLegal() {
  const pendientes = datosDelNegocioPendientes();
  const produccion = process.env.NODE_ENV === 'production';
  control(
    'legal',
    'datos del negocio completos (razón social, NIT, contacto, autorización ATT)',
    pendientes.length === 0 || !produccion,
    pendientes.length === 0 ? '' : `faltan: ${pendientes.join(', ')}${produccion ? '' : ' (bloquean el despliegue)'}`,
  );

  const documentos = ['terminos', 'privacidad', 'reembolsos', 'cookies'];
  const faltantes = documentos.filter((d) => !existsSync(`../web/src/app/(publico)/${d}/page.tsx`));
  control('legal', `los ${documentos.length} documentos legales están publicados`, faltantes.length === 0, faltantes.join(', '));

  // analiticas, publicidad, fuentes o scripts externos: exigirian aviso de cookies y consentimiento
  const terceros = /googletagmanager|google-analytics|gtag\(|facebook\.net|fbq\(|hotjar|clarity\.ms|mixpanel|segment\.(com|io)|posthog|plausible|umami|@vercel\/analytics|@vercel\/speed-insights|fonts\.googleapis|next\/font\/google|<script[^>]+src=["']https?:/i;
  const conTerceros = [...archivosDeLaWeb('../web/src'), '../web/package.json'].filter((archivo) => terceros.test(readFileSync(archivo, 'utf8')));
  control('legal', 'la web no carga analíticas ni scripts de terceros', conTerceros.length === 0, conTerceros.join(', '));
}

async function revisarApi() {
  try {
    await fetch(`${API}${RUTAS_API.salud}`);
  } catch {
    control('api', `API en ${API}`, true, 'no esta corriendo: controles de la API omitidos');
    return;
  }
  const cerradas = [RUTAS_API.buses.base, RUTAS_API.usuarios.base, RUTAS_API.encomiendas.base, RUTAS_API.panel.indicadores, RUTAS_API.panel.prediccion];
  const abiertas: string[] = [];
  for (const ruta of cerradas) {
    const r = await fetch(`${API}${ruta}`);
    if (r.status !== 401) abiertas.push(`${ruta} (${r.status})`);
  }
  control('api', `las ${cerradas.length} rutas del panel exigen sesion`, abiertas.length === 0, abiertas.join(', '));

  const extrano = await fetch(`${API}${RUTAS_API.salud}`, { headers: { Origin: 'https://sitio-desconocido.example' } });
  const permitido = extrano.headers.get('access-control-allow-origin');
  control('api', 'CORS rechaza sitios que no son la web', permitido === null, permitido ?? '');
  control('api', 'sin encabezado x-powered-by', extrano.headers.get('x-powered-by') === null);
  control('api', 'X-Content-Type-Options: nosniff', extrano.headers.get('x-content-type-options') === 'nosniff');
}

async function principal() {
  await revisarBase();
  revisarConfiguracion();
  revisarRepositorio();
  revisarLegal();
  await revisarApi();

  console.table(filas.map((f) => ({ ...f, ok: f.ok ? 'si' : 'NO' })));
  const fallas = filas.filter((f) => !f.ok).length;
  console.log(fallas === 0 ? 'Revision de seguridad superada.' : `${fallas} control(es) fallaron: revisar antes de presentar.`);
  process.exitCode = fallas === 0 ? 0 : 1;
}

principal().catch((error: unknown) => {
  console.error('No se pudo completar la revision:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

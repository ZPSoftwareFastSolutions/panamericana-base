/*
 * SERVICE WORKER del portal (PWA).
 * - Las paginas se piden SIEMPRE a la red (precios y asientos cambian): si no hay conexion,
 *   se muestra la pagina "sin conexion" guardada al instalar.
 * - Los archivos estaticos con version (/_next/static, iconos) se guardan y se reutilizan.
 * - Las llamadas a la API nunca se guardan: una compra necesita datos al dia.
 */
// cambiar la version en cada despliegue: al activarse, el service worker borra los caches anteriores
const VERSION = 'panamericana-v1';
const MAXIMO_ESTATICOS = 60;
const SIN_CONEXION = '/sin-conexion';
const PRECARGA = [SIN_CONEXION, '/icono-192.png', '/icono-512.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECARGA)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((clave) => clave !== VERSION).map((clave) => caches.delete(clave))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  if (pedido.mode === 'navigate') {
    evento.respondWith(fetch(pedido).catch(() => caches.match(SIN_CONEXION)));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icono-')) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ||
          fetch(pedido).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(VERSION).then(async (cache) => {
              await cache.put(pedido, copia);
              // se conservan solo los ultimos archivos guardados
              const claves = await cache.keys();
              const sobrantes = claves.filter((c) => !PRECARGA.includes(new URL(c.url).pathname));
              await Promise.all(sobrantes.slice(0, Math.max(0, sobrantes.length - MAXIMO_ESTATICOS)).map((c) => cache.delete(c)));
            });
            return respuesta;
          }),
      ),
    );
  }
});

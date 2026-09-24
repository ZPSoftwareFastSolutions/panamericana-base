import type { MetadataRoute } from 'next';

/**
 * MANIFIESTO de la aplicacion instalable (PWA): con esto el portal se puede agregar a la
 * pantalla de inicio del celular y abrirse como una app (sin la barra del navegador).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Panamericana · Pasajes y encomiendas',
    short_name: 'Panamericana',
    description: 'Compra pasajes por tramos, consulta tu boleto y sigue tus encomiendas',
    lang: 'es-BO',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icono-mascara-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

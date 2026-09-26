import type { Metadata, Viewport } from 'next';
import { datosDelNegocioPendientes } from '@panamericana/shared';
import { RegistroPwa } from '@/compartido/componentes/RegistroPwa';
import { SITIO_URL } from '@/compartido/sitio';
import { Proveedores } from './proveedores';
import './globals.css';

// el sitio oficial no se publica sin los datos del operador que exigen el boleto y los documentos legales
const pendientes = datosDelNegocioPendientes();
if (SITIO_URL && pendientes.length > 0) {
  throw new Error(`Faltan datos del negocio en shared/src/negocio.ts: ${pendientes.join(', ')}`);
}

export const metadata: Metadata = {
  metadataBase: SITIO_URL ? new URL(SITIO_URL) : undefined,
  title: { default: 'Panamericana · Pasajes por tramos y encomiendas', template: '%s · Panamericana' },
  description: 'Compra pasajes de bus por tramos, elige tu asiento, consulta tu boleto y sigue tus encomiendas en Bolivia.',
  applicationName: 'Panamericana',
  // sin dominio oficial, ninguna pagina se indexa (ver compartido/sitio.ts)
  robots: SITIO_URL ? { index: true, follow: true } : { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Panamericana', statusBarStyle: 'default' },
  icons: { icon: '/icono-192.png', apple: '/apple-touch-icon.png' },
  openGraph: { type: 'website', locale: 'es_BO', siteName: 'Panamericana' },
};

/** color de la barra del celular cuando el portal se usa como app instalada */
export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-BO">
      <body className="min-h-screen antialiased">
        {/* primer elemento con Tab: salta la cabecera y el menu (teclado y lectores de pantalla) */}
        <a
          href="#contenido"
          className="fixed top-2 left-2 z-50 -translate-y-24 rounded bg-white px-4 py-3 font-medium text-slate-900 shadow-lg focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Proveedores>{children}</Proveedores>
        <RegistroPwa />
      </body>
    </html>
  );
}

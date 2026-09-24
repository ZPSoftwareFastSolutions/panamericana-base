import type { Metadata, Viewport } from 'next';
import { RegistroPwa } from '@/compartido/componentes/RegistroPwa';
import { Proveedores } from './proveedores';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panamericana',
  description: 'Sistema de gestion de pasajes, flota, rutas y encomiendas',
  applicationName: 'Panamericana',
  appleWebApp: { capable: true, title: 'Panamericana', statusBarStyle: 'default' },
  icons: { icon: '/icono-192.png', apple: '/apple-touch-icon.png' },
};

/** color de la barra del celular cuando el portal se usa como app instalada */
export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Proveedores>{children}</Proveedores>
        <RegistroPwa />
      </body>
    </html>
  );
}

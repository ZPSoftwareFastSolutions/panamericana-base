import type { Metadata } from 'next';
import { Proveedores } from './proveedores';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panamericana',
  description: 'Sistema de gestion de pasajes, flota, rutas y encomiendas',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}

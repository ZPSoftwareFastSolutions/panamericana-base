import type { Metadata } from 'next';
import { Bienvenida } from '@/modulos/sesion/componentes/Bienvenida';

export const metadata: Metadata = {
  title: 'Inicio',
};

/** PAGINA /admin: inicio del panel */
export default function PaginaInicioPanel() {
  return <Bienvenida />;
}

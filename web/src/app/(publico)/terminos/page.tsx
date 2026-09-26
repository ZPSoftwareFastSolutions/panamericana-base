import type { Metadata } from 'next';
import { TerminosCondiciones } from '@/modulos/legal/componentes/TerminosCondiciones';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Condiciones para comprar pasajes por tramos y enviar encomiendas con Panamericana.',
};

/** PAGINA /terminos: documento legal del portal (el texto vive en el modulo legal) */
export default function PaginaTerminosCondiciones() {
  return <TerminosCondiciones />;
}

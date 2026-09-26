import type { Metadata } from 'next';
import { PoliticaReembolsos } from '@/modulos/legal/componentes/PoliticaReembolsos';

export const metadata: Metadata = {
  title: 'Política de Reembolsos',
  description: 'Cuándo y cómo se devuelve el dinero de un pasaje o una encomienda de Panamericana.',
};

/** PAGINA /reembolsos: documento legal del portal (el texto vive en el modulo legal) */
export default function PaginaPoliticaReembolsos() {
  return <PoliticaReembolsos />;
}

import type { Metadata } from 'next';
import { PoliticaCookies } from '@/modulos/legal/componentes/PoliticaCookies';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Qué guarda el portal de Panamericana en tu navegador y por qué no usa cookies de analítica ni publicidad.',
};

/** PAGINA /cookies: documento legal del portal (el texto vive en el modulo legal) */
export default function PaginaPoliticaCookies() {
  return <PoliticaCookies />;
}

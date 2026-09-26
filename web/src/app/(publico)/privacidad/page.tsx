import type { Metadata } from 'next';
import { PoliticaPrivacidad } from '@/modulos/legal/componentes/PoliticaPrivacidad';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Qué datos personales pide Panamericana, para qué los usa, con quién los comparte y cómo ejercer tus derechos.',
};

/** PAGINA /privacidad: documento legal del portal (el texto vive en el modulo legal) */
export default function PaginaPoliticaPrivacidad() {
  return <PoliticaPrivacidad />;
}

import type { Metadata } from 'next';
import { PanelConSesion } from '@/modulos/sesion/componentes/PanelConSesion';

// el panel es interno: los buscadores no lo indexan
export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel · Panamericana' },
  robots: { index: false, follow: false },
};

/**
 * Layout del panel administrativo.
 * PanelConSesion exige una sesion del personal y arma el menu segun los roles.
 * Las pantallas nuevas se crean dentro de app/(backoffice)/admin/ y se agregan al menu
 * en compartido/componentes/MenuLateral.tsx
 */
export default function LayoutBackoffice({ children }: { children: React.ReactNode }) {
  return <PanelConSesion>{children}</PanelConSesion>;
}

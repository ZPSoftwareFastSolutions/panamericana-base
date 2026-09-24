import { PanelConSesion } from '@/modulos/sesion/componentes/PanelConSesion';

/**
 * Layout del panel administrativo.
 * PanelConSesion exige una sesion del personal y arma el menu segun los roles.
 * Las pantallas nuevas se crean dentro de app/(backoffice)/admin/ y se agregan al menu
 * en compartido/componentes/MenuLateral.tsx
 */
export default function LayoutBackoffice({ children }: { children: React.ReactNode }) {
  return <PanelConSesion>{children}</PanelConSesion>;
}

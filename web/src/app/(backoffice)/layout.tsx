import { MenuLateral } from '@/compartido/componentes/MenuLateral';

/**
 * Layout del panel administrativo: menu lateral comun a todas las pantallas internas.
 * Las pantallas nuevas del backoffice se crean dentro de app/(backoffice)/admin/
 * y se agregan al menu en compartido/componentes/MenuLateral.tsx
 */
export default function LayoutBackoffice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-slate-200 bg-white p-4 md:w-56 md:border-r md:border-b-0">
        <p className="mb-4 font-bold">Panamericana</p>
        <MenuLateral />
      </aside>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

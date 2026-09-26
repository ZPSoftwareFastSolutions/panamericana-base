'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * MENU LATERAL del panel administrativo.
 * Es un componente "cliente" porque necesita saber en que pagina esta el usuario
 * (usePathname) para resaltar la opcion activa.
 *
 * Muestra solo las opciones que corresponden a los roles del usuario.
 * Para agregar una pantalla nueva al menu: agregar una linea en OPCIONES con sus roles.
 */
const OPCIONES = [
  { etiqueta: 'Inicio', ruta: '/admin', roles: ['administrador', 'vendedor', 'encomiendas'] },
  { etiqueta: 'Panel', ruta: '/admin/panel', roles: ['administrador'] },
  { etiqueta: 'Taquilla', ruta: '/admin/taquilla', roles: ['administrador', 'vendedor'] },
  { etiqueta: 'Encomiendas', ruta: '/admin/encomiendas', roles: ['administrador', 'encomiendas'] },
  { etiqueta: 'Viajes', ruta: '/admin/viajes', roles: ['administrador'] },
  { etiqueta: 'Rutas', ruta: '/admin/rutas', roles: ['administrador'] },
  { etiqueta: 'Buses', ruta: '/admin/buses', roles: ['administrador'] },
  { etiqueta: 'Terminales', ruta: '/admin/terminales', roles: ['administrador'] },
  { etiqueta: 'Clientes', ruta: '/admin/clientes', roles: ['administrador', 'vendedor', 'encomiendas'] },
];

type Propiedades = {
  roles: string[];
  nombre: string;
  alCerrarSesion: () => void;
};

export function MenuLateral({ roles, nombre, alCerrarSesion }: Propiedades) {
  const rutaActual = usePathname();
  const visibles = OPCIONES.filter((opcion) => opcion.roles.some((rol) => roles.includes(rol)));

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Menú del panel" className="flex flex-col gap-1 text-sm">
        {visibles.map((opcion) => {
          // "Inicio" solo se marca en /admin exacto; las demas tambien en sus subpaginas
          const activa =
            opcion.ruta === '/admin' ? rutaActual === '/admin' : rutaActual.startsWith(opcion.ruta);
          return (
            <Link
              key={opcion.ruta}
              href={opcion.ruta}
              aria-current={activa ? 'page' : undefined}
              className={
                activa
                  ? 'rounded bg-slate-900 px-3 py-2 font-medium text-white'
                  : 'rounded px-3 py-2 text-slate-700 hover:bg-slate-100'
              }
            >
              {opcion.etiqueta}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-3 text-sm">
        <p className="font-medium text-slate-900">{nombre}</p>
        <p className="text-xs text-slate-600">{roles.join(', ')}</p>
        <button type="button" onClick={alCerrarSesion} className="mt-2 min-h-11 text-slate-700 underline hover:text-slate-900">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

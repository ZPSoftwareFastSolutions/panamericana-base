'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * MENU LATERAL del panel administrativo.
 * Es un componente "cliente" porque necesita saber en que pagina esta el usuario
 * (usePathname) para resaltar la opcion activa.
 *
 * Para agregar una pantalla nueva al menu: agregar una linea en OPCIONES.
 */
const OPCIONES = [
  { etiqueta: 'Buses', ruta: '/admin/buses' },
  { etiqueta: 'Terminales', ruta: '/admin/terminales' },
  { etiqueta: 'Clientes', ruta: '/admin/clientes' },
];

export function MenuLateral() {
  const rutaActual = usePathname();

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {OPCIONES.map((opcion) => {
        const activa = rutaActual.startsWith(opcion.ruta);
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
  );
}

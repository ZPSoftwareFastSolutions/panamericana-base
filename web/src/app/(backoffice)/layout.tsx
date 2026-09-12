import Link from 'next/link';

/**
 * Layout del panel administrativo: menu lateral comun a todas las pantallas internas.
 * Las pantallas nuevas del backoffice se crean dentro de app/(backoffice)/admin/
 */
const MENU = [
  { etiqueta: 'Buses', ruta: '/admin/buses' },
  // { etiqueta: 'Terminales', ruta: '/admin/terminales' },
  // { etiqueta: 'Rutas', ruta: '/admin/rutas' },
];

export default function LayoutBackoffice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-slate-200 bg-white p-4">
        <p className="mb-4 font-bold">Panamericana</p>
        <nav className="flex flex-col gap-2 text-sm">
          {MENU.map((opcion) => (
            <Link key={opcion.ruta} href={opcion.ruta} className="text-slate-700 hover:underline">
              {opcion.etiqueta}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

'use client';

import { useTerminales } from '../hooks/useTerminales';

/** tabla de terminales con sus tres estados: cargando, error y lista vacia */
export function TablaTerminales() {
  const { data: terminales, isPending, error } = useTerminales();

  if (isPending) return <p className="text-slate-600">Cargando terminales...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (terminales.length === 0) {
    return <p className="text-slate-600">Todavía no hay terminales registradas.</p>;
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Ciudad</th>
            <th className="py-2 pr-4">Dirección</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {terminales.map((terminal) => (
            <tr key={terminal.id} className="border-b border-slate-200">
              <td className="py-2 pr-4 font-medium">{terminal.nombre}</td>
              <td className="py-2 pr-4">{terminal.ciudad.nombre}</td>
              <td className="py-2 pr-4">{terminal.direccion}</td>
              <td className="py-2">{terminal.activo ? 'Activa' : 'Inactiva'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

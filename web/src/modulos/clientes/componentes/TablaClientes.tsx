'use client';

import { useClientes } from '../hooks/useClientes';

/** tabla de clientes con sus tres estados: cargando, error y lista vacia (solo los datos que se usan) */
export function TablaClientes() {
  const { data: clientes, isPending, error } = useClientes();

  if (isPending) return <p className="text-slate-600">Cargando clientes...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (clientes.length === 0) {
    return <p className="text-slate-600">Todavía no hay clientes registrados.</p>;
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 pr-4">Documento</th>
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Celular</th>
            <th className="py-2">Correo</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="border-b border-slate-200">
              <td className="py-2 pr-4 font-medium whitespace-nowrap">
                {cliente.tipo_documento.toUpperCase()} {cliente.numero_documento}
              </td>
              <td className="py-2 pr-4">
                {cliente.nombres} {cliente.apellidos}
              </td>
              <td className="py-2 pr-4">{cliente.telefono ?? '—'}</td>
              <td className="py-2">{cliente.correo ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

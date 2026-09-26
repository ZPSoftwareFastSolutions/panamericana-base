'use client';

import Link from 'next/link';
import { useBuses } from '../hooks/useBuses';

export function TablaBuses() {
  const { data: buses, isPending, error } = useBuses();

  if (isPending) return <p className="text-slate-600">Cargando buses...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (buses.length === 0)
    return <p className="text-slate-600">Todavía no hay buses registrados.</p>;

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2">Placa</th>
            <th className="py-2">Marca</th>
            <th className="py-2">Modelo</th>
            <th className="py-2">Pisos</th>
            <th className="py-2">Estado</th>
            <th className="py-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.id} className="border-b border-slate-200">
              <td className="py-2 font-medium">{bus.placa}</td>
              <td className="py-2">{bus.marca}</td>
              <td className="py-2">{bus.modelo}</td>
              <td className="py-2">{bus.numero_pisos}</td>
              <td className="py-2">{bus.estado}</td>
              <td className="py-2">
                <Link
                  href={`/admin/buses/${bus.id}/croquis`}
                  className="text-blue-700 hover:underline"
                >
                  Croquis<span className="sr-only"> del bus {bus.placa}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

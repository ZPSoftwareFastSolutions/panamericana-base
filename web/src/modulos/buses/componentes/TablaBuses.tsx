'use client';

import { useBuses } from '../hooks/useBuses';

export function TablaBuses() {
  const { data: buses, isPending, error } = useBuses();

  if (isPending) return <p className="text-slate-500">Cargando buses...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (buses.length === 0) return <p className="text-slate-500">Todavia no hay buses registrados.</p>;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-300 text-left">
          <th className="py-2">Placa</th>
          <th className="py-2">Marca</th>
          <th className="py-2">Modelo</th>
          <th className="py-2">Pisos</th>
          <th className="py-2">Estado</th>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}

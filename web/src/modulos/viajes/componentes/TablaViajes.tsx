'use client';

import { Fragment, useState } from 'react';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';
import { useViajes } from '../hooks/useViajes';
import { EditorTarifas } from './EditorTarifas';

/** viajes programados desde hoy, con su ocupacion y sus tarifas (que se pueden cambiar) */
export function TablaViajes() {
  const { data: viajes, isPending, error } = useViajes();
  const [editando, setEditando] = useState<string | null>(null);

  if (isPending) return <p className="text-slate-500">Cargando viajes...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (viajes.length === 0) return <p className="text-slate-500">No hay viajes programados desde hoy.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 pr-4">Salida</th>
            <th className="py-2 pr-4">Ruta</th>
            <th className="py-2 pr-4">Bus</th>
            <th className="py-2 pr-4">Tarifas</th>
            <th className="py-2 pr-4">Ocupacion</th>
            <th className="py-2 pr-4">Estado</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {viajes.map((viaje) => (
            <Fragment key={viaje.id}>
            <tr className="border-b border-slate-200 align-top">
              <td className="py-2 pr-4 whitespace-nowrap">
                {fechaHoraEnBolivia(viaje.fecha_salida)}
                <span className="block text-xs text-slate-500">llega {fechaHoraEnBolivia(viaje.fecha_llegada_estimada)}</span>
              </td>
              <td className="py-2 pr-4">{viaje.ruta.nombre}</td>
              <td className="py-2 pr-4">{viaje.bus.placa}</td>
              <td className="py-2 pr-4">
                {viaje.tarifas.map((t) => (
                  <span key={t.tipo_asiento} className="block whitespace-nowrap">
                    {t.tipo_asiento}: {formatearBs(t.precio)}
                  </span>
                ))}
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                {viaje.asientos_vendidos} / {viaje.total_asientos}
              </td>
              <td className="py-2 pr-4">{viaje.estado}</td>
              <td className="py-2">
                {viaje.estado === 'programado' && new Date(viaje.fecha_salida) > new Date() && (
                  <button type="button" className="text-blue-700 hover:underline" onClick={() => setEditando(viaje.id)}>
                    Precios
                  </button>
                )}
              </td>
            </tr>
            {editando === viaje.id && (
              <tr className="border-b border-slate-200 bg-slate-50">
                <td colSpan={7} className="p-3">
                  <EditorTarifas viaje={viaje} alTerminar={() => setEditando(null)} />
                </td>
              </tr>
            )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

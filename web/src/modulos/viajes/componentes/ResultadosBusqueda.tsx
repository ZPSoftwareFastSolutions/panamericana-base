'use client';

import Link from 'next/link';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { formatearDuracion, horaEnBolivia } from '@/compartido/utilidades/fechas';
import { useBuscarViajes } from '../hooks/useViajes';

/**
 * Resultados de la busqueda. Cada viaje muestra la hora en que el bus pasa por la ciudad
 * de origen (puede ser una parada intermedia), la llegada, el precio del tramo y los asientos libres.
 */
export function ResultadosBusqueda({ origen, destino, fecha }: { origen: string; destino: string; fecha: string }) {
  const { data: resultados, isPending, error } = useBuscarViajes(origen, destino, fecha);

  if (!origen || !destino || !fecha) {
    return <p className="text-slate-600">Elige origen, destino y fecha para buscar.</p>;
  }
  if (isPending) return <p className="text-slate-600">Buscando viajes...</p>;
  if (error) return <p className="text-red-600">No se pudo buscar: {error.message}</p>;
  if (resultados.length === 0) {
    return <p className="rounded-lg bg-white p-4 text-slate-600">No hay viajes disponibles para esa fecha. Prueba con otro día.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {resultados.map((r) => (
        <li key={`${r.viaje_id}-${r.origen.orden}-${r.destino.orden}`} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">
              {horaEnBolivia(r.origen.hora)} <span aria-hidden="true" className="text-slate-500">→</span>
              <span className="sr-only">llega</span> {horaEnBolivia(r.destino.hora)}
              <span className="ml-2 text-sm font-normal text-slate-600">{formatearDuracion(r.duracion_min)}</span>
            </p>
            <p className="text-sm text-slate-600">
              {r.origen.terminal} <span aria-hidden="true">→</span>
              <span className="sr-only">a</span> {r.destino.terminal}
            </p>
            <p className="text-xs text-slate-600">
              Ruta {r.ruta.nombre} · bus {r.bus.placa} ·{' '}
              {r.tarifas_tramo.map((t) => `${t.tipo_asiento} ${formatearBs(t.precio)}`).join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
            <p className="text-right">
              <span className="block text-xs text-slate-600">desde</span>
              <span className="text-xl font-bold">{formatearBs(r.precio_desde)}</span>
            </p>
            {r.asientos_libres > 0 ? (
              <Link
                href={`/viajes/${r.viaje_id}?desde=${r.origen.orden}&hasta=${r.destino.orden}`}
                className="inline-flex min-h-11 items-center rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
              >
                Elegir asiento ({r.asientos_libres} libres)
                <span className="sr-only"> en el bus de las {horaEnBolivia(r.origen.hora)}</span>
              </Link>
            ) : (
              <span className="text-sm font-medium text-red-600">Sin asientos</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

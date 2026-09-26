'use client';

import { formatearDuracion } from '@/compartido/utilidades/fechas';
import { useRutas } from '../hooks/useRutas';

/** lista de rutas: cada una con su recorrido parada por parada */
export function TablaRutas() {
  const { data: rutas, isPending, error } = useRutas();

  if (isPending) return <p className="text-slate-600">Cargando rutas...</p>;
  if (error) return <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>;
  if (rutas.length === 0) return <p className="text-slate-600">Todavía no hay rutas registradas.</p>;

  return (
    <ul className="flex flex-col gap-4">
      {rutas.map((ruta) => (
        <li key={ruta.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">{ruta.nombre}</p>
            <p className="text-sm text-slate-600">
              {formatearDuracion(ruta.duracion_estimada_min)}
              {ruta.distancia_km !== null && ` · ${ruta.distancia_km} km`}
            </p>
          </div>
          <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {ruta.paradas.map((parada, i) => (
              <li key={parada.orden} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-slate-500">→</span>}
                <span>
                  <strong>{parada.orden}.</strong> {parada.terminal.ciudad}
                  <span className="text-slate-600"> (+{formatearDuracion(parada.minutos_desde_origen)})</span>
                </span>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

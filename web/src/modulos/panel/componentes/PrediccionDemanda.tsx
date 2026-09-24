'use client';

import { useState } from 'react';
import { CampoSeleccion } from '@/compartido/componentes/Campo';
import { GraficoBarras } from '@/compartido/componentes/GraficoBarras';
import { usePrediccion } from '../hooks/usePanel';

const DIA = new Intl.DateTimeFormat('es-BO', { weekday: 'short', day: '2-digit', timeZone: 'UTC' });
const etiqueta = (fecha: string) => DIA.format(new Date(`${fecha}T00:00:00Z`));

/**
 * DEMANDA ESTIMADA (machine learning): pasajes esperados por ruta y dia comparados con la
 * capacidad ya programada. Si la demanda supera el 90 % de los asientos, sugiere un refuerzo.
 */
export function PrediccionDemanda() {
  const [dias, setDias] = useState(7);
  const { data, isPending, error } = usePrediccion(dias);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Demanda estimada</h2>
          <p className="text-sm text-slate-500">Pasajes esperados por dia frente a los asientos ya programados</p>
        </div>
        <div className="w-40">
          <CampoSeleccion
            etiqueta="Proximos"
            opciones={[
              { valor: '7', texto: '7 dias' },
              { valor: '14', texto: '14 dias' },
            ]}
            value={String(dias)}
            onChange={(e) => setDias(Number(e.target.value))}
          />
        </div>
      </div>

      {isPending && <p className="text-slate-500">Calculando la demanda...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {data && (
        <>
          {data.bases.map(({ ruta, pasajes_por_dia, fuente }) => {
            const delaRuta = data.dias.filter((d) => d.ruta.id === ruta.id);
            const alertas = delaRuta.filter((d) => d.alerta === 'refuerzo_sugerido');
            return (
              <article key={ruta.id} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">
                  {ruta.nombre}{' '}
                  <span className="font-normal text-slate-500">
                    · base {pasajes_por_dia} pasajes/dia ({fuente === 'ventas_reales' ? 'ventas reales' : 'modelo'})
                  </span>
                </h3>
                <GraficoBarras
                  titulo={`Demanda estimada de ${ruta.nombre}`}
                  categorias={delaRuta.map((d) => etiqueta(d.fecha) + (d.feriado ? ' ★' : ''))}
                  series={[
                    { nombre: 'Pasajes estimados', color: '#0f172a', valores: delaRuta.map((d) => d.pasajes_estimados) },
                    { nombre: 'Asientos programados', color: '#94a3b8', valores: delaRuta.map((d) => d.capacidad_programada) },
                  ]}
                  resaltadas={delaRuta.map((d) => d.alerta === 'refuerzo_sugerido')}
                />
                {alertas.length > 0 && (
                  <p role="status" className="rounded bg-red-50 p-2 text-sm text-red-800">
                    Refuerzo sugerido: {alertas.map((d) => `${etiqueta(d.fecha)} (${d.pasajes_estimados} pasajes para ${d.capacidad_programada} asientos)`).join(' · ')}
                  </p>
                )}
                {delaRuta.some((d) => d.alerta === 'sin_viajes') && (
                  <p className="text-xs text-amber-700">
                    Sin viajes programados: {delaRuta.filter((d) => d.alerta === 'sin_viajes').map((d) => etiqueta(d.fecha)).join(', ')}
                  </p>
                )}
              </article>
            );
          })}

          <p className="border-t border-slate-200 pt-3 text-xs text-slate-500">
            Modelo: {data.modelo.tipo} v{data.modelo.version}, entrenado el {data.modelo.entrenado_en} con datos {data.modelo.datos}. En
            dias de prueba: error medio {data.modelo.metricas.mae} pasajes/dia (RMSE {data.modelo.metricas.rmse}), R²{' '}
            {data.modelo.metricas.r2}. ★ feriado nacional.
          </p>
        </>
      )}
    </section>
  );
}

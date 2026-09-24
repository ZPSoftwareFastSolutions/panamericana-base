'use client';

import type { Indicadores } from '@panamericana/shared';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';

const NOMBRES_CANAL: Record<string, string> = { web: 'Portal web', movil: 'Celular', taquilla: 'Taquilla' };

function Tarjeta({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
      {detalle && <p className="text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}

/** tarjetas, ventas por canal y ocupacion por viaje del periodo */
export function ResumenIndicadores({ datos }: { datos: Indicadores }) {
  const totalCanales = datos.ventas_por_canal.reduce((s, c) => s + c.monto, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta titulo="Pasajes vendidos" valor={String(datos.pasajes.vendidos)} detalle={`${datos.pasajes.anulados} anulados`} />
        <Tarjeta
          titulo="Ingresos netos"
          valor={formatearBs(datos.ingresos.neto)}
          detalle={`cobrado ${formatearBs(datos.ingresos.cobrado)} · devuelto ${formatearBs(datos.ingresos.reembolsado)}`}
        />
        <Tarjeta
          titulo="Ocupacion promedio"
          valor={datos.ocupacion_promedio === null ? '—' : `${datos.ocupacion_promedio} %`}
          detalle={`${datos.ocupacion.length} viajes en el periodo`}
        />
        <Tarjeta
          titulo="Encomiendas"
          valor={String(datos.encomiendas.registradas)}
          detalle={`${datos.encomiendas.entregadas} entregadas · ${datos.encomiendas.en_camino} en camino · ${formatearBs(datos.encomiendas.ingresos)}`}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <h2 className="mb-3 font-semibold">Ventas por canal</h2>
          {datos.ventas_por_canal.length === 0 && <p className="text-sm text-slate-500">Sin ventas en el periodo.</p>}
          <ul className="flex flex-col gap-3">
            {datos.ventas_por_canal.map((c) => (
              <li key={c.canal} className="text-sm">
                <div className="flex justify-between">
                  <span>{NOMBRES_CANAL[c.canal] ?? c.canal}</span>
                  <span>
                    {c.ventas} ventas · {formatearBs(c.monto)}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-100">
                  <div className="h-2 rounded bg-slate-800" style={{ width: `${totalCanales ? (c.monto / totalCanales) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <h2 className="mb-3 font-semibold">Ocupacion por viaje</h2>
          {datos.ocupacion.length === 0 && <p className="text-sm text-slate-500">No hay viajes en el periodo.</p>}
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {datos.ocupacion.map((v) => (
                  <tr key={v.viaje_id} className="border-b border-slate-100">
                    <td className="py-1 pr-2 whitespace-nowrap">{fechaHoraEnBolivia(v.fecha_salida)}</td>
                    <td className="py-1 pr-2">{v.bus}</td>
                    <td className="w-1/2 py-1">
                      <div className="h-2 rounded bg-slate-100">
                        <div
                          className={`h-2 rounded ${v.porcentaje >= 90 ? 'bg-red-600' : 'bg-emerald-600'}`}
                          style={{ width: `${v.porcentaje}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-1 pl-2 text-right whitespace-nowrap">
                      {v.vendidos}/{v.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

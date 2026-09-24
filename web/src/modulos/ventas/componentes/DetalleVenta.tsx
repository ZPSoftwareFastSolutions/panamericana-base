import type { Venta } from '@panamericana/shared';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia, horaEnBolivia } from '@/compartido/utilidades/fechas';

/** resumen de una venta: viaje, tramo y un renglon por pasaje */
export function DetalleVenta({ venta }: { venta: Venta }) {
  return (
    <div className="flex flex-col gap-4">
      {venta.viaje && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold">
            {venta.viaje.origen.ciudad} → {venta.viaje.destino.ciudad}
          </p>
          <p className="text-slate-600">
            Sube {fechaHoraEnBolivia(venta.viaje.origen.hora)} en {venta.viaje.origen.terminal}
          </p>
          <p className="text-slate-600">
            Llega {horaEnBolivia(venta.viaje.destino.hora)} a {venta.viaje.destino.terminal} · bus {venta.viaje.bus.placa}
          </p>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-slate-200">
        {venta.pasajes.map((pasaje) => (
          <li key={pasaje.codigo} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>
              <strong>Asiento {pasaje.asiento.numero}</strong> ({pasaje.asiento.tipo}
              {pasaje.asiento.piso > 1 ? `, piso ${pasaje.asiento.piso}` : ''}) · {pasaje.pasajero.nombres}{' '}
              {pasaje.pasajero.apellidos}
              <span className="block text-xs text-slate-500">
                {pasaje.pasajero.tipo_documento.toUpperCase()} {pasaje.pasajero.numero_documento} · pasaje {pasaje.codigo}
              </span>
            </span>
            <span className="whitespace-nowrap">{formatearBs(pasaje.precio)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-slate-300 pt-3">
        <span className="text-slate-600">Total</span>
        <span className="text-xl font-bold">{formatearBs(venta.total)}</span>
      </div>
    </div>
  );
}

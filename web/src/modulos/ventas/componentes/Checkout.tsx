'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Boton } from '@/compartido/componentes/Boton';
import { CuentaRegresiva } from '@/compartido/componentes/CuentaRegresiva';
import { ErrorDeApi } from '@/compartido/servicios/clienteHttp';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { useVenta, usePagarVenta } from '../hooks/useVentas';
import { DetalleVenta } from './DetalleVenta';

/**
 * COMPRA PASO 3: pagar (simulado) y ver los codigos de los pasajes.
 * La venta muestra cuanto tiempo queda de reserva. Si vence, los asientos se liberan
 * y se ofrece volver al croquis (la API responde 409 reserva_expirada).
 */
export function Checkout({ codigo }: { codigo: string }) {
  const venta = useVenta(codigo);
  const pagar = usePagarVenta(codigo);
  const [vencio, setVencio] = useState(false);
  const alTerminar = useCallback(() => setVencio(true), []);

  if (venta.isPending) return <p className="text-slate-500">Cargando tu compra...</p>;
  if (venta.error) {
    return (
      <p className="text-red-600">
        {venta.error instanceof ErrorDeApi && venta.error.estado === 404 ? 'No encontramos esa compra.' : venta.error.message}
      </p>
    );
  }

  const datos = venta.data;
  const volverAlCroquis = datos.viaje
    ? `/viajes/${datos.viaje.id}?desde=${datos.viaje.origen.orden}&hasta=${datos.viaje.destino.orden}`
    : '/';

  if (datos.estado === 'pagada') {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow">
        <p className="rounded bg-emerald-50 p-3 font-semibold text-emerald-800">Compra confirmada</p>
        <p className="text-sm text-slate-600">
          Codigo de tu compra: <strong className="font-mono text-base text-slate-900">{datos.codigo}</strong>. Presenta el
          codigo de cada pasaje y el documento del pasajero al abordar.
        </p>
        <DetalleVenta venta={datos} />
      </div>
    );
  }

  const expirada = datos.estado === 'expirada' || vencio || (pagar.error instanceof ErrorDeApi && pagar.error.codigo === 'reserva_expirada');

  if (expirada) {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow">
        <p className="font-semibold text-red-600">El tiempo para pagar termino y los asientos se liberaron.</p>
        <Link href={volverAlCroquis} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">
          Volver a elegir asientos
        </Link>
      </div>
    );
  }

  if (datos.estado !== 'pendiente') {
    return <p className="rounded-xl bg-white p-6 shadow">Esta compra esta {datos.estado}.</p>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Compra <strong className="font-mono">{datos.codigo}</strong>
        </p>
        {datos.reservado_hasta && (
          <p className="text-sm">
            Tus asientos estan reservados: <CuentaRegresiva hasta={datos.reservado_hasta} alTerminar={alTerminar} />
          </p>
        )}
      </div>

      <DetalleVenta venta={datos} />

      <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
        Pago simulado con tarjeta: en esta version no se cobra dinero real.
      </div>

      <Boton type="button" onClick={() => pagar.mutate()} cargando={pagar.isPending}>
        Pagar {formatearBs(datos.total)}
      </Boton>
      {pagar.error && (
        <p role="alert" className="text-red-600">
          {pagar.error.message}
        </p>
      )}
    </div>
  );
}

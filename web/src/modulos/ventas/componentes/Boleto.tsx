'use client';

import Link from 'next/link';
import { Boton } from '@/compartido/componentes/Boton';
import { CodigoQR } from '@/compartido/componentes/CodigoQR';
import { DatoDelNegocio } from '@/compartido/componentes/DatoDelNegocio';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia, horaEnBolivia } from '@/compartido/utilidades/fechas';
import { usePasaje } from '../hooks/useVentas';

const ESTADOS: Record<string, { texto: string; estilo: string }> = {
  pagado: { texto: 'Válido para viajar', estilo: 'bg-emerald-100 text-emerald-800' },
  reservado: { texto: 'Reservado: falta pagar', estilo: 'bg-amber-100 text-amber-800' },
  anulado: { texto: 'Anulado', estilo: 'bg-red-100 text-red-800' },
  expirado: { texto: 'Reserva vencida', estilo: 'bg-slate-200 text-slate-700' },
};

/**
 * BOLETO ELECTRONICO: pasajero, viaje, tramo, asiento, tarifa, precio, datos del operador
 * y un QR con el codigo del pasaje (lo que el reglamento de transporte pide en el pasaje).
 * Se puede imprimir: la cabecera y el pie del portal no salen en papel.
 */
export function Boleto({ codigo }: { codigo: string }) {
  const { data: pasaje, isPending, error } = usePasaje(codigo);

  if (isPending) return <p className="text-slate-600">Buscando el pasaje...</p>;
  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-red-600">{error.message}</p>
        <Link href="/boleto" className="text-blue-700 underline">
          Buscar otro código
        </Link>
      </div>
    );
  }

  const estado = ESTADOS[pasaje.estado] ?? { texto: pasaje.estado, estilo: 'bg-slate-200' };
  const { viaje } = pasaje;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border-2 border-slate-900 bg-white p-5 print:border print:shadow-none">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Panamericana · boleto</p>
          <h1 className="font-mono text-2xl font-bold">{pasaje.codigo}</h1>
          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium ${estado.estilo}`}>{estado.texto}</span>
        </div>
        <CodigoQR texto={pasaje.codigo} tamano={120} />
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-slate-600">Sube en</p>
          <p className="font-semibold">
            {viaje.origen.terminal} ({viaje.origen.ciudad})
          </p>
          <p>{fechaHoraEnBolivia(viaje.origen.hora)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-600">Baja en</p>
          <p className="font-semibold">
            {viaje.destino.terminal} ({viaje.destino.ciudad})
          </p>
          <p>llegada estimada {horaEnBolivia(viaje.destino.hora)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-600">Pasajero</p>
          <p className="font-semibold">
            {pasaje.pasajero.nombres} {pasaje.pasajero.apellidos}
          </p>
          <p>
            {pasaje.pasajero.tipo_documento.toUpperCase()} {pasaje.pasajero.numero_documento}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-600">Asiento</p>
          <p className="text-2xl font-bold">
            {pasaje.asiento.numero}
            <span className="ml-2 text-sm font-normal">
              {pasaje.asiento.tipo}
              {pasaje.asiento.piso > 1 ? ` · piso ${pasaje.asiento.piso}` : ''}
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-600">Tarifa</p>
          <p className="font-semibold">{pasaje.tipo_pasajero.nombre}</p>
          {pasaje.tipo_pasajero.requisito && <p className="text-sm">Presentar al subir: {pasaje.tipo_pasajero.requisito}</p>}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm">
        <span>
          Bus {viaje.bus.placa} · {viaje.ruta.nombre} · venta {pasaje.venta.codigo}
        </span>
        <span className="text-lg font-bold">{formatearBs(pasaje.precio)}</span>
      </footer>

      {pasaje.estado === 'pagado' && (
        <p className="text-xs text-slate-600">
          Presenta tu documento de identidad y este boleto al subir. Equipaje sin costo: una pieza de hasta 20 kg en la
          bodega. Anulaciones en taquilla hasta el {fechaHoraEnBolivia(pasaje.anulable_hasta)}, con devolución del 100 %. Condiciones completas en los{' '}
          <Link href="/terminos" className="text-blue-700 underline">
            Términos y Condiciones
          </Link>
          .
        </p>
      )}

      <p className="text-xs text-slate-600">
        Operador: <DatoDelNegocio dato="razon_social" /> · NIT <DatoDelNegocio dato="nit" /> · Autorización ATT{' '}
        <DatoDelNegocio dato="autorizacion_att" /> · Tel. <DatoDelNegocio dato="telefono" />
      </p>

      <Boton variante="secundario" className="w-fit print:hidden" onClick={() => window.print()}>
        Imprimir
      </Boton>
    </article>
  );
}

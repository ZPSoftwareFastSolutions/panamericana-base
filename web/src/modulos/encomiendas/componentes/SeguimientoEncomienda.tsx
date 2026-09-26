'use client';

import Link from 'next/link';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';
import { useSeguimiento } from '../hooks/useEncomiendas';
import { EtiquetaEstado, NOMBRES_ESTADO } from './EtiquetaEstado';

/** SEGUIMIENTO PUBLICO: estado actual, terminales y el historial de cambios (sin datos personales) */
export function SeguimientoEncomienda({ codigo }: { codigo: string }) {
  const { data: seguimiento, isPending, error } = useSeguimiento(codigo);

  if (isPending) return <p className="text-slate-600">Buscando la encomienda...</p>;
  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-red-600">{error.message}</p>
        <Link href="/seguimiento" className="text-blue-700 underline">
          Buscar otro código
        </Link>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xl font-bold">{seguimiento.codigo_seguimiento}</span>
        <EtiquetaEstado estado={seguimiento.estado} />
      </header>
      <p>
        {seguimiento.terminal_origen.nombre} ({seguimiento.terminal_origen.ciudad}) <span aria-hidden="true">→</span>
        <span className="sr-only">a</span>{' '}
        {seguimiento.terminal_destino.nombre} ({seguimiento.terminal_destino.ciudad})
      </p>
      <ol className="flex flex-col gap-2 border-l-2 border-slate-300 pl-4">
        {seguimiento.historial.map((paso) => (
          <li key={`${paso.estado}-${paso.fecha}`}>
            <p className="font-medium">{NOMBRES_ESTADO[paso.estado]}</p>
            <p className="text-sm text-slate-600">{fechaHoraEnBolivia(paso.fecha)}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

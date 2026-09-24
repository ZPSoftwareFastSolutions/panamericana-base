'use client';

import { useState } from 'react';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo } from '@/compartido/componentes/Campo';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';
import { useAnularPasaje, usePasaje } from '@/modulos/ventas/hooks/useVentas';

/**
 * ANULACION EN TAQUILLA: se busca el pasaje por su codigo, se revisa y se anula.
 * La API decide si todavia se puede (pagado y hasta 2 horas antes de subir) y registra el reembolso.
 */
export function AnulacionPasaje() {
  const [texto, setTexto] = useState('');
  const [codigo, setCodigo] = useState('');
  const pasaje = usePasaje(codigo);
  const anular = useAnularPasaje();

  function buscar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    anular.reset();
    setCodigo(texto.trim().toUpperCase());
  }

  const datos = pasaje.data;

  return (
    <section className="flex flex-col gap-3">
      <form onSubmit={buscar} className="flex items-end gap-2">
        <Campo etiqueta="Codigo del pasaje" placeholder="P-XXXXXXXX" value={texto} onChange={(e) => setTexto(e.target.value)} required />
        <Boton type="submit" variante="secundario">
          Buscar
        </Boton>
      </form>

      {pasaje.isFetching && <p className="text-slate-500">Buscando...</p>}
      {pasaje.error && <p className="text-red-600">{pasaje.error.message}</p>}

      {datos && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p className="text-base font-semibold">
            {datos.codigo} · <span className="uppercase">{datos.estado}</span>
          </p>
          <p>
            {datos.pasajero.nombres} {datos.pasajero.apellidos} ({datos.pasajero.tipo_documento.toUpperCase()}{' '}
            {datos.pasajero.numero_documento})
          </p>
          <p>
            {datos.viaje.origen.terminal} → {datos.viaje.destino.terminal} · sube {fechaHoraEnBolivia(datos.viaje.origen.hora)} ·
            asiento {datos.asiento.numero}
          </p>
          <p>Pagado: {formatearBs(datos.precio)}</p>
          <p className="text-slate-500">Se puede anular hasta el {fechaHoraEnBolivia(datos.anulable_hasta)}</p>

          {anular.data ? (
            <p role="status" className="rounded bg-emerald-50 p-2 text-emerald-800">
              Pasaje anulado. Devolver {formatearBs(anular.data.reembolso)} al pasajero; el asiento quedo libre.
            </p>
          ) : (
            datos.estado === 'pagado' && (
              <Boton
                className="w-fit"
                cargando={anular.isPending}
                onClick={() => {
                  if (window.confirm(`¿Anular ${datos.codigo} y devolver ${formatearBs(datos.precio)}?`)) {
                    anular.mutate(datos.codigo);
                  }
                }}
              >
                Anular y devolver {formatearBs(datos.precio)}
              </Boton>
            )
          )}
          {anular.error && (
            <p role="alert" className="text-red-600">
              {anular.error.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

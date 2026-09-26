'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ResultadoBusqueda, Venta } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { hoyEnBolivia, horaEnBolivia } from '@/compartido/utilidades/fechas';
import { useCiudades } from '@/modulos/catalogos/hooks/useCatalogos';
import { useVenderEnTaquilla } from '@/modulos/ventas/hooks/useVentas';
import { SeleccionDeAsientos } from '@/modulos/ventas/componentes/SeleccionDeAsientos';
import { useBuscarViajes } from '@/modulos/viajes/hooks/useViajes';

/**
 * VENTA EN TAQUILLA: el vendedor busca el viaje, elige asientos en el MISMO croquis que la web
 * y cobra en efectivo. Al terminar, entrega los boletos (se abren para imprimir).
 */
export function VentaTaquilla() {
  const ciudades = useCiudades();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState(hoyEnBolivia);
  const [tramo, setTramo] = useState<ResultadoBusqueda | null>(null);
  const [vendida, setVendida] = useState<Venta | null>(null);
  const resultados = useBuscarViajes(origen, destino, fecha);
  const vender = useVenderEnTaquilla();

  const opciones = (ciudades.data ?? []).map((c) => ({ valor: c.id, texto: c.nombre }));

  if (vendida) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
        <h2 className="text-lg font-semibold text-emerald-900">
          Venta {vendida.codigo} cobrada: {formatearBs(vendida.total)} en efectivo
        </h2>
        <ul className="flex flex-col gap-1 text-sm">
          {vendida.pasajes.map((p) => (
            <li key={p.codigo} className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{p.codigo}</span>
              <span>
                asiento {p.asiento.numero} · {p.pasajero.nombres} {p.pasajero.apellidos} ({p.pasajero.numero_documento})
                {p.tipo_pasajero.requisito && (
                  <strong>
                    {' '}
                    · tarifa {p.tipo_pasajero.nombre}: verificar {p.tipo_pasajero.requisito.toLowerCase()}
                  </strong>
                )}
              </span>
              <Link href={`/boleto/${p.codigo}`} target="_blank" rel="noopener" className="text-blue-700 underline">
                Imprimir boleto<span className="sr-only"> {p.codigo} (se abre en otra pestaña)</span>
              </Link>
            </li>
          ))}
        </ul>
        <Boton
          variante="secundario"
          className="w-fit"
          onClick={() => {
            setVendida(null);
            setTramo(null);
          }}
        >
          Nueva venta
        </Boton>
      </section>
    );
  }

  if (tramo) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {tramo.origen.terminal} {horaEnBolivia(tramo.origen.hora)} → {tramo.destino.terminal} · bus {tramo.bus.placa}
          </p>
          <Boton variante="secundario" onClick={() => setTramo(null)}>
            Cambiar viaje
          </Boton>
        </div>
        <SeleccionDeAsientos
          viajeId={tramo.viaje_id}
          desde={tramo.origen.orden}
          hasta={tramo.destino.orden}
          textoBoton="Cobrar en efectivo"
          nota="El cobro es inmediato: los asientos quedan vendidos y los pasajes emitidos."
          consentimiento="taquilla"
          alConfirmar={async (pasajeros, acepta_condiciones) => {
            const venta = await vender.mutateAsync({
              viaje_id: tramo.viaje_id,
              orden_origen: tramo.origen.orden,
              orden_destino: tramo.destino.orden,
              pasajeros,
              acepta_condiciones,
            });
            setVendida(venta);
          }}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <CampoSeleccion
          etiqueta="Origen"
          opciones={opciones}
          textoVacio="Ciudad de origen"
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
        />
        <CampoSeleccion
          etiqueta="Destino"
          opciones={opciones}
          textoVacio="Ciudad de destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
        <Campo
          etiqueta="Fecha"
          type="date"
          value={fecha}
          min={hoyEnBolivia()}
          onChange={(e) => setFecha(e.target.value)}
          suppressHydrationWarning
        />
      </div>

      {origen && destino && origen === destino && (
        <p role="alert" className="text-sm text-red-600">
          El destino debe ser distinto al origen
        </p>
      )}
      {resultados.isFetching && <p className="text-slate-600">Buscando viajes...</p>}
      {resultados.error && <p className="text-red-600">{resultados.error.message}</p>}
      {resultados.data?.length === 0 && <p className="text-slate-600">No hay viajes para esa fecha.</p>}

      <ul className="flex flex-col gap-2">
        {resultados.data?.map((r) => (
          <li
            key={`${r.viaje_id}-${r.origen.orden}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            <span>
              <strong>{horaEnBolivia(r.origen.hora)}</strong> <span aria-hidden="true">→</span>
              <span className="sr-only">llega</span> {horaEnBolivia(r.destino.hora)} · bus {r.bus.placa} · desde{' '}
              {formatearBs(r.precio_desde)} · {r.asientos_libres} libres
            </span>
            <Boton disabled={r.asientos_libres === 0} onClick={() => setTramo(r)}>
              Vender<span className="sr-only"> el viaje de las {horaEnBolivia(r.origen.hora)}</span>
            </Boton>
          </li>
        ))}
      </ul>
    </section>
  );
}

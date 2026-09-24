'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/compartido/componentes/Boton';
import { PlanoAsientos } from '@/compartido/componentes/PlanoAsientos';
import type { AsientoDelPlano } from '@/compartido/componentes/PlanoAsientos';
import { ErrorDeApi } from '@/compartido/servicios/clienteHttp';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia, horaEnBolivia } from '@/compartido/utilidades/fechas';
import { useDisponibilidad } from '@/modulos/viajes/hooks/useViajes';
import { useReservar } from '../hooks/useVentas';
import { FormularioPasajeros, PASAJERO_VACIO } from './FormularioPasajeros';
import type { DatosPasajeroFormulario } from './FormularioPasajeros';

const MAXIMO_ASIENTOS = 5;

/**
 * COMPRA PASO 1 y 2: elegir asientos en el croquis del tramo y escribir los datos de cada pasajero.
 * Al continuar se RESERVAN los asientos (quedan retenidos unos minutos) y se pasa al pago.
 * Si otro cliente gano un asiento, la API responde 409 y el croquis se refresca.
 */
export function CompraDeAsientos({ viajeId, desde, hasta }: { viajeId: string; desde: number; hasta: number }) {
  const router = useRouter();
  const disponibilidad = useDisponibilidad(viajeId, desde, hasta);
  const reservar = useReservar();
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [pasajeros, setPasajeros] = useState<Record<string, DatosPasajeroFormulario>>({});
  const [aviso, setAviso] = useState<string | null>(null);

  if (disponibilidad.isPending) return <p className="text-slate-500">Cargando el croquis del bus...</p>;
  if (disponibilidad.error) return <p className="text-red-600">{disponibilidad.error.message}</p>;

  const datos = disponibilidad.data;
  const libres = new Set(datos.asientos.filter((a) => a.disponible).map((a) => a.id));
  // si un asiento elegido se ocupo mientras tanto (el croquis se refresca solo), deja de estar elegido
  const vigentes = elegidos.filter((id) => libres.has(id));
  const seleccion = datos.asientos.filter((a) => vigentes.includes(a.id));
  const total = seleccion.reduce((suma, a) => suma + a.precio, 0);

  const asientosDelPlano: AsientoDelPlano[] = datos.asientos.map((a) => ({
    ...a,
    estado: vigentes.includes(a.id) ? 'seleccionado' : a.disponible ? 'libre' : 'ocupado',
    detalle: a.disponible ? formatearBs(a.precio).replace('Bs ', '') : undefined,
  }));

  function alElegir(asiento: AsientoDelPlano) {
    setAviso(null);
    if (vigentes.includes(asiento.id)) {
      setElegidos(vigentes.filter((id) => id !== asiento.id));
    } else if (vigentes.length >= MAXIMO_ASIENTOS) {
      setAviso(`Puedes elegir hasta ${MAXIMO_ASIENTOS} asientos por compra`);
    } else {
      setElegidos([...vigentes, asiento.id]);
    }
  }

  function continuar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    reservar.mutate(
      {
        viaje_id: viajeId,
        orden_origen: desde,
        orden_destino: hasta,
        pasajeros: seleccion.map((a) => {
          const p = pasajeros[a.id] ?? PASAJERO_VACIO;
          return { asiento_id: a.id, ...p, telefono: p.telefono || null };
        }),
      },
      {
        onSuccess: (venta) => router.push(`/compra/${venta.codigo}`),
        onError: (error) => {
          if (error instanceof ErrorDeApi && error.codigo === 'asiento_no_disponible') {
            setAviso(error.message);
            void disponibilidad.refetch();
          }
        },
      },
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <section className="flex flex-col gap-3">
        <div className="rounded-lg bg-white p-3 text-sm">
          <p className="font-semibold">
            {datos.origen.ciudad} → {datos.destino.ciudad}
          </p>
          <p className="text-slate-600">
            Sube {fechaHoraEnBolivia(datos.origen.hora)} en {datos.origen.terminal} · llega {horaEnBolivia(datos.destino.hora)}
          </p>
        </div>
        <PlanoAsientos numeroPisos={datos.numero_pisos} asientos={asientosDelPlano} alElegir={alElegir} />
      </section>

      <form onSubmit={continuar} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {seleccion.length === 0 ? 'Elige tus asientos en el croquis' : `Asientos elegidos: ${seleccion.map((a) => a.numero).join(', ')}`}
        </h2>

        {aviso && (
          <p role="alert" className="rounded bg-amber-50 p-3 text-sm text-amber-800">
            {aviso}
          </p>
        )}

        {seleccion.length > 0 && (
          <>
            <FormularioPasajeros
              asientos={seleccion}
              pasajeros={pasajeros}
              alCambiar={(id, datosPasajero) => setPasajeros({ ...pasajeros, [id]: datosPasajero })}
            />
            <div className="flex items-center justify-between rounded-lg bg-white p-4">
              <span className="text-slate-600">Total</span>
              <span className="text-2xl font-bold">{formatearBs(total)}</span>
            </div>
            <Boton type="submit" cargando={reservar.isPending}>
              Continuar al pago
            </Boton>
            <p className="text-xs text-slate-500">Al continuar, tus asientos quedan reservados por 10 minutos mientras pagas.</p>
          </>
        )}

        {reservar.error && !(reservar.error instanceof ErrorDeApi && reservar.error.codigo === 'asiento_no_disponible') && (
          <p role="alert" className="text-red-600">
            {reservar.error.message}
          </p>
        )}
      </form>
    </div>
  );
}

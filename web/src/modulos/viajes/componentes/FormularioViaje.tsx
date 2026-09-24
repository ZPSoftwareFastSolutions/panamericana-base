'use client';

import { useState } from 'react';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { aIsoBolivia, hoyEnBolivia } from '@/compartido/utilidades/fechas';
import { useBuses } from '@/modulos/buses/hooks/useBuses';
import { useCroquis } from '@/modulos/croquis/hooks/useCroquis';
import { useRutas } from '@/modulos/rutas/hooks/useRutas';
import { useProgramarViaje } from '../hooks/useViajes';

const INICIAL = { ruta_id: '', bus_id: '', fecha: '', hora: '08:00' };

/**
 * Programar un viaje: ruta, bus, fecha y hora de salida (hora de La Paz) y una tarifa
 * por cada TIPO de asiento que tiene el bus (se leen de su croquis).
 */
export function FormularioViaje() {
  const [valores, setValores] = useState(INICIAL);
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const rutas = useRutas();
  const buses = useBuses();
  const croquis = useCroquis(valores.bus_id || null);
  const programar = useProgramarViaje();

  const tipos = [...new Set((croquis.data?.asientos ?? []).map((a) => a.tipo))];

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    programar.mutate(
      {
        ruta_id: valores.ruta_id,
        bus_id: valores.bus_id,
        fecha_salida: aIsoBolivia(valores.fecha, valores.hora),
        tarifas: tipos.map((tipo) => ({ tipo_asiento: tipo, precio: Number(precios[tipo] ?? 0) })),
      },
      {
        onSuccess: () => {
          setValores(INICIAL);
          setPrecios({});
        },
      },
    );
  }

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <h2 className="font-semibold">Programar viaje</h2>

      <CampoSeleccion
        etiqueta="Ruta"
        textoVacio="Elige una ruta"
        opciones={(rutas.data ?? []).filter((r) => r.activo).map((r) => ({ valor: r.id, texto: r.nombre }))}
        value={valores.ruta_id}
        onChange={(e) => setValores({ ...valores, ruta_id: e.target.value })}
        required
      />
      <CampoSeleccion
        etiqueta="Bus"
        textoVacio="Elige un bus"
        opciones={(buses.data ?? [])
          .filter((b) => b.estado === 'activo')
          .map((b) => ({ valor: b.id, texto: `${b.placa} · ${b.marca} ${b.modelo}` }))}
        value={valores.bus_id}
        onChange={(e) => {
          setValores({ ...valores, bus_id: e.target.value });
          setPrecios({});
        }}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <Campo
          etiqueta="Fecha"
          type="date"
          min={hoyEnBolivia()}
          suppressHydrationWarning
          value={valores.fecha}
          onChange={(e) => setValores({ ...valores, fecha: e.target.value })}
          required
        />
        <Campo etiqueta="Hora (La Paz)" type="time" value={valores.hora} onChange={(e) => setValores({ ...valores, hora: e.target.value })} required />
      </div>

      {valores.bus_id && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-slate-700">Tarifa del recorrido completo (Bs)</legend>
          {croquis.isPending && <p className="text-sm text-slate-500">Leyendo el croquis del bus...</p>}
          {croquis.data && tipos.length === 0 && (
            <p className="text-sm text-red-600">Este bus todavia no tiene croquis de asientos.</p>
          )}
          {tipos.map((tipo) => (
            <Campo
              key={tipo}
              etiqueta={`Asiento ${tipo}`}
              type="number"
              min={0.01}
              step="0.01"
              value={precios[tipo] ?? ''}
              onChange={(e) => setPrecios({ ...precios, [tipo]: e.target.value })}
              required
            />
          ))}
        </fieldset>
      )}

      <Boton type="submit" cargando={programar.isPending} disabled={tipos.length === 0}>
        Programar
      </Boton>
      {programar.error && (
        <p role="alert" className="text-red-600">
          {programar.error.message}
        </p>
      )}
    </form>
  );
}

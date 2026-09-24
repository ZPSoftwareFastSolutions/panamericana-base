'use client';

import { useState } from 'react';
import type { Viaje } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo } from '@/compartido/componentes/Campo';
import { useCroquis } from '@/modulos/croquis/hooks/useCroquis';
import { useEditarTarifas } from '../hooks/useViajes';

/**
 * CAMBIAR LOS PRECIOS de un viaje programado: un precio por cada tipo de asiento que el bus
 * tiene HOY en su croquis (si el croquis cambio, aparecen o desaparecen campos).
 * Los pasajes ya vendidos conservan su precio; el cambio vale para las ventas siguientes.
 */
export function EditorTarifas({ viaje, alTerminar }: { viaje: Viaje; alTerminar: () => void }) {
  const croquis = useCroquis(viaje.bus.id);
  const editar = useEditarTarifas(viaje.id);
  // solo guarda lo que la persona escribio; lo demas se muestra con el precio actual
  const [escritos, setEscritos] = useState<Record<string, string>>({});

  if (croquis.isPending) return <p className="text-sm text-slate-500">Cargando los tipos de asiento del bus...</p>;
  if (croquis.error) return <p className="text-sm text-red-600">{croquis.error.message}</p>;

  const tipos = [...new Set(croquis.data.asientos.map((a) => a.tipo))];
  const precioDe = (tipo: string) =>
    escritos[tipo] ?? String(viaje.tarifas.find((t) => t.tipo_asiento === tipo)?.precio ?? '');

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(evento) => {
        evento.preventDefault();
        editar.mutate(
          { tarifas: tipos.map((tipo_asiento) => ({ tipo_asiento, precio: Number(precioDe(tipo_asiento)) })) },
          { onSuccess: alTerminar },
        );
      }}
    >
      {tipos.map((tipo) => (
        <div key={tipo} className="w-28">
          <Campo
            etiqueta={`${tipo} (Bs)`}
            type="number"
            min="0.01"
            step="0.01"
            value={precioDe(tipo)}
            onChange={(e) => setEscritos({ ...escritos, [tipo]: e.target.value })}
            required
          />
        </div>
      ))}
      <Boton type="submit" cargando={editar.isPending}>
        Guardar
      </Boton>
      <Boton type="button" variante="secundario" onClick={alTerminar}>
        Cancelar
      </Boton>
      {editar.error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {editar.error.message}
        </p>
      )}
    </form>
  );
}

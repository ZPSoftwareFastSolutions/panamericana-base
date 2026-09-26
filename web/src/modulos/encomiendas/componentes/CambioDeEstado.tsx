'use client';

import { useState } from 'react';
import type { Encomienda, EstadoEncomienda } from '@panamericana/shared';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';
import { useRutas } from '@/modulos/rutas/hooks/useRutas';
import { useViajes } from '@/modulos/viajes/hooks/useViajes';
import { useCambiarEstadoEncomienda } from '../hooks/useEncomiendas';
import { NOMBRES_ESTADO } from './EtiquetaEstado';

/**
 * avanzar el estado de una encomienda; al despacharla se puede elegir el viaje que la lleva.
 * Los pasos posibles los manda la API (encomienda.siguientes): la regla vive en el backend.
 */
export function CambioDeEstado({ encomienda }: { encomienda: Encomienda }) {
  const opciones = encomienda.siguientes;
  const [estado, setEstado] = useState<EstadoEncomienda | ''>(opciones[0] ?? '');
  const [observacion, setObservacion] = useState('');
  const [viajeId, setViajeId] = useState('');
  const viajes = useViajes();
  const rutas = useRutas();
  const cambiar = useCambiarEstadoEncomienda();

  if (opciones.length === 0) return null;

  // solo los viajes cuya ruta pasa por la terminal de origen y DESPUES por la de destino
  const orden = (rutaId: string, terminalId: string) =>
    rutas.data?.find((r) => r.id === rutaId)?.paradas.find((p) => p.terminal.id === terminalId)?.orden;
  const viajesProgramados = (viajes.data ?? [])
    .filter((v) => {
      const sube = orden(v.ruta.id, encomienda.terminal_origen.id);
      const baja = orden(v.ruta.id, encomienda.terminal_destino.id);
      return v.estado === 'programado' && sube !== undefined && baja !== undefined && sube < baja;
    })
    .map((v) => ({ valor: v.id, texto: `${fechaHoraEnBolivia(v.fecha_salida)} · ${v.ruta.nombre} · ${v.bus.placa}` }));

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!estado) return;
        if (estado === 'cancelada' && !window.confirm('¿Cancelar la encomienda y devolver el costo?')) return;
        cambiar.mutate(
          {
            codigo: encomienda.codigo_seguimiento,
            datos: { estado, observacion: observacion || null, viaje_id: estado === 'en_transito' && viajeId ? viajeId : null },
          },
          { onSuccess: () => setObservacion('') },
        );
      }}
    >
      <div className="grid gap-2 sm:grid-cols-3">
        <CampoSeleccion
          etiqueta="Pasar a"
          opciones={opciones.map((o) => ({ valor: o, texto: NOMBRES_ESTADO[o] }))}
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoEncomienda)}
        />
        {estado === 'en_transito' && (
          <CampoSeleccion
            etiqueta="Viaje (opcional)"
            opciones={viajesProgramados}
            textoVacio="Sin indicar"
            value={viajeId}
            onChange={(e) => setViajeId(e.target.value)}
          />
        )}
        <Campo etiqueta="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      </div>
      {cambiar.error && (
        <p role="alert" className="text-sm text-red-600">
          {cambiar.error.message}
        </p>
      )}
      <Boton type="submit" variante="secundario" className="w-fit" cargando={cambiar.isPending}>
        Guardar estado
      </Boton>
    </form>
  );
}

'use client';

import { useState } from 'react';
import type { EstadoEncomienda } from '@panamericana/shared';
import { CampoSeleccion } from '@/compartido/componentes/Campo';
import { formatearBs } from '@/compartido/utilidades/dinero';
import { fechaHoraEnBolivia } from '@/compartido/utilidades/fechas';
import { useEncomiendas } from '../hooks/useEncomiendas';
import { CambioDeEstado } from './CambioDeEstado';
import { EtiquetaEstado, NOMBRES_ESTADO } from './EtiquetaEstado';

/** encomiendas recientes con su estado; cada una se puede abrir para avanzar su estado */
export function TablaEncomiendas() {
  const [filtro, setFiltro] = useState<EstadoEncomienda | ''>('');
  const [abierta, setAbierta] = useState<string | null>(null);
  const { data: encomiendas, isPending, error } = useEncomiendas(filtro || undefined);

  return (
    <div className="flex flex-col gap-3">
      <div className="w-56">
        <CampoSeleccion
          etiqueta="Estado"
          opciones={Object.entries(NOMBRES_ESTADO).map(([valor, texto]) => ({ valor, texto }))}
          textoVacio="Todos"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoEncomienda | '')}
        />
      </div>

      {isPending && <p className="text-slate-600">Cargando encomiendas...</p>}
      {error && <p className="text-red-600">No se pudo cargar la lista: {error.message}</p>}
      {encomiendas?.length === 0 && <p className="text-slate-600">No hay encomiendas con ese estado.</p>}

      <ul className="flex flex-col divide-y divide-slate-200">
        {encomiendas?.map((e) => (
          <li key={e.id} className="flex flex-col gap-2 py-3 text-sm">
            <button
              type="button"
              className="flex min-h-11 flex-wrap items-center justify-between gap-2 text-left"
              onClick={() => setAbierta(abierta === e.id ? null : e.id)}
              aria-expanded={abierta === e.id}
            >
              <span>
                <span className="font-mono font-semibold">{e.codigo_seguimiento}</span> · {e.terminal_origen.ciudad}{' '}
                <span aria-hidden="true">→</span>
                <span className="sr-only">a</span>{' '}
                {e.terminal_destino.ciudad} · {e.descripcion}
                <span className="block text-xs text-slate-600">
                  De {e.remitente.nombres} {e.remitente.apellidos} para {e.destinatario.nombres} {e.destinatario.apellidos} ·{' '}
                  {e.peso_kg} kg · {formatearBs(e.costo)} · {fechaHoraEnBolivia(e.creado_en)}
                </span>
              </span>
              <EtiquetaEstado estado={e.estado} />
            </button>

            {abierta === e.id && (
              <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3">
                {e.viaje && (
                  <p>
                    Viaja en el bus {e.viaje.bus} ({e.viaje.ruta}), salida {fechaHoraEnBolivia(e.viaje.fecha_salida)}
                  </p>
                )}
                <ol className="flex flex-col gap-1">
                  {e.historial.map((h) => (
                    <li key={`${h.estado}-${h.fecha}`}>
                      <strong>{NOMBRES_ESTADO[h.estado]}</strong> · {fechaHoraEnBolivia(h.fecha)} · {h.usuario}
                      {h.observacion ? ` · ${h.observacion}` : ''}
                    </li>
                  ))}
                </ol>
                {/* key: al cambiar el estado, el formulario vuelve a empezar con los pasos nuevos */}
                <CambioDeEstado key={e.estado} encomienda={e} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

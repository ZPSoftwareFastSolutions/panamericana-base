'use client';

import { useState } from 'react';
import type { FiltroIndicadores } from '@panamericana/shared';
import { Campo, CampoSeleccion } from '@/compartido/componentes/Campo';
import { useRutas } from '@/modulos/rutas/hooks/useRutas';
import { useIndicadores } from '../hooks/usePanel';
import { ResumenIndicadores } from './ResumenIndicadores';

/** PANEL DE INDICADORES: filtros (periodo y ruta) y el resumen; sin fechas, los ultimos 30 dias */
export function PanelIndicadores() {
  const [filtro, setFiltro] = useState<FiltroIndicadores>({});
  const rutas = useRutas();
  const { data, isPending, error } = useIndicadores(filtro);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Campo
          etiqueta="Desde"
          type="date"
          value={filtro.desde ?? data?.desde ?? ''}
          onChange={(e) => setFiltro({ ...filtro, desde: e.target.value || undefined })}
        />
        <Campo
          etiqueta="Hasta"
          type="date"
          value={filtro.hasta ?? data?.hasta ?? ''}
          onChange={(e) => setFiltro({ ...filtro, hasta: e.target.value || undefined })}
        />
        <CampoSeleccion
          etiqueta="Ruta"
          textoVacio="Todas"
          opciones={(rutas.data ?? []).map((r) => ({ valor: r.id, texto: r.nombre }))}
          value={filtro.ruta_id ?? ''}
          onChange={(e) => setFiltro({ ...filtro, ruta_id: e.target.value || undefined })}
        />
      </div>

      {isPending && <p className="text-slate-600">Cargando indicadores...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {data && <ResumenIndicadores datos={data} />}
    </div>
  );
}

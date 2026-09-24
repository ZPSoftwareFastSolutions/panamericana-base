'use client';

import { useQuery } from '@tanstack/react-query';
import type { FiltroIndicadores } from '@panamericana/shared';
import { panelServicio } from '../servicios/panelServicio';

export const clavesPanel = {
  indicadores: (filtro: FiltroIndicadores) => ['panel', 'indicadores', filtro] as const,
  prediccion: (dias: number) => ['panel', 'prediccion', dias] as const,
};

/** HOOK: indicadores del periodo elegido */
export function useIndicadores(filtro: FiltroIndicadores) {
  return useQuery({ queryKey: clavesPanel.indicadores(filtro), queryFn: () => panelServicio.indicadores(filtro) });
}

/** HOOK: demanda estimada de los proximos dias (cambia poco: 5 minutos en cache) */
export function usePrediccion(dias: number) {
  return useQuery({
    queryKey: clavesPanel.prediccion(dias),
    queryFn: () => panelServicio.prediccion(dias),
    staleTime: 5 * 60 * 1000,
  });
}

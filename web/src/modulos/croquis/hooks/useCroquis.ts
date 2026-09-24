'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GenerarCroquisEntrada } from '@panamericana/shared';
import { croquisServicio } from '../servicios/croquisServicio';

export const clavesCroquis = {
  delBus: (busId: string) => ['croquis', busId] as const,
};

/** HOOK: croquis de un bus (no pide nada mientras no haya un bus elegido) */
export function useCroquis(busId: string | null) {
  return useQuery({
    queryKey: clavesCroquis.delBus(busId ?? ''),
    queryFn: () => croquisServicio.obtener(busId!),
    enabled: Boolean(busId),
  });
}

/** HOOK (editor): genera el croquis estandar de un bus sin asientos */
export function useGenerarCroquis(busId: string) {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: (datos: GenerarCroquisEntrada) => croquisServicio.generar(busId, datos),
    onSuccess: (croquis) => clienteQuery.setQueryData(clavesCroquis.delBus(busId), croquis),
  });
}

/** HOOK (editor): cambia el tipo de un asiento */
export function useCambiarTipoAsiento(busId: string) {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: ({ asientoId, tipo }: { asientoId: string; tipo: string }) =>
      croquisServicio.cambiarTipo(busId, asientoId, { tipo }),
    onSuccess: (croquis) => clienteQuery.setQueryData(clavesCroquis.delBus(busId), croquis),
  });
}

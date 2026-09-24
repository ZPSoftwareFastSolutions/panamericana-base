'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CambiarEstadoEncomiendaEntrada, EstadoEncomienda } from '@panamericana/shared';
import { encomiendasServicio } from '../servicios/encomiendasServicio';

export const clavesEncomiendas = {
  todas: ['encomiendas'] as const,
  lista: (estado?: EstadoEncomienda) => ['encomiendas', 'lista', estado ?? 'todas'] as const,
  seguimiento: (codigo: string) => ['seguimiento', codigo] as const,
};

/** HOOK (panel): encomiendas, opcionalmente filtradas por estado */
export function useEncomiendas(estado?: EstadoEncomienda) {
  return useQuery({
    queryKey: clavesEncomiendas.lista(estado),
    queryFn: () => encomiendasServicio.listar(estado),
  });
}

/** HOOK (panel): registra y cobra una encomienda; refresca las listas */
export function useRegistrarEncomienda() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: encomiendasServicio.registrar,
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: clavesEncomiendas.todas }),
  });
}

/** HOOK (panel): cambia el estado; si otra persona lo cambio antes, igual refresca */
export function useCambiarEstadoEncomienda() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: ({ codigo, datos }: { codigo: string; datos: CambiarEstadoEncomiendaEntrada }) =>
      encomiendasServicio.cambiarEstado(codigo, datos),
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: clavesEncomiendas.todas }),
  });
}

/** HOOK (portal): seguimiento publico por codigo */
export function useSeguimiento(codigo: string) {
  return useQuery({
    queryKey: clavesEncomiendas.seguimiento(codigo),
    queryFn: () => encomiendasServicio.seguimiento(codigo),
    enabled: codigo.trim().length >= 3,
    retry: false,
  });
}

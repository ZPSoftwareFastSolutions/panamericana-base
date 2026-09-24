'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { viajesServicio } from '../servicios/viajesServicio';

export const clavesViajes = {
  todos: ['viajes'] as const,
  busqueda: (origen: string, destino: string, fecha: string) => ['viajes', 'busqueda', origen, destino, fecha] as const,
  disponibilidad: (viajeId: string, desde: number, hasta: number) =>
    ['viajes', 'disponibilidad', viajeId, desde, hasta] as const,
};

/** HOOK (backoffice): viajes desde hoy */
export function useViajes() {
  return useQuery({ queryKey: clavesViajes.todos, queryFn: viajesServicio.listar });
}

/** HOOK (backoffice): programa un viaje y refresca la lista */
export function useProgramarViaje() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: viajesServicio.programar,
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: clavesViajes.todos }),
  });
}

/** HOOK (portal): viajes para ir de una ciudad a otra en una fecha */
export function useBuscarViajes(origen: string, destino: string, fecha: string) {
  return useQuery({
    queryKey: clavesViajes.busqueda(origen, destino, fecha),
    queryFn: () => viajesServicio.buscar(origen, destino, fecha),
    enabled: Boolean(origen && destino && fecha),
  });
}

/**
 * HOOK (portal): asientos del tramo. Se refresca cada 20 segundos para que el croquis
 * muestre las compras de otras personas sin recargar la pagina.
 */
export function useDisponibilidad(viajeId: string, desde: number, hasta: number) {
  return useQuery({
    queryKey: clavesViajes.disponibilidad(viajeId, desde, hasta),
    queryFn: () => viajesServicio.disponibilidad(viajeId, desde, hasta),
    refetchInterval: 20_000,
  });
}

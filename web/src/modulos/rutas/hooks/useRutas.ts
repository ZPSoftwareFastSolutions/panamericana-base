'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rutasServicio } from '../servicios/rutasServicio';

export const clavesRutas = {
  todas: ['rutas'] as const,
};

/** HOOK: lista de rutas con sus paradas */
export function useRutas() {
  return useQuery({ queryKey: clavesRutas.todas, queryFn: rutasServicio.listar });
}

/** HOOK: registra una ruta y refresca la lista */
export function useRegistrarRuta() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: rutasServicio.registrar,
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: clavesRutas.todas }),
  });
}

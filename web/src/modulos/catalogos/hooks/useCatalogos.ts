'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogosServicio } from '../servicios/catalogosServicio';

/** claves de cache de los catalogos */
export const clavesCatalogos = {
  ciudades: ['catalogos', 'ciudades'] as const,
  tiposDocumento: ['catalogos', 'tipos-documento'] as const,
  roles: ['catalogos', 'roles'] as const,
};

// los catalogos casi nunca cambian: se guardan 10 minutos en cache
const DIEZ_MINUTOS = 10 * 60 * 1000;

/** HOOK: ciudades para elegir la ciudad de una terminal */
export function useCiudades() {
  return useQuery({
    queryKey: clavesCatalogos.ciudades,
    queryFn: catalogosServicio.ciudades,
    staleTime: DIEZ_MINUTOS,
  });
}

/** HOOK: tipos de documento (ci, ce, pasaporte) para los formularios de personas */
export function useTiposDocumento() {
  return useQuery({
    queryKey: clavesCatalogos.tiposDocumento,
    queryFn: catalogosServicio.tiposDocumento,
    staleTime: DIEZ_MINUTOS,
  });
}

/** HOOK: roles que se pueden asignar a un usuario */
export function useRoles() {
  return useQuery({
    queryKey: clavesCatalogos.roles,
    queryFn: catalogosServicio.roles,
    staleTime: DIEZ_MINUTOS,
  });
}

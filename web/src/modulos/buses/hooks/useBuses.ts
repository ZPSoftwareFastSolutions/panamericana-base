'use client';

import { useQuery } from '@tanstack/react-query';
import { busesServicio } from '../servicios/busesServicio';

/** clave con la que se guarda la lista en cache */
export const clavesBuses = {
  todos: ['buses'] as const,
};

/** HOOK: trae la lista de buses y entrega los estados de carga y error */
export function useBuses() {
  return useQuery({
    queryKey: clavesBuses.todos,
    queryFn: busesServicio.listar,
  });
}

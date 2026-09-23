'use client';

import { useQuery } from '@tanstack/react-query';
import { terminalesServicio } from '../servicios/terminalesServicio';

/** clave con la que se guarda la lista en cache */
export const clavesTerminales = {
  todas: ['terminales'] as const,
};

/** HOOK: trae la lista de terminales y entrega los estados de carga y error */
export function useTerminales() {
  return useQuery({
    queryKey: clavesTerminales.todas,
    queryFn: terminalesServicio.listar,
  });
}

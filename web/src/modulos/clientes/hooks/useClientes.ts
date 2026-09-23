'use client';

import { useQuery } from '@tanstack/react-query';
import { clientesServicio } from '../servicios/clientesServicio';

/** clave con la que se guarda la lista en cache */
export const clavesClientes = {
  todos: ['clientes'] as const,
};

/** HOOK: trae la lista de clientes y entrega los estados de carga y error */
export function useClientes() {
  return useQuery({
    queryKey: clavesClientes.todos,
    queryFn: clientesServicio.listar,
  });
}

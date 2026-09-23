'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesServicio } from '../servicios/clientesServicio';
import { clavesClientes } from './useClientes';

/** HOOK: registra un cliente y refresca la lista automaticamente */
export function useRegistrarCliente() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: clientesServicio.registrar,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: clavesClientes.todos });
    },
  });
}

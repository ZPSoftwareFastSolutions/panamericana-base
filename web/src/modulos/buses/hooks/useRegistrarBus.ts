'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { busesServicio } from '../servicios/busesServicio';
import { clavesBuses } from './useBuses';

/** HOOK: registra un bus y refresca la lista automaticamente */
export function useRegistrarBus() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: busesServicio.registrar,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: clavesBuses.todos });
    },
  });
}

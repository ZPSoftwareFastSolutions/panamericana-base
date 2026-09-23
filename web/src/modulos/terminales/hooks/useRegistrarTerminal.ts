'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalesServicio } from '../servicios/terminalesServicio';
import { clavesTerminales } from './useTerminales';

/** HOOK: registra una terminal y refresca la lista automaticamente (sin recargar la pagina) */
export function useRegistrarTerminal() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: terminalesServicio.registrar,
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: clavesTerminales.todas });
    },
  });
}

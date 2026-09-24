'use client';

import { useQuery } from '@tanstack/react-query';
import { croquisServicio } from '../servicios/croquisServicio';

export const clavesCroquis = {
  delBus: (busId: string) => ['croquis', busId] as const,
};

/** HOOK: croquis de un bus (no pide nada mientras no haya un bus elegido) */
export function useCroquis(busId: string | null) {
  return useQuery({
    queryKey: clavesCroquis.delBus(busId ?? ''),
    queryFn: () => croquisServicio.obtener(busId!),
    enabled: Boolean(busId),
  });
}

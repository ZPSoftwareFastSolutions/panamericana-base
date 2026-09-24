'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { registrarProveedorDeToken } from '@/compartido/servicios/clienteHttp';
import { sesionServicio } from '@/modulos/sesion/servicios/sesionServicio';

/**
 * PUNTO DE ARRANQUE DE LA WEB: conecta las piezas, igual que contenedor.ts en el backend.
 *  - el cliente HTTP obtiene el token de la sesion desde el modulo sesion;
 *  - TanStack Query guarda en cache lo que piden los hooks.
 */
registrarProveedorDeToken(sesionServicio.token);

export function Proveedores({ children }: { children: React.ReactNode }) {
  const [clienteQuery] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return <QueryClientProvider client={clienteQuery}>{children}</QueryClientProvider>;
}

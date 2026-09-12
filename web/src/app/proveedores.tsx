'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/** Envuelve toda la app para que los hooks puedan pedir datos y guardarlos en cache */
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

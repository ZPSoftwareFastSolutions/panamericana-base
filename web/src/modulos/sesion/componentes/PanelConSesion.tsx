'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MenuLateral } from '@/compartido/componentes/MenuLateral';
import { ErrorDeApi } from '@/compartido/servicios/clienteHttp';
import { useCerrarSesion, useSesion } from '../hooks/useSesion';

/**
 * GUARDIA DEL PANEL: arma el backoffice solo si hay una sesion con rol interno.
 *  - sin sesion -> va al login (y vuelve aqui despues)
 *  - con sesion pero sin rol del personal -> mensaje de acceso denegado
 *
 * La seguridad real esta en la API (cada endpoint exige su rol); esto solo ordena la pantalla.
 */
export function PanelConSesion({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const sesion = useSesion();
  const cerrar = useCerrarSesion();

  const sinSesion =
    sesion.data === null || (sesion.error instanceof ErrorDeApi && sesion.error.estado === 401);

  useEffect(() => {
    if (sinSesion) router.replace(`/login?volver=${encodeURIComponent(ruta)}`);
  }, [sinSesion, router, ruta]);

  function cerrarSesion() {
    cerrar.mutate(undefined, { onSuccess: () => router.replace('/login') });
  }

  if (sesion.isPending || sinSesion) {
    return <p className="p-8 text-slate-600">Verificando la sesión...</p>;
  }

  if (sesion.error) {
    return (
      <div className="flex flex-col gap-3 p-8">
        <p className="text-red-600">{sesion.error.message}</p>
        <button type="button" onClick={cerrarSesion} className="w-fit underline">
          Cerrar sesión
        </button>
      </div>
    );
  }

  const usuario = sesion.data!;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-slate-200 bg-white p-4 md:w-56 md:border-r md:border-b-0">
        <p className="mb-4 font-bold">Panamericana</p>
        <MenuLateral
          roles={usuario.roles}
          nombre={`${usuario.nombres} ${usuario.apellidos}`}
          alCerrarSesion={cerrarSesion}
        />
      </aside>
      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none md:p-8">
        {children}
      </main>
    </div>
  );
}

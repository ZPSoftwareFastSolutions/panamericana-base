'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/compartido/componentes/Boton';
import { Campo } from '@/compartido/componentes/Campo';
import { useIniciarSesion } from '../hooks/useSesion';

/** solo se vuelve a paginas del panel (evita redirigir a otro sitio) */
function destinoSeguro(volver?: string): string {
  return volver && volver.startsWith('/admin') ? volver : '/admin';
}

/** formulario de inicio de sesion del personal */
export function FormularioLogin({ volver }: { volver?: string }) {
  const router = useRouter();
  const iniciar = useIniciarSesion();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    iniciar.mutate({ correo, clave }, { onSuccess: () => router.replace(destinoSeguro(volver)) });
  }

  return (
    <form onSubmit={alEnviar} className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Acceso del personal</h1>
      <Campo
        etiqueta="Correo"
        type="email"
        autoComplete="username"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <Campo
        etiqueta="Contrasena"
        type="password"
        autoComplete="current-password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        required
      />
      <Boton type="submit" cargando={iniciar.isPending}>
        Ingresar
      </Boton>
      {iniciar.error && (
        <p role="alert" className="text-sm text-red-600">
          {iniciar.error.message}
        </p>
      )}
    </form>
  );
}

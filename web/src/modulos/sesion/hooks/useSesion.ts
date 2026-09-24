'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sesionServicio } from '../servicios/sesionServicio';

export const clavesSesion = {
  perfil: ['sesion'] as const,
};

/**
 * HOOK: el usuario que inicio sesion.
 *  data === undefined -> todavia se esta averiguando
 *  data === null      -> no hay sesion
 *  data = usuario     -> hay sesion; trae sus roles
 */
export function useSesion() {
  const clienteQuery = useQueryClient();

  // si la sesion cambia en otra pestana o se renueva el token, se vuelve a preguntar
  useEffect(
    () => sesionServicio.escuchar(() => clienteQuery.invalidateQueries({ queryKey: clavesSesion.perfil })),
    [clienteQuery],
  );

  return useQuery({
    queryKey: clavesSesion.perfil,
    queryFn: async () => ((await sesionServicio.token()) ? sesionServicio.perfil() : null),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

/** HOOK: iniciar sesion y cargar el perfil con sus roles */
export function useIniciarSesion() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: async ({ correo, clave }: { correo: string; clave: string }) => {
      await sesionServicio.iniciar(correo, clave);
      return clienteQuery.fetchQuery({ queryKey: clavesSesion.perfil, queryFn: sesionServicio.perfil });
    },
  });
}

/** HOOK: cerrar sesion y olvidar todos los datos guardados del panel */
export function useCerrarSesion() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: sesionServicio.cerrar,
    onSuccess: () => {
      clienteQuery.clear();
      clienteQuery.setQueryData(clavesSesion.perfil, null);
    },
  });
}

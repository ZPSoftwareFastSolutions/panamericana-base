'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ventasServicio } from '../servicios/ventasServicio';

export const clavesVentas = {
  porCodigo: (codigo: string) => ['ventas', codigo] as const,
  pasaje: (codigo: string) => ['pasajes', codigo] as const,
};

/** HOOK: reservar los asientos elegidos (crea la venta pendiente) */
export function useReservar() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: ventasServicio.reservar,
    onSuccess: (venta) => clienteQuery.setQueryData(clavesVentas.porCodigo(venta.codigo), venta),
  });
}

/** HOOK: una venta por su codigo (checkout y confirmacion) */
export function useVenta(codigo: string) {
  return useQuery({
    queryKey: clavesVentas.porCodigo(codigo),
    queryFn: () => ventasServicio.obtener(codigo),
    retry: false,
  });
}

/** HOOK: pagar (simulado) la venta; al terminar, la pantalla muestra la venta pagada */
export function usePagarVenta(codigo: string) {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: () => ventasServicio.pagar(codigo),
    onSuccess: (venta) => clienteQuery.setQueryData(clavesVentas.porCodigo(codigo), venta),
    onError: () => clienteQuery.invalidateQueries({ queryKey: clavesVentas.porCodigo(codigo) }),
  });
}

/** HOOK: un pasaje por su codigo (boleto y consulta en taquilla). Sin codigo no pide nada */
export function usePasaje(codigo: string) {
  return useQuery({
    queryKey: clavesVentas.pasaje(codigo),
    queryFn: () => ventasServicio.pasaje(codigo),
    enabled: codigo.trim().length >= 3,
    retry: false,
  });
}

/** HOOK (taquilla): vender y cobrar en efectivo; el croquis del viaje se vuelve a pedir */
export function useVenderEnTaquilla() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: ventasServicio.venderEnTaquilla,
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: ['viajes'] }),
  });
}

/** HOOK (taquilla): anular un pasaje; actualiza el pasaje y los croquis */
export function useAnularPasaje() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: ventasServicio.anularPasaje,
    onSuccess: (resultado) => {
      clienteQuery.setQueryData(clavesVentas.pasaje(resultado.pasaje.codigo), resultado.pasaje);
      clienteQuery.invalidateQueries({ queryKey: ['viajes'] });
    },
  });
}

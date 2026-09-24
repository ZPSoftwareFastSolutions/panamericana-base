import { RUTAS_API } from '@panamericana/shared';
import type { RegistrarRutaEntrada, Ruta } from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/** SERVICIO de rutas: recorridos con paradas ordenadas */
export const rutasServicio = {
  listar: () => clienteHttp.get<Ruta[]>(RUTAS_API.rutas.base),
  registrar: (datos: RegistrarRutaEntrada) => clienteHttp.post<Ruta>(RUTAS_API.rutas.base, datos),
};

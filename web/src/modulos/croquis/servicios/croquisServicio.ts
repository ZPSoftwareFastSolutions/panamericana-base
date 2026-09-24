import { RUTAS_API } from '@panamericana/shared';
import type {
  CambiarTipoAsientoEntrada,
  Croquis,
  GenerarCroquisEntrada,
  RegistrarAsientoEntrada,
} from '@panamericana/shared';
import { clienteHttp } from '@/compartido/servicios/clienteHttp';

/** SERVICIO del croquis: los asientos fisicos de un bus */
export const croquisServicio = {
  obtener: (busId: string) => clienteHttp.get<Croquis>(RUTAS_API.croquis.delBus(busId)),
  generar: (busId: string, datos: GenerarCroquisEntrada) =>
    clienteHttp.post<Croquis>(RUTAS_API.croquis.generarDelBus(busId), datos),
  registrarAsiento: (busId: string, datos: RegistrarAsientoEntrada) =>
    clienteHttp.post<Croquis>(RUTAS_API.croquis.delBus(busId), datos),
  cambiarTipo: (busId: string, asientoId: string, datos: CambiarTipoAsientoEntrada) =>
    clienteHttp.put<Croquis>(RUTAS_API.croquis.asientoDelBus(busId, asientoId), datos),
};

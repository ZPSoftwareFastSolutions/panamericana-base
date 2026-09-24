import { estadosSiguientes } from '../dominio/Encomienda';
import type { EncomiendaDetalle, EncomiendaRepositorio, EncomiendaVista } from '../dominio/EncomiendaRepositorio';
import { EncomiendaNoEncontradaError } from '../dominio/errores';

/** agrega los pasos siguientes (regla del dominio) al detalle que trae la base */
export function aVista(encomienda: EncomiendaDetalle): EncomiendaVista {
  return { ...encomienda, siguientes: estadosSiguientes(encomienda.estado) };
}

/** Caso de uso: ver una encomienda con todos sus datos (personal) */
export class ObtenerEncomienda {
  constructor(private readonly encomiendas: EncomiendaRepositorio) {}

  async ejecutar(codigo: string): Promise<EncomiendaVista> {
    const encomienda = await this.encomiendas.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!encomienda) throw new EncomiendaNoEncontradaError(codigo);
    return aVista(encomienda);
  }
}

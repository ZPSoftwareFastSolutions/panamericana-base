import type { EstadoEncomienda } from '../dominio/Encomienda';
import type { EncomiendaRepositorio, EncomiendaVista } from '../dominio/EncomiendaRepositorio';
import { aVista } from './ObtenerEncomienda';

/** Caso de uso: listar encomiendas (opcionalmente por estado) */
export class ListarEncomiendas {
  constructor(private readonly encomiendas: EncomiendaRepositorio) {}

  async ejecutar(estado?: EstadoEncomienda): Promise<EncomiendaVista[]> {
    return (await this.encomiendas.listar(estado)).map(aVista);
  }
}

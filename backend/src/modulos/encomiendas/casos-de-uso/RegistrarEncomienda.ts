import { registrarEncomienda } from '../dominio/Encomienda';
import type { DatosEncomienda } from '../dominio/Encomienda';
import type { EncomiendaRepositorio, EncomiendaVista } from '../dominio/EncomiendaRepositorio';
import { EncomiendaNoEncontradaError, TerminalNoValidaError } from '../dominio/errores';
import { aVista } from './ObtenerEncomienda';

/**
 * Caso de uso: registrar una encomienda y cobrarla en efectivo.
 * Pasos: 1) la entidad valida personas, terminales distintas, peso y costo
 *        2) las dos terminales existen y estan activas
 *        3) el repositorio guarda todo junto (venta, pago, encomienda y estado "registrada")
 */
export class RegistrarEncomienda {
  constructor(
    private readonly encomiendas: EncomiendaRepositorio,
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  async ejecutar(datos: DatosEncomienda, usuario_id: string): Promise<EncomiendaVista> {
    const encomienda = registrarEncomienda(datos, this.ahora());

    const activas = await this.encomiendas.terminalesActivas([
      encomienda.terminal_origen_id,
      encomienda.terminal_destino_id,
    ]);
    if (activas.length !== 2) throw new TerminalNoValidaError();

    await this.encomiendas.guardar(encomienda, usuario_id);

    const guardada = await this.encomiendas.buscarPorCodigo(encomienda.codigo_seguimiento);
    if (!guardada) throw new EncomiendaNoEncontradaError(encomienda.codigo_seguimiento);
    return aVista(guardada);
  }
}

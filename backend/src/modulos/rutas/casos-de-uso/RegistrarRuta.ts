import { crearRuta } from '../dominio/Ruta';
import type { ParadaEntrada } from '../dominio/Ruta';
import type { RutaDetalle, RutaRepositorio } from '../dominio/RutaRepositorio';
import { RutaDuplicadaError, TerminalInvalidaError } from '../dominio/errores';

/**
 * Caso de uso: registrar una ruta con sus paradas.
 * Pasos: 1) la entidad valida el recorrido · 2) las terminales existen · 3) el nombre no se repite · 4) guardar
 */
export class RegistrarRuta {
  constructor(private readonly rutas: RutaRepositorio) {}

  async ejecutar(entrada: { nombre: string; paradas: ParadaEntrada[] }): Promise<RutaDetalle> {
    const ruta = crearRuta(entrada);

    const ids = ruta.paradas.map((p) => p.terminal_id);
    const activas = await this.rutas.terminalesActivas(ids);
    if (activas.length !== ids.length) {
      throw new TerminalInvalidaError();
    }

    if (await this.rutas.existeNombre(ruta.nombre)) {
      throw new RutaDuplicadaError(ruta.nombre);
    }

    await this.rutas.guardar(ruta);

    const guardada = await this.rutas.buscarPorId(ruta.id);
    if (!guardada) throw new Error('La ruta no se encontró después de guardarla');
    return guardada;
  }
}

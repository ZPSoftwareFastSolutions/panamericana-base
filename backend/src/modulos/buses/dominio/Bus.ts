import { NumeroPisosInvalidoError, PlacaInvalidaError } from './errores';

export type EstadoBus = 'activo' | 'mantenimiento' | 'inactivo';

export type DatosNuevoBus = {
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion?: number | null;
  numero_pisos: number;
};

/**
 * Entidad del dominio: aqui viven las REGLAS del negocio sobre un bus.
 * No importa Express, ni pg, ni nada externo.
 */
export class Bus {
  private constructor(
    readonly id: string,
    readonly placa: string,
    readonly marca: string,
    readonly modelo: string,
    readonly anio_fabricacion: number | null,
    readonly numero_pisos: number,
    readonly estado: EstadoBus,
  ) {}

  /** crea un bus nuevo aplicando las reglas del negocio */
  static crear(datos: DatosNuevoBus): Bus {
    // placa boliviana: 3 o 4 digitos seguidos de 3 letras (ej. 2045KLP); se ignoran espacios y guiones
    const placa = datos.placa.replace(/[\s-]/g, '').toUpperCase();

    if (!/^\d{3,4}[A-Z]{3}$/.test(placa)) {
      throw new PlacaInvalidaError(datos.placa);
    }
    if (datos.numero_pisos !== 1 && datos.numero_pisos !== 2) {
      throw new NumeroPisosInvalidoError();
    }

    return new Bus(
      crypto.randomUUID(),
      placa,
      datos.marca.trim(),
      datos.modelo.trim(),
      datos.anio_fabricacion ?? null,
      datos.numero_pisos,
      'activo',
    );
  }

  /**
   * reconstruye un bus que YA existe (viene de la base de datos).
   * no vuelve a validar: esos datos ya pasaron por las reglas cuando se crearon.
   */
  static reconstruir(datos: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    anio_fabricacion: number | null;
    numero_pisos: number;
    estado: EstadoBus;
  }): Bus {
    return new Bus(
      datos.id,
      datos.placa,
      datos.marca,
      datos.modelo,
      datos.anio_fabricacion,
      datos.numero_pisos,
      datos.estado,
    );
  }
}

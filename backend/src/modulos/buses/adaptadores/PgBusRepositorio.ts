import type { Pool } from 'pg';
import { Bus } from '../dominio/Bus';
import type { EstadoBus } from '../dominio/Bus';
import type { BusRepositorio } from '../dominio/BusRepositorio';

/**
 * Fila tal como viene de la tabla buses.
 * Los nombres son EXACTAMENTE los de la base de datos.
 */
type FilaBus = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion: number | null;
  numero_pisos: number;
  estado: EstadoBus;
};

/** Aqui, y solo aqui, se escribe SQL del modulo buses. Palabras SQL en minusculas. */
export class PgBusRepositorio implements BusRepositorio {
  constructor(private readonly db: Pool) {}

  async listar(): Promise<Bus[]> {
    const resultado = await this.db.query<FilaBus>(
      `select id, placa, marca, modelo, anio_fabricacion, numero_pisos, estado
         from buses
        order by placa`,
    );

    return resultado.rows.map((fila) => Bus.reconstruir(fila));
  }

  async existePlaca(placa: string): Promise<boolean> {
    const resultado = await this.db.query('select 1 from buses where placa = $1', [placa]);
    return (resultado.rowCount ?? 0) > 0;
  }

  async guardar(bus: Bus): Promise<void> {
    await this.db.query(
      `insert into buses (id, placa, marca, modelo, anio_fabricacion, numero_pisos, estado)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        bus.id,
        bus.placa,
        bus.marca,
        bus.modelo,
        bus.anio_fabricacion,
        bus.numero_pisos,
        bus.estado,
      ],
    );
  }
}

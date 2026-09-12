import type { Bus } from './Bus';

/**
 * El "enchufe": el dominio dice QUE necesita, no COMO se hace.
 * La implementacion real con SQL esta en adaptadores/PgBusRepositorio.ts
 */
export interface BusRepositorio {
  listar(): Promise<Bus[]>;
  existePlaca(placa: string): Promise<boolean>;
  guardar(bus: Bus): Promise<void>;
}

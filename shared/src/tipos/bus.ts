export type EstadoBus = 'activo' | 'mantenimiento' | 'inactivo';

/** un bus tal como lo devuelve la API (mismos nombres que la tabla buses) */
export type Bus = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion: number | null;
  numero_pisos: number;
  estado: EstadoBus;
};

/** datos que se envian para registrar un bus */
export type RegistrarBusEntrada = {
  placa: string;
  marca: string;
  modelo: string;
  anio_fabricacion?: number | null;
  numero_pisos: number;
};

import type { TipoDocumento } from './comunes';
import type { CanalVenta, EstadoPasaje } from './venta';

/**
 * un pasaje tal como se imprime en el boleto.
 * El documento del pasajero llega oculto (****351): la consulta es publica.
 */
export type Pasaje = {
  codigo: string;
  estado: EstadoPasaje;
  precio: number;
  venta: { codigo: string; canal: CanalVenta };
  asiento: { numero: number; piso: number; tipo: string };
  pasajero: {
    tipo_documento: TipoDocumento;
    numero_documento: string;
    nombres: string;
    apellidos: string;
  };
  viaje: {
    id: string;
    ruta: { id: string; nombre: string };
    bus: { id: string; placa: string };
    fecha_salida: string;
    origen: { orden: number; terminal: string; ciudad: string; hora: string };
    destino: { orden: number; terminal: string; ciudad: string; hora: string };
  };
  /** hasta cuando se puede anular en taquilla (2 horas antes de subir) */
  anulable_hasta: string;
};

/** resultado de anular un pasaje: el pasaje ya anulado y el monto devuelto */
export type AnulacionPasaje = {
  pasaje: Pasaje;
  reembolso: number;
};

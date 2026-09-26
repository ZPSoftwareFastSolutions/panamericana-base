import type { TipoDocumento } from './comunes';

export type CanalVenta = 'web' | 'movil' | 'taquilla';
export type EstadoVenta = 'pendiente' | 'pagada' | 'anulada' | 'expirada';
export type EstadoPasaje = 'reservado' | 'pagado' | 'anulado' | 'expirado';

/** datos de un pasajero y el asiento que va a ocupar */
export type PasajeroEntrada = {
  asiento_id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  correo?: string | null;
  /** tarifa diferenciada (catalogo tipos_pasajero); sin indicar, 'general' */
  tipo_pasajero?: string;
};

/** reservar asientos de un tramo: crea la venta pendiente y retiene los asientos unos minutos */
export type ReservarEntrada = {
  viaje_id: string;
  orden_origen: number;
  orden_destino: number;
  pasajeros: PasajeroEntrada[];
  /** el comprador acepto los Terminos y Condiciones y la Politica de Privacidad (obligatorio) */
  acepta_condiciones: boolean;
};

/** venta presencial: reserva y cobra en efectivo en un solo paso (mismo inventario que la web) */
export type VenderEnTaquillaEntrada = ReservarEntrada;

/** pago simulado: la web paga con tarjeta; la taquilla, en efectivo */
export type PagarVentaEntrada = {
  metodo?: 'tarjeta' | 'efectivo';
};

export type PasajeDeVenta = {
  codigo: string;
  estado: EstadoPasaje;
  precio: number;
  asiento: { numero: number; piso: number; tipo: string };
  /** tarifa con que se vendio y documento que debe presentar al subir */
  tipo_pasajero: { codigo: string; nombre: string; requisito: string | null };
  pasajero: {
    tipo_documento: TipoDocumento;
    numero_documento: string;
    nombres: string;
    apellidos: string;
  };
};

/** una venta con sus pasajes y el viaje; el total sale de la vista ventas_totales */
export type Venta = {
  id: string;
  codigo: string;
  canal: CanalVenta;
  estado: EstadoVenta;
  total: number;
  /** hasta cuando se retienen los asientos (solo mientras esta pendiente) */
  reservado_hasta: string | null;
  creado_en: string;
  viaje: {
    id: string;
    ruta: { id: string; nombre: string };
    bus: { id: string; placa: string };
    fecha_salida: string;
    origen: { orden: number; terminal: string; ciudad: string; hora: string };
    destino: { orden: number; terminal: string; ciudad: string; hora: string };
  };
  pasajes: PasajeDeVenta[];
};

import type { TipoDocumento } from './comunes';

/** registrada -> en_transito -> en_destino -> entregada (o cancelada antes de salir) */
export type EstadoEncomienda = 'registrada' | 'en_transito' | 'en_destino' | 'entregada' | 'cancelada';

/** remitente o destinatario (se guardan como clientes) */
export type PersonaEncomiendaEntrada = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
};

/** registrar un envio: se cobra en origen, en efectivo, al registrarlo */
export type RegistrarEncomiendaEntrada = {
  remitente: PersonaEncomiendaEntrada;
  destinatario: PersonaEncomiendaEntrada;
  terminal_origen_id: string;
  terminal_destino_id: string;
  descripcion: string;
  peso_kg: number;
  costo: number;
};

/** cambiar el estado; al despacharla (en_transito) se puede indicar el viaje que la lleva */
export type CambiarEstadoEncomiendaEntrada = {
  estado: EstadoEncomienda;
  observacion?: string | null;
  viaje_id?: string | null;
};

type TerminalDeEncomienda = { id: string; nombre: string; ciudad: string };

type PersonaDeEncomienda = {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
};

/** una encomienda tal como la ve el personal */
export type Encomienda = {
  id: string;
  codigo_seguimiento: string;
  /** estado actual (sale del historial, vista encomiendas_estado_actual) */
  estado: EstadoEncomienda;
  /** a que estados puede pasar ahora (lo decide el backend) */
  siguientes: EstadoEncomienda[];
  descripcion: string;
  peso_kg: number;
  costo: number;
  remitente: PersonaDeEncomienda;
  destinatario: PersonaDeEncomienda;
  terminal_origen: TerminalDeEncomienda;
  terminal_destino: TerminalDeEncomienda;
  viaje: { id: string; fecha_salida: string; ruta: string; bus: string } | null;
  venta: { codigo: string } | null;
  creado_en: string;
  historial: { estado: EstadoEncomienda; observacion: string | null; fecha: string; usuario: string }[];
};

/** lo que ve cualquiera con el codigo de seguimiento: sin datos personales */
export type SeguimientoEncomienda = {
  codigo_seguimiento: string;
  estado: EstadoEncomienda;
  terminal_origen: TerminalDeEncomienda;
  terminal_destino: TerminalDeEncomienda;
  creado_en: string;
  historial: { estado: EstadoEncomienda; fecha: string }[];
};

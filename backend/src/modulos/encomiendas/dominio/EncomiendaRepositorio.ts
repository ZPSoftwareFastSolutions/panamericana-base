import type { EncomiendaNueva, EstadoEncomienda } from './Encomienda';

type TerminalDeEncomienda = { id: string; nombre: string; ciudad: string };
type PersonaDeEncomienda = {
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
};

/** una encomienda con su estado actual y su historial */
export type EncomiendaDetalle = {
  id: string;
  codigo_seguimiento: string;
  estado: EstadoEncomienda;
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

/** lo que devuelven los casos de uso: el detalle mas los estados a los que puede pasar */
export type EncomiendaVista = EncomiendaDetalle & { siguientes: EstadoEncomienda[] };

export type CambioDeEstado = {
  encomienda_id: string;
  /** el estado que se leyo antes de validar: si cambio mientras tanto, no se guarda nada */
  estado_esperado: EstadoEncomienda;
  estado_nuevo: EstadoEncomienda;
  observacion: string | null;
  usuario_id: string;
  viaje_id: string | null;
  reembolsar: boolean;
};

/** lo que el modulo necesita de la base; la implementacion con SQL esta en adaptadores/ */
export interface EncomiendaRepositorio {
  /** de esos ids, los que son terminales activas */
  terminalesActivas(ids: string[]): Promise<string[]>;

  /** remitente, destinatario, venta pagada, pago, encomienda y primer estado: todo junto */
  guardar(encomienda: EncomiendaNueva, usuario_id: string): Promise<void>;

  /** las mas recientes primero; con estado, solo las que estan en ese estado */
  listar(estado?: EstadoEncomienda): Promise<EncomiendaDetalle[]>;
  buscarPorCodigo(codigo: string): Promise<EncomiendaDetalle | null>;

  /** el viaje esta programado o en ruta y pasa por el origen y despues por el destino */
  viajeSirve(viaje_id: string, terminal_origen_id: string, terminal_destino_id: string): Promise<boolean>;

  /** guarda el cambio en el historial (y el viaje o el reembolso). false si el estado ya no era el esperado */
  registrarCambio(cambio: CambioDeEstado): Promise<boolean>;
}

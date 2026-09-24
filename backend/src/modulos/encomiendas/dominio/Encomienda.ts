import { generarCodigo } from '../../../compartido/dominio/Codigo';
import { crearPersona } from '../../../compartido/dominio/Persona';
import type { DatosPersona, Persona } from '../../../compartido/dominio/Persona';
import { EncomiendaInvalidaError, TransicionInvalidaError } from './errores';

/**
 * ENCOMIENDA: un paquete que viaja de una terminal a otra.
 *
 * Se cobra EN ORIGEN, en efectivo, al registrarla (queda una venta de canal "taquilla").
 * Su estado no se guarda en la tabla: es el ultimo registro de su historial
 * (vista encomiendas_estado_actual). Maquina de estados:
 *
 *   registrada --> en_transito --> en_destino --> entregada
 *        \--> cancelada (solo antes de salir; se devuelve el costo)
 */

export const ESTADOS_ENCOMIENDA = ['registrada', 'en_transito', 'en_destino', 'entregada', 'cancelada'] as const;
export type EstadoEncomienda = (typeof ESTADOS_ENCOMIENDA)[number];

const SIGUIENTES: Record<EstadoEncomienda, EstadoEncomienda[]> = {
  registrada: ['en_transito', 'cancelada'],
  en_transito: ['en_destino'],
  en_destino: ['entregada'],
  entregada: [],
  cancelada: [],
};

export const PESO_MAXIMO_KG = 50;
export const COSTO_MAXIMO = 1000;
const LARGO_MAXIMO_DESCRIPCION = 200;

export type DatosEncomienda = {
  remitente: DatosPersona;
  destinatario: DatosPersona;
  terminal_origen_id: string;
  terminal_destino_id: string;
  descripcion: string;
  peso_kg: number;
  costo: number;
};

export type EncomiendaNueva = {
  id: string;
  codigo_seguimiento: string;
  venta: { id: string; codigo: string };
  remitente: Persona;
  destinatario: Persona;
  terminal_origen_id: string;
  terminal_destino_id: string;
  descripcion: string;
  peso_kg: number;
  costo: number;
};

/** un numero positivo, con tope y a lo sumo 2 decimales */
function esCantidadValida(valor: number, maximo: number): boolean {
  return valor > 0 && valor <= maximo && Math.abs(Math.round(valor * 100) - valor * 100) < 1e-6;
}

/** valida el envio y arma la encomienda con su venta; todavia no toca la base */
export function registrarEncomienda(datos: DatosEncomienda, ahora: Date): EncomiendaNueva {
  const remitente = crearPersona(datos.remitente, ahora);
  const destinatario = crearPersona(datos.destinatario, ahora);

  if (datos.terminal_origen_id === datos.terminal_destino_id) {
    throw new EncomiendaInvalidaError('La terminal de destino debe ser distinta a la de origen');
  }
  const descripcion = datos.descripcion.trim().replace(/\s+/g, ' ');
  if (!descripcion || descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
    throw new EncomiendaInvalidaError(`Describe el contenido en 1 a ${LARGO_MAXIMO_DESCRIPCION} caracteres`);
  }
  if (!esCantidadValida(datos.peso_kg, PESO_MAXIMO_KG)) {
    throw new EncomiendaInvalidaError(`El peso va de 0,01 a ${PESO_MAXIMO_KG} kg, con 2 decimales como maximo`);
  }
  if (!esCantidadValida(datos.costo, COSTO_MAXIMO)) {
    throw new EncomiendaInvalidaError(`El costo va de Bs 0,01 a Bs ${COSTO_MAXIMO}, con 2 decimales como maximo`);
  }

  return {
    id: crypto.randomUUID(),
    codigo_seguimiento: generarCodigo('E'),
    venta: { id: crypto.randomUUID(), codigo: generarCodigo('V') },
    remitente,
    destinatario,
    terminal_origen_id: datos.terminal_origen_id,
    terminal_destino_id: datos.terminal_destino_id,
    descripcion,
    peso_kg: datos.peso_kg,
    costo: datos.costo,
  };
}

/** los estados a los que puede pasar (la pantalla los ofrece tal cual) */
export function estadosSiguientes(actual: EstadoEncomienda): EstadoEncomienda[] {
  return [...SIGUIENTES[actual]];
}

/** solo se avanza un paso a la vez (o se cancela antes de salir) */
export function exigirCambioDeEstado(actual: EstadoEncomienda, nuevo: EstadoEncomienda): void {
  if (!SIGUIENTES[actual].includes(nuevo)) {
    throw new TransicionInvalidaError(actual, nuevo, SIGUIENTES[actual]);
  }
}

/** al cancelar se devuelve lo cobrado */
export function requiereReembolso(nuevo: EstadoEncomienda): boolean {
  return nuevo === 'cancelada';
}

/** el viaje que lleva la encomienda se indica al despacharla */
export function admiteViaje(nuevo: EstadoEncomienda): boolean {
  return nuevo === 'en_transito';
}

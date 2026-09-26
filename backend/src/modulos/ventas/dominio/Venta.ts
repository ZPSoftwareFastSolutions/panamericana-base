import { generarCodigo } from '../../../compartido/dominio/Codigo';
import { crearPersona } from '../../../compartido/dominio/Persona';
import type { DatosPersona, Persona } from '../../../compartido/dominio/Persona';
import { exigirTramoALaVenta, precioConDescuento, precioDeTramo, resolverTramo } from '../../../compartido/dominio/Tramo';
import type { ParadaDelViaje, TipoDePasajero } from '../../../compartido/dominio/Tramo';
import { AsientoNoDisponibleError, ReservaInvalidaError } from './errores';

/**
 * VENTA: una operacion de compra que agrupa pasajes (y mas adelante encomiendas) y se cobra junta.
 *
 * Ciclo de vida:  pendiente --pagar--> pagada        (pasajes: reservado -> pagado)
 *                 pendiente --vence--> expirada      (pasajes: reservado -> expirado, asientos libres)
 *
 * Tarifas diferenciadas (normativa boliviana): cada pasajero indica su tipo (general, adulto mayor,
 * discapacidad, menor) y el descuento del catalogo se aplica sobre el precio del tramo. El documento
 * que lo acredita se presenta al subir al bus.
 */

export const MAXIMO_PASAJES_POR_VENTA = 5;

export type Canal = 'web' | 'movil' | 'taquilla';

export type ViajeParaReservar = {
  id: string;
  ruta_id: string;
  bus_id: string;
  estado: string;
  fecha_salida: Date;
  duracion_ruta: number;
  paradas: ParadaDelViaje[];
  tarifas: { tipo_asiento: string; precio: number }[];
};

export type AsientoParaReservar = { id: string; numero: number; tipo: string; ocupado: boolean };

export type DatosPasajero = DatosPersona & { asiento_id: string; tipo_pasajero?: string };

export type { TipoDePasajero };

export const TIPO_PASAJERO_GENERAL = 'general';

export type PasajeNuevo = {
  id: string;
  codigo: string;
  asiento_id: string;
  precio: number;
  tipo_pasajero: string;
  pasajero: Persona;
};

export type VentaNueva = {
  id: string;
  codigo: string;
  canal: Canal;
  usuario_id: string | null;
  viaje_id: string;
  ruta_id: string;
  bus_id: string;
  orden_origen: number;
  orden_destino: number;
  reservado_hasta: Date;
  pasajes: PasajeNuevo[];
};

/**
 * Sin aceptar los Terminos y Condiciones y la Politica de Privacidad no se vende (web ni taquilla).
 * El caso de uso lo revisa ANTES de ir a la base; reservarAsientos lo vuelve a exigir.
 */
export function exigirConsentimiento(acepta_condiciones: boolean): void {
  if (acepta_condiciones !== true) {
    throw new ReservaInvalidaError('Para comprar hay que aceptar los Términos y Condiciones y la Política de Privacidad');
  }
}

/**
 * Reserva asientos de un tramo: valida todo y arma la venta pendiente con sus pasajes.
 * Aun no toca la base: el repositorio la guarda despues, dentro de una transaccion.
 */
export function reservarAsientos(
  datos: {
    viaje: ViajeParaReservar;
    asientos: AsientoParaReservar[];
    orden_origen: number;
    orden_destino: number;
    pasajeros: DatosPasajero[];
    tiposPasajero: TipoDePasajero[];
    acepta_condiciones: boolean;
    canal: Canal;
    usuario_id: string | null;
  },
  ahora: Date,
  minutosDeReserva: number,
): VentaNueva {
  const { viaje, pasajeros } = datos;

  exigirConsentimiento(datos.acepta_condiciones);

  if (pasajeros.length === 0 || pasajeros.length > MAXIMO_PASAJES_POR_VENTA) {
    throw new ReservaInvalidaError(`Una compra lleva de 1 a ${MAXIMO_PASAJES_POR_VENTA} pasajes`);
  }
  const idsAsiento = pasajeros.map((p) => p.asiento_id);
  if (new Set(idsAsiento).size !== idsAsiento.length) {
    throw new ReservaInvalidaError('Cada pasajero ocupa un asiento distinto');
  }

  const tramo = resolverTramo(viaje.paradas, datos.orden_origen, datos.orden_destino);
  exigirTramoALaVenta(viaje.estado, viaje.fecha_salida, tramo.origen, ahora);

  // primero se validan las personas: sus reglas (CI, celular) no dependen de nada mas
  const personas = pasajeros.map((p) => crearPersona(p, ahora));
  const documentos = personas.map((p) => `${p.tipo_documento}:${p.numero_documento}`);
  if (new Set(documentos).size !== documentos.length) {
    throw new ReservaInvalidaError('Una misma persona no puede ocupar dos asientos en la misma compra');
  }

  const elegidos = idsAsiento.map((id) => {
    const asiento = datos.asientos.find((a) => a.id === id);
    if (!asiento) throw new ReservaInvalidaError('Alguno de los asientos no pertenece al bus de este viaje');
    return asiento;
  });

  const ocupados = elegidos.filter((a) => a.ocupado).map((a) => a.numero);
  if (ocupados.length > 0) throw new AsientoNoDisponibleError(ocupados);

  // cada pasajero con una tarifa del catalogo (sin indicar: general)
  const tipos = pasajeros.map((p) => {
    const codigo = p.tipo_pasajero ?? TIPO_PASAJERO_GENERAL;
    const tipo = datos.tiposPasajero.find((t) => t.codigo === codigo);
    if (!tipo) throw new ReservaInvalidaError(`La tarifa "${codigo}" no existe`);
    return tipo;
  });

  const pasajes = elegidos.map((asiento, i) => {
    const tarifa = viaje.tarifas.find((t) => t.tipo_asiento === asiento.tipo);
    if (!tarifa) {
      throw new ReservaInvalidaError(`El asiento ${asiento.numero} no tiene tarifa en este viaje`);
    }
    const tipo = tipos[i]!;
    return {
      id: crypto.randomUUID(),
      codigo: generarCodigo('P'),
      asiento_id: asiento.id,
      precio: precioConDescuento(precioDeTramo(tarifa.precio, tramo.minutos, viaje.duracion_ruta), tipo.descuento_porcentaje),
      tipo_pasajero: tipo.codigo,
      pasajero: personas[i]!,
    };
  });

  return {
    id: crypto.randomUUID(),
    codigo: generarCodigo('V'),
    canal: datos.canal,
    usuario_id: datos.usuario_id,
    viaje_id: viaje.id,
    ruta_id: viaje.ruta_id,
    bus_id: viaje.bus_id,
    orden_origen: datos.orden_origen,
    orden_destino: datos.orden_destino,
    reservado_hasta: new Date(ahora.getTime() + minutosDeReserva * 60_000),
    pasajes,
  };
}

/** la reserva de una venta pendiente vencio si su plazo ya paso */
export function reservaVencida(venta: { estado: string; reservado_hasta: string | null }, ahora: Date): boolean {
  return venta.estado === 'pendiente' && (!venta.reservado_hasta || new Date(venta.reservado_hasta) <= ahora);
}

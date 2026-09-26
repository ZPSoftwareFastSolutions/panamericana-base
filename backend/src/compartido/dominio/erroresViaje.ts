import { ErrorDeDominio } from './ErrorDeDominio';

/** Errores de viajes y tramos: los usan la busqueda, la disponibilidad y la venta. */

export class ViajeNoEncontradoError extends ErrorDeDominio {
  readonly codigo = 'viaje_no_encontrado';
  readonly estadoHttp = 404;

  constructor(id: string) {
    super(`No existe un viaje con el id ${id}`);
  }
}

export class ViajeNoDisponibleError extends ErrorDeDominio {
  readonly codigo = 'viaje_no_disponible';
  readonly estadoHttp = 409;

  constructor(motivo = 'Este viaje ya no está a la venta') {
    super(motivo);
  }
}

export class TramoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'tramo_invalido';
  readonly estadoHttp = 400;

  constructor(motivo = 'El tramo debe ir de una parada de la ruta a otra posterior') {
    super(motivo);
  }
}

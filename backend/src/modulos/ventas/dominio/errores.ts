import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class AsientoNoDisponibleError extends ErrorDeDominio {
  readonly codigo = 'asiento_no_disponible';
  readonly estadoHttp = 409;

  constructor(numeros: number[] = []) {
    super(
      numeros.length > 0
        ? `El asiento ${numeros.join(', ')} ya no esta libre para ese tramo. Elige otro`
        : 'Alguno de los asientos ya no esta libre para ese tramo. Elige otro',
    );
  }
}

export class ReservaInvalidaError extends ErrorDeDominio {
  readonly codigo = 'reserva_invalida';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class ReservaExpiradaError extends ErrorDeDominio {
  readonly codigo = 'reserva_expirada';
  readonly estadoHttp = 409;

  constructor() {
    super('El tiempo para pagar termino y los asientos se liberaron. Vuelve a elegirlos');
  }
}

export class VentaNoEncontradaError extends ErrorDeDominio {
  readonly codigo = 'venta_no_encontrada';
  readonly estadoHttp = 404;

  constructor(codigo: string) {
    super(`No existe una venta con el codigo ${codigo}`);
  }
}

export class VentaNoPendienteError extends ErrorDeDominio {
  readonly codigo = 'venta_no_pendiente';
  readonly estadoHttp = 409;

  constructor(estado: string) {
    super(`La venta ya esta ${estado}: no se puede pagar otra vez`);
  }
}

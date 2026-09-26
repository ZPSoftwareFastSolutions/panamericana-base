import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class EncomiendaInvalidaError extends ErrorDeDominio {
  readonly codigo = 'encomienda_invalida';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class EncomiendaNoEncontradaError extends ErrorDeDominio {
  readonly codigo = 'encomienda_no_encontrada';
  readonly estadoHttp = 404;

  constructor(codigo: string) {
    super(`No existe una encomienda con el código ${codigo}`);
  }
}

export class TransicionInvalidaError extends ErrorDeDominio {
  readonly codigo = 'transicion_invalida';
  readonly estadoHttp = 409;

  constructor(actual: string, nuevo: string, permitidos: string[]) {
    const legible = (estado: string) => estado.replaceAll('_', ' ');
    super(
      permitidos.length > 0
        ? `La encomienda está ${legible(actual)}: puede pasar a ${permitidos.map(legible).join(' o ')}, no a ${legible(nuevo)}`
        : `La encomienda ya está ${legible(actual)} y no cambia de estado`,
    );
  }
}

export class EstadoCambiadoError extends ErrorDeDominio {
  readonly codigo = 'estado_cambiado';
  readonly estadoHttp = 409;

  constructor() {
    super('Otra persona cambió el estado de la encomienda mientras tanto. Vuelve a cargarla');
  }
}

export class TerminalNoValidaError extends ErrorDeDominio {
  readonly codigo = 'terminal_invalida';
  readonly estadoHttp = 400;

  constructor() {
    super('La terminal de origen o de destino no existe o está inactiva');
  }
}

export class ViajeNoSirveError extends ErrorDeDominio {
  readonly codigo = 'viaje_no_sirve';
  readonly estadoHttp = 400;

  constructor() {
    super('Ese viaje no está programado o no pasa por la terminal de origen y después por la de destino');
  }
}

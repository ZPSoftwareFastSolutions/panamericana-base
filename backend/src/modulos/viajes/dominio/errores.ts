import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class ViajeInvalidoError extends ErrorDeDominio {
  readonly codigo = 'viaje_invalido';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

export class BusOcupadoError extends ErrorDeDominio {
  readonly codigo = 'bus_ocupado';
  readonly estadoHttp = 409;

  constructor(placa: string) {
    super(`El bus ${placa} ya tiene otro viaje en ese horario`);
  }
}

export class BusquedaInvalidaError extends ErrorDeDominio {
  readonly codigo = 'busqueda_invalida';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

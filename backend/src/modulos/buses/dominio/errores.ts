import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class PlacaInvalidaError extends ErrorDeDominio {
  readonly codigo = 'placa_invalida';
  readonly estadoHttp = 400;

  constructor(placa: string) {
    super(`La placa "${placa}" no tiene un formato valido`);
  }
}

export class NumeroPisosInvalidoError extends ErrorDeDominio {
  readonly codigo = 'numero_pisos_invalido';
  readonly estadoHttp = 400;

  constructor() {
    super('Un bus solo puede tener 1 o 2 pisos');
  }
}

export class PlacaDuplicadaError extends ErrorDeDominio {
  readonly codigo = 'placa_duplicada';
  readonly estadoHttp = 409;

  constructor(placa: string) {
    super(`Ya existe un bus con la placa ${placa}`);
  }
}

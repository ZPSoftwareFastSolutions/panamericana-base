import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class ModeloInvalidoError extends ErrorDeDominio {
  readonly codigo = 'modelo_invalido';
  readonly estadoHttp = 500;

  constructor(motivo: string) {
    super(`El modelo de demanda no se puede usar: ${motivo}`);
  }
}

export class PeriodoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'periodo_invalido';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class PeriodoDelPanelInvalidoError extends ErrorDeDominio {
  readonly codigo = 'periodo_invalido';
  readonly estadoHttp = 400;

  constructor(motivo: string) {
    super(motivo);
  }
}

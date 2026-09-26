import { ErrorDeDominio } from '../../../compartido/dominio/ErrorDeDominio';

export class NoAutenticadoError extends ErrorDeDominio {
  readonly codigo = 'no_autenticado';
  readonly estadoHttp = 401;

  constructor(motivo = 'Inicia sesión para continuar') {
    super(motivo);
  }
}

export class SinPermisoError extends ErrorDeDominio {
  readonly codigo = 'sin_permiso';
  readonly estadoHttp = 403;

  constructor() {
    super('Tu rol no tiene permiso para esta acción');
  }
}

import { ErrorDeDominio } from './ErrorDeDominio';

/** Errores que puede lanzar cualquier modulo. */

export class DatoObligatorioError extends ErrorDeDominio {
  readonly codigo = 'dato_obligatorio';
  readonly estadoHttp = 400;

  constructor(campo: string) {
    super(`El campo "${campo}" es obligatorio`);
  }
}

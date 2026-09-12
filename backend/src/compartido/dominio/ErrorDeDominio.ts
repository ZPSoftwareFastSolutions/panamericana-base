/**
 * clase base de los errores del negocio.
 * cada error define su codigo (para el JSON) y su estado HTTP.
 */
export abstract class ErrorDeDominio extends Error {
  abstract readonly codigo: string;
  abstract readonly estadoHttp: number;

  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

import { ErrorDeDominio } from './ErrorDeDominio';

/**
 * Errores de los datos de una persona.
 * Los usan todos los modulos que registran personas: clientes, usuarios y choferes.
 */

export class TipoDocumentoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'tipo_documento_invalido';
  readonly estadoHttp = 400;

  constructor(tipo: string) {
    super(`El tipo de documento "${tipo}" no existe. Usa ci, ce o pasaporte`);
  }
}

export class DocumentoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'documento_invalido';
  readonly estadoHttp = 400;

  constructor(numero: string) {
    super(`El número de documento "${numero}" no tiene un formato válido`);
  }
}

export class TelefonoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'telefono_invalido';
  readonly estadoHttp = 400;

  constructor(telefono: string) {
    super(`El celular "${telefono}" debe tener 8 dígitos y empezar con 6 o 7`);
  }
}

export class CorreoInvalidoError extends ErrorDeDominio {
  readonly codigo = 'correo_invalido';
  readonly estadoHttp = 400;

  constructor(correo: string) {
    super(`El correo "${correo}" no tiene un formato válido`);
  }
}

export class FechaNacimientoInvalidaError extends ErrorDeDominio {
  readonly codigo = 'fecha_nacimiento_invalida';
  readonly estadoHttp = 400;

  constructor() {
    super('La fecha de nacimiento no puede ser posterior a hoy');
  }
}
